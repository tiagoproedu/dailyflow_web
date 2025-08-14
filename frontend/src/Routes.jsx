// frontend/src/Routes.jsx
import { Route, Routes } from "react-router-dom";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

import MainContent from "./components/layout/MainContent";
import TasksPage from "./pages/TasksPage";
import HabitsPage from "./pages/HabitsPage";
import RoutinesPage from "./pages/RoutinesPage";
import ProfilePage from "./pages/ProfilePage";

// Importe o nosso novo componente!
import ProtectedRoute from "./components/auth/ProtectedRoute";

const AppRoutes = () => {
    return (
        <Routes>
            {/* Rotas Públicas */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* --- Rotas Privadas Agrupadas --- */}
            <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<MainContent />} />
                <Route path="/tasks" element={<TasksPage />} />
                <Route path="/habits" element={<HabitsPage />} />
                <Route path="/routines" element={<RoutinesPage />} />
                <Route path="/profile" element={<ProfilePage />} />
            </Route>
        </Routes>
    );
}

export default AppRoutes;