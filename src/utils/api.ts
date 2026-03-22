import { incrementUsage } from '../shared/usage';

const API_URL = 'https://sai.sharedllm.com/v1/chat/completions';
const MODEL = 'gpt-oss:120b';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function chatCompletion(messages: ChatMessage[], stream = false): Promise<string> {
  incrementUsage();
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      messages,
      stream,
      temperature: 0.7,
      max_tokens: 2048,
    }),
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  if (stream) {
    return streamResponse(res);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

async function streamResponse(res: Response): Promise<string> {
  const reader = res.body?.getReader();
  if (!reader) throw new Error('No reader available');

  const decoder = new TextDecoder();
  let result = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n').filter(l => l.startsWith('data: '));

    for (const line of lines) {
      const data = line.slice(6).trim();
      if (data === '[DONE]') break;
      try {
        const parsed = JSON.parse(data);
        const content = parsed.choices?.[0]?.delta?.content || '';
        result += content;
      } catch {
        // skip malformed chunks
      }
    }
  }

  return result;
}

export async function scorePost(postText: string): Promise<{
  overall: number;
  dimensions: { hook: number; readability: number; cta: number; emotion: number; formatting: number };
  feedback: string;
}> {
  const prompt = `Analyze this LinkedIn post and score it. Return ONLY valid JSON with no markdown formatting, no code blocks.

Post:
"""
${postText}
"""

Return JSON:
{
  "overall": <0-100>,
  "dimensions": {
    "hook": <0-100>,
    "readability": <0-100>,
    "cta": <0-100>,
    "emotion": <0-100>,
    "formatting": <0-100>
  },
  "feedback": "<2-3 sentences of actionable feedback>"
}`;

  const result = await chatCompletion([
    { role: 'system', content: 'You are a LinkedIn engagement expert. Return only valid JSON, no markdown.' },
    { role: 'user', content: prompt },
  ]);

  return JSON.parse(result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
}

export async function optimizePost(postText: string): Promise<{ optimized: string; changes: string[] }> {
  const prompt = `Optimize this LinkedIn post for maximum engagement. Return ONLY valid JSON with no markdown formatting.

Post:
"""
${postText}
"""

Return JSON:
{
  "optimized": "<the fully optimized post>",
  "changes": ["<change 1>", "<change 2>", "<change 3>"]
}`;

  const result = await chatCompletion([
    { role: 'system', content: 'You are a LinkedIn viral content strategist. Return only valid JSON.' },
    { role: 'user', content: prompt },
  ]);

  return JSON.parse(result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
}

export async function generateVariants(postText: string): Promise<{ variants: { version: string; post: string; angle: string }[] }> {
  const prompt = `Create 3 A/B test variants of this LinkedIn post, each with a different angle. Return ONLY valid JSON.

Post:
"""
${postText}
"""

Return JSON:
{
  "variants": [
    { "version": "A", "post": "<variant text>", "angle": "<what makes this different>" },
    { "version": "B", "post": "<variant text>", "angle": "<what makes this different>" },
    { "version": "C", "post": "<variant text>", "angle": "<what makes this different>" }
  ]
}`;

  const result = await chatCompletion([
    { role: 'system', content: 'You are a LinkedIn A/B testing expert. Return only valid JSON.' },
    { role: 'user', content: prompt },
  ]);

  return JSON.parse(result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
}

export async function rewriteHooks(postText: string): Promise<{ hooks: { hook: string; style: string }[] }> {
  const prompt = `Rewrite the opening hook of this LinkedIn post in 5 different styles. Return ONLY valid JSON.

Post:
"""
${postText}
"""

Return JSON:
{
  "hooks": [
    { "hook": "<hook text>", "style": "<style name, e.g. Question, Bold Claim, Story, Statistic, Contrarian>" },
    { "hook": "<hook text>", "style": "<style name>" },
    { "hook": "<hook text>", "style": "<style name>" },
    { "hook": "<hook text>", "style": "<style name>" },
    { "hook": "<hook text>", "style": "<style name>" }
  ]
}`;

  const result = await chatCompletion([
    { role: 'system', content: 'You are a LinkedIn hook writing expert. Return only valid JSON.' },
    { role: 'user', content: prompt },
  ]);

  return JSON.parse(result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
}

export async function predictViralScore(postText: string): Promise<{
  score: number;
  prediction: string;
  factors: { factor: string; impact: string }[];
}> {
  const prompt = `Predict the viral potential of this LinkedIn post on a scale of 1-10. Return ONLY valid JSON.

Post:
"""
${postText}
"""

Return JSON:
{
  "score": <1-10>,
  "prediction": "<one sentence prediction>",
  "factors": [
    { "factor": "<factor name>", "impact": "positive" | "negative" | "neutral" },
    { "factor": "<factor name>", "impact": "positive" | "negative" | "neutral" },
    { "factor": "<factor name>", "impact": "positive" | "negative" | "neutral" }
  ]
}`;

  const result = await chatCompletion([
    { role: 'system', content: 'You are a LinkedIn viral content analyst. Return only valid JSON.' },
    { role: 'user', content: prompt },
  ]);

  return JSON.parse(result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
}
