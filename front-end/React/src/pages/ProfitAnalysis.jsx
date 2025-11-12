import { useNavigate, useLocation } from "react-router-dom";
import "./custom_css/onemorestep.css";
import { supabase } from "../supabaseClient";
import { useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function AnalysisResults() {
  const navigate = useNavigate();
  const location = useLocation();
  const analysis = location.state?.result?.cache?.profit_analysis || {};
  const latest = location.state?.result?.cache?.latest || {};
  const crop = location.state?.crop;
  const county = location.state?.county;
  const farm_size = location.state?.farm_size;

  const [saving, setSaving] = useState(false);

const handleProceed = async () => {
  setSaving(true);
  try {
    // 1️⃣ Save prediction first (reuse handleProceed logic)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: Data } = await supabase
      .from("farms")
      .select("id")
      .order("date_generated", { ascending: false })
      .limit(1);

    const farmId = Data?.[0]?.id;

    await supabase.from("predictions").insert([
      {
        crop: crop,
        predicted_yield: analysis.predicted_yield,
        input_summary: latest.input_data,
        market_price: analysis.market_price,
        profit_margin: analysis.profit_margin,
        user_id: user.id,
        farm_id: farmId,
      },
    ]);

    // 2️⃣ Fetch AI insight report
    const response = await fetch(`${API_BASE}/api/crop/insight`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) throw new Error("Failed to fetch crop insight");
    const data = await response.json();
    const message = data.Insights.Insights;

    // 3️⃣ Save AI message
    await supabase.from("ai_chats").insert([
      {
        user_id: user?.id,
        farm_id: farmId,
        message: message,
        context: { source: "crop_insight_endpoint" },
      },
    ]);

    // 4️⃣ Navigate to Report page
    navigate("/report", { state: { reportData: message } });
  } catch (err) {
    console.error("Error generating report:", err);
    alert("Failed to generate report");
  } finally {
    setSaving(false);
  }
};


  const handleBack = () => navigate(-1);



  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex flex-col items-center px-6 py-10 animate-fade-in">
      {/* Header */}
      <div className="w-full max-w-md bg-white/80 shadow-lg rounded-2xl p-6 mb-6 animate-fade-up">
        <div className="flex items-center mb-3">
          <button
            onClick={handleBack}
            className="mr-3 text-green-700 hover:text-green-900 transition-colors text-2xl"
          >
            ←
          </button>
          <h1 className="text-2xl font-extrabold text-green-800">
            Profitability Analysis
          </h1>
        </div>
        <p className="text-gray-600 text-sm">
          {county || "Any County"}, Kenya • {farm_size || "--"} acres
        </p>
      </div>

      {/* Crop Info */}
      <div className="w-full max-w-md bg-white/80 shadow-lg rounded-xl p-5 mb-4 text-center animate-fade-up">
        <h2 className="text-green-700 font-bold text-lg capitalize">
          {analysis.crop || "Maize"}
        </h2>
        <p className="text-gray-500 text-sm">
          Profitability overview for your selected crop
        </p>
      </div>

      {/* Cards */}
      <div className="w-full max-w-md space-y-4">
        {/* Revenue */}
        <div className="bg-white/80 rounded-xl shadow-md p-5 text-center hover:shadow-lg transition-all animate-fade-up">
          <p className="text-gray-700 font-semibold mb-1">
            Estimated Revenue
          </p>
          <h3 className="text-2xl font-bold text-green-600">
            KSh {analysis.profit?.total_revenue?.toLocaleString() || "00,000"}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Based on current market prices
          </p>
        </div>

        {/* Cost */}
        <div className="bg-white/80 rounded-xl shadow-md p-5 text-center hover:shadow-lg transition-all animate-fade-up">
          <p className="text-gray-700 font-semibold mb-1">
            Estimated Cultivation Cost
          </p>
          <h3 className="text-2xl font-bold text-red-600">
            KSh {analysis.profit?.total_cost?.toLocaleString() || "00,000"}
          </h3>
          <p className="text-xs text-gray-500 mt-1">(Based on your inputs)</p>
        </div>

        {/* Net Profit */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-center animate-fade-up">
          <p className="text-white font-semibold mb-1">Net Profit</p>
          <h3 className="text-3xl font-extrabold text-white">
            KSh {analysis.profit?.total_profit?.toLocaleString() || "00,000"}
          </h3>
          <p className="text-white/90 text-xs mt-1">
            After accounting for input costs
          </p>
        </div>

        {/* Profit Analysis Button */}
        <div className="flex justify-center mt-3 animate-fade-up">
          <button
            onClick={() => navigate("/profit")}
            className="green-btn w-full py-3 font-bold rounded-xl hover:scale-105 transition-transform"
          >
            VIEW PROFIT ANALYSIS
          </button>
        </div>


        {/* Generate Report */}
        <div className="animate-fade-up">
          <button
            onClick={handleProceed}
            disabled={saving}
            className="green-btn w-full py-3 mt-4 font-bold rounded-xl shadow-md transition-transform hover:scale-105"
          >
            {saving ? "Saving..." : "GENERATE REPORT"}
          </button>
        </div>
      </div>

      <p className="text-gray-500 text-xs italic mt-10 animate-fade-up">
        Accurate insights based on your location and crop selection.
      </p>
    </div>
  );
}
