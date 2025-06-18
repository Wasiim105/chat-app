import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.ObjectId,
    ref: "projects",
    required: true,
  },
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: "addusermodels",
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  messageContent: {
    type: Buffer,
    required: true,
  },
  contentType: {
    type: String, // "text/plain", "image/png", "application/pdf", etc.
    required: false,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const chatModel = mongoose.models.chatModel || mongoose.model("chatModel",chatSchema)

export default chatModel;