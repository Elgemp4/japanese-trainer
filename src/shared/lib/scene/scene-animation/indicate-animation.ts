import {AbstractSceneAnimation, type AnimationOptions, type Frame} from "./abstract-scene-animation.ts";
import type {SceneElement} from "../scene-element.ts";

export type IndicateOptions = AnimationOptions & {
    color?: string
}

/**
 * Briefly pulse an element and recolor it (manim's Indicate)
 */
export class IndicateAnimation extends AbstractSceneAnimation {
    protected color:string;

    constructor(el : SceneElement, {color = "var(--color-primary)", ...options} : IndicateOptions = {}) {
        super(el, {duration: 700, ...options});
        this.color = color;
    }
    protected keyframes(): Frame[] {
        const scale = this.el.scale;
        return [
            {scale},
            {scale: scale * 1.25, fill: this.color, stroke: this.color, offset: 0.4},
            {scale, fill: this.color, stroke: this.color},
        ];
    }

    protected reducedKeyframes(): Frame[] {
        return [{fill: this.color, stroke: this.color}];
    }

}