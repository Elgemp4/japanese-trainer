import {test, expect, describe, vi, afterEach} from "vitest"
import {Scene, SceneAbortedError} from "./scene.ts";
import {WriteAnimation} from "./scene-animation/write-animation.ts";
import {FadeinAnimation} from "./scene-animation/fadein-animation.ts";
import {MovetoAnimation} from "./scene-animation/moveto-animation.ts";
import {IndicateAnimation} from "./scene-animation/indicate-animation.ts";

const makeSvg = () => document.createElementNS("http://www.w3.org/2000/svg", "svg");

/** The group drawn for the n-th object of the scene */
const drawn = (svg: SVGSVGElement, n = 0) => svg.children[n] as SVGGElement;

describe("Testing scene engine", () => {
    afterEach(() => vi.unstubAllGlobals())

    test("Objects start hidden and write reveals them", async() => {
        const svg = makeSvg();
        const scene = new Scene(svg);
        const kana = scene.text("あ");
        expect(drawn(svg).style.opacity).toBe("0");
        await scene.play(new WriteAnimation(kana));
        expect(drawn(svg).style.opacity).toBe("1");
        expect(drawn(svg).style.fillOpacity).toBe("1");
    })

    test("Objects are positioned where they are created", () => {
        const scene = new Scene(makeSvg());
        expect(scene.text("あ", {x: 400, y: 200}).position).toEqual({x: 400, y: 200});
    })

    test("moveTo moves the object to an absolute position", async() => {
        const scene = new Scene(makeSvg());
        const kana = scene.text("あ", {x: 400, y: 200});
        await scene.play(new MovetoAnimation(kana, {x: 250, y: 100, scale: 0.5}));
        expect(kana.position).toEqual({x: 250, y: 100});
        expect(kana.scale).toBe(0.5);

        // A missing coordinate keeps the current one
        await scene.play(new MovetoAnimation(kana, {x: 300}));
        expect(kana.position).toEqual({x: 300, y: 100});
    })

    test("fadeIn keeps the current position", async() => {
        const scene = new Scene(makeSvg());
        const kana = scene.text("あ", {x: 400, y: 200});
        await scene.play(new MovetoAnimation(kana, {y: 60}));
        await scene.play(new FadeinAnimation(kana, {shift: [0, 20]}));
        expect(kana.position).toEqual({x: 400, y: 60});
    })

    test("An unscaled object has a scale of 1", () => {
        const scene = new Scene(makeSvg());
        expect(scene.text("あ").scale).toBe(1);
    })

    test("Reduced motion indicate only recolors", async() => {
        vi.stubGlobal("matchMedia", () => ({matches: true}));
        const svg = makeSvg();
        const scene = new Scene(svg);
        const kana = scene.text("あ");
        await scene.play(new IndicateAnimation(kana, {color: "red"}));
        expect(drawn(svg).style.fill).toBe("red");
        expect(kana.scale).toBe(1);
    })

    test("Named objects replace each other", () => {
        const svg = makeSvg();
        const scene = new Scene(svg);
        scene.text("a", {name: "label"});
        const second = scene.text("i", {name: "label"});
        expect(svg.children).toHaveLength(1);
        expect(scene.get("label")).toBe(second);
    })

    test("A disposed scene stops its script", async() => {
        const scene = new Scene(makeSvg());
        scene.dispose();
        await expect(scene.play()).rejects.toBeInstanceOf(SceneAbortedError);
        expect(() => scene.text("あ")).toThrow(SceneAbortedError);
    })
})
