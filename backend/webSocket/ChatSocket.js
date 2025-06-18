import chatModel from "../models/ChatModel.js";

export const setupWebSocket = (wss) => {
  wss.on("connection", (ws) => {
    console.log("WebSocket client connected");

    ws.on("message", async (data) => {
      try {
        const parsed = JSON.parse(data);
        
        // Convert base64 to Buffer for storage
        const messageContent = parsed.contentType === 'text/plain' ? 
          Buffer.from(parsed.messageContent, 'utf-8') :
          Buffer.from(parsed.messageContent, 'base64');

        const newMsg = new chatModel({
          projectId: parsed.projectId,
          userId: parsed.userId,
          userName: parsed.userName,
          messageContent,
          contentType: parsed.contentType,
        });

        await newMsg.save();

        // Prepare the response message
        const responseMessage = {
          _id: newMsg._id,
          userName: newMsg.userName,
          projectId: newMsg.projectId,
          userId: newMsg.userId,
          // Send back the original content (not Buffer)
          messageContent: messageContent,
          contentType: newMsg.contentType,
          timestamp: newMsg.timestamp
        };
        

        // Broadcast to all clients
        wss.clients.forEach((client) => {
          if (client.readyState === ws.OPEN) {
            client.send(JSON.stringify(responseMessage));
          }
        });

      } catch (err) {
        console.error("Error processing WebSocket message:", err);
      }
    });

    ws.on("close", () => {
      console.log("WebSocket client disconnected");
    });
  });
};