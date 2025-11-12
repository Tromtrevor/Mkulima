import React from "react";
import { useNavigate } from "react-router-dom";
import "./custom_css/onemorestep.css";

export default function Information() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-100 flex flex-col items-center p-6 animate-fade-in">
      <div className="w-full max-w-md bg-white/90 rounded-2xl shadow-lg p-5 mt-6 mb-6 animate-fade-up">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="text-green-700 font-semibold text-lg hover:text-green-900"
          >
            ←
          </button>
          <div className="text-center flex-1">
            <h1 className="text-xl font-extrabold text-green-800 tracking-wide">MKULIMA</h1>
          </div>
          <div style={{ width: 36 }} /> {/* spacer */}
        </div>

        <div className="mt-6 text-center">
          <h2 className="text-sm uppercase text-gray-500">Information</h2>
          <p className="text-lg font-bold text-gray-800 mt-2">Useful data & market insights</p>
        </div>
      </div>

      <div className="w-full max-w-md bg-white/80 rounded-xl shadow-md p-6 space-y-4 animate-fade-up">
        <button
          onClick={() => navigate("/market-prices")}
          className="w-full text-left bg-white rounded-md p-4 shadow-sm hover:shadow-lg transition-all flex items-center justify-between"
        >
          <div>
            <div className="text-sm text-gray-500">Market Prices</div>
            <div className="text-lg font-bold text-gray-800">Current commodity prices</div>
          </div>
          <div className="text-green-600 font-bold">→</div>
        </button>

        <button
          onClick={() => navigate("/crops-data")}
          className="w-full text-left bg-white rounded-md p-4 shadow-sm hover:shadow-lg transition-all flex items-center justify-between"
        >
          <div>
            <div className="text-sm text-gray-500">Crop Data</div>
            <div className="text-lg font-bold text-gray-800">Crop-specific recommendations</div>
          </div>
          <div className="text-green-600 font-bold">→</div>
        </button>

        {/* If you want to add User Data later, place it here. */}
      </div>

    </div>
  );
}