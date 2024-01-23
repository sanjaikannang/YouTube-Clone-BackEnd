import Channel from "../models/channelModel.js";
import Video from "../models/videoModel.js";

// Create a new channel
export const createChannel = async (req, res) => {
  const { name, description } = req.body;

  try {
    const newChannel = await Channel.create({
      name,
      description,
      owner: req.user.id, // Assuming you store user id in req.user.id after authentication
    });

    res.status(201).json(newChannel);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get Particular channel details using the channel ID
export const getParticularChannel = async (req, res) => {
  const channelId = req.params.channelId;

  try {
    const channel = await Channel.findById(channelId)
      .populate('videos', 'title description url thumbnailUrl') 
      .populate('subscribers', 'name'); 

    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    const response = {
      name: channel.name,
      description: channel.description,
      videos: channel.videos.map(video => ({
        id: video._id, 
        title: video.title,
        description: video.description,
        url: video.url,
        thumbnailUrl: video.thumbnailUrl, 
      })),
      subscribers: channel.subscribers.map(subscriber => subscriber.name),
      subscribersCount: channel.subscribers.length,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


// Subscribe the channel using channel Id
export const subscribeChannel = async (req, res) => {
  const channelId = req.params.channelId;

  try {
    const channel = await Channel.findById(channelId);

    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    if (channel.subscribers.includes(req.user.id)) {
      return res.status(400).json({ message: "Already subscribed to this channel" });
    }

    channel.subscribers.push(req.user.id);
    await channel.save();

    res.status(200).json({ message: "Subscribed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Unsubscribe the channel using channel Id
export const unsubscribeChannel = async (req, res) => {
  const channelId = req.params.channelId;

  try {
    const channel = await Channel.findById(channelId);

    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    if (!channel.subscribers.includes(req.user.id)) {
      return res.status(400).json({ message: "Not subscribed to this channel" });
    }

    // Remove subscriber from the array
    channel.subscribers.pull(req.user.id);

    // Log the state of the subscribers array before and after removal
    // console.log("Before Save:", channel.subscribers);

    // Save changes to the database
    await channel.save();

    // Log the state of the subscribers array after saving
    // console.log("After Save:", channel.subscribers);

    res.status(200).json({ message: "Unsubscribed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get current Login user's channel details
export const getCurrentUserChannel = async (req, res) => {
  try {
    // Check if the current user has a channel
    const channel = await Channel.findOne({ owner: req.user.id })
      .populate({
        path: 'videos',
        select: 'title description url thumbnailUrl', // Include thumbnailUrl in the select
      })
      .populate('subscribers', 'name'); // Add population for subscribers

    if (channel) {
      // If the user has a channel, return channel details
      const response = {
        name: channel.name,
        description: channel.description,
        videos: channel.videos.map(video => ({
          _id: video._id, 
          title: video.title,
          description: video.description,
          url: video.url,
          thumbnailUrl: video.thumbnailUrl, 
        })),
        subscribers: channel.subscribers.map(subscriber => subscriber.name),
        subscribersCount: channel.subscribers.length,
      };

      res.status(200).json(response);
    } else {
      // If the user doesn't have a channel, prompt them to create one
      res.status(404).json({ message: "You don't have a channel. Create a channel first." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Check subscription status for a specific channel
export const checkSubscription = async (req, res) => {
  const { channelId } = req.params;

  try {
    // Check if the user is logged in
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Find the channel by ID
    const channel = await Channel.findById(channelId);

    // Check if the channel exists
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    // Check if the user is subscribed to the channel
    const isSubscribed = channel.subscribers.includes(req.user.id);

    // Return the subscription status
    res.status(200).json({ subscribed: isSubscribed });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};