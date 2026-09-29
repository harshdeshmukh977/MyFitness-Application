import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// =========================
// MAIN PAGES
// =========================
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Setup from "./pages/Setup";
import Dashboard from "./pages/Dashboard";

// =========================
// PERSONAL PROFILE FLOW
// =========================
import PersonalProfile from "./pages/PersonalProfile";
import BodyMetrics from "./pages/Personal-profile/BodyMetrics";
import GenderCard from "./pages/Personal-profile/GenderCard";
import ProfileSummary from "./pages/Personal-profile/ProfileSummary";
import WhatNext from "./pages/Personal-profile/WhatNext";
import FitnessGoal from "./pages/Personal-profile/FitnessGoal";
import BenefitsProfile from "./pages/Personal-profile/BenefitsProfile";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =========================
            WELCOME
        ========================= */}
        <Route
          path="/"
          element={<Welcome />}
        />

        {/* =========================
            LOGIN / REGISTER
        ========================= */}
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* =========================
            SETUP
        ========================= */}
        <Route
          path="/setup"
          element={<Setup />}
        />

        {/* =========================
            PERSONAL PROFILE FLOW
        ========================= */}

        {/* Personal Profile */}
        <Route
          path="/personal-profile"
          element={<PersonalProfile />}
        />

        {/* Body Metrics */}
        <Route
          path="/body-metrics"
          element={<BodyMetrics />}
        />

        {/* Gender Card */}
        <Route
          path="/gender-card"
          element={<GenderCard />}
        />

        {/* Profile Summary */}
        <Route
          path="/profile-summary"
          element={<ProfileSummary />}
        />

        {/* What Next */}
        <Route
          path="/what-next"
          element={<WhatNext />}
        />

        {/* Fitness Goal */}
        <Route
          path="/fitness-goal"
          element={<FitnessGoal />}
        />

        {/* Benefits Profile */}
        <Route
          path="/benefits-profile"
          element={<BenefitsProfile />}
        />

        {/* =========================
            DASHBOARD
        ========================= */}
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        {/* =========================
            UNKNOWN ROUTE
        ========================= */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;