import type {Frame} from "./scene-animation/abstract-scene-animation.ts";

export const SVG_NS = "http://www.w3.org/2000/svg";

/**
 * An object of the scene. Its content is drawn around (0, 0) inside a <g>,
 * and the group's translate is the object's position, whatever the content is.
 * Inherited styles (fill, stroke, opacity...) set on the group apply to the whole content.
 */
export class SceneElement{
    private group : SVGGElement;
    length: number = 0;

    /**
     * @param content the svg drawing, centered on (0, 0)
     * @param position where the center of the object is placed in the scene
     */
    constructor(content : SVGElement, {x, y} : {x: number, y: number}) {
        this.group = document.createElementNS(SVG_NS, "g");
        this.group.append(content);
        this.group.style.translate = `${x}px ${y}px`;
        this.group.style.opacity = "0";
    }

    get position() : {x:number, y: number}{
        // A translate with a single value means y = 0, "".split(" ") would give [""]
        const [x="0", y="0"] = (this.group.style.translate || "0px").split(" ");
        return {
            x: parseFloat(x),
            y: parseFloat(y)
        }
    }

    get scale() : number{
        return parseFloat(this.group.style.scale || "1");
    }

    /**
     * Apply styles directly on the object, without animating
     */
    setStyle(style : Partial<CSSStyleDeclaration>){
        Object.assign(this.group.style, style);
    }

    animate(keyframes: Frame[], params:  KeyframeAnimationOptions) {
        if(typeof this.group.animate !== "function"){
            return null;
        }
        return this.group.animate(keyframes as Keyframe[],params);
    }

    applyFrame(keyframe : Frame){
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const {offset, ...style} = keyframe;
        Object.assign(this.group.style, style);
    }

    /**
     * Add the object to the scene's svg
     */
    mount(parent : Element) {
        parent.append(this.group);
    }

    remove() {
        this.group.remove();
    }
}
