import type { VideoAnalysis, TranscriptLine } from "@shared/schema";

declare global {
  interface Window {
    puter: {
      ai: {
        chat: (prompt: string | any[], options?: { model?: string; stream?: boolean }) => Promise<{
          message: { content: string };
          text?: string;
        }>;
      };
    };
  }
}

export async function analyzeTranscriptWithPuter(
  transcript: TranscriptLine[],
  fullText: string
): Promise<VideoAnalysis> {
  if (!window.puter) {
    console.error('Puter.js not loaded');
    throw new Error('Puter.js is not available. Please refresh the page.');
  }

  try {
    const prompt = `You are an expert at analyzing conversation transcripts. Analyze the following transcript and provide insights in JSON format with these fields:
- summary: A brief summary of the conversation (2-3 sentences)
- highlights: Array of key highlights or important moments (3-5 items)
- mainTopics: Array of main topics discussed, each with "name" and "icon" (use a simple text label or abbreviation for icon, not emoji)
- partialTopics: Array of partially discussed topics, each with "name" and "reason" why it was only partial
- speakers: Array of speaker info with "name" (e.g., "Consultant", "Client"), "role", and "speakingTime" (estimated in seconds)
- decisions: Array of decisions made, each with "decision" and "actionItems" array

Respond ONLY with valid JSON.

Transcript:
${fullText}`;

    console.log('[PUTER AI] Starting transcript analysis with Puter.js...');
    
    const response = await window.puter.ai.chat(prompt, {
      model: 'gpt-5-nano'
    });

    const content = response.message?.content || response.text || '{}';
    console.log('[PUTER AI] Received response:', content.substring(0, 200));
    
    const result = JSON.parse(content);

    return {
      summary: result.summary || "No summary available",
      highlights: result.highlights || [],
      mainTopics: result.mainTopics || [],
      partialTopics: result.partialTopics || [],
      speakers: result.speakers || [],
      decisions: result.decisions || []
    };
  } catch (error) {
    console.error('[PUTER AI] Analysis error:', error);
    throw new Error(`Failed to analyze transcript: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
