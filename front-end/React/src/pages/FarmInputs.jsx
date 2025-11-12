import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./custom_css/onemorestep.css";

const FarmInputs = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const result = location.state?.result;
  

  const crop = location.state?.crop;
  const county = location.state?.county;
  const farm_size = location.state?.farm_size;  
  // Get data from location.state - fix the destructuring
  //const { crop, county, farm_size } = state || {};
// Handle both object and string

  const [inputs, setInputs] = useState({
    labour_cost_acre: "",
    seed_cost_acre: "",
    fertilizer_cost_acre: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async () => {
    if (parseFloat(inputs.labour_cost_acre) < 0 || 
        parseFloat(inputs.seed_cost_acre) < 0 || 
        parseFloat(inputs.fertilizer_cost_acre) < 0) {
      setError("Cost values cannot be negative");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Debug: Log what we're sending
      console.log("Sending data:", {
        crop_name: crop,
        county: county,
        farm_size: farm_size ? parseFloat(farm_size) : undefined,
        labor_cost_per_acre: parseFloat(inputs.labour_cost_acre),
        seed_cost_per_acre: parseFloat(inputs.seed_cost_acre),
        fertilizer_cost_per_acre: parseFloat(inputs.fertilizer_cost_acre),
      });

      const response = await fetch("http://127.0.0.1:8000/api/crop/calculate-own-profit", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"},
        body: JSON.stringify({
          crop_name: crop,
          seed_cost_per_acre: parseFloat(inputs.seed_cost_acre),
          fertilizer_cost_per_acre: parseFloat(inputs.fertilizer_cost_acre),
          labor_cost_per_acre: parseFloat(inputs.labour_cost_acre),
        }),
      });

      // Get the response text first to see what the error is
      const responseText = await response.text();
      console.log("Response status:", response.status);
      console.log("Response body:", responseText);

      if (!response.ok) {
        // Try to parse as JSON for detailed error message
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.detail || errorData.message || JSON.stringify(errorData);
        } catch (e) {
          errorMessage = responseText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // Parse the successful response
      const data = JSON.parse(responseText);
      console.log("Success data:", data);

      // Navigate to profit analysis page with results
      navigate("/profit", { 
        state: { 
          result: data,
          crop: crop,
          county: county,
          farm_size: farm_size,
          inputs: inputs
        } 
      });

    } catch (err) {
      console.error("API Error:", err);
      setError(`Server error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex flex-col items-center justify-center px-5 py-8 animate-fade-in">
      
      {/* Header Section */}
      <div className="w-full max-w-md bg-white/80 shadow-xl rounded-2xl p-6 mb-6 animate-fade-up">
        <div className="flex items-center mb-4">
          <button 
            onClick={handleBack}
            className="mr-3 text-green-700 hover:text-green-900 transition-colors text-2xl"
          >
            ←
          </button>
          <h1 className="text-2xl font-bold text-green-800">Enter Farm Inputs</h1>
        </div>
        {/*
        <p className="text-gray-600 text-sm">
          Location: {county || "Any County"} | Farm Size: {farm_size || "--"} acres | Crop: {crop || "--"}
        </p>*/}
      </div>

      {/* Inputs Form */}
      <div className="w-full max-w-md bg-white/80 shadow-xl rounded-2xl p-6 animate-fade-up">
        <p className="text-gray-600 mb-6 text-center">
          Enter your farm input costs per acre for accurate profit analysis
        </p>

        {/* Labour Cost */}
        <div className="mb-5">
          <label className="block text-gray-700 font-semibold mb-2">
            Labour Cost per Acre (KSh)
          </label>
          <input
            type="number"
            name="labour_cost_acre"
            value={inputs.labour_cost_acre}
            onChange={handleChange}
            placeholder="e.g. 5000"
            className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-green-500 outline-none transition-all"
            min="0"
            step="100"
            required
          />
        </div>

        {/* Seed Cost */}
        <div className="mb-5">
          <label className="block text-gray-700 font-semibold mb-2">
            Seed Cost per Acre (KSh)
          </label>
          <input
            type="number"
            name="seed_cost_acre"
            value={inputs.seed_cost_acre}
            onChange={handleChange}
            placeholder="e.g. 2000"
            className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-green-500 outline-none transition-all"
            min="0"
            step="100"
            required
          />
        </div>

        {/* Fertilizer Cost */}
        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">
            Fertilizer Cost per Acre (KSh)
          </label>
          <input
            type="number"
            name="fertilizer_cost_acre"
            value={inputs.fertilizer_cost_acre}
            onChange={handleChange}
            placeholder="e.g. 3000"
            className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-green-500 outline-none transition-all"
            min="0"
            step="100"
            required
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="green-btn w-full py-3 font-semibold text-white rounded-lg shadow-md transition-transform hover:scale-105 disabled:opacity-60 disabled:hover:scale-100"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Calculating...
            </div>
          ) : (
            "PROCEED TO ANALYSIS"
          )}
        </button>
      </div>

      {/* Info Note */}
      <div className="w-full max-w-md mt-6 animate-fade-up">
        <p className="text-center text-gray-500 text-sm italic">
          Providing accurate input costs ensures the most precise profit analysis for your farm.
        </p>
      </div>

      {/* Bottom spacing */}
      <div className="mt-8"></div>
    </div>
  );
};

export default FarmInputs;

