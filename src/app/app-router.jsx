import {BrowserRouter, Route, Routes} from "react-router";
import TestPage from "../pages/test/test-page.jsx";
import Layout from "./layout.jsx";

const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout/>}>
                    <Route path="/" element={<TestPage/>}/>
                </Route>
            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;