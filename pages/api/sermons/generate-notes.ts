import type { NextApiRequest, NextApiResponse } from 'next';
import { Groq } from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { title, preacher, scripture, summary } = req.body as {
    title:     string;
    preacher:  string;
    scripture?: string;
    summary?:  string;
  };

  if (!title || !preacher) {
    return res.status(400).json({ error: 'title and preacher are required' });
  }

  if (!process.env.GROQ_API_KEY) {
    return res.status(503).json({ error: 'AI service not configured' });
  }

  const prompt = `You are a sermon notes assistant for Ruach Tabernacle Church.

Generate structured sermon notes in Markdown for the following:
- **Title**: ${title}
- **Preacher**: ${preacher}
${scripture ? `- **Scripture**: ${scripture}` : ''}
${summary ? `- **Description**: ${summary}` : ''}

Produce notes with these sections:
1. **Sermon Outline** — 3–5 main points from the title/theme
2. **Key Takeaways** — 5 bullet points of practical insights
3. **Scripture References** — relevant verses (include the main scripture and 2–3 supporting)
4. **Application Questions** — 3 reflection questions for personal or group study
5. **Closing Prayer** — a short relevant prayer (2–3 sentences)

Use concise, faith-based language appropriate for a modern church congregation. Format in clean Markdown.`;

  try {
    const completion = await groq.chat.completions.create({
      model:      'llama-3.3-70b-versatile',
      max_tokens: 1200,
      messages:   [{ role: 'user', content: prompt }],
    });

    const notes = completion.choices[0]?.message?.content ?? '';
    return res.status(200).json({ notes });
  } catch (e: unknown) {
    console.error('[generate-notes]', e);
    return res.status(500).json({ error: 'Failed to generate notes' });
  }
}
