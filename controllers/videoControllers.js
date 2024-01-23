import Video from "../models/videoModel.js";
import Channel from "../models/channelModel.js";
import mongoose from "mongoose";
import * as cloudinaryService from '../services/cloudinaryService.js';

// Upload video
export const uploadVideo = async (req, res) => {
  try {
    // Check if user has a channel
    const channel = await Channel.findOne({ owner: req.user.id });

    if (!channel) {
      return res.status(400).json({ message: "You need to create a channel first" });
    }

    const { title, description } = req.body;
    const file = req.files['video'][0];  // Use req.files['video'][0] to get the first file
    const thumbnailFile = req.files['thumbnail'][0];  // Use req.files['thumbnail'][0] to get the first file

    // Upload video to Cloudinary
    const uploadResult = await cloudinaryService.uploadVideo(file.buffer, {
      resource_type: "video",
    });

    // Upload thumbnail to Cloudinary
    const thumbnailUploadResult = await cloudinaryService.uploadImage(thumbnailFile.buffer, {
      resource_type: "image",
    });

    // Create a new video record
    const newVideo = new Video({
      title,
      description,
      url: uploadResult.secure_url,
      thumbnailUrl: thumbnailUploadResult.secure_url,
      channel: channel._id,
      owner: req.user.id,
    });

    // Save video to MongoDB
    await newVideo.save();

    // Update channel's videos array
    channel.videos.push(newVideo._id);
    await channel.save();

    // Response
    const response = {
      videoId: newVideo._id,
      title: newVideo.title,
      description: newVideo.description,
      url: newVideo.url,
      thumbnailUrl: newVideo.thumbnailUrl,  // Include thumbnailUrl in the response
      channelName: channel.name,
      channelId: channel._id,
      subscribersCount: channel.subscribers.length,
      likes: newVideo.likes.length,
      dislikes: newVideo.dislikes.length,
      comments: newVideo.comments,
    };

    res.status(201).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get all video
export const getVideo = async (req, res) => {
  try {
    const videos = await Video.find()
      .populate("channel", "name")
      .populate("likes", "name")
      .populate("dislikes", "name")
      .populate("comments.user", "name");

    const response = videos.map(video => {
      return {
        videoId: video._id, 
        title: video.title,
        description: video.description,
        url: video.url,
        thumbnailUrl: video.thumbnailUrl,
        channelName: video.channel?.name,
        channelId: video.channel?._id,
        subscribersCount: video.channel?.subscribers?.length || 0,
        likes: video.likes.length,
        dislikes: video.dislikes.length,
        comments: video.comments,
      };
    });

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get Particular video using video Id
export const getParticularVideo = async (req, res) => {
  const videoId = req.params.videoId;

  // Check if videoId is not a valid ObjectId
  if (!mongoose.isValidObjectId(videoId)) {
    return res.status(400).json({ message: "Invalid videoId" });
  }

  try {
    const video = await Video.findById(videoId)
      .populate({
        path: "channel",
        select: "name _id subscribers",
      })
      .populate("likes", "name")
      .populate("dislikes", "name")
      .populate("comments.user", "name");

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    const channelName = video.channel ? video.channel.name : "Unknown Channel";
    const channelId = video.channel ? video.channel._id : null;

    const response = {
      videoId: video._id,
      title: video.title,
      description: video.description,
      url: video.url,
      channelName,
      channelId,
      subscribersCount: video.channel ? video.channel.subscribers.length : 0,
      likes: video.likes.length,
      dislikes: video.dislikes.length,
      comments: video.comments,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update video using the video Id
export const updateVideo = async (req, res) => {
  const videoId = req.params.videoId;
  const { title, description } = req.body;

  try {
    const existingVideo = await Video.findById(videoId);

    if (!existingVideo) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Delete the previous video file and thumbnail from Cloudinary
    if (existingVideo.url) {
      const publicId = existingVideo.url.split('/').pop().split('.')[0];
      await cloudinaryService.deleteVideo(publicId);
    }

    if (existingVideo.thumbnailUrl) {
      const thumbnailPublicId = existingVideo.thumbnailUrl.split('/').pop().split('.')[0];
      await cloudinaryService.deleteImage(thumbnailPublicId);
    }

    // Check if a new video file is provided
    if (req.files['video']) {
      // Upload the new video file to Cloudinary
      const cloudinaryVideoUploadResponse = await cloudinaryService.uploadVideo(req.files['video'][0].buffer);

      // Update the video URL with the new Cloudinary URL
      existingVideo.url = cloudinaryVideoUploadResponse.secure_url;
    }

    // Check if a new thumbnail file is provided
    if (req.files['thumbnail']) {
      // Upload the new thumbnail file to Cloudinary
      const cloudinaryThumbnailUploadResponse = await cloudinaryService.uploadImage(req.files['thumbnail'][0].buffer);

      // Update the video thumbnail URL with the new Cloudinary URL
      existingVideo.thumbnailUrl = cloudinaryThumbnailUploadResponse.secure_url;
    }

    // Update the video details with the new data
    existingVideo.title = title || existingVideo.title;
    existingVideo.description = description || existingVideo.description;

    // Save the updated video
    const updatedVideo = await existingVideo.save();


    const channelName = updatedVideo.channel ? updatedVideo.channel.name : "Unknown Channel";
    const channelId = updatedVideo.channel ? updatedVideo.channel._id : null;

    const subscribersCount = updatedVideo.channel?.subscribers?.length || 0;
    const likesCount = updatedVideo.likes?.length || 0;
    const dislikesCount = updatedVideo.dislikes?.length || 0;

    const response = {
      title: updatedVideo.title,
      description: updatedVideo.description,
      url: updatedVideo.url,
      thumbnailUrl: updatedVideo.thumbnailUrl,  
      channelName,
      channelId,
      subscribersCount,
      likes: likesCount,
      dislikes: dislikesCount,
      comments: updatedVideo.comments,
    };
    
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Delete Video
export const deleteVideo = async (req, res) => {
  const videoId = req.params.videoId;

  try {
    const deletedVideo = await Video.findByIdAndDelete(videoId);

    if (!deletedVideo) {
      return res.status(404).json({ message: "Video not found" });
    }

    // Remove video from associated channel if it exists
    if (deletedVideo.channel) {
      await Channel.findByIdAndUpdate(
        deletedVideo.channel,
        { $pull: { videos: videoId } },
        { new: true }
      );
    }

    res.status(200).json({ message: "Video deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Like the video
export const likeVideo = async (req, res) => {
  const videoId = req.params.videoId;

  try {
    const video = await Video.findById(videoId);

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // Check if user has already liked the video
    if (video.likes.includes(req.user.id)) {
      return res.status(400).json({ message: "You have already liked this video" });
    }

    video.likes.push(req.user.id);
    await video.save();

    res.status(200).json({ message: "Video liked successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Dislike the video
export const dislikeVideo = async (req, res) => {
  const videoId = req.params.videoId;

  try {
    const video = await Video.findById(videoId);

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // Check if user has already disliked the video
    if (video.dislikes.includes(req.user.id)) {
      return res.status(400).json({ message: "You have already disliked this video" });
    }

    video.dislikes.push(req.user.id);
    await video.save();

    res.status(200).json({ message: "Video disliked successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Comment the video
export const commentVideo = async (req, res) => {
  const videoId = req.params.videoId;
  const { text } = req.body; 

  try {
    const video = await Video.findById(videoId);

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // Add comment with user information
    video.comments.push({
      user: req.user.id,
      text, // Use the 'text' property for the comment text
    });

    await video.save();

    res.status(200).json({ message: "Comment added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
