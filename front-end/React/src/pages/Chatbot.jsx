import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import "./custom_css/onemorestep.css";

export default function Chatbot() {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chatRow, setChatRow] = useState(null); // full DB row for this user
  const chatEndRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load chat history once
  useEffect(() => {
    let mounted = true;
    const fetchHistory = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const user = userData?.user;
        if (!user) return;

        // get single row for this user (id == user.id)
        const { data, error } = await supabase
          .from("chatbot")
          .select("id,chats")
          .eq("id", user.id)
          //.single();

        if (error && error.code !== "PGRST116") {
          // ignore "No rows found" style error code, warn others
          console.warn("Load error:", error);
        }

        if (!mounted) return;

        if (data) {
          setChatRow(data);
          const chats = Array.isArray(data.chats) ? data.chats : (data.chats ? JSON.parse(data.chats) : []);
          // flatten into message list: request then response
          const formatted = chats.flatMap((entry) => {
            const req = entry.request ?? entry.Request ?? entry.RequestText ?? null;
            const res = entry.response ?? entry.Response ?? entry.ResponseText ?? null;
            const out = [];
            if (req != null) out.push({ role: "user", content: req, key: `r_${Math.random()}` });
            if (res != null) out.push({ role: "assistant", content: res, key: `a_${Math.random()}` });
            return out;
          });
          setMessages(formatted);
        }
      } catch (err) {
        console.warn("fetchHistory error:", err);
      }
    };

    fetchHistory();
    return () => { mounted = false; };
  }, []);

  // send user message, call backend, then append {request,response} to chats column on user's row
  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    // optimistic UI: show user message immediately
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

      // call backend AI
      const resp = await fetch("http://127.0.0.1:8000/api/crop/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const result = await resp.json();
      const aiText = result?.reply ?? result?.message ?? JSON.stringify(result);

      // build new chat entry
      const newEntry = { request: text, response: aiText };

      if (chatRow && chatRow.id) {
        // existing row: append to chats array and update
        const existingChats = Array.isArray(chatRow.chats) ? chatRow.chats : (chatRow.chats ? JSON.parse(chatRow.chats) : []);
        const updatedChats = [...existingChats, newEntry];

        const { data: updated, error: updateErr } = await supabase
          .from("chatbot")
          .update({ chats: updatedChats })
          .eq("id", chatRow.id)
          .select()
          //.single();

        if (updateErr) {
          console.warn("Failed to update chatbot row:", updateErr);
        } else {
          setChatRow(updated);
        }
      } else {
        // no row yet: insert new row with id = user.id and chats = [newEntry]
        const { data: inserted, error: insertErr } = await supabase
          .from("chatbot")
          .insert([{ id: user.id, chats: [newEntry] }])
          .select()
          .single();

        if (insertErr) {
          console.warn("Failed to insert chatbot row:", insertErr);
        } else {
          setChatRow(inserted);
        }
      }

      // append AI reply to UI
      setMessages((prev) => [...prev, { role: "assistant", content: aiText, key: `a_${Date.now()}` }]);
    } catch (err) {
      console.error("AI fetch error:", err);
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
                <div className="whitespace-pre-wrap break-words">{typeof msg.content === "object" ? JSON.stringify(msg.content) : msg.content}</div>
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