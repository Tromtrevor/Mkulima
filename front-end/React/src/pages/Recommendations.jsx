import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./custom_css/onemorestep.css"; // Reuse same animations and base theme

const Recommendation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state?.result;

  const [selectedCrop, setSelectedCrop] = useState("");

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 text-center p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 animate-fade-up">
          No Recommendation Data Found
        </h2>
        <button
          onClick={() => navigate("/")}
          className="green-btn hover:scale-105 transition-all animate-fade-up"
        >
          Go Back
        </button>
      </div>
    );
  }

  const predictions = data.predictions || {};
  const crops = Object.keys(predictions).map((key) => ({
    crop: key,
    ...predictions[key],
  }));

  const handleProceed = () => {
    if (!selectedCrop) {
      alert("Please select a crop to proceed.");
      return;
    }
    const chosen = crops.find((c) => c.crop === selectedCrop);
    navigate("/selection", { state: { 
      chosenCrop: chosen,
      county: data.county,
      farm_size: data.farm_size 
    } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex flex-col items-center px-5 py-8 text-center animate-fade-in">
      {/* Title Section */}
      <div className="max-w-lg w-full bg-white/80 shadow-xl rounded-2xl p-6 animate-fade-up">
        <h1 className="text-2xl font-bold text-green-800 mb-2">
          🌿 Top Recommendations
        </h1>
        <p className="text-gray-600 text-sm">
          Location: {data.county || "Any County"}, Kenya | Farm Size:{" "}
          {data.farm_size || "--"} acres
        </p>
      </div>

      {/* Crop Cards */}
      <div className="w-full max-w-lg mt-8 space-y-5">
        {crops.map((item, index) => (
          <div
            key={index}
            className="bg-white shadow-lg border border-green-100 hover:border-green-300 hover:shadow-2xl transition-all rounded-xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between animate-fade-up"
          >
            <div className="flex flex-col items-start text-left space-y-1">
              <h2 className="text-xl font-semibold text-green-700 capitalize">
                {item.crop}
              </h2>
              <p className="text-gray-700 text-sm">
                <span className="font-semibold">Expected Yield: </span>
                {item.prediction_in_acres} t/acre
              </p>
              <p className="text-gray-700 text-sm">
                <span className="font-semibold">Market Price: </span>
                <span className="text-green-600 font-bold">
                  KSh {item.market_price.toLocaleString()}
                </span>
              </p>
            </div>
            <div className="mt-3 sm:mt-0">
              <button
                onClick={() => setSelectedCrop(item.crop)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  selectedCrop === item.crop
                    ? "bg-green-600 text-white shadow-md"
                    : "bg-green-100 text-green-700 hover:bg-green-200"
                }`}
              >
                Select
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Crop Selection Section */}
      <div className="w-full max-w-lg bg-white/80 shadow-md rounded-2xl p-6 mt-10 animate-fade-up">
        <label className="block text-gray-800 font-semibold mb-2 text-center">
          Select a Crop for Profit Analysis 🌾
        </label>
        <select
          value={selectedCrop}
          onChange={(e) => setSelectedCrop(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-green-500 outline-none transition-all"
        >
          <option value="">-- Choose Crop --</option>
          {crops.map((item, index) => (
            <option key={index} value={item.crop}>
              {item.crop}
            </option>
          ))}
        </select>

        <button
          onClick={handleProceed}
          className="mt-6 w-full green-btn hover:scale-105 transition-all"
        >
          Proceed
        </button>
      </div>

      {/* Bottom Bar */}
      <div className="mt-10 opacity-40 text-gray-600 text-sm animate-fade-in">
        Select your preferred crop to proceed for profit analysis.
      </div>
    </div>
  );
};

export default Recommendation;
