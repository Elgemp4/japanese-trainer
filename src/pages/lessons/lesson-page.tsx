import {Link, useNavigate, useParams} from "react-router";
import ScenePlayer from "../../shared/lib/scene/scene-player.tsx";
import {findLesson} from "./lessons.ts";
import {markCompleted} from "./progress.ts";

const LessonPage = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const lesson = findLesson(id);

    if (!lesson) {
        return <p className="lesson">Lesson not found. <Link className="text-primary" to="/lessons">Back to lessons</Link></p>;
    }

    const complete = () => {
        markCompleted(lesson.id);
        navigate("/lessons");
    };

    return (
        <section className="lesson flex flex-col gap-4">
            <Link className="text-primary" to="/lessons">← Lessons</Link>
            <h1 className="text-2xl font-bold text-heading">{lesson.title}</h1>
            <ScenePlayer key={lesson.id} steps={lesson.steps} onComplete={complete}/>
        </section>
    );
};

export default LessonPage;
