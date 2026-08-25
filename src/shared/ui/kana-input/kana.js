import {makeLog} from "../logging/log.js";

const extendedKatakana = {
    // F
    FA: "ファ", FI: "フィ", FE: "フェ", FO: "フォ", FYU: "フュ",
    // V
    VA: "ヴァ", VI: "ヴィ", VU: "ヴ", VE: "ヴェ", VO: "ヴォ",
    // TS
    TSA: "ツァ", TSI: "ツィ", TSE: "ツェ", TSO: "ツォ",
    // CH / SH / J + e
    CHE: "チェ", SHE: "シェ", JE: "ジェ",
    // T + petite voyelle
    TI: "ティ", TU: "トゥ", TYU: "テュ",
    // W
    WI: "ウィ", WE: "ウェ",
    // glides + e (rares)
    KYE: "キェ", GYE: "ギェ", NYE: "ニェ", HYE: "ヒェ",
    BYE: "ビェ", PYE: "ピェ", MYE: "ミェ", RYE: "リェ",
    "-": "ー"
};

const hiraganaMap = {
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

const log = makeLog("kana");

function isUpperCase(text) {
    return text === text.toUpperCase();
}

function hiraganaToKatakana(hiraganas){
    let katakana = "";
    for(const char of hiraganas) {
        katakana += String.fromCharCode(char.codePointAt(0) + 0x60)
    }

    return katakana;
}

function mapToKana(word){
    let extKatakana = extendedKatakana[word];
    if(extKatakana){
        return extKatakana;
    }

    let kana = hiraganaMap[word.toLowerCase()];
    if(!kana) return null;

    return isUpperCase(word) ? hiraganaToKatakana(kana) : kana
}

export function parseToKana(text, cursorPosition = 0) {
    let newCursorPosition = cursorPosition;
    const MAX_CHAR = 3;
    let output = text+"";

    let basePointer = 0;
    let endPointer = 1;

    let shouldIncrementBase;

    log("Start cursor position : ", cursorPosition);
    log("End cursor position : ", newCursorPosition);

    while(basePointer < output.length){
        log("pointers", basePointer, endPointer)
        let kanaTranslation;
        const currentWord = output.slice(basePointer, endPointer);
        const length = endPointer-basePointer;
        shouldIncrementBase = false;

        //Check if the span is not greater than 3 letters and that we don't overflow
        if(length > MAX_CHAR || endPointer > output.length){
            log("Window span exceeded max length, incrementing base pointer");
            shouldIncrementBase = true;
        }
        // Check if the current character is already a kana (only if it's one character wide)
        // Happens if the user uses a IME or a japanese keyboard
        // Micro optimization by fast forwarding those characters and avoiding the sliding window algorithm
        else if(length === 1 && isKana(currentWord)){
            log("Already a kana, skip ahead");
            shouldIncrementBase = true;
        }
        // Check if the current word is romaji convertible to kana
        else if((kanaTranslation = mapToKana(currentWord))){
            log("Converting romaji to kana")
            const before = output.slice(0, basePointer);
            const after = output.slice(endPointer);
            output = before + kanaTranslation + after;
            shouldIncrementBase = true;
        }
        //Check for double consonant
        else if (length >= 2 && currentWord.charAt(0) === currentWord.charAt(1)){
            log("Replacing double consonant by small tsu")
            const before = output.slice(0, basePointer);
            const after = output.slice(endPointer);
            const smallTsu = isUpperCase(currentWord.charAt(0)) ? "ッ" : "っ";
            output = before + smallTsu + currentWord.charAt(0) + after;
        }
        //If no match move the endPointer
        else{
            log("No match advancing endPointer")
            endPointer++;
        }

        if(shouldIncrementBase){
            basePointer += kanaTranslation?.length ?? 1;
            if(kanaTranslation && endPointer === newCursorPosition){
                log("Setting new cursor position")
                newCursorPosition = basePointer
            }
            endPointer = basePointer + 1;
        }
    }

    log("Start cursor position : ", cursorPosition);
    log("End cursor position : ", newCursorPosition);
    return {
        output, newCursorPosition
    };
}

