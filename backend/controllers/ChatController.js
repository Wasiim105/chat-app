import chatModel from "../models/ChatModel.js";

export const getMessagesByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    console.log("projectId : ",projectId);
    //const messages = await chatModel.deleteMany({ projectId });
    const messages = await chatModel.find({ projectId }).sort({ timestamp: 1 });
    if(!messages) return res.status(404).json({message: "No messages found"});
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};
