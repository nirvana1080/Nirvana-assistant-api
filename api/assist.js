import Anthropic from '@anthropic-ai/sdk';

const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const VALID_KEYS = (process.env.CLIENT_API_KEYS || 'demo_key_replace_in_prod').split(',');
const MODEL = 'claude-haiku-4-5-20251001';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const key = req.headers['x-api-key'];
  if (!key || !VALID_KEYS.includes(key)) {
    return res.status(401).json({ error: 'Invalid API key' });
  }

  const { context = {}, language = 'hinglish', businessType = 'local_services' } = req.body;

  const system = `You are Nirvana Assistant, helping users fill forms for a ${businessType} business.
${language === 'hinglish' ? 'Reply in friendly Hinglish (Hindi+English mix), max 2 sentences, 1 emoji.' : 'Reply in English, max 2 sentences, 1 emoji.'}
Be specific, short, and helpful.`;

  const userMsg = [
    `Field: "${context.fieldName || 'unknown'}"`,
    context.event     ? `Event: ${context.event}` : '',
    context.errorText ? `Error: "${context.errorText}"` : '',
    context.timeSpent ? `Stuck for: ${Math.round(context.timeSpent/1000)}s` : '',
    context.userText  ? `User asked: "${context.userText}"` : '',
  ].filter(Boolean).join('\n');

  try {
    const response = await claude.messages.create({
      model: MODEL,
      max_tokens: 150,
      system,
      messages: [{ role: 'user', content: userMsg }],
    });
    res.json({ message: response.content[0]?.text?.trim() || null });
  } catch (err) {
    res.status(502).json({ message: null });
  }
}
