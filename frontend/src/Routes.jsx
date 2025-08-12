import { Route, BrowserRouter, Routes } from "react-router-dom";

import TasksPage from "./pages/TasksPage";
import MainContent from "./components/layout/MainContent";
import HabitsPage from "./pages/HabitsPage";
import RoutinesPage from "./pages/RoutinesPage";
import ProfilePage from "./pages/ProfilePage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

const AppRoutes = () => {
    return (
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/dashboard" element={<MainContent />} />
                <Route path="/tasks" element={<TasksPage />} />
                <Route path="/habits" element={<HabitsPage />} />
                <Route path="/routines" element={<RoutinesPage />} />
                <Route path="/profile" element={<ProfilePage />} />
            </Routes>
    );
}

export default AppRoutes;