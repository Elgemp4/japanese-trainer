import {BrowserRouter, Route, Routes} from "react-router";
import TestPage from "../pages/test/test-page.tsx";
import LessonPathPage from "../pages/lessons/lesson-path-page.tsx";
import LessonPage from "../pages/lessons/lesson-page.tsx";
import Layout from "./layout.tsx";

const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout/>}>
                    <Route path="/" element={<TestPage/>}/>
                    <Route path="/lessons" element={<LessonPathPage/>}/>
                    <Route path="/lessons/:id" element={<LessonPage/>}/>
                </Route>
            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;
