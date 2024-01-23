import express from "express";
import auth from "../middlewares/auth.js"
import { createChannel,getParticularChannel, subscribeChannel, unsubscribeChannel,getCurrentUserChannel,checkSubscription } from "../controllers/channelControllers.js";

const router = express.Router();

// Create a new channel
router.post("/create", auth,createChannel);

// Get Particular channel details using the channel ID
router.get("/get/:channelId",auth, getParticularChannel);

// Subscribe the channel
router.post("/subscribe/:channelId",auth, subscribeChannel);

// UnSubscribe the channel
router.post("/unsubscribe/:channelId",auth, unsubscribeChannel);

// Get current user's channel details
router.get("/current-user", auth, getCurrentUserChannel);

// Check subscription status for a specific channel
router.get('/check-subscription/:channelId',auth,checkSubscription);

export default router;
