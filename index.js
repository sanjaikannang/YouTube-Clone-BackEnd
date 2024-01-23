import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { v2 as cloudinary } from 'cloudinary';

import connectDB from "./connectMongoDB.js";
import userRoutes from "./routes/userRoutes.js"
import channelRoutes from "./routes/channelRoutes.js"
import videoRoutes from "./routes/videoRoutes.js"

dotenv.config();
connectDB();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  chunk_size: 100000000,// 100 MB 
  timeout: 1000000, // 10 minutes
});

const app = express();
app.use(express.json());
app.use(cors());

app.use('/user',userRoutes);
app.use('/channel',channelRoutes);
app.use('/video',videoRoutes);

// app.use('/',(req, res) => {
//     res.send("This is a You Tube clone Project !!!")
// })

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
