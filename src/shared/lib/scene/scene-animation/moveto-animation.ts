import {AbstractSceneAnimation, type AnimationOptions, type Frame} from "./abstract-scene-animation.ts";
import type {SceneElement} from "../scene-element.ts";

export type MoveToOptions = AnimationOptions & {
    x?: number,
    y?: number,
    scale?: number
}

/**
 * Move (and optionally scale) an element so its anchor sits at x, y
 */
export class MovetoAnimation extends AbstractSceneAnimation {
    protected x : number|undefined;
    protected y : number|undefined;
    protected scale : number|undefined;
    constructor(el : SceneElement, {x,y,scale,...options} : MoveToOptions = {}) {
        super(el, {...options});
        this.x = x;
        this.y = y;
        this.scale = scale;
    }

    protected keyframes(): Frame[] {
        const offset = this.el.offset;
        const dx = this.x === undefined ? offset.x : this.x - Number(offset.x);
        const dy = this.y === undefined ? offset.y : this.y - Number(offset.y);

        const frame: Frame = {translate: `${dx}px ${dy}px`};
        if (this.scale !== undefined) {
            frame.scale = this.scale;
        }
        return [frame];
    }

    protected reducedKeyframes(): Frame[] {
        const offset = this.el.offset;
        const dx = this.x === undefined ? offset.x : this.x - Number(offset.x);
        const dy = this.y === undefined ? offset.y : this.y - Number(offset.y);

        const frame: Frame = {translate: `${dx}px ${dy}px`};
        if (this.scale !== undefined) {
            frame.scale = this.scale;
        }
        return [frame];
    }

}