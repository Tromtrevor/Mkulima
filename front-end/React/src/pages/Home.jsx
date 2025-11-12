import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient"; // added

const Home = () => {
  const [county, setCounty] = useState("");
  const [farmSize, setFarmSize] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();


  const handleSubmit = async () => {
    if (!county || !farmSize) {
      alert("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      // get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Please sign in before saving farm details.");
        setLoading(false);
        return;
      }

      const payload = {
        county: county,
        farm_size: parseFloat(farmSize),
      };

      // save to backend prediction endpoint
      const response = await fetch("http://127.0.0.1:8000/api/crop/predict-yield", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      // save farm to supabase 'farms' table — include user_id to satisfy RLS
      try {
        const { data: insertData, error: insertError } = await supabase
          .from("farms")
          .insert([
            {
              county: county,
              farm_size: parseFloat(farmSize),
              user_id: user.id,
            },
          ]);

        if (insertError) {
          console.warn("Failed to save farm record:", insertError);
        } else {
          console.log("Saved farm record:", insertData);
        }
      } catch (dbErr) {
        console.warn("Supabase insert error:", dbErr);
      }

      // Navigate to Recommendation page with results
      navigate("/recommendation", { state: { result: data["data"] }});
    } catch (err) {
      console.error(err);
      alert("Failed to connect to backend.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-[#f2f0ef] animate-fade-in">
      <h1 className="absolute top-[80px] text-xl font-bold text-gray-800 animate-fade-up">
        Welcome, MKULIMA 🌱
      </h1>

      <div className="bg-white shadow-lg rounded-2xl w-[90%] max-w-[400px] p-6 mt-32 animate-fade-up">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <label className="text-gray-900 font-semibold text-lg tracking-wide">
              Farm Location (County)
            </label>
            <input
              type="text"
              value={county}
              onChange={(e) => setCounty(e.target.value)}
              placeholder="e.g. Makueni"
              className="w-full border border-gray-300 rounded-xl p-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-gray-900 font-semibold text-lg tracking-wide">
              Farm Size (m²)
            </label>
            <input
              type="number"
              value={farmSize}
              onChange={(e) => setFarmSize(e.target.value)}
              placeholder="e.g. 500"
              className="w-full border border-gray-300 rounded-xl p-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-10 w-full bg-[#229e47] hover:bg-green-700 text-white font-bold py-3 rounded-[10px] transition-all animate-fade-up"
        >
          {loading ? "Analyzing..." : "PROCEED TO ANALYSIS"}
        </button>
      </div>

      {/* bottom iPhone-style bar */}
      <div className="absolute bottom-0 w-full flex justify-center mb-2">
        <div className="w-[150px] h-[5px] bg-black rounded-full opacity-30"></div>
      </div>
    </div>
  );
};

export default Home;