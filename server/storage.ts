import { users, videos, type User, type InsertUser, type VideoData, sampleVideoData } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

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

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getVideo(id: string): Promise<VideoData | undefined> {
    const [video] = await db.select().from(videos).where(eq(videos.id, id));
    if (!video) return undefined;
    
    return {
      ...video,
      uploadedAt: new Date(video.uploadedAt),
    };
  }

  async getAllVideos(): Promise<VideoData[]> {
    const allVideos = await db.select().from(videos);
    return allVideos.map(video => ({
      ...video,
      uploadedAt: new Date(video.uploadedAt),
    }));
  }

  async createVideo(video: Omit<VideoData, 'id'>): Promise<VideoData> {
    const [newVideo] = await db
      .insert(videos)
      .values({
        ...video,
        uploadedAt: video.uploadedAt.toISOString(),
      })
      .returning();
    
    return {
      ...newVideo,
      uploadedAt: new Date(newVideo.uploadedAt),
    };
  }

  async updateVideo(id: string, updates: Partial<VideoData>): Promise<VideoData | undefined> {
    const updateData = updates.uploadedAt 
      ? { ...updates, uploadedAt: updates.uploadedAt.toISOString() }
      : updates;
    
    const [updated] = await db
      .update(videos)
      .set(updateData as any)
      .where(eq(videos.id, id))
      .returning();
    
    if (!updated) return undefined;
    
    return {
      ...updated,
      uploadedAt: new Date(updated.uploadedAt),
    };
  }

  async deleteVideo(id: string): Promise<boolean> {
    const result = await db.delete(videos).where(eq(videos.id, id)).returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
