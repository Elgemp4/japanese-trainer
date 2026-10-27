import {AbstractSceneAnimation, type Frame} from "./abstract-scene-animation.ts";

/**
 * Draw the outline of an element, then fill it (manim's Write)
 */
export class WriteAnimation extends AbstractSceneAnimation{
    protected keyframes(): Frame[] {
        const length = `${this.el.length}px`;
        return[
            {opacity: "1", strokeDasharray: length, strokeDashoffset: length, fillOpacity: 0},
            {opacity: "1", strokeDasharray: length, strokeDashoffset: "0px", fillOpacity: 0, offset: 0.7},
            {opacity: "1", strokeDasharray: length, strokeDashoffset: "0px", fillOpacity: 1},
        ];
    }

    protected reducedKeyframes(): Frame[] {
        const length = `${this.el.length}px`;
        return[
            {opacity: "1", strokeDasharray: length, strokeDashoffset: length, fillOpacity: 0},
            {opacity: "1", strokeDasharray: length, strokeDashoffset: "0px", fillOpacity: 0, offset: 0.7},
            {opacity: "1", strokeDasharray: length, strokeDashoffset: "0px", fillOpacity: 1},
        ];
    }

}