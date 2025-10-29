import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import path from "path";
import { sampleVideoData } from "@shared/schema";

// Configure multer for video uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'];
    const allowedExtensions = ['.mp4', '.mov', '.avi', '.mkv'];
    
    const isAllowedType = allowedTypes.includes(file.mimetype);
    const isAllowedExt = allowedExtensions.some(ext => file.originalname.toLowerCase().endsWith(ext));
    
    if (isAllowedType || isAllowedExt) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only video files are allowed.'));
    }
  },
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB max file size
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all videos
  app.get("/api/videos", async (req, res) => {
    try {
      const videos = await storage.getAllVideos();
      res.json(videos);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch videos" });
    }
  });

  // Get a single video by ID
  app.get("/api/videos/:id", async (req, res) => {
    try {
      const video = await storage.getVideo(req.params.id);
      if (!video) {
        return res.status(404).json({ error: "Video not found" });
      }
      res.json(video);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch video" });
    }
  });

  // Upload a new video
  app.post("/api/videos/upload", upload.single('video'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No video file provided" });
      }

      // In a real implementation, this would:
      // 1. Extract audio from video
      // 2. Send to transcription API (e.g., Whisper, AssemblyAI)
      // 3. Perform speaker diarization
      // 4. Send transcript to AI for analysis (OpenAI, Anthropic)
      // 5. Generate timeline segments based on topic analysis
      
      // For now, we'll return sample data structure
      const videoUrl = `/uploads/${req.file.filename}`;
      
      const newVideo = await storage.createVideo({
        videoUrl,
        videoName: req.file.originalname,
        duration: 596, // Would be extracted from actual video
        uploadedAt: new Date(),
        segments: sampleVideoData.segments,
        transcript: sampleVideoData.transcript,
        analysis: sampleVideoData.analysis,
      });

      res.json(newVideo);
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: "Failed to process video upload" });
    }
  });

  // Update video metadata
  app.patch("/api/videos/:id", async (req, res) => {
    try {
      const updated = await storage.updateVideo(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Video not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update video" });
    }
  });

  // Delete a video
  app.delete("/api/videos/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteVideo(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Video not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete video" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
