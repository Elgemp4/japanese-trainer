import {type AnimationOptions, type Frame, AbstractSceneAnimation} from "./abstract-scene-animation.ts";
import type {SceneElement} from "../scene-element.ts";


/**
 * Fade an element out
 */
export class FadeOutAnimation extends AbstractSceneAnimation {
    constructor(el : SceneElement, options : AnimationOptions = {}) {
        super(el, {duration: 500, ...options});
    }


    protected keyframes(): Frame[] {
        return  [{opacity: 0}];
    }

    protected reducedKeyframes(): Frame[] {
        return  [{opacity: 0}];
    }

}