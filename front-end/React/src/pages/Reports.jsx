import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./custom_css/onemorestep.css";
import { supabase } from "../supabaseClient";

export default function Reports() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      setError(null);
      try {
        // get signed in user
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData?.user?.id ?? null;

        let query = supabase.from("predictions").select("*").order("date_generated", { ascending: false });

        // if user is present, fetch only their predictions
        if (userId) query = query.eq("user_id", userId);

        const { data, error: fetchErr } = await query;
        if (fetchErr) throw fetchErr;
        setReports(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load reports:", err);
        setError(err?.message || "Failed to load reports");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);
  
  const openReport = async () => {
    const { data: Data } = await supabase
        .from("farms")
        .select("id")
        .order("date_generated", { ascending: false })
        .limit(1);

    const farmId = Data?.[0]?.id;
    
    const {data: reportData} = await supabase
        .from("ai_chats")
        .select("message")
        .eq("farm_id", farmId)

    const Report = reportData?.[0]?.message
    

    // navigate to report page, pass the prediction row as reportData
    navigate("/report", { state: { reportData: Report } });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f2f0ef]">
        <div className="text-center animate-fade-in">
          <div className="w-12 h-12 border-4 border-[#229e47] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f2f0ef] p-6">
        <div className="max-w-md text-center bg-white p-6 rounded-xl shadow">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button onClick={() => window.location.reload()} className="bg-[#229e47] text-white px-4 py-2 rounded">Retry</button>
        </div>
      </div>
    );
  }

  if (!reports.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f2f0ef] p-6">
        <div className="max-w-md text-center bg-white p-8 rounded-xl shadow">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Reports Yet</h2>
          <p className="text-gray-600 mb-6">Generate a report from Profit Analysis to see it listed here.</p>
          <button onClick={() => navigate("/profit")} className="bg-[#229e47] text-white px-6 py-3 rounded-xl font-bold">Generate Report</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f2f0ef] p-6 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button onClick={() => navigate(-1)} className="text-[#229e47] font-semibold mb-4">← Back</button>
          <h1 className="text-3xl font-bold text-gray-800">Generated Reports</h1>
          <p className="text-gray-600">Your saved predictions and generated reports</p>
        </div>

        <div className="space-y-4">
          {reports.map((r) => (
            <button
              key={r.id}
              onClick={() => openReport(r)}
              className="w-full text-left bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-all flex items-center justify-between"
            >
              <div>
                <div className="text-sm text-gray-500">Crop</div>
                <div className="text-lg font-bold text-gray-800 capitalize">{r.crop ?? "—"}</div>
                <div className="mt-2 text-sm text-gray-600">
                  Predicted yield: <span className="font-semibold text-gray-800">{r.predicted_yield ?? "—"}</span>
                </div>
                <div className="text-sm text-gray-600">
                  Profit margin: <span className="font-semibold text-gray-800">{r.profit_margin ?? "—"}</span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-gray-400">{new Date(r.date_generated).toLocaleString()}</div>
                <div className="mt-3 inline-flex items-center justify-center h-9 w-9 rounded-full bg-[#229e47] text-white font-bold">→</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}