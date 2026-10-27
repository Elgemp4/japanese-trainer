/**
 * A tiny manim-like animation engine running on SVG + the Web Animations API.
 *
 * Usage:
 *   const scene = createScene(svgElement);
 *   const title = scene.text("あ", {size: 160});
 *   await scene.play(write(title));
 *   await scene.play(moveTo(title, {y: 70, scale: 0.4}), fadeIn(other));
 */

const SVG_NS = "http://www.w3.org/2000/svg";

/**
 * A keyframe whose properties are the CSS properties being animated, in camelCase
 */
type Frame = Partial<Record<keyof CSSStyleDeclaration, string | number>> & {offset?: number};

/**
 * An animation waiting to be played by a scene, created with write, fadeIn, moveTo...
 */
export type SceneAnimation = (scene: Scene) => Animation | null;

export type TextOptions = {
    x?: number,
    y?: number,
    size?: number,
    color?: string,
    /** Name to get the object back with scene.get, an object with the same name gets replaced */
    name?: string,
};

export type Scene = {
    instant: boolean,
    text: (content: string, options?: TextOptions) => SVGTextElement,
    get: (name: string) => SVGTextElement,
    play: (...animations: SceneAnimation[]) => Promise<void>,
    wait: (ms?: number) => Promise<void>,
    skip: () => void,
    dispose: () => void,
    resetSkip: () => void,
};

export const WIDTH = 800;
export const HEIGHT = 450;

/**
 * Thrown inside a scene's script when the scene was disposed, to stop it
 */
export class SceneAbortedError extends Error {
    constructor() {
        super("Scene aborted");
    }
}

const prefersReducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

/**
 * Apply a keyframe instantly to an element
 * @param el the element
 * @param frame the keyframe to apply
 */
const applyFrame = (el: SVGElement, frame: Frame) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {offset, ...style} = frame;
    Object.assign(el.style, style);
};

/**
 * Animate an element and keep its final state.
 * When animations are unavailable (instant mode, reduced motion, jsdom) the final frame is applied directly
 * @param scene the scene running the animation
 * @param el the element to animate
 * @param keyframes the WAAPI keyframes
 * @param options the WAAPI options
 */
const animate = (scene: Scene, el: SVGElement, keyframes: Frame[], options: KeyframeAnimationOptions): Animation | null => {
    const lastFrame = keyframes[keyframes.length - 1];
    if (scene.instant || typeof el.animate !== "function" || prefersReducedMotion()) {
        applyFrame(el, lastFrame);
        return null;
    }

    const animation = el.animate(keyframes as Keyframe[], {fill: "forwards", easing: "ease-in-out", ...options});
    animation.finished
        .then(() => {
            applyFrame(el, lastFrame);
            animation.cancel();
        })
        .catch(() => {});
    return animation;
};

/**
 * Draw the outline of an element, then fill it (manim's Write)
 */
export const write = (el: SVGElement, {duration = 1400} = {}): SceneAnimation => (scene) => {
    const length = `${el.dataset.length}px`;
    el.style.strokeDasharray = length;
    el.style.opacity = "1";
    return animate(scene, el, [
        {strokeDashoffset: length, fillOpacity: 0},
        {strokeDashoffset: "0px", fillOpacity: 0, offset: 0.7},
        {strokeDashoffset: "0px", fillOpacity: 1},
    ], {duration});
};

/**
 * Fade an element in, optionally sliding it from an offset
 */
export const fadeIn = (el: SVGElement, {duration = 600, shift = [0, 0] as [number, number]} = {}): SceneAnimation => (scene) => {
    const [dx, dy] = shift;
    const {x, y} = offsetOf(el);
    return animate(scene, el, [
        {opacity: 0, translate: `${x + dx}px ${y + dy}px`},
        {opacity: 1, translate: `${x}px ${y}px`},
    ], {duration});
};

/**
 * Fade an element out
 */
export const fadeOut = (el: SVGElement, {duration = 500} = {}): SceneAnimation => (scene) =>
    animate(scene, el, [{opacity: 0}], {duration});

/**
 * Move (and optionally scale) an element so its anchor sits at x, y
 */
export const moveTo = (
    el: SVGElement,
    {x, y, scale, duration = 800}: {x?: number, y?: number, scale?: number, duration?: number} = {},
): SceneAnimation => (scene) => {
    const offset = offsetOf(el);
    const dx = x === undefined ? offset.x : x - Number(el.dataset.x);
    const dy = y === undefined ? offset.y : y - Number(el.dataset.y);
    el.dataset.dx = String(dx);
    el.dataset.dy = String(dy);

    const frame: Frame = {translate: `${dx}px ${dy}px`};
    if (scale !== undefined) {
        el.dataset.scale = String(scale);
        frame.scale = scale;
    }
    return animate(scene, el, [frame], {duration});
};

/**
 * Briefly pulse an element and recolor it (manim's Indicate)
 */
export const indicate = (el: SVGElement, {color = "var(--color-primary)", duration = 700} = {}): SceneAnimation => (scene) => {
    const scale = Number(el.dataset.scale);
    return animate(scene, el, [
        {scale},
        {scale: scale * 1.25, fill: color, stroke: color, offset: 0.4},
        {scale, fill: color, stroke: color},
    ], {duration});
};

const offsetOf = (el: SVGElement) => ({x: Number(el.dataset.dx), y: Number(el.dataset.dy)});

/**
 * Create a scene drawing into the provided svg element. Clears the svg.
 * @param svg the svg to draw into
 */
export const createScene = (svg: SVGSVGElement): Scene => {
    let disposed = false;
    let skipping = false;
    let pendingWait: (() => void) | null = null;
    const running = new Set<Animation>();
    const objects = new Map<string, SVGTextElement>();

    const guard = () => {
        if (disposed) throw new SceneAbortedError();
    };

    svg.replaceChildren();

    const scene: Scene = {
        /**
         * When true, every animation jumps to its end state (used to restore earlier steps)
         */
        instant: false,

        /**
         * Add a hidden text object, centered on x, y. Reveal it with write or fadeIn
         * @param content the text
         * @param options position, size, color and an optional name to get it back later
         */
        text(content, {x = WIDTH / 2, y = HEIGHT / 2, size = 48, color = "var(--color-heading)", name} = {}) {
            guard();
            const el = document.createElementNS(SVG_NS, "text");
            el.textContent = content;
            el.setAttribute("x", String(x));
            el.setAttribute("y", String(y));
            el.setAttribute("text-anchor", "middle");
            el.setAttribute("dominant-baseline", "central");
            el.setAttribute("font-size", String(size));
            Object.assign(el.style, {
                fill: color,
                stroke: color,
                strokeWidth: String(Math.max(1, size / 80)),
                opacity: "0",
                transformBox: "fill-box",
                transformOrigin: "center",
            });
            Object.assign(el.dataset, {x, y, dx: 0, dy: 0, scale: 1, length: size * 12});

            if (name) {
                objects.get(name)?.remove();
                objects.set(name, el);
            }
            svg.append(el);
            return el;
        },

        /**
         * Get back an object created with a name
         */
        get(name) {
            const el = objects.get(name);
            if (!el) throw new Error(`No scene object named "${name}"`);
            return el;
        },

        /**
         * Run animations in parallel and wait for all of them
         * @param animations animations created with write, fadeIn, moveTo...
         */
        async play(...animations) {
            guard();
            const started = animations.map((animation) => animation(scene)).filter((animation) => animation !== null);
            started.forEach((animation) => {
                running.add(animation);
                if (skipping) animation.finish();
            });
            await Promise.allSettled(started.map((animation) => animation.finished));
            started.forEach((animation) => running.delete(animation));
            guard();
        },

        /**
         * Pause the script
         * @param ms the duration of the pause
         */
        async wait(ms = 1000) {
            guard();
            if (!scene.instant && !skipping) {
                await new Promise<void>((resolve) => {
                    const timeout = setTimeout(resolve, ms);
                    pendingWait = () => {
                        clearTimeout(timeout);
                        resolve();
                    };
                });
                pendingWait = null;
            }
            guard();
        },

        /**
         * Jump to the end of the script currently playing
         */
        skip() {
            skipping = true;
            running.forEach((animation) => animation.finish());
            pendingWait?.();
        },

        /**
         * Stop the scene, any further call in its script throws a SceneAbortedError
         */
        dispose() {
            disposed = true;
            running.forEach((animation) => animation.cancel());
            pendingWait?.();
        },

        /**
         * Reset skipping, to be called before playing a new script
         */
        resetSkip() {
            skipping = false;
        },
    };

    return scene;
};
