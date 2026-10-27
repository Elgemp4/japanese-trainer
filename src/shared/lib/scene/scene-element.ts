import type {Frame} from "./scene-animation/abstract-scene-animation.ts";

export class SceneElement{
    private svg : SVGElement;
    length: number = 0;

    constructor(svg : SVGElement) {
        this.svg = svg;
    }

    get offset() : {x:number, y: number}{
        const [x="0", y="0"] = this.svg.style.translate.split(" ");
        return {
            x: parseFloat(x),
            y: parseFloat(y)
        }
    }

    get scale() : number{
        return parseFloat(this.svg.style.scale);
    }

    animate(keyframes: Frame[], params:  KeyframeAnimationOptions) {
        if(typeof this.svg.animate !== "function"){
            return null;
        }
        return this.svg.animate(keyframes as Keyframe[],params);
    }

    applyFrame(keyframe : Frame){
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const {offset, ...style} = keyframe;
        Object.assign(this.svg.style, style);
    }

    remove() {
        this.svg.remove();
    }
}