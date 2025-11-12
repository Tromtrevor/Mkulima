import { useNavigate, useLocation } from "react-router-dom";
import "./custom_css/onemorestep.css";

export default function OneMoreStep() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { county, farm_size, chosenCrop } = state || {};
  const crop = chosenCrop.crop;
  const handleDefault = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/crop/calculate-default-profit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json" },
        body: JSON.stringify({
          crop_name: crop,
        }),
      });

      const responseText = await response.text();
      const data = JSON.parse(responseText);

      navigate("/profit", {
        state: {
          result: data,
          crop: crop,
          county: county,
          farm_size: farm_size,
        },
      });
    } catch (err) {
      console.error("Error:", err);
      alert("Failed to calculate default profit analysis");
    }
  };

  const handleCustom = () => {
    navigate("/farm-inputs", {
      state: {
        county: county,
        farm_size: farm_size,
        crop: chosenCrop.crop,
        useDefaults: true },
    });
  };

  return (
    <div className="main-container min-h-screen flex flex-col items-center justify-center bg-[#f2f0ef] animate-fade-in p-6">
      {/* Header Section */}
      <div className="top-section text-center mb-10 animate-fade-up">
        <h1 className="heading text-3xl font-bold text-gray-800 mb-4">
          One More Step ..
        </h1>

        <div className="manage-money-png w-[220px] h-[220px] mx-auto bg-[url('/images/manage-money.png')] bg-cover bg-center animate-fade-in"></div>

        <p className="subtitle text-lg text-gray-800 font-semibold mt-6">
          Choose Your Profit Analysis Parameters
        </p>

        <p className="description text-gray-600 mt-3 max-w-[420px] mx-auto leading-relaxed">
          Get started with details about your farm/land and other parameters that
          help personalize our crop recommendations for you.
        </p>
      </div>

      {/* Buttons Section */}
      <div className="button-section flex flex-col gap-4 w-full max-w-[380px] animate-fade-up">
        <button
          className="green-btn w-full bg-[#229e47] hover:bg-green-700 text-white font-bold py-3 rounded-[10px] shadow-md transition-all duration-300"
          onClick={handleCustom}
        >
          ENTER FARM ACTIVITY INPUTS
        </button>

        <button
          className="outline-btn w-full border-2 border-[#229e47] text-[#229e47] hover:bg-[#229e47] hover:text-white font-bold py-3 rounded-[10px] shadow-md transition-all duration-300"
          onClick={handleDefault}
        >
          AI OPTIMUM PREDICTION
        </button>
      </div>

      {/* Note Section */}
      <p className="note text-center text-gray-500 italic mt-8 animate-fade-up">
        For highest accuracy of analysis, farm inputs are recommended because of
        use of accurate and factual data.
      </p>

      {/* Bottom Indicator (optional aesthetic) */}
      <div className="absolute bottom-4 w-full flex justify-center">
        <div className="w-[140px] h-[5px] bg-black rounded-full opacity-20"></div>
      </div>
    </div>
  );
}
