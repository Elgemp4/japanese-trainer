import {Link, Outlet} from "react-router";

const Layout = () => {
    return (
        <div className="main-grid min-h-screen">
            <header className="bg-surface border-b border-b-border py-2">
                <div className="flex justify-between">
                    <Link to="/">JapaTrainer</Link>
                    <nav>
                        <Link to="/lessons">Lessons</Link>
                    </nav>
                </div>
            </header>
            <main className="bg-bg py-8">
                <Outlet/>
            </main>
        </div>
    );
};

export default Layout;