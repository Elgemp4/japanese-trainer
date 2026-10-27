/**
 * A tiny manim-like animation engine running on SVG + the Web Animations API.
 *
 * Usage:
 *   const scene = createScene(svgElement);
 *   const title = scene.text("あ", {size: 160});
 *   await scene.play(write(title));
 *   await scene.play(moveTo(title, {y: 70, scale: 0.4}), fadeIn(other));
 */
import {SceneElement} from "./scene-element.ts";
import type {AbstractSceneAnimation} from "./scene-animation/abstract-scene-animation.ts";

const SVG_NS = "http://www.w3.org/2000/svg";



export type TextOptions = {
    x?: number,
    y?: number,
    size?: number,
    color?: string,
    /** Name to get the object back with scene.get, an object with the same name gets replaced */
    name?: string,
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


export class Scene{
    private disposed = false;
    private skipping = false;
    private pendingWait: (() => void) | null = null;
    private running = new Set<Animation>();
    private objects = new Map<string, SceneElement>();

    /**
     * When true, every animation jumps to its end state (used to restore earlier steps)
     */
    instant = false;
    private svg : SVGElement;

    constructor(svg : SVGElement) {
        this.svg = svg;
        this.svg.replaceChildren();
    }

    guard() {
        if (this.disposed) throw new SceneAbortedError();
    }

    /**
     * Add a hidden text object, centered on x, y. Reveal it with write or fadeIn
     * @param content the text
     * @param options position, size, color and an optional name to get it back later
     */
    text(content: string, {x = WIDTH / 2, y = HEIGHT / 2, size = 48, color = "var(--color-heading)", name} : TextOptions = {}) {
        this.guard();
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

        const sceneElement = new SceneElement(el);
        sceneElement.length = size * 12;

        if (name) {
            this.objects.get(name)?.remove();
            this.objects.set(name, sceneElement);
        }

        this.svg.append(el);
        return sceneElement;
    }

    /**
     * Get back an object created with a name
     */
    get(name: string) {
        const el = this.objects.get(name);
        if (!el) throw new Error(`No scene object named "${name}"`);
        return el;
    }

    /**
     * Run animations in parallel and wait for all of them
     * @param animations animations created with write, fadeIn, moveTo...
     */
    async play(...animations : AbstractSceneAnimation[]) {
        this.guard();
        const started = animations.map((animation) => animation.animate(this)).filter((animation) => animation !== null);
        started.forEach((animation) => {
            this.running.add(animation);
            if (this.skipping) animation.finish();
        });
        await Promise.allSettled(started.map((animation) => animation.finished));
        started.forEach((animation) => this.running.delete(animation));
        this.guard();
    }

    /**
     * Pause the script
     * @param ms the duration of the pause
     */
    async wait(ms = 1000) {
        this.guard();
        if (!this.instant && !this.skipping) {
            await new Promise<void>((resolve) => {
                const timeout = setTimeout(resolve, ms);
                this.pendingWait = () => {
                    clearTimeout(timeout);
                    resolve();
                };
            });
            this.pendingWait = null;
        }
        this.guard();
    }

    /**
     * Jump to the end of the script currently playing
     */
    skip() {
        this.skipping = true;
        this.running.forEach((animation) => animation.finish());
        this.pendingWait?.();
    }

    /**
     * Stop the scene, any further call in its script throws a SceneAbortedError
     */
    dispose() {
        this.disposed = true;
        this.running.forEach((animation) => animation.cancel());
        this.pendingWait?.();
    }

    /**
     * Reset skipping, to be called before playing a new script
     */
    resetSkip() {
        this.skipping = false;
    }
}