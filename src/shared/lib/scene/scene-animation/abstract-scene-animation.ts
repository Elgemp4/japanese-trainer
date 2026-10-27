import type {Scene} from "../scene.ts";
import type {SceneElement} from "../scene-element.ts";

/**
 * A keyframe whose properties are the CSS properties being animated, in camelCase
 */
export type Frame = Partial<Record<keyof CSSStyleDeclaration, string | number>> & {offset?: number};

export type AnimationOptions = {
    duration?: number,
    easing?: string,
};

export abstract class AbstractSceneAnimation {
    private prefersReducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

    protected el : SceneElement;
    protected duration : number;
    protected easing : string;

    constructor(el : SceneElement, {duration = 600, easing="ease-in-out"} : AnimationOptions = {}) {
        this.el = el;
        this.duration = duration;
        this.easing = easing;
    }

    /**
     * Animate an element and keep its final state.
     * When animations are unavailable (instant mode, reduced motion, jsdom) the final frame is applied directly
     * @param scene
     */
    animate(scene: Scene): Animation | null {
        const keyframes = this.prefersReducedMotion() ? this.reducedKeyframes() : this.keyframes();
        const lastFrame = keyframes[keyframes.length - 1];
        if (scene.instant) {
            this.el.applyFrame(lastFrame);
            return null;
        }

        const animation = this.el.animate(keyframes, {fill: "forwards", easing: this.easing, duration: this.duration});
        if(animation === null){
            this.el.applyFrame(lastFrame);
            return null;
        }

        animation.finished
            .then(() => {
                this.el.applyFrame(lastFrame);
                animation.cancel();
            })
            .catch(() => {});
        return animation;
    };

    /**
     * Play the animation in a normal way
     * @param scene
     * @protected
     */
    protected abstract keyframes(): Frame[];

    /**
     * Play the animation in a reduced motion way
     * @param scene
     * @protected
     */
    protected abstract reducedKeyframes(): Frame[];
}