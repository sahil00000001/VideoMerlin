import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import path from "path";
import { transcribeVideo } from "./transcription";

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

      const videoPath = req.file.path;
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const videoUrl = `${baseUrl}/uploads/${req.file.filename}`;
      
      console.log(`Processing video: ${req.file.originalname}`);
      
      // Create video entry immediately with pending status
      const newVideo = await storage.createVideo({
        videoUrl,
        videoName: req.file.originalname,
        duration: null,
        uploadedAt: new Date(),
        segments: null,
        transcript: null,
        analysis: null,
        transcriptionStatus: 'processing',
        transcriptionError: null,
      });

      // Return the video immediately so user can see it
      res.json(newVideo);
      
      // Process transcription in the background
      (async () => {
        try {
          const { transcript, duration, segments, analysis } = await transcribeVideo(videoPath);
          
          await storage.updateVideo(newVideo.id, {
            duration,
            segments,
            transcript,
            analysis,
            transcriptionStatus: 'completed',
            transcriptionError: null,
          });
          
          console.log(`Successfully transcribed video: ${req.file!.originalname}`);
        } catch (error) {
          console.error('Transcription error:', error);
          
          const errorMessage = error instanceof Error ? error.message : 'Unknown transcription error';
          
          await storage.updateVideo(newVideo.id, {
            transcriptionStatus: 'failed',
            transcriptionError: errorMessage,
          });
        }
      })();
      
    } catch (error) {
      console.error('Upload error:', error);
      
      // Clean up uploaded video file on failure
      if (req.file) {
        try {
          const fs = await import('fs');
          if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
          }
        } catch (cleanupErr) {
          console.error('Failed to cleanup uploaded file:', cleanupErr);
        }
      }
      
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

  // Retry transcription for a video
  app.post("/api/videos/:id/retry-transcription", async (req, res) => {
    try {
      const video = await storage.getVideo(req.params.id);
      if (!video) {
        return res.status(404).json({ error: "Video not found" });
      }

      // Extract filename from URL
      const urlParts = video.videoUrl.split('/');
      const filename = urlParts[urlParts.length - 1];
      const videoPath = `uploads/${filename}`;

      // Update status to processing
      await storage.updateVideo(req.params.id, {
        transcriptionStatus: 'processing',
        transcriptionError: null,
      });

      res.json({ message: "Transcription started" });

      // Process transcription in the background
      (async () => {
        try {
          const { transcript, duration, segments, analysis } = await transcribeVideo(videoPath);
          
          await storage.updateVideo(req.params.id, {
            duration,
            segments,
            transcript,
            analysis,
            transcriptionStatus: 'completed',
            transcriptionError: null,
          });
          
          console.log(`Successfully transcribed video: ${video.videoName}`);
        } catch (error) {
          console.error('Retry transcription error:', error);
          
          const errorMessage = error instanceof Error ? error.message : 'Unknown transcription error';
          
          await storage.updateVideo(req.params.id, {
            transcriptionStatus: 'failed',
            transcriptionError: errorMessage,
          });
        }
      })();
      
    } catch (error) {
      res.status(500).json({ error: "Failed to retry transcription" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
