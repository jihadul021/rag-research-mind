import { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./App.css";

const nameFromFile = (filename) =>
  filename
    .replace(".pdf", "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .slice(0, 35);

const MODE_META = {
  simple: { 
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>, 
    label: "Simple",    
    desc: "Beginner friendly" 
  },
  summary: { 
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>, 
    label: "Summary",   
    desc: "Bullet point overview" 
  },
  technical: { 
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><path d="M3 9h18M9 21V9"/></svg>, 
    label: "Technical", 
    desc: "In-depth analysis" 
  },
  compare: { 
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></svg>, 
    label: "Compare",   
    desc: "Cross-paper insights" 
  },
};

export default function App() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState(() => {
    const saved = localStorage.getItem("papermind_docs");
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedIds, setSelectedIds] = useState([]);
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState("simple");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await axios.post("http://localhost:8000/api/upload", formData);
      const newDoc = {
        document_id: res.data.document_id,
        name: nameFromFile(file.name),
        num_chunks: res.data.num_chunks,
      };
      setDocuments((prev) => {
        const updated = [...prev, newDoc];
        localStorage.setItem("papermind_docs", JSON.stringify(updated));
        return updated;
      });
      setFile(null);
      fileInputRef.current.value = "";
    } catch (err) {
      const msg = err.response?.data?.detail || "Upload failed.";
      alert(msg);
      setFile(null);
      fileInputRef.current.value = "";
    } finally {
      setUploading(false);
    }
  };

  const toggleSelect = (id) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const activeIds =
    selectedIds.length > 0 ? selectedIds : documents.map((d) => d.document_id);

  const handleQuery = async () => {
    if (!query.trim() || documents.length === 0) return;
    const userMsg = { role: "user", text: query, mode };
    setMessages((prev) => [...prev, userMsg]);
    setQuery("");
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8000/api/query", {
        query: userMsg.text,
        mode,
        document_ids: activeIds,
      });
      setMessages((prev) => [...prev, { role: "bot", text: res.data.answer, mode }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Something went wrong. Please try again.", mode: "error" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleQuery();
    }
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          <span className="brand-name">ResearchMind</span>
        </div>

        <div className="section">
          <p className="section-label">Knowledge Base</p>
          <div className="upload-area" onClick={() => fileInputRef.current.click()}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              hidden
              onChange={(e) => setFile(e.target.files[0])}
            />
            <svg className="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
            <span className="upload-text">
              {file ? file.name.slice(0, 28) + "…" : "Select PDF Document"}
            </span>
          </div>
          <button
            className="btn-primary"
            onClick={handleUpload}
            disabled={!file || uploading}
          >
            {uploading ? "Processing Document…" : "Upload & Index"}
          </button>
        </div>

        {documents.length > 0 && (
          <div className="section">
            <div className="section-header">
              <p className="section-label">Library</p>
              <span className="badge">
                {selectedIds.length === 0 ? "All Docs" : `${selectedIds.length} Selected`}
              </span>
            </div>
            <div className="paper-list">
              {documents.map((d) => (
                <div
                  key={d.document_id}
                  className={`paper-row ${selectedIds.includes(d.document_id) ? "active" : ""}`}
                  onClick={() => toggleSelect(d.document_id)}
                >
                  <div className="paper-check">
                    {selectedIds.includes(d.document_id) && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    )}
                  </div>
                  <div className="paper-details">
                    <p className="paper-name">{d.name}</p>
                    <p className="paper-chunks">{d.num_chunks} vectorized chunks</p>
                  </div>
                </div>
              ))}
            </div>
            <button
              className="btn-ghost"
              onClick={() => {
                setDocuments([]);
                setSelectedIds([]);
                localStorage.removeItem("papermind_docs");
              }}
            >
              Clear Library
            </button>
          </div>
        )}

        <div className="section mode-section">
          <p className="section-label">Analysis Mode</p>
          <div className="mode-grid">
            {Object.entries(MODE_META).map(([key, m]) => (
              <button
                key={key}
                className={`mode-card ${mode === key ? "active" : ""}`}
                onClick={() => setMode(key)}
              >
                <span className="mode-icon">{m.icon}</span>
                <div className="mode-text-wrapper">
                  <span className="mode-label-text">{m.label}</span>
                  <span className="mode-desc">{m.desc}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </aside>

      <main className="chat">
        <header className="chat-header">
          <div className="chat-status">
            <span className="status-dot"></span>
            <p className="chat-title">
              {documents.length === 0
                ? "Awaiting document upload"
                : selectedIds.length === 0
                ? `Active Context: All ${documents.length} paper${documents.length > 1 ? "s" : ""}`
                : `Active Context: ${selectedIds.length} selected paper${selectedIds.length > 1 ? "s" : ""}`}
            </p>
          </div>
          <div className="mode-pill">
            {MODE_META[mode].icon}
            {MODE_META[mode].label}
          </div>
        </header>

        <div className="messages">
          {messages.length === 0 && (
            <div className="empty">
              <div className="empty-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              </div>
              <p className="empty-title">Ready to assist</p>
              <p className="empty-sub">
                {documents.length === 0
                  ? "Upload a research paper from the sidebar to establish a knowledge base."
                  : "The context is loaded. Ask a question about your indexed papers below."}
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`msg-wrap ${msg.role}`}>
              <div className="msg-avatar">
                {msg.role === "user" ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>
                )}
              </div>
              <div className="msg-bubble">
                <div className="msg-content">
                  <p className="msg-text">{msg.text}</p>
                </div>
                {msg.role === "user" && (
                  <span className="msg-mode">Analyzed via {MODE_META[msg.mode]?.label || msg.mode} Mode</span>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="msg-wrap bot">
               <div className="msg-avatar">
                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>
              </div>
              <div className="msg-bubble">
                <div className="msg-content loading-content">
                  <div className="dots">
                    <span /><span /><span />
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="input-area">
          <div className="input-wrapper">
            <textarea
              className="input"
              rows={1}
              placeholder={
                documents.length === 0
                  ? "Upload a paper first to start asking questions..."
                  : "Ask anything about your documents..."
              }
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';
              }}
              onKeyDown={handleKeyDown}
              disabled={documents.length === 0 || loading}
            />
            <button
              className="send"
              onClick={handleQuery}
              disabled={documents.length === 0 || loading || !query.trim()}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
            </button>
          </div>
          <div className="input-footer">
            ResearchMind AI can make mistakes. Verify important information from the source text.
          </div>
        </div>
      </main>
    </div>
  );
}