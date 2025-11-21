import React, { useState, useRef, useEffect } from "react";
import { uploadFile, chatMessage } from "./api";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const chatBoxRef = useRef(null);

  useEffect(() => {
    // scroll to bottom when messages change
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert("Choose a file first");
    setUploadStatus("uploading");
    try {
      const res = await uploadFile(file);
      if (res.status === "ok") {
        setUploadStatus(`OK — ${res.chunks_added} chunks added`);
      } else {
        setUploadStatus(`Error: ${res.error || JSON.stringify(res)}`);
      }
    } catch (err) {
      setUploadStatus("Upload failed: " + err.message);
    } finally {
      setTimeout(() => setUploadStatus(null), 5000);
    }
  };

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const userMsg = { sender: "user", text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    // call backend
    try {
      const res = await chatMessage(trimmed);
      if (res.response) {
        // res.response could be object {answer:..., critique:...}
        const botText =
          typeof res.response === "string"
            ? res.response
            : res.response.answer || JSON.stringify(res.response);
        setMessages((prev) => [...prev, { sender: "bot", text: botText }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "No response from server" },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Error: " + err.message },
      ]);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "2rem auto", padding: "1rem" }}>
      <h1>RAG Chatbot</h1>

      <section style={{ marginBottom: "1.5rem" }}>
        <h3>Upload document</h3>
        <input
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={handleFileChange}
        />
        <button onClick={handleUpload} style={{ marginLeft: 8 }}>
          Upload
        </button>
        {uploadStatus && <div style={{ marginTop: 8 }}>{uploadStatus}</div>}
      </section>

      <section>
        <h3>Chat</h3>
        <div
          ref={chatBoxRef}
          style={{
            border: "1px solid #ddd",
            borderRadius: 6,
            height: 300,
            overflowY: "auto",
            padding: 12,
            marginBottom: 8,
          }}
        >
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                marginBottom: 10,
                textAlign: m.sender === "user" ? "right" : "left",
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  padding: "8px 12px",
                  borderRadius: 12,
                  background: m.sender === "user" ? "#e6f4ff" : "#f1f1f1",
                  maxWidth: "80%",
                  wordBreak: "break-word",
                }}
              >
                <strong style={{ fontSize: 12, opacity: 0.8 }}>
                  {m.sender}
                </strong>
                <div>{m.text}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex" }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask a question about your uploaded docs..."
            style={{ flex: 1, padding: "8px 10px" }}
          />
          <button onClick={sendMessage} style={{ marginLeft: 8 }}>
            Send
          </button>
        </div>
      </section>
    </div>
  );
}

export default App;
