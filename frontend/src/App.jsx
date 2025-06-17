import React, { useEffect, useRef, useState } from "react";

const App = () => {
  const fileInputRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const ws = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket(`ws://localhost:8080`);

    ws.current.onmessage = async (e) => {
      if (e.data instanceof Blob) {
        const url = URL.createObjectURL(e.data);
        setMessages((prev) => [...prev, { type: "image", content: url }]);
      } else {
        setMessages((prev) => [...prev, { type: "text", content: e.data }]);
      }
    };

    ws.current.onopen = () => console.log("WebSocket connected");
    ws.current.onclose = () => console.log("WebSocket disconnected");

    return () => ws.current.close();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (input.trim()) {
      ws.current.send(input);
      setInput("");
    }
  };

  const handleFileSubmit = () => {
    if (file) {
      ws.current.send(file);
      setFile(null);
      fileInputRef.current.value = null;
    }
  };

  const handleSendClick = () => {
    if (input.trim()) {
      sendMessage();
    } else if (file) {
      handleFileSubmit();
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "30px auto",
        padding: 20,
        borderRadius: 12,
        boxShadow: "0 0 15px rgba(0,0,0,0.1)",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#fdfdfd",
      }}
    >
      <h2 style={{ textAlign: "center", color: "#3b3b3b" }}>📡 WebSocket Chat</h2>

      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: 10,
          height: 300,
          overflowY: "scroll",
          marginBottom: 15,
          padding: 10,
          background: "#f0f2f5",
        }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              marginBottom: 10,
              display: "flex",
              justifyContent: msg.type === "text" ? "flex-start" : "flex-end",
            }}
          >
            {msg.type === "image" ? (
              <img
                src={msg.content}
                alt="received"
                style={{
                  maxWidth: "200px",
                  maxHeight: "200px",
                  borderRadius: 8,
                  boxShadow: "0 0 5px rgba(0,0,0,0.2)",
                }}
              />
            ) : (
              <div
                style={{
                  background: "#fff",
                  padding: "8px 12px",
                  borderRadius: 16,
                  maxWidth: "80%",
                  boxShadow: "0 0 5px rgba(0,0,0,0.1)",
                }}
              >
                {msg.content}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendClick()}
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            outline: "none",
            fontSize: "14px",
          }}
          placeholder="💬 Type your message..."
        />
        <button
          onClick={handleSendClick}
          style={{
            padding: "10px 18px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: "bold",
            transition: "background 0.3s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#0056b3")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#007bff")}
        >
          Send
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*,application/pdf"
        style={{
          marginTop: 12,
          fontSize: "14px",
        }}
      />
    </div>
  );
};

export default App;
