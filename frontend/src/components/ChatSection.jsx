import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

const ChatSection = ({ projectId, userId, userName }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const ws = useRef(null);
  const fileInputRef = useRef(null);
  const bottomRef = useRef(null);

  // Helper to process message content from backend
  const processMessageContent = (message) => {
    // If it's already a string (from WebSocket), return as-is
    if (typeof message.messageContent === 'string') {
      return message.messageContent;
    }
    
    // Handle Buffer data from MongoDB
    if (message.messageContent && message.messageContent.data) {
      // Convert Buffer data (Uint8Array) to string for text content
      if (message.contentType === 'text/plain') {
        return new TextDecoder().decode(new Uint8Array(message.messageContent.data));
      }
      // Create Blob URL for binary content (images, etc.)
      else {
        const blob = new Blob([new Uint8Array(message.messageContent.data)], {
          type: message.contentType
        });
        return URL.createObjectURL(blob);
      }
    }
    
    return message.messageContent;
  };

  useEffect(() => {
    // Fetch initial messages
    const fetchMessages = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/chat/${projectId}`);
        const processedMessages = res.data.map(msg => ({
          ...msg,
          messageContent: processMessageContent(msg)
        }));
        setMessages(processedMessages);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
    };

    fetchMessages();

    // Setup WebSocket
    ws.current = new WebSocket("ws://localhost:8080");

    ws.current.onmessage = (e) => {
      
      try {
        const data = JSON.parse(e.data);
        const processedMessage = {
          ...data,
          messageContent: processMessageContent(data)
        };
        setMessages(prev => [...prev, processedMessage]);
      } catch (err) {
        console.error("Error processing WebSocket message:", err);
      }
    };

    return () => {
      // Clean up Blob URLs when unmounting
      messages.forEach(msg => {
        if (msg.contentType && msg.contentType !== 'text/plain' && 
            msg.messageContent && msg.messageContent.startsWith('blob:')) {
          URL.revokeObjectURL(msg.messageContent);
        }
      });
      ws.current.close();
    };
  }, [projectId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendText = () => {
    if (input.trim()) {
      const message = {
        projectId,
        userName,
        userId,
        messageContent: input,
        contentType: "text/plain"
      };
      ws.current.send(JSON.stringify(message));
      setInput("");
    }
  };

  const sendFile = () => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result.split(',')[1];
      const message = {
        projectId,
        userName,
        userId,
        messageContent: base64String,
        contentType: file.type || "application/octet-stream"
      };
      ws.current.send(JSON.stringify(message));
    };
    reader.readAsDataURL(file);
    setFile(null);
    fileInputRef.current.value = null;
  };

  const handleSend = () => {
    if (input.trim()) sendText();
    else if (file) sendFile();
  };

  return (
    <div style={{ border: "1px solid #ccc", borderRadius: 8, padding: 16, width: 600 }}>
      <h3>Chat Section</h3>
      <div style={{ height: 300, overflowY: "scroll", marginBottom: 10 }}>
        {messages.map((msg) => (
          <div key={msg._id} style={{ margin: "10px 0" }}>
            <strong>{msg.userName}:</strong>
            {msg.contentType && msg.contentType.startsWith('image/') ? (
              <img 
                src={msg.messageContent} 
                alt="file" 
                style={{ maxWidth: "100px", display: "block" }} 
              />
            ) : (
              <span> {msg.messageContent}</span>
            )}
            <div style={{ fontSize: "0.8em", color: "#666" }}>
              {new Date(msg.timestamp).toLocaleString()}
            </div>
          </div>
        ))}
        
      </div>

      <div style={{ display: "flex", alignItems: "center" }}>
        <input
          type="text"
          placeholder="Type your message"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          style={{ padding: 8, flex: 1, marginRight: 10 }}
        />
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => setFile(e.target.files[0])}
          style={{ display: "none" }}
          id="file-upload"
        />
        <label 
          htmlFor="file-upload"
          style={{
            padding: "8px 12px",
            background: "#eee",
            borderRadius: 4,
            marginRight: 10,
            cursor: "pointer"
          }}
        >
          📎
        </label>
        <button 
          onClick={handleSend} 
          style={{ padding: "8px 16px" }}
          disabled={!input.trim() && !file}
        >
          Send
        </button>
      </div>
      {file && (
        <div style={{ marginTop: 8 }}>
          Selected: {file.name}
          <button 
            onClick={() => {
              setFile(null);
              fileInputRef.current.value = null;
            }}
            style={{ marginLeft: 8, background: "none", border: "none" }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatSection;