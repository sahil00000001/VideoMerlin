import { type User, type InsertUser, type VideoData, sampleVideoData } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getVideo(id: string): Promise<VideoData | undefined>;
  getAllVideos(): Promise<VideoData[]>;
  createVideo(video: Omit<VideoData, 'id'>): Promise<VideoData>;
  updateVideo(id: string, video: Partial<VideoData>): Promise<VideoData | undefined>;
  deleteVideo(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private videos: Map<string, VideoData>;

  constructor() {
    this.users = new Map();
    this.videos = new Map();
    
    // Pre-populate with sample video data for demonstration
    this.videos.set(sampleVideoData.id, sampleVideoData);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getVideo(id: string): Promise<VideoData | undefined> {
    return this.videos.get(id);
  }

  async getAllVideos(): Promise<VideoData[]> {
    return Array.from(this.videos.values());
  }

  async createVideo(video: Omit<VideoData, 'id'>): Promise<VideoData> {
    const id = randomUUID();
    const videoData: VideoData = { ...video, id };
    this.videos.set(id, videoData);
    return videoData;
  }

  async updateVideo(id: string, updates: Partial<VideoData>): Promise<VideoData | undefined> {
    const video = this.videos.get(id);
    if (!video) return undefined;
    
    const updated = { ...video, ...updates };
    this.videos.set(id, updated);
    return updated;
  }

  async deleteVideo(id: string): Promise<boolean> {
    return this.videos.delete(id);
  }
}

export const storage = new MemStorage();
