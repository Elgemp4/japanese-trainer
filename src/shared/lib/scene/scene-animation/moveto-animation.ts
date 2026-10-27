import {AbstractSceneAnimation, type AnimationOptions, type Frame} from "./abstract-scene-animation.ts";
import type {SceneElement} from "../scene-element.ts";

export type MoveToOptions = AnimationOptions & {
    x?: number,
    y?: number,
    scale?: number
}

/**
 * Move (and optionally scale) an element so its center sits at x, y
 */
export class MovetoAnimation extends AbstractSceneAnimation {
    protected x : number|undefined;
    protected y : number|undefined;
    protected scale : number|undefined;
    constructor(el : SceneElement, {x,y,scale,...options} : MoveToOptions = {}) {
        super(el, {duration: 800, ...options});
        this.x = x;
        this.y = y;
        this.scale = scale;
    }

    protected keyframes(): Frame[] {
        const {position} = this.el;
        const x = this.x ?? position.x;
        const y = this.y ?? position.y;

        const frame: Frame = {translate: `${x}px ${y}px`};
        if (this.scale !== undefined) {
            frame.scale = this.scale;
        }
        return [frame];
    }

    protected reducedKeyframes(): Frame[] {
        return this.keyframes();
    }

}