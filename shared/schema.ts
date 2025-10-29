import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Video Analysis Schema
export interface TranscriptLine {
  speaker: string;
  text: string;
  start: number;
  end: number;
  timestamp: number;
}

export interface TimelineSegment {
  topic: string;
  description: string;
  startTime: number;
  endTime: number;
  keywords: string[];
  color: string;
}

export interface Speaker {
  name: string;
  role: string;
  speakingTime: number;
}

export interface VideoAnalysis {
  summary: string;
  highlights: string[];
  mainTopics: Array<{ name: string; icon: string }>;
  partialTopics: Array<{ name: string; reason: string }>;
  speakers: Speaker[];
  decisions: Array<{ decision: string; actionItems: string[] }>;
}

export interface VideoData {
  id: string;
  videoUrl: string;
  videoName: string;
  duration: number;
  uploadedAt: Date;
  segments: TimelineSegment[];
  transcript: TranscriptLine[];
  analysis: VideoAnalysis;
}

// Sample data for demonstration
export const sampleVideoData: VideoData = {
  id: "sample-1",
  videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  videoName: "Beauty Consultation - Sarah Johnson.mp4",
  duration: 596,
  uploadedAt: new Date("2025-10-28"),
  segments: [
    {
      topic: "Introduction & Client Assessment",
      description: "Welcome client, discuss needs and goals for today's consultation",
      startTime: 0,
      endTime: 120,
      keywords: ["welcome", "needs assessment", "goals", "consultation overview"],
      color: "#E8F4F8"
    },
    {
      topic: "Hair Treatment Discussion",
      description: "Review keratin treatment options, benefits, and hair health analysis",
      startTime: 120,
      endTime: 280,
      keywords: ["keratin", "smoothing", "treatment", "hair health", "damage repair"],
      color: "#FFE5E5"
    },
    {
      topic: "Skincare Routine Review",
      description: "Discuss current skincare products, skin type analysis, and personalized recommendations",
      startTime: 280,
      endTime: 420,
      keywords: ["skincare", "moisturizer", "serum", "skin type", "anti-aging"],
      color: "#FFF4E5"
    },
    {
      topic: "Treatment Plan & Scheduling",
      description: "Finalize treatment plan, pricing discussion, and booking next appointments",
      startTime: 420,
      endTime: 596,
      keywords: ["pricing", "schedule", "appointment", "payment", "follow-up"],
      color: "#E8F8E8"
    }
  ],
  transcript: [
    {
      speaker: "SPEAKER_00",
      text: "Welcome to Radiant Beauty Salon! I'm so glad you could make it today. How can we help you look and feel your absolute best?",
      start: 2.5,
      end: 8.2,
      timestamp: 2.5
    },
    {
      speaker: "SPEAKER_01",
      text: "Hi! Thank you for having me. I've been really struggling with my hair lately. It's so dry and frizzy, especially after the summer. I was hoping we could discuss some treatment options.",
      start: 8.5,
      end: 18.3,
      timestamp: 8.5
    },
    {
      speaker: "SPEAKER_00",
      text: "Absolutely, I completely understand. Summer can be really harsh on hair with the sun exposure and chlorine. Let me take a closer look at your hair texture and condition.",
      start: 18.6,
      end: 27.1,
      timestamp: 18.6
    },
    {
      speaker: "SPEAKER_01",
      text: "Yes, I've been swimming a lot, and I think that made it worse. I've also been using a lot of heat styling tools.",
      start: 27.5,
      end: 34.2,
      timestamp: 27.5
    },
    {
      speaker: "SPEAKER_00",
      text: "That makes sense. I think you'd be a perfect candidate for our keratin smoothing treatment. It's designed to repair damage, reduce frizz, and add incredible shine. The treatment typically lasts 3-4 months with proper care.",
      start: 34.8,
      end: 48.5,
      timestamp: 34.8
    },
    {
      speaker: "SPEAKER_01",
      text: "That sounds amazing! How does the keratin treatment work exactly? And is it safe for all hair types?",
      start: 49.0,
      end: 55.7,
      timestamp: 49.0
    },
    {
      speaker: "SPEAKER_00",
      text: "Great question! Keratin is a protein that naturally occurs in your hair. The treatment infuses your hair with this protein, filling in the gaps and creating a smooth, protective layer. It's completely safe and works beautifully on all hair types.",
      start: 56.2,
      end: 69.8,
      timestamp: 56.2
    },
    {
      speaker: "SPEAKER_00",
      text: "The process takes about 2-3 hours. We'll start with a clarifying shampoo to remove any buildup, then apply the keratin formula section by section. After that, we blow-dry and flat iron to seal it in.",
      start: 122.3,
      end: 135.6,
      timestamp: 122.3
    },
    {
      speaker: "SPEAKER_01",
      text: "Wow, that's quite detailed! What kind of results can I expect? Will my hair be completely straight?",
      start: 136.1,
      end: 142.8,
      timestamp: 136.1
    },
    {
      speaker: "SPEAKER_00",
      text: "Your hair will be significantly smoother and more manageable, but it won't be board straight unless that's your natural texture. The treatment enhances your natural hair pattern while eliminating frizz. You'll notice about 70-80% reduction in styling time!",
      start: 143.4,
      end: 158.9,
      timestamp: 143.4
    },
    {
      speaker: "SPEAKER_01",
      text: "That's perfect! I don't want it too straight anyway. And what about aftercare? What do I need to do to maintain it?",
      start: 159.5,
      end: 166.3,
      timestamp: 159.5
    },
    {
      speaker: "SPEAKER_00",
      text: "Excellent question. For the first 72 hours after treatment, you'll need to avoid washing your hair, tying it up, or tucking it behind your ears. This allows the keratin to fully set. After that, use sulfate-free shampoo and conditioner to extend the results.",
      start: 166.9,
      end: 182.7,
      timestamp: 166.9
    },
    {
      speaker: "SPEAKER_00",
      text: "Now, let's also talk about your skincare routine. I noticed you mentioned wanting to address some concerns. What are you currently using?",
      start: 281.5,
      end: 289.8,
      timestamp: 281.5
    },
    {
      speaker: "SPEAKER_01",
      text: "Honestly, I've been pretty inconsistent. I use a basic cleanser and moisturizer, but that's about it. I know I should be doing more, especially for anti-aging.",
      start: 290.4,
      end: 299.6,
      timestamp: 290.4
    },
    {
      speaker: "SPEAKER_00",
      text: "No worries at all! Let's build you a simple but effective routine. Based on your skin type, which appears to be combination with some dry patches, I'd recommend starting with a gentle cleanser, a hydrating serum with hyaluronic acid, and a good SPF moisturizer.",
      start: 300.2,
      end: 317.5,
      timestamp: 300.2
    },
    {
      speaker: "SPEAKER_01",
      text: "That sounds manageable. What about at night? Should I be using different products?",
      start: 318.1,
      end: 323.4,
      timestamp: 318.1
    },
    {
      speaker: "SPEAKER_00",
      text: "Absolutely! Nighttime is when your skin does most of its repair work. I'd suggest adding a retinol serum 2-3 times per week to help with fine lines and cell turnover, plus a richer night cream to lock in moisture while you sleep.",
      start: 323.9,
      end: 339.2,
      timestamp: 323.9
    },
    {
      speaker: "SPEAKER_00",
      text: "We also have some amazing vitamin C serums that work wonders for brightening and evening out skin tone. They pair beautifully with the hyaluronic acid in the morning routine.",
      start: 340.1,
      end: 350.8,
      timestamp: 340.1
    },
    {
      speaker: "SPEAKER_01",
      text: "I love that! Can you write down the specific products you recommend? I don't want to forget anything.",
      start: 351.4,
      end: 357.6,
      timestamp: 351.4
    },
    {
      speaker: "SPEAKER_00",
      text: "Of course! I'll prepare a complete product list for you with instructions. Now, let's talk about pricing and scheduling your keratin treatment.",
      start: 421.7,
      end: 430.9,
      timestamp: 421.7
    },
    {
      speaker: "SPEAKER_00",
      text: "The keratin treatment is $285, and that includes the initial treatment plus a take-home sulfate-free care kit. For the skincare products, I can bundle them for you at a 15% discount if you get the full routine today.",
      start: 431.5,
      end: 446.8,
      timestamp: 431.5
    },
    {
      speaker: "SPEAKER_01",
      text: "That's actually better than I expected! What dates do you have available for the keratin treatment?",
      start: 447.4,
      end: 453.2,
      timestamp: 447.4
    },
    {
      speaker: "SPEAKER_00",
      text: "Let me check our calendar. I have next Thursday at 10 AM or Saturday at 2 PM. Both would work perfectly for the 2-3 hour treatment window.",
      start: 453.8,
      end: 463.5,
      timestamp: 453.8
    },
    {
      speaker: "SPEAKER_01",
      text: "Saturday would be perfect! I can take my time and not worry about rushing. Let's book that.",
      start: 464.1,
      end: 470.3,
      timestamp: 464.1
    },
    {
      speaker: "SPEAKER_00",
      text: "Wonderful! You're all booked for Saturday at 2 PM. I'll send you a confirmation email with pre-treatment instructions and the product list we discussed. Is there anything else you'd like to know?",
      start: 470.9,
      end: 484.6,
      timestamp: 470.9
    },
    {
      speaker: "SPEAKER_01",
      text: "I think that covers everything! I'm so excited for this. Thank you so much for taking the time to explain everything.",
      start: 485.2,
      end: 492.8,
      timestamp: 485.2
    },
    {
      speaker: "SPEAKER_00",
      text: "You're so welcome! I can't wait to see your transformation. Remember, if you have any questions before Saturday, don't hesitate to call or text. We're here for you!",
      start: 493.4,
      end: 504.7,
      timestamp: 493.4
    },
    {
      speaker: "SPEAKER_01",
      text: "Perfect! I'll see you on Saturday. Thank you again!",
      start: 505.3,
      end: 509.1,
      timestamp: 505.3
    },
    {
      speaker: "SPEAKER_00",
      text: "See you then! Have a beautiful day!",
      start: 509.7,
      end: 512.5,
      timestamp: 509.7
    }
  ],
  analysis: {
    summary: "This 10-minute beauty consultation successfully covered multiple service areas including hair treatment and skincare. The consultant effectively assessed the client's needs, explained the keratin treatment process in detail, and built a personalized skincare routine. The consultation demonstrated excellent client education, with clear explanations of products, procedures, and expected outcomes. The session concluded with successful booking and product sales, showing strong consultation-to-conversion effectiveness.",
    highlights: [
      "Client expressed clear need for hair damage repair and frizz reduction",
      "Keratin treatment recommended with detailed process explanation",
      "Comprehensive skincare routine developed for combination skin type",
      "Successfully booked keratin treatment for Saturday at 2 PM",
      "Product bundle sold with 15% discount incentive"
    ],
    mainTopics: [
      { name: "Keratin Treatment Consultation", icon: "Sparkles" },
      { name: "Hair Damage Assessment", icon: "Activity" },
      { name: "Skincare Routine Development", icon: "Droplets" },
      { name: "Product Recommendations", icon: "ShoppingBag" },
      { name: "Appointment Scheduling", icon: "Calendar" },
      { name: "Pricing & Packages", icon: "DollarSign" }
    ],
    partialTopics: [
      { name: "Hair Coloring Services", reason: "Mentioned briefly but not fully explored as client focus was on treatment" },
      { name: "Makeup Services", reason: "Not discussed during this consultation session" }
    ],
    speakers: [
      {
        name: "SPEAKER_00",
        role: "Beauty Consultant",
        speakingTime: 380
      },
      {
        name: "SPEAKER_01",
        role: "Client",
        speakingTime: 216
      }
    ],
    decisions: [
      {
        decision: "Keratin smoothing treatment approved for client",
        actionItems: [
          "Book Saturday 2 PM appointment",
          "Send pre-treatment instructions via email",
          "Prepare sulfate-free care kit"
        ]
      },
      {
        decision: "Personalized skincare routine created",
        actionItems: [
          "Prepare product list with morning/evening routines",
          "Apply 15% bundle discount",
          "Provide usage instructions for retinol"
        ]
      }
    ]
  }
};
