import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const STARTER_AI_LIMIT = 5;

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export async function POST(request: NextRequest) {
  if (!GROQ_API_KEY) {
    return NextResponse.json(
      { error: "AI generation is not configured" },
      { status: 503 }
    );
  }

  const { tenantId, category, style } = await request.json();

  if (!tenantId || !category || !style) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { plan: true, businessName: true },
  });

  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  const month = getCurrentMonth();
  const usage = await prisma.aiUsage.upsert({
    where: { tenantId_month: { tenantId, month } },
    update: { count: { increment: 1 } },
    create: { tenantId, month, count: 1 },
  });

  if (tenant.plan === "starter" && usage.count > STARTER_AI_LIMIT) {
    return NextResponse.json(
      {
        error: "AI generation limit reached",
        message: `Free tier includes ${STARTER_AI_LIMIT} AI generations per month. Upgrade to Business for unlimited.`,
        limit: STARTER_AI_LIMIT,
        used: usage.count,
      },
      { status: 429 }
    );
  }

  const styleDescriptions: Record<string, string> = {
    heartfelt: "sincere, emotional, warm, and deeply personal",
    friendly: "warm, cheerful, casual, and upbeat",
    funny: "lighthearted and humorous. Use playful jokes, witty observations, or cheeky humor. Make them laugh out loud. Think best man speech energy — warm but hilarious.",
    formal: "elegant, professional, respectful, and proper",
  };

  const categoryLabels: Record<string, string> = {
    birthday: "birthday",
    anniversary: "anniversary",
    "get-well": "get well / recovery",
    sympathy: "sympathy / condolence",
    "thank-you": "thank you / gratitude",
    "just-because": "just because / thinking of you",
    congratulations: "congratulations / achievement",
    love: "romantic love",
    "thinking-of-you": "thinking of you",
  };

  const prompt = `You are a world-class floral message writer. Your messages make people cry happy tears (or laugh out loud). Generate exactly 3 flower card messages for a ${categoryLabels[category] || category} occasion.

Style: ${styleDescriptions[style] || style}

CRITICAL RULES:
- Each message MUST be 2 sentences, 30-45 words total — heartfelt but concise, like a real flower card
- Write like a bestselling author, not a greeting card factory
- Use vivid imagery and sensory language
- Make the recipient feel deeply seen and cherished
- Never start with "Dear" or "Wishing" — be creative
- Vary sentence structure across the 3 messages

${style === "funny" ? `FUNNY STYLE EXAMPLES:
"I always say I'm a morning person, but really I'm a 'send me flowers and I'll pretend to be awake' person. Happy birthday to someone who actually deserves to be celebrated."
"Remember when we thought 30 was old? Yeah, me neither. Happy birthday from someone who's definitely not Googling 'is 30 considered middle-aged' right now."
"They say age is just a number. In your case, that number is classified, and honestly, I respect the security clearance. Happy birthday!"` : style === "formal" ? `FORMAL STYLE EXAMPLES:
"On this distinguished occasion, please accept my warmest regards and these flowers as a token of the high esteem in which you are held. Your contributions have been truly remarkable."
"It is with great pleasure that I extend my sincerest wishes on this momentous occasion. May this day mark the beginning of a new chapter filled with prosperity and achievement."` : style === "friendly" ? `FRIENDLY STYLE EXAMPLES:
"Hey! Just wanted you to know that you're one of those rare people who makes everything better just by being there. Hope your day is as awesome as you are!"
"Life's better with good friends, and I hit the jackpot with you. Sending you all the good vibes and a whole lot of love today!"` : `HEARTFELT STYLE EXAMPLES:
"Some people walk into a room and the whole place lights up. You are that person, and today we celebrate every ounce of the magic you bring to this world."
"Life has a way of showing us what matters most, and standing here beside you after all these years, I know — you are the best thing that ever happened to me."`}

Return ONLY a JSON array of exactly 3 strings, no other text. Example format:
["message 1", "message 2", "message 3"]`;

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.9,
          max_tokens: 500,
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error("Groq error:", err);
      return NextResponse.json(
        { error: "Failed to generate messages" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || "";

    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Invalid response format" },
        { status: 500 }
      );
    }

    const messages = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(messages) || messages.length !== 3) {
      return NextResponse.json(
        { error: "Invalid message count" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      messages,
      usage: {
        count: usage.count,
        limit: tenant.plan === "starter" ? STARTER_AI_LIMIT : null,
        plan: tenant.plan,
      },
    });
  } catch (err) {
    console.error("AI generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate messages" },
      { status: 500 }
    );
  }
}
