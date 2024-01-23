import express from "express";
import auth from "../middlewares/auth.js";
import multer from "multer";
import {
  uploadVideo,
  getVideo,
  getParticularVideo,
  updateVideo,
  deleteVideo,
  likeVideo,
  dislikeVideo,
  commentVideo,
} from "../controllers/videoControllers.js";

const router = express.Router();

const storage = multer.memoryStorage(); // Store the file in memory as a Buffer
const upload = multer({ storage: storage });

// Upload Video
router.post("/upload", auth, upload.fields([{ name: 'video', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), uploadVideo);

// Get all the video
router.get("/get", auth, getVideo);

// Get Particular video using video Id
router.get("/get/:videoId", auth, getParticularVideo);

// Update video using the video Id
router.put("/update-video/:videoId", auth, upload.fields([{ name: 'video', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), updateVideo);

// Delete Video
router.delete("/delete/:videoId", auth, deleteVideo);

// Like the video
router.post("/like/:videoId", auth, likeVideo);

// Dislike the video
router.post("/dislike/:videoId", auth, dislikeVideo);

// Comment the video
router.post("/comment/:videoId", auth, commentVideo);

export default router;
