import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "./custom_css/onemorestep.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const [reportCount, setReportCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportCount = async () => {
      try {
        setLoading(true);
        // get signed-in user
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        const userId = userData?.user?.id;
        if (!userId) {
          setReportCount(0);
          return;
        }

        // fetch predictions count for that user
        const { count, error } = await supabase
          .from("predictions")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId);

        if (error) throw error;
        setReportCount(count || 0);
      } catch (err) {
        console.error("Error fetching report count:", err);
        setReportCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchReportCount();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex justify-center items-start py-10 px-5 animate-fade-in">
      <aside className="w-full max-w-md bg-white/80 shadow-xl rounded-2xl p-6 space-y-6 animate-fade-up">
        {/* Header / Welcome Section */}
        <div className="relative bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl p-5 text-center shadow-md">
          <h1 className="text-2xl font-extrabold tracking-wide">
            Welcome, MkuliMa 🌿
          </h1>
          <p className="text-sm opacity-90 mt-1">
            Your smart agri companion for insights and analysis
          </p>
        </div>

        {/* Dashboard Summary */}
        <div className="text-green-700 font-extrabold text-lg text-center">
          DASHBOARD
        </div>

        {/* Reports Card */}
        <div className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-all">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-gray-800 font-bold text-lg">Total Reports</h2>
            <svg
              className="w-6 h-6 text-green-600"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path d="M10 2a1 1 0 011 1v14a1 1 0 11-2 0V3a1 1 0 011-1zM4 6a1 1 0 011 1v8a1 1 0 11-2 0V7a1 1 0 011-1zm12 2a1 1 0 011 1v6a1 1 0 11-2 0V11a1 1 0 011-1z" />
            </svg>
          </div>
          <div className="text-4xl font-extrabold text-gray-800 text-center">
            {loading ? (
              <span className="text-gray-400 text-lg">Loading...</span>
            ) : (
              reportCount
            )}
          </div>
          <button
            onClick={() => navigate("/reports")}
            className="mt-4 w-full green-btn hover:scale-105 transition-all"
          >
            View Reports
          </button>
        </div>

        {/* AI Chat & Announcements */}
        <div className="grid grid-cols-2 gap-4">
          {/* AI Chat */}
          <div className="bg-white rounded-xl shadow-md p-4 flex flex-col justify-between hover:shadow-lg transition-all">
            <div>
              <h3 className="text-gray-800 font-bold mb-2">AI Chat</h3>
              <p className="text-gray-600 text-xs">
                Chat and get instant answers using MkuliMa assistant.
              </p>
            </div>
            <button
              onClick={() => navigate("/chat")}
              className="text-green-600 text-sm font-semibold mt-3 hover:underline"
            >
              Start Chat →
            </button>
          </div>

          {/* Announcements */}
          <div className="bg-white rounded-xl shadow-md p-4 flex flex-col justify-between hover:shadow-lg transition-all">
            <div>
              <h3 className="text-gray-800 font-bold mb-2">Announcements</h3>
              <p className="text-gray-600 text-xs">
                Catch up on grants, tenders, and agricultural updates.
              </p>
            </div>
            <button
              onClick={() => navigate("/announcements")}
              className="text-green-600 text-sm font-semibold mt-3 hover:underline"
            >
              Explore →
            </button>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          <button
            onClick={() => navigate("/profit")}
            className="w-full text-left bg-white rounded-xl p-4 shadow-md hover:shadow-lg flex items-center justify-between transition-all"
          >
            <span className="font-semibold text-gray-800">
              Profit Analysis
            </span>
            <span className="text-sm text-green-600">Open</span>
          </button>

          <button
            onClick={() => navigate("/recommendations")}
            className="w-full text-left bg-white rounded-xl p-4 shadow-md hover:shadow-lg flex items-center justify-between transition-all"
          >
            <span className="font-semibold text-gray-800">Recommendations</span>
            <span className="text-sm text-green-600">View</span>
          </button>
        </div>

        {/* Recommendation Button */}
        <div className="flex justify-center">
          <button
            onClick={() => navigate("/home")}
            className="green-btn px-6 py-3 font-extrabold hover:scale-105 transition-all"
          >
            GET RECOMMENDATION
          </button>
        </div>

        {/* Info Note */}
        <p className="text-center text-gray-500 text-xs italic mt-6 animate-fade-up">
          Use this dashboard to navigate and explore all features. Your smart
          insights await!
        </p>
      </aside>
    </div>
  );
}
