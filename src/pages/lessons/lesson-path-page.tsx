import {Link} from "react-router";
import {lessons} from "./lessons.ts";
import {getCompleted, isUnlocked} from "./progress.ts";

// Horizontal offsets making the path zigzag
const ZIGZAG = ["0", "4rem", "0", "-4rem"];

const LessonPathPage = () => {
    const completed = getCompleted();

    return (
        <section className="lesson-path flex flex-col items-center gap-4">
            <h1 className="text-3xl font-bold text-heading mb-6">Lessons</h1>
            <ol className="flex flex-col items-center gap-8">
                {lessons.map((lesson, i) => {
                    const done = completed.has(lesson.id);
                    const unlocked = isUnlocked(lessons, i, completed);
                    const node = (
                        <>
                            <span className={`size-16 rounded-full grid place-items-center text-xl font-bold border-4 ${
                                done ? "bg-primary border-primary text-surface"
                                    : unlocked ? "bg-surface border-primary text-primary"
                                        : "bg-bg border-border text-muted"
                            }`}>
                                {done ? "✓" : i + 1}
                            </span>
                            <span className={unlocked ? "text-heading" : "text-muted"}>{lesson.title}</span>
                        </>
                    );

                    return (
                        <li key={lesson.id} style={{translate: ZIGZAG[i % ZIGZAG.length]}}>
                            {unlocked
                                ? <Link to={`/lessons/${lesson.id}`} className="flex flex-col items-center gap-1 hover:scale-105 transition-transform">{node}</Link>
                                : <div className="flex flex-col items-center gap-1" aria-disabled="true">{node}</div>}
                        </li>
                    );
                })}
            </ol>
        </section>
    );
};

export default LessonPathPage;
