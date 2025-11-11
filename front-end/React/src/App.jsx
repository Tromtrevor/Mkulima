import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Recommendation from "./pages/Recommendations";
import OneMoreStep from "./pages/OneMoreStep";
import FarmInputs from "./pages/FarmInputs";
import SignUpPage from "./pages/SignUpPage";
import LogInPage from "./pages/LogInPage";
import SidebarMenu from "./components/SidebarMenu";
import AnalysisResults from "./pages/ProfitAnalysis";
import Report from "./pages/Report";
import Dashboard from "./pages/Dashboard";


function Layout({ children }) {
  const location = useLocation();
  const hideSidebar = ["/login", "/signup", "/"].includes(location.pathname);

  return (
    <div className="flex min-h-screen">
      {!hideSidebar && <SidebarMenu />}
      <div className="flex-grow">{children}</div>
    </div>
  );
}


function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/login" element={<LogInPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/home" element={<Home />} />
          <Route path="/recommendation" element={<Recommendation />} />
          <Route path="/selection" element={<OneMoreStep />} />
          <Route path="/farm-inputs" element={<FarmInputs />} />
          <Route path="/profit" element={<AnalysisResults />} />
          <Route path="/report" element={<Report />} />
          {/* Catch all route for undefined paths */}
          {/*<Route path="*" element={<Navigate to="/home" replace />} />*/}
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;