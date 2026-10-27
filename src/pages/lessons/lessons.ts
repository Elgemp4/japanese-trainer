import type {Step} from "../../shared/lib/scene/scene-player.tsx";
import {WIDTH} from "../../shared/lib/scene/scene.ts";
import {WriteAnimation} from "../../shared/lib/scene/scene-animation/write-animation.ts";
import {FadeinAnimation} from "../../shared/lib/scene/scene-animation/fadein-animation.ts";
import {FadeOutAnimation} from "../../shared/lib/scene/scene-animation/fadeout-animation.ts";
import {MovetoAnimation} from "../../shared/lib/scene/scene-animation/moveto-animation.ts";
import {IndicateAnimation} from "../../shared/lib/scene/scene-animation/indicate-animation.ts";

/**
 * A kana with its reading and an optional hint about its pronunciation
 */
type KanaEntry = [kana: string, romaji: string, hint?: string];

export type Lesson = {
    id: string,
    title: string,
    steps: Step[],
};

const CENTER = {x: WIDTH / 2, y: 190};
const SLOT_Y = 60;
const SLOT_GAP = 110;

/**
 * The x position of the i-th kana once collected in the top row
 */
const slotX = (i: number, count: number) => WIDTH / 2 + (i - (count - 1) / 2) * SLOT_GAP;

/**
 * Build a lesson teaching a row of kana: each kana is presented, then quizzed,
 * then collected in the top row, and the lesson ends by typing the whole row
 * @param id the lesson id, used in the url
 * @param title the lesson title
 * @param kana a list of [kana, romaji, hint?]
 */
const makeRowLesson = ({id, title, kana}: {id: string, title: string, kana: KanaEntry[]}): Lesson => {
    const count = kana.length;

    const intro: Step = {
        caption: `Let's learn ${kana.map(([k]) => k).join(" ")}`,
        play: async (scene) => {
            const heading = scene.text(title, {size: 56});
            const subtitle = scene.text(`${count} new kana`, {y: 290, size: 28, color: "var(--color-muted)"});
            await scene.play(new WriteAnimation(heading));
            await scene.play(new FadeinAnimation(subtitle, {shift: [0, 20]}));
        },
    };

    const kanaSteps = kana.flatMap(([character, romaji, hint], i): Step[] => [
        {
            caption: hint ?? `${character} is read “${romaji}”`,
            play: async (scene) => {
                // Collect the previous kana in the top row before writing the new one
                if (i > 0) {
                    await scene.play(
                        new MovetoAnimation(scene.get(`kana-${i - 1}`), {x: slotX(i - 1, count), y: SLOT_Y, scale: 0.35}),
                        new FadeOutAnimation(scene.get("romaji")),
                    );
                }
                const big = scene.text(character, {...CENTER, size: 180, name: `kana-${i}`});
                const label = scene.text(romaji, {x: CENTER.x, y: 350, size: 44, color: "var(--color-secondary)", name: "romaji"});
                await scene.play(new WriteAnimation(big));
                await scene.play(new FadeinAnimation(label, {shift: [0, 20]}));
            },
        },
        {
            caption: "How is it read? Type it below.",
            play: async (scene) => {
                await scene.play(new FadeOutAnimation(scene.get("romaji")));
            },
            check: {
                answer: character,
                onSuccess: async (scene) => {
                    await scene.play(new FadeinAnimation(scene.get("romaji")), new IndicateAnimation(scene.get(`kana-${i}`)));
                },
            },
        },
    ]);

    const recap: Step = {
        caption: `Now type the whole row: ${kana.map(([, r]) => r).join(" ")}`,
        play: async (scene) => {
            await scene.play(new FadeOutAnimation(scene.get("romaji")));
            await scene.play(...kana.map((_, i) =>
                new MovetoAnimation(scene.get(`kana-${i}`), {x: slotX(i, count), y: CENTER.y, scale: 0.6}),
            ));
            for (const [i, [, romaji]] of kana.entries()) {
                const label = scene.text(romaji, {x: slotX(i, count), y: 290, size: 32, color: "var(--color-secondary)"});
                await scene.play(new FadeinAnimation(label, {shift: [0, 15], duration: 300}));
            }
        },
        check: {
            answer: kana.map(([k]) => k).join(""),
            onSuccess: async (scene) => {
                for (const i of kana.keys()) {
                    await scene.play(new IndicateAnimation(scene.get(`kana-${i}`), {duration: 400}));
                }
            },
        },
    };

    return {id, title, steps: [intro, ...kanaSteps, recap]};
};

export const lessons: Lesson[] = [
    makeRowLesson({
        id: "vowels",
        title: "The vowels",
        kana: [
            ["あ", "a", "あ sounds like the “a” in “father”"],
            ["い", "i", "い sounds like the “ee” in “meet”"],
            ["う", "u", "う sounds like the “oo” in “food”, lips relaxed"],
            ["え", "e", "え sounds like the “e” in “bed”"],
            ["お", "o", "お sounds like the “o” in “more”"],
        ],
    }),
    makeRowLesson({
        id: "k-row",
        title: "The K row",
        kana: [["か", "ka"], ["き", "ki"], ["く", "ku"], ["け", "ke"], ["こ", "ko"]],
    }),
    makeRowLesson({
        id: "s-row",
        title: "The S row",
        kana: [["さ", "sa"], ["し", "shi", "し is read “shi”, not “si”"], ["す", "su"], ["せ", "se"], ["そ", "so"]],
    }),
];

export const findLesson = (id?: string) => lessons.find((lesson) => lesson.id === id);
