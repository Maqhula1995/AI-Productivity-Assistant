import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider, DEFAULT_MODEL } from "./ai-gateway";

function getModel() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("LOVABLE_API_KEY is not configured");
  return createLovableAiGatewayProvider(key)(DEFAULT_MODEL);
}

export type MeetingSummary = {
  keyPoints: string[];
  decisions: string[];
  actionItems: { task: string; owner: string; deadline: string }[];
  deadlines: string[];
};

export type Schedule = {
  blocks: { start: string; end: string; task: string; priority: "high" | "medium" | "low"; note: string }[];
  tips: string[];
};

const emailSchema = z.object({
  audience: z.string().trim().min(1).max(200),
  tone: z.enum(["formal", "informal", "persuasive", "friendly", "apologetic"]),
  purpose: z.string().trim().min(1).max(500),
  details: z.string().trim().max(2000).optional().default(""),
});

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => emailSchema.parse(d))
  .handler(async ({ data }) => {
    const { text } = await generateText({
      model: getModel(),
      system:
        "You are a professional workplace email writer. Produce ready-to-send emails. Always include a clear Subject line on the first line as 'Subject: ...' followed by a blank line, then the body with greeting, body paragraphs, and sign-off. Avoid biased, harmful, or discriminatory content. Keep it concise and on-purpose.",
      prompt: `Write an email.\nAudience: ${data.audience}\nTone: ${data.tone}\nPurpose: ${data.purpose}\nAdditional details: ${data.details || "(none)"}`,
    });
    return { email: text };
  });

const summarizeSchema = z.object({
  notes: z.string().trim().min(20).max(20000),
});

export const summarizeMeeting = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => summarizeSchema.parse(d))
  .handler(async ({ data }) => {
    const { text } = await generateText({
      model: getModel(),
      system:
        "You summarize meeting notes for busy professionals. Return STRICT JSON with this exact shape and nothing else: {\"keyPoints\":string[],\"decisions\":string[],\"actionItems\":{\"task\":string,\"owner\":string,\"deadline\":string}[],\"deadlines\":string[]}. Use empty arrays when something is missing. Never invent owners or deadlines — use 'Unassigned' or 'No deadline' if absent.",
      prompt: `Meeting notes:\n\n${data.notes}`,
    });
    let parsed: MeetingSummary;
    try {
      const cleaned = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
      parsed = JSON.parse(cleaned) as MeetingSummary;
    } catch {
      parsed = { keyPoints: [text], decisions: [], actionItems: [], deadlines: [] };
    }
    return { summary: parsed };
  });

const plannerSchema = z.object({
  tasks: z.string().trim().min(3).max(4000),
  hours: z.string().trim().min(1).max(200),
});

export const planSchedule = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => plannerSchema.parse(d))
  .handler(async ({ data }) => {
    const { text } = await generateText({
      model: getModel(),
      system:
        "You are an executive productivity coach. Given a list of tasks and the user's working hours, produce a prioritized daily schedule. Return STRICT JSON only: {\"blocks\":[{\"start\":\"HH:MM\",\"end\":\"HH:MM\",\"task\":string,\"priority\":\"high\"|\"medium\"|\"low\",\"note\":string}],\"tips\":string[]}. Include short breaks. Group similar deep work. Tips should be 3-5 actionable productivity suggestions.",
      prompt: `Working hours: ${data.hours}\nTasks:\n${data.tasks}`,
    });
    let parsed: Schedule;
    try {
      const cleaned = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
      parsed = JSON.parse(cleaned) as Schedule;
    } catch {
      parsed = { blocks: [], tips: [text] };
    }
    return { schedule: parsed };
  });

const chatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(4000),
      }),
    )
    .min(1)
    .max(40),
});

export const chatAssistant = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => chatSchema.parse(d))
  .handler(async ({ data }) => {
    const { text } = await generateText({
      model: getModel(),
      system:
        "You are an AI Productivity Assistant for working professionals. Give concise, practical, ethical answers about workplace productivity, time management, communication, meetings, focus, prioritization, and tools. Refuse harmful, discriminatory, or unsafe requests. Use markdown lists when helpful. Keep responses under ~250 words unless asked for more.",
      messages: data.messages,
    });
    return { reply: text };
  });