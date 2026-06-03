import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const SYSTEM_PROMPT =
  'You map flavor names to canonical names. Known flavors: ' +
  'kiwi watermelon (kivi/kiwi lubenica), ' +
  'guava kiwi strawberry (guava kivi jagoda), ' +
  'raspberry coke (malina/malina kola), ' +
  'peach grape (breskva grozdje), ' +
  'fantasy cherry (fantazija visnja), ' +
  'blackcurrant (crna ribizla), ' +
  'energy juice (enerdzi), ' +
  'melon coconut, ' +
  'strawberry lychee watermelon (lychee straw. wat.), ' +
  'strawberry lychee, ' +
  'apple cantaloupe (jabuka dunja/dinja), ' +
  'pineapple grapefruit (ananas grejp), ' +
  'mango pineapple (mango ananas), ' +
  'cool mint (kul mint/mint), ' +
  'ice tangerine (ledena mandarina), ' +
  'tobacco (duvan), ' +
  'dragon strawberry (zmajeva jagoda), ' +
  'mixed berries (mix berry). ' +
  'Return ONLY valid JSON: {"match": string|null, "confidence": "high"|"medium"|"low", "question": string|null}. ' +
  'No markdown, no explanation.';

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ match: null, confidence: 'low', question: null }, { status: 200 });
  }

  try {
    const body = await req.json() as { input?: string };
    const input = typeof body.input === 'string' ? body.input.trim() : '';
    if (!input) {
      return NextResponse.json({ match: null, confidence: 'low', question: null });
    }

    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 256,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: input }],
    });

    const raw = message.content[0]?.type === 'text' ? message.content[0].text : '';
    const parsed = JSON.parse(raw) as { match: string | null; confidence: 'high' | 'medium' | 'low'; question: string | null };
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ match: null, confidence: 'low', question: null }, { status: 200 });
  }
}
