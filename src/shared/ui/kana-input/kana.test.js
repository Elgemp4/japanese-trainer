import {isKana, parseToKana} from "./kana.js";

import {test, expect, describe} from "vitest"

describe("Testing isKana correctness", () => {
    test("Check non japanese characters to return false", () => {
        expect(isKana('a')).toBeFalsy()
        expect(isKana('3')).toBeFalsy()
        expect(isKana('-')).toBeFalsy()
        expect(isKana('F')).toBeFalsy()
    })

    test("Check basic kanas", () => {
        expect(isKana('く')).toBeTruthy();
        expect(isKana('あ')).toBeTruthy();
        expect(isKana('を')).toBeTruthy();
        expect(isKana('ク')).toBeTruthy();
        expect(isKana('ア')).toBeTruthy();
        expect(isKana('ヲ')).toBeTruthy();
    })

    test("Check redaku kanas", () => {
        expect(isKana('が')).toBeTruthy();
        expect(isKana('づ')).toBeTruthy();
        expect(isKana('ぽ')).toBeTruthy();
        expect(isKana('ガ')).toBeTruthy();
        expect(isKana('ギ')).toBeTruthy();
        expect(isKana('ボ')).toBeTruthy();
    })

    test("Check small kanas", () => {
        expect(isKana('ゃ')).toBeTruthy();
        expect(isKana('ゅ')).toBeTruthy();
        expect(isKana('ょ')).toBeTruthy();
        expect(isKana('っ')).toBeTruthy();
        expect(isKana('ー')).toBeTruthy();
        expect(isKana('ュ')).toBeTruthy();
        expect(isKana('ョ')).toBeTruthy();
        expect(isKana('ャ')).toBeTruthy();
    })
})


describe("Testing parseToKana", () => {
    test("Test basic vowels and ん", () => {
        expect(parseToKana("a").output).toBe("あ")
        expect(parseToKana("aiueo").output).toBe("あいうえお")
        expect(parseToKana("n").output).toBe("n")
        expect(parseToKana("nn").output).toBe("ん")
    })
    test("Test vowels + consonants", () => {
        expect(parseToKana("ka").output).toBe("か")
        expect(parseToKana("na").output).toBe("な")
        expect(parseToKana("cha").output).toBe("ちゃ")
        expect(parseToKana("kya").output).toBe("きゃ")
        expect(parseToKana("tsu").output).toBe("つ")
        expect(parseToKana("shi").output).toBe("し")
        expect(parseToKana("du").output).toBe("づ")
        expect(parseToKana("kachakyatsushidu").output).toBe("かちゃきゃつしづ")
    })
    test("Test double consonant", () => {
        expect(parseToKana("ccha").output).toBe("っちゃ");
        expect(parseToKana("kakkoi").output).toBe("かっこい");
        expect(parseToKana("gekkou").output).toBe("げっこう");
    });
    test("Test with characters in the middle", () => {
        expect(parseToKana("akkkkkkkka").output).toBe("あっっっっっっっか");
        expect(parseToKana("ahjklmka").output).toBe("あhjklmか");
    });

    test("Test with　preexisting kanas", () => {
        expect(parseToKana("あぶく").output).toBe("あぶく");
        expect(parseToKana("あぶku").output).toBe("あぶく");
    });

    test("Cursor position after input", () => {
        expect(parseToKana("あbuく", 3).newCursorPosition).toBe(2);
        expect(parseToKana("aぶく", 1).newCursorPosition).toBe(1);
        expect(parseToKana("あくkyuか", 5).newCursorPosition).toBe(4);
    })
})
