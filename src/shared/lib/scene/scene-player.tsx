import {useEffect, useRef, useState} from "react";
import {createScene, HEIGHT, type Scene, SceneAbortedError, WIDTH} from "./scene.ts";
import KanaInput from "../../ui/kana-input/kana-input.tsx";

export type Step = {
    caption: string,
    play: (scene: Scene) => Promise<void>,
    /** Makes the step a quiz: the user must type the answer to continue */
    check?: {
        answer: string,
        onSuccess?: (scene: Scene) => Promise<void>,
    },
};

type ScenePlayerProps = {
    steps: Step[],
    onComplete?: () => void,
};

const ignoreAbort = (error: unknown) => {
    if (!(error instanceof SceneAbortedError)) throw error;
};

/**
 * Play a step's script, then its success script when the step was a solved quiz
 */
const runStep = async (scene: Scene, step: Step, solved: boolean) => {
    scene.resetSkip();
    await step.play(scene);
    if (solved && step.check?.onSuccess) {
        await step.check.onSuccess(scene);
    }
};

/**
 * Plays a list of animated steps, manim-slides style.
 * Steps with a check wait for the user to type the answer before allowing to continue.
 */
const ScenePlayer = ({steps, onComplete}: ScenePlayerProps) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const sceneRef = useRef<Scene>(null);
    const [index, setIndex] = useState(0);
    const [run, setRun] = useState(0);
    const [finishedRun, setFinishedRun] = useState<string | null>(null);
    const [solved, setSolved] = useState(false);

    const step = steps[index];
    const runKey = `${index}-${run}`;
    const playing = finishedRun !== runKey;
    const isLast = index === steps.length - 1;
    const blocked = step.check && !solved;

    useEffect(() => {
        if (!svgRef.current) return;
        const scene = createScene(svgRef.current);
        sceneRef.current = scene;

        (async () => {
            // Restore the state left by the previous steps instantly, then animate the current one
            scene.instant = true;
            for (const previous of steps.slice(0, index)) {
                await runStep(scene, previous, true);
            }
            scene.instant = false;
            await runStep(scene, steps[index], false);
            setFinishedRun(`${index}-${run}`);
        })().catch(ignoreAbort);

        return () => scene.dispose();
    }, [steps, index, run]);

    const goTo = (newIndex: number) => {
        setSolved(false);
        setIndex(newIndex);
    };

    const next = () => {
        if (isLast) onComplete?.();
        else goTo(index + 1);
    };

    const checkAnswer = (value: string) => {
        const scene = sceneRef.current;
        if (solved || !scene || value !== step.check?.answer) return;
        setSolved(true);
        scene.skip();
        // Let the skipped script settle before celebrating
        setTimeout(() => {
            scene.resetSkip();
            step.check?.onSuccess?.(scene).catch(ignoreAbort);
        });
    };

    return (
        <div className="flex flex-col gap-4">
            <svg
                ref={svgRef}
                viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                className="w-full aspect-video bg-surface border border-border rounded-xl font-[Noto_Sans_JP,sans-serif]"
                role="img"
                aria-label={step.caption}
            />

            <p className="text-center text-lg text-text min-h-7" aria-live="polite">{step.caption}</p>

            {step.check && (
                <KanaInput
                    key={index}
                    className="self-center text-center text-2xl"
                    aria-label="Your answer"
                    placeholder="Type in romaji…"
                    autoFocus
                    onValueChange={checkAnswer}
                />
            )}

            <div className="flex items-center justify-between gap-2">
                <button className="btn" onClick={() => goTo(index - 1)} disabled={index === 0}>
                    Back
                </button>
                <span className="text-muted text-sm">{index + 1} / {steps.length}</span>
                <div className="flex gap-2">
                    {playing
                        ? <button className="btn" onClick={() => sceneRef.current?.skip()}>Skip</button>
                        : <button className="btn" onClick={() => {
                            setSolved(false);
                            setRun(run + 1);
                        }}>Replay</button>}
                    <button className="btn btn-primary" onClick={next} disabled={blocked}>
                        {isLast ? "Finish" : "Next"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ScenePlayer;
