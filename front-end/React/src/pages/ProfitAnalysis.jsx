import { useNavigate, useLocation } from "react-router-dom";
import "./custom_css/onemorestep.css";
import { supabase } from "../supabaseClient";
import { useState } from "react";

const AnalysisResults = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const analysis = location.state?.result?.cache?.profit_analysis || {};
  const latest = location.state?.result?.cache?.latest || {};
  const crop = location.state?.crop;
  const county = location.state?.county;
  const farm_size = location.state?.farm_size;

  const [saving, setSaving] = useState(false);

  // Save prediction to Supabase then navigate to report
// ...existing code...
  // Save prediction to Supabase then navigate to report
  const handleProceed = async () => {
    setSaving(true);
    try {
      // get signed-in user (supabase-js v2)
      const {
        data: { user },
        error: getUserError,
      } = await supabase.auth.getUser();

      if (getUserError) {
        console.warn("Failed to get user:", getUserError);
      }

      // 1) Create a new farm row to generate farm_id
      let farmId = null;
      try {
        const farmRow = {
          county: county ?? latest?.county ?? null,
          farm_size: farm_size ?? latest?.farm_size ?? null,
          user_id: user?.id ?? null, // include user id to satisfy RLS if required
        };

        const { data: farmData, error: farmError } = await supabase
          .from("farms")
          .insert([farmRow])
          .select("id")
          .single();

        if (farmError) {
          console.warn("Failed to create farm record:", farmError);
        } else {
          farmId = farmData.id;
          console.log("Created farm id:", farmId);
        }
      } catch (err) {
        console.warn("Error creating farm record:", err);
      }

      // 2) Insert prediction referencing the new farm_id
      const payload = {
        crop: analysis?.crop ?? crop ?? null,
        predicted_yield: analysis?.predicted_yield ?? null,
        input_summary: JSON.stringify(latest?.input_data ?? {}),
        market_price: analysis?.market_price ?? null,
        profit_margin: analysis?.profit_margin ?? null,
        farm_id: farmId,
        user_id: user.id, // include user id to satisfy RLS if required
      };

      // Remove null/undefined keys so insert is clean
      Object.keys(payload).forEach((k) => {
        if (payload[k] === undefined || payload[k] === null) delete payload[k];
      });

      const { data: insertData, error: insertError } = await supabase
        .from("predictions")
        .insert([payload]);

      if (insertError) {
        console.warn("Failed to save prediction:", insertError);
      } else {
        console.log("Saved prediction:", insertData);
      }
    } catch (err) {
      console.error("Error saving prediction:", err);
    } finally {
      setSaving(false);
      // navigate to report page (report page will fetch insight from backend)
      navigate("/report", { state: { result: location.state?.result, crop, county, farm_size } });
    }
  };
// ...existing code...

  const handleBack = () => {
    navigate(-1);
  };

  const handleMoreInfo = () => {
    navigate("/farm-inputs", {
      state: {
        county: county,
        farm_size: farm_size,
        crop: crop,
        useDefaults: true,
      },
    }); // ✅ goes back to inputs if user wants to adjust
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex flex-col items-center px-5 py-8 animate-fade-in">
      {/* Header Section */}
      <div className="w-full max-w-md bg-white/80 shadow-xl rounded-2xl p-6 mb-6 animate-fade-up">
        <div className="flex items-center mb-4">
          <button
            onClick={handleBack}
            className="mr-3 text-green-700 hover:text-green-900 transition-colors text-2xl"
          >
            ←
          </button>
          <h1 className="text-2xl font-bold text-green-800">Profitability Analysis</h1>
        </div>
        <p className="text-gray-600 text-sm">
          Location: {county || "Any County"}, Kenya | Farm Size: {farm_size || "--"} acres
        </p>
      </div>

      {/* Illustration */}
      <div className="w-full max-w-md flex justify-center mb-6 animate-fade-up">
        <div className="w-48 h-48 bg-green-200 rounded-full flex items-center justify-center">
          <span className="text-6xl">📊</span>
        </div>
      </div>

      {/* Selected Crop */}
      <div className="w-full max-w-md bg-white/80 shadow-lg rounded-xl p-4 mb-4 animate-fade-up">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
            <span className="text-lg font-semibold text-green-700 capitalize">
              {analysis.crop || "Maize"}
            </span>
          </div>
        </div>
      </div>

      {/* Revenue Card */}
      <div className="w-full max-w-md bg-white/80 shadow-lg rounded-xl p-5 mb-4 animate-fade-up">
        <div className="text-center">
          <div className="text-gray-700 font-semibold mb-2">Estimated Revenue</div>
          <div className="text-2xl font-bold text-green-600 mb-1">
            KSh {analysis.profit?.total_revenue?.toLocaleString() || "00,000"}
          </div>
          <div className="text-xs text-gray-500">(Based on current market prices)</div>
        </div>
      </div>

      {/* Cost Card */}
      <div className="w-full max-w-md bg-white/80 shadow-lg rounded-xl p-5 mb-4 animate-fade-up">
        <div className="text-center">
          <div className="text-gray-700 font-semibold mb-2">Estimated Cultivation Cost</div>
          <div className="text-2xl font-bold text-red-600 mb-1">
            KSh {analysis.profit?.total_cost?.toLocaleString() || "00,000"}
          </div>
          <div className="text-xs text-gray-500">(Based on your inputs)</div>
        </div>
      </div>

      {/* Net Profit Card */}
      <div className="w-full max-w-md bg-gradient-to-r from-green-500 to-emerald-600 shadow-xl rounded-xl p-6 mb-6 animate-fade-up">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="text-white mr-3 text-2xl">📈</div>
            <div>
              <div className="text-white font-semibold text-sm">Net Profit</div>
              <div className="text-2xl font-bold text-white">
                KSh {analysis.profit?.total_profit?.toLocaleString() || "00,000"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* More Info */}
      <div className="w-full max-w-md text-center mb-6 animate-fade-up">
        <button
          onClick={handleMoreInfo}
          className="text-green-700 font-semibold text-sm hover:underline transition-colors"
        >
          Edit Input Costs
        </button>
      </div>

      {/* Proceed */}
      <div className="w-full max-w-md animate-fade-up">
        <button
          onClick={handleProceed}
          disabled={saving}
          className="green-btn w-full py-3 font-semibold text-white rounded-lg shadow-md transition-transform hover:scale-105"
        >
          {saving ? "Saving..." : "GENERATE REPORT"}
        </button>
      </div>

      <div className="mt-8"></div>
    </div>
  );
};

export default AnalysisResults;