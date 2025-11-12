// Chatbot.jsx
import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import "./custom_css/onemorestep.css";

export default function Chatbot() {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chatRow, setChatRow] = useState(null);
  const chatEndRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load chat history once
  useEffect(() => {
    let mounted = true;
    const fetchHistory = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) return;

      const { data, error } = await supabase
        .from("chatbot")
        .select("id,chats")
        .eq("id", user.id);

      if (error && error.code !== "PGRST116") console.warn("Load error:", error);

      if (!mounted || !data) return;

      setChatRow(data[0] || null);

      const chats = data[0]?.chats ?? [];
      const formatted = chats.flatMap((entry) => {
        const out = [];
        if (entry.request) out.push({ role: "user", content: entry.request, key: `r_${Math.random()}` });
        if (entry.response) out.push({ role: "assistant", content: entry.response, key: `a_${Math.random()}` });
        return out;
      });
      setMessages(formatted);
    };

    fetchHistory();
    return () => { mounted = false; };
  }, []);

  // Send message
  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text, key: `u_${Date.now()}` }]);
    setLoading(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) {
        alert("Please log in first.");
        setLoading(false);
        return;
      }

      // Prepare chat history for AI
      const history = chatRow?.chats ?? [];
      const payload = { message: text, history };

      // Call backend AI
      const resp = await fetch("http://127.0.0.1:8000/api/crop/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await resp.json();
      const aiText = result?.reply ?? "No response";

      // Save in Supabase
      const newEntry = { request: text, response: aiText };
      const updatedChats = [...history, newEntry];

      if (chatRow?.id) {
        const { data: updated, error: updateErr } = await supabase
          .from("chatbot")
          .update({ chats: updatedChats })
          .eq("id", chatRow.id)
          .select();

        if (updateErr) console.warn("Update error:", updateErr);
        else setChatRow(updated[0]);
      } else {
        const { data: inserted, error: insertErr } = await supabase
          .from("chatbot")
          .insert([{ id: user.id, chats: [newEntry] }])
          .select();

        if (insertErr) console.warn("Insert error:", insertErr);
        else setChatRow(inserted[0]);
      }

      // Append AI reply locally
      setMessages((prev) => [...prev, { role: "assistant", content: aiText, key: `a_${Date.now()}` }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { role: "assistant", content: "⚠️ Failed to reach AI." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f2f0ef] flex flex-col animate-fade-in">
      <div className="bg-white shadow-md p-4 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="text-[#229e47] font-semibold hover:text-green-700 transition-all">← Back</button>
        <h1 className="text-xl font-bold text-gray-800">MkuliMa Chatbot 🌿</h1>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f9f8f6]">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 italic mt-10">👋 Hi MkuliMa! Ask me anything about your crops, reports, or markets.</div>
        ) : (
          messages.map((msg, i) => (
            <div key={msg.key ?? i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`p-3 rounded-2xl shadow-md max-w-xs md:max-w-md ${msg.role === "user" ? "bg-[#229e47] text-white rounded-br-none" : "bg-white text-gray-800 rounded-bl-none"}`}>
                <div className="whitespace-pre-wrap break-words">{msg.content}</div>
              </div>
            </div>
          ))
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="bg-white border-t p-4 flex items-center gap-3">
        <input
          type="text"
          placeholder="Ask about your crop, yield, or advice..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#229e47] outline-none"
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend} disabled={loading} className={`px-4 py-2 font-semibold rounded-lg shadow-md ${loading ? "bg-gray-300 cursor-not-allowed" : "bg-[#229e47] hover:bg-green-700 text-white"}`}>
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}
