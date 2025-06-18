import express from "express";
import { getMessagesByProject } from "../controllers/ChatController.js";

const chatRouter = express.Router();

chatRouter.get("/:projectId", getMessagesByProject);

export default chatRouter;