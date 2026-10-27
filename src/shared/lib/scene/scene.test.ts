import {test, expect, describe} from "vitest"
import {createScene, fadeIn, moveTo, SceneAbortedError, write} from "./scene.ts";

const makeSvg = () => document.createElementNS("http://www.w3.org/2000/svg", "svg");

describe("Testing scene engine", () => {
    test("Objects start hidden and write reveals them", async() => {
        const scene = createScene(makeSvg());
        const kana = scene.text("あ");
        expect(kana.style.opacity).toBe("0");
        await scene.play(write(kana));
        expect(kana.style.opacity).toBe("1");
        expect(kana.style.fillOpacity).toBe("1");
    })

    test("moveTo translates relative to the object anchor", async() => {
        const scene = createScene(makeSvg());
        const kana = scene.text("あ", {x: 400, y: 200});
        await scene.play(moveTo(kana, {x: 450, y: 100, scale: 0.5}), fadeIn(scene.text("a")));
        expect(kana.style.translate).toBe("50px -100px");
        expect(kana.style.scale).toBe("0.5");
    })

    test("Named objects replace each other", () => {
        const svg = makeSvg();
        const scene = createScene(svg);
        scene.text("a", {name: "label"});
        const second = scene.text("i", {name: "label"});
        expect(svg.children).toHaveLength(1);
        expect(scene.get("label")).toBe(second);
    })

    test("A disposed scene stops its script", async() => {
        const scene = createScene(makeSvg());
        scene.dispose();
        await expect(scene.play()).rejects.toBeInstanceOf(SceneAbortedError);
        expect(() => scene.text("あ")).toThrow(SceneAbortedError);
    })
})
