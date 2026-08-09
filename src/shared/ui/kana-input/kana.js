export const kanaMap = {
    a: "あ", i: "い", u: "う", e: "え", o: "お",
    ka: "か", ki: "き", ku: "く", ke: "け", ko: "こ",
    sa: "さ", shi: "し", su: "す", se: "せ", so: "そ",
    ta: "た", chi: "ち", tsu: "つ", te: "て", to: "と",
    na: "な", ni: "に", nu: "ぬ", ne: "ね", no: "の",
    ha: "は", hi: "ひ", fu: "ふ", he: "へ", ho: "ほ",
    ma: "ま", mi: "み", mu: "む", me: "め", mo: "も",
    ya: "や", yu: "ゆ", yo: "よ",
    ra: "ら", ri: "り", ru: "る", re: "れ", ro: "ろ",
    wa: "わ", wo: "を", nn: "ん",
    ga: "が", gi: "ぎ", gu: "ぐ", ge: "げ", go: "ご",
    za: "ざ", ji: "じ", zu: "ず", ze: "ぜ", zo: "ぞ",
    da: "だ", di: "ぢ", du: "づ", de: "で", do: "ど",
    ba: "ば", bi: "び", bu: "ぶ", be: "べ", bo: "ぼ",
    pa: "ぱ", pi: "ぴ", pu: "ぷ", pe: "ぺ", po: "ぽ",
    kya: "きゃ", kyu: "きゅ", kyo: "きょ",
    sha: "しゃ", shu: "しゅ", sho: "しょ",
    cha: "ちゃ", chu: "ちゅ", cho: "ちょ",
    nya: "にゃ", nyu: "にゅ", nyo: "にょ",
    hya: "ひゃ", hyu: "ひゅ", hyo: "ひょ",
    mya: "みゃ", myu: "みゅ", myo: "みょ",
    rya: "りゃ", ryu: "りゅ", ryo: "りょ",
    gya: "ぎゃ", gyu: "ぎゅ", gyo: "ぎょ",
    ja: "じゃ", ju: "じゅ", jo: "じょ",
    bya: "びゃ", byu: "びゅ", byo: "びょ",
    pya: "ぴゃ", pyu: "ぴゅ", pyo: "ぴょ",
}

export function isKana(char) {
    const code = char.codePointAt(0);
    return (
        (code >= 0x3040 && code <= 0x309f) || // hiragana
        (code >= 0x30a0 && code <= 0x30ff)    // katakana
    );
}


export function parseToKana(text, cursorPosition = 0) {
    let newCursorPosition = cursorPosition;
    const MAX_CHAR = 3;
    let output = text+"";

    let basePointer = 0;
    let endPointer = 1;

    let shouldIncrementBase;

    while(basePointer < output.length){
        let kanaTranslation;
        const currentWord = output.slice(basePointer, endPointer);
        const length = endPointer-basePointer;
        shouldIncrementBase = false;

        //Check if the span is not greater than 3 letters and that we don't overflow
        if(length > MAX_CHAR || endPointer > output.length){
            shouldIncrementBase = true;
        }
        // Check if the current character is already a kana (only if it's one caracter wide)
        else if(length === 1 && isKana(currentWord)){
            shouldIncrementBase = true;
        }
        // Check if the current word is romajed kana
        else if((kanaTranslation = kanaMap[currentWord])){
            const before = output.slice(0, basePointer);
            const after = output.slice(endPointer);
            output = before + kanaTranslation + after;
            shouldIncrementBase = true;

        }
        //Check for double consonant
        else if (length >= 2 && currentWord.charAt(0) === currentWord.charAt(1)){
            const before = output.slice(0, basePointer);
            const after = output.slice(endPointer);
            output = before + "っ" + currentWord.charAt(0) + after;
            shouldIncrementBase = true;
        }
        //If no match move the endPointer
        else{
            endPointer++;
        }

        if(shouldIncrementBase){
            basePointer += kanaTranslation?.length ?? 1;
            if(endPointer === newCursorPosition){
                newCursorPosition = basePointer
            }
            endPointer = basePointer + 1;
        }
    }

    return {
        output, newCursorPosition
    };
}

