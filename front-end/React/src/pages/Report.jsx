import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import "./custom_css/onemorestep.css";

export default function Report() {
  const navigate = useNavigate();
  const location = useLocation();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInsight = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/crop/insight", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) throw new Error("Failed to fetch report data");

        const data = await response.json();
        setReportData(data);
      } catch (err) {
        console.error("Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInsight();
  }, []);

  const handleDownloadPDF = () => alert("PDF download feature coming soon!");
  const handleShare = () => alert("Share feature coming soon!");
  const handleGoBack = () => navigate(-1);

  if (loading) {
    return (
      <div className="main-container min-h-screen flex items-center justify-center bg-[#f2f0ef]">
        <div className="text-center animate-fade-in">
          <div className="w-12 h-12 border-4 border-[#229e47] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Generating your report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-container min-h-screen flex items-center justify-center bg-[#f2f0ef]">
        <div className="text-center max-w-md">
          <p className="text-red-600 text-lg mb-4">Error: {error}</p>
          <button onClick={handleGoBack} className="bg-[#229e47] text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition-all">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="main-container min-h-screen flex items-center justify-center bg-[#f2f0ef]">
        <p className="text-gray-600 text-lg">No report data available.</p>
      </div>
    );
  }

  // Normalize response shapes seen in your screenshot:
  // possible shapes: { Insights: { Insights: {...} } }, { Insights: {...} }, or direct {...}
  const data =
    reportData?.Insights?.Insights ??
    reportData?.Insights ??
    reportData ??
    {};

  return (
    <div className="main-container min-h-screen bg-[#f2f0ef] animate-fade-in p-6">
      <div className="header-section mb-8 animate-fade-up">
        <button onClick={handleGoBack} className="mb-6 text-[#229e47] font-semibold hover:text-green-700 transition-all">← Back</button>
        <h1 className="heading text-4xl font-bold text-gray-800 mb-2">Crop Insight Report</h1>
        <p className="text-gray-600">AI-Generated Analysis & Recommendations</p>
      </div>

      <div className="report-content max-w-4xl mx-auto animate-fade-up">
        {data.insight && (
          <div className="main-insight bg-white rounded-lg shadow-md p-8 mb-8 border-l-4 border-[#229e47]">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Key Insight</h2>
            <p className="text-gray-700 leading-relaxed text-lg">{data.insight}</p>
          </div>
        )}

        {Array.isArray(data.recommendations) && data.recommendations.length > 0 && (
          <div className="recommendations bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Recommendations</h2>
            <div className="space-y-4">
              {data.recommendations.map((rec, idx) => (
                <div key={idx} className="flex gap-4 p-4 bg-[#f9f7f4] rounded-lg hover:shadow-md transition-all">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-[#229e47] text-white font-bold">{idx + 1}</div>
                  </div>
                  <div className="flex-grow"><p className="text-gray-700 leading-relaxed">{rec}</p></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {Array.isArray(data.warnings) && data.warnings.length > 0 && (
          <div className="warnings bg-orange-50 rounded-lg shadow-md p-8 mb-8 border-l-4 border-orange-400">
            <h2 className="text-2xl font-bold text-orange-800 mb-6">⚠️ Important Cautions</h2>
            <div className="space-y-3">
              {data.warnings.map((warning, idx) => (
                <div key={idx} className="flex gap-3 text-orange-700"><span className="font-bold">•</span><p>{warning}</p></div>
              ))}
            </div>
          </div>
        )}

        {data.market_trends && (
          <div className="market-trends bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Market Trends</h2>
            <p className="text-gray-700 leading-relaxed mb-4">{data.market_trends}</p>
          </div>
        )}

        {Array.isArray(data.best_practices) && data.best_practices.length > 0 && (
          <div className="best-practices bg-blue-50 rounded-lg shadow-md p-8 mb-8 border-l-4 border-blue-400">
            <h2 className="text-2xl font-bold text-blue-800 mb-6">Best Practices</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.best_practices.map((practice, idx) => (<div key={idx} className="bg-white p-4 rounded-lg shadow-sm"><p className="text-gray-700 leading-relaxed">{practice}</p></div>))}
            </div>
          </div>
        )}

        {data.roi_info && (
          <div className="roi-info bg-green-50 rounded-lg shadow-md p-8 mb-8 border-l-4 border-[#229e47]">
            <h2 className="text-2xl font-bold text-green-800 mb-4">ROI Information</h2>
            <p className="text-gray-700 leading-relaxed">{data.roi_info}</p>
          </div>
        )}

        {data.notes && (
          <div className="additional-notes bg-gray-50 rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Additional Notes</h2>
            <p className="text-gray-700 leading-relaxed">{data.notes}</p>
          </div>
        )}
      </div>

      <div className="button-section flex flex-col gap-4 max-w-md mx-auto mb-8 animate-fade-up mt-8">
        <button onClick={handleDownloadPDF} className="download-btn w-full bg-[#229e47] hover:bg-green-700 text-white font-bold py-3 rounded-[10px] shadow-md transition-all duration-300">DOWNLOAD AS PDF</button>
        <button onClick={handleShare} className="share-btn w-full border-2 border-[#229e47] text-[#229e47] hover:bg-[#229e47] hover:text-white font-bold py-3 rounded-[10px] shadow-md transition-all duration-300">SHARE REPORT</button>
      </div>

      <div className="absolute bottom-4 w-full flex justify-center"><div className="w-[140px] h-[5px] bg-black rounded-full opacity-20"></div></div>
    </div>
  );
}