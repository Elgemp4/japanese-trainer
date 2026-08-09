import {BrowserRouter, Route, Routes} from "react-router";
import TestPage from "../pages/test/test-page.jsx";

const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<TestPage/>}/>
            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;