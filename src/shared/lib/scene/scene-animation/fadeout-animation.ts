import {type Frame, AbstractSceneAnimation} from "./abstract-scene-animation.ts";


/**
 * Fade an element out
 */
export class FadeOutAnimation extends AbstractSceneAnimation {

    protected keyframes(): Frame[] {
        return  [{opacity: 0}];
    }

    protected reducedKeyframes(): Frame[] {
        return  [{opacity: 0}];
    }

}