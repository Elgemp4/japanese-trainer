import {type AnimationOptions, type Frame, AbstractSceneAnimation} from "./abstract-scene-animation.ts";
import type {SceneElement} from "../scene-element.ts";

export type FadeInOptions = AnimationOptions & {
    shift? : [number, number]
}

/**
 * Fade an element in, optionally sliding it from an offset
 */
export class FadeinAnimation extends AbstractSceneAnimation {
    protected shift: [number, number];

    constructor(el : SceneElement, {shift = [0,0], ...options} : FadeInOptions = {}) {
        super(el, {...options});
        this.shift = shift;
    }


    protected keyframes(): Frame[] {
        const [dx, dy] = this.shift;
        const {x, y} = this.el.position;
        return [
            {opacity: 0, translate: `${x + dx}px ${y + dy}px`},
            {opacity: 1, translate: `${x}px ${y}px`},
        ];
    }

    protected reducedKeyframes(): Frame[] {
        return [{opacity: 0}, {opacity: 1}];
    }

}