import OpenAI from "openai";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import ffprobeInstaller from "@ffprobe-installer/ffprobe";
import fs from "fs";
import path from "path";
import type { TranscriptLine, TimelineSegment, VideoAnalysis } from "@shared/schema";

// Configure ffmpeg and ffprobe paths
ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobeInstaller.path);

// This is using OpenAI's API with Whisper for transcription
// Reference: blueprint:javascript_openai
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is required for video transcription');
}
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface TranscriptionResult {
  transcript: TranscriptLine[];
  duration: number;
  segments: TimelineSegment[];
  analysis: VideoAnalysis;
}

export async function extractAudioFromVideo(videoPath: string): Promise<string> {
  const audioPath = videoPath.replace(path.extname(videoPath), '.mp3');
  
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .output(audioPath)
      .audioCodec('libmp3lame')
      .audioBitrate('128k')
      .on('end', () => resolve(audioPath))
      .on('error', (err: Error) => reject(err))
      .run();
  });
}

export async function getVideoDuration(videoPath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err: any, metadata: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(Math.floor(metadata.format.duration || 0));
      }
    });
  });
}

export async function transcribeVideo(videoPath: string): Promise<TranscriptionResult> {
  // Validate API key is available
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured. Please add your OpenAI API key to enable transcription.');
  }
  
  try {
    // Step 1: Extract audio from video
    console.log('Extracting audio from video...');
    const audioPath = await extractAudioFromVideo(videoPath);
    
    // Step 2: Get video duration
    const duration = await getVideoDuration(videoPath);
    
    // Step 3: Transcribe audio using OpenAI Whisper
    console.log('Transcribing audio with Whisper...');
    const audioReadStream = fs.createReadStream(audioPath);
    
    const transcription = await openai.audio.transcriptions.create({
      file: audioReadStream,
      model: "whisper-1",
      response_format: "verbose_json",
      timestamp_granularities: ["segment"]
    });
    
    // Step 4: Convert Whisper segments to TranscriptLine format
    const transcript: TranscriptLine[] = (transcription.segments || []).map((segment: any, index: number) => ({
      speaker: `SPEAKER_${index % 2 === 0 ? '00' : '01'}`, // Simple speaker alternation
      text: segment.text.trim(),
      start: segment.start,
      end: segment.end,
      timestamp: segment.start
    }));
    
    // Step 5: Generate AI analysis using GPT
    console.log('Analyzing transcript with AI...');
    const analysis = await analyzeTranscript(transcript, transcription.text);
    
    // Step 6: Generate timeline segments from analysis
    const segments = generateTimelineSegments(transcript, analysis);
    
    // Cleanup audio file
    try {
      fs.unlinkSync(audioPath);
    } catch (err) {
      console.error('Failed to delete temporary audio file:', err);
    }
    
    return {
      transcript,
      duration,
      segments,
      analysis
    };
  } catch (error) {
    console.error('Transcription error:', error);
    // Clean up audio file if it exists
    const audioPath = videoPath.replace(path.extname(videoPath), '.mp3');
    try {
      if (fs.existsSync(audioPath)) {
        fs.unlinkSync(audioPath);
      }
    } catch (cleanupErr) {
      console.error('Failed to cleanup audio file:', cleanupErr);
    }
    throw new Error(`Failed to transcribe video: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function analyzeTranscript(transcript: TranscriptLine[], fullText: string): Promise<VideoAnalysis> {
  try {
    // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `You are an expert at analyzing conversation transcripts. Analyze the following transcript and provide insights in JSON format with these fields:
- summary: A brief summary of the conversation (2-3 sentences)
- highlights: Array of key highlights or important moments (3-5 items)
- mainTopics: Array of main topics discussed, each with "name" and "icon" (use a simple text label or abbreviation for icon, not emoji)
- partialTopics: Array of partially discussed topics, each with "name" and "reason" why it was only partial
- speakers: Array of speaker info with "name" (e.g., "Consultant", "Client"), "role", and "speakingTime" (estimated in seconds)
- decisions: Array of decisions made, each with "decision" and "actionItems" array

Respond ONLY with valid JSON.`
        },
        {
          role: "user",
          content: fullText
        }
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 8192
    });
    
    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      summary: result.summary || "No summary available",
      highlights: result.highlights || [],
      mainTopics: result.mainTopics || [],
      partialTopics: result.partialTopics || [],
      speakers: result.speakers || [],
      decisions: result.decisions || []
    };
  } catch (error) {
    console.error('Analysis error:', error instanceof Error ? error.message : error);
    // Return default analysis if AI analysis fails
    return {
      summary: "Analysis not available",
      highlights: [],
      mainTopics: [],
      partialTopics: [],
      speakers: [],
      decisions: []
    };
  }
}

function generateTimelineSegments(transcript: TranscriptLine[], analysis: VideoAnalysis): TimelineSegment[] {
  if (transcript.length === 0) {
    return [];
  }
  
  const colors = ['#E8F4F8', '#FFE5E5', '#FFF4E5', '#E8F8E8', '#F0E8F8'];
  const totalDuration = transcript[transcript.length - 1].end;
  const numTopics = Math.min(analysis.mainTopics.length, 5) || 3;
  const segmentDuration = totalDuration / numTopics;
  
  const segments: TimelineSegment[] = [];
  
  for (let i = 0; i < numTopics; i++) {
    const startTime = i * segmentDuration;
    const endTime = Math.min((i + 1) * segmentDuration, totalDuration);
    const topic = analysis.mainTopics[i];
    
    // Find transcript lines in this segment
    const segmentLines = transcript.filter(
      line => line.start >= startTime && line.start < endTime
    );
    
    // Extract keywords from segment text
    const segmentText = segmentLines.map(line => line.text).join(' ');
    const keywords = extractKeywords(segmentText);
    
    segments.push({
      topic: topic?.name || `Segment ${i + 1}`,
      description: `Discussion from ${formatTime(startTime)} to ${formatTime(endTime)}`,
      startTime: Math.floor(startTime),
      endTime: Math.floor(endTime),
      keywords,
      color: colors[i % colors.length]
    });
  }
  
  return segments;
}

function extractKeywords(text: string): string[] {
  // Simple keyword extraction - get most common meaningful words
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 4); // Filter short words
  
  const wordCount = new Map<string, number>();
  words.forEach(word => {
    wordCount.set(word, (wordCount.get(word) || 0) + 1);
  });
  
  return Array.from(wordCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
