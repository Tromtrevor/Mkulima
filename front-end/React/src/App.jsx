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


// Temporary placeholder for missing pages
{/*const ProfitAnalysis = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-green-800 mb-4">Profit Analysis</h1>
      <p className="text-gray-600">This page is under development</p>
    </div>
  </div>
);
*/}
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
          <Route path="/home" element={<Home />} />
          <Route path="/recommendation" element={<Recommendation />} />
          <Route path="/selection" element={<OneMoreStep />} />
          <Route path="/farm-inputs" element={<FarmInputs />} />
          <Route path="/profit" element={<AnalysisResults />} />
          {/* Catch all route for undefined paths */}
          {/*<Route path="*" element={<Navigate to="/home" replace />} />*/}
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;