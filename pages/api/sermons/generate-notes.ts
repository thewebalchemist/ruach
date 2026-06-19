import type { NextApiRequest, NextApiResponse } from 'next';
import { Groq } from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { title, preacher, scripture, summary, transcript } = req.body as {
    title: string;
    preacher: string;
    scripture?: string;
    summary?: string;
    transcript?: string;
  };

  if (!title || !preacher) {
    return res.status(400).json({ error: 'title and preacher are required' });
  }
  if (!process.env.GROQ_API_KEY) {
    return res.status(503).json({ error: 'AI service not configured' });
  }

  const hasTranscript = typeof transcript === 'string' && transcript.trim().length > 100;

  const prompt = hasTranscript
    ? `You are a sermon notes assistant for Ruach Tabernacle Church.

Below is the actual transcript from a sermon titled "${title}" by ${preacher}.${scripture ? `\nMain scripture reference: ${scripture}` : ''}

--- TRANSCRIPT START ---
${transcript.trim().substring(0, 8000)}
--- TRANSCRIPT END ---

Based ONLY on what is in this transcript, produce structured sermon notes in Markdown with these exact sections:

## Sermon Outline
List 3–5 main points using only ideas explicitly stated in this sermon. Quote or closely paraphrase the preacher.

## Key Takeaways
5 practical bullet points drawn directly from this message.

## Scripture References
List every Bible verse or passage actually mentioned or quoted in the transcript. Format each as: **Book Chapter:Verse** — brief quote or paraphrase as used in the sermon. Do NOT add any verses not mentioned in the transcript.

## Application Questions
3 reflection or discussion questions based on what THIS sermon specifically teaches.

## Closing Prayer
A 2–3 sentence prayer that reflects the specific themes and scriptures of this sermon.

CRITICAL RULES:
- Do NOT invent points, ideas, or scriptures that are not in the transcript
- Do NOT add generic Christian content — stay 100% within this sermon's content
- If the transcript is incomplete, work with what is there and note it briefly`
    : `You are a sermon notes assistant for Ruach Tabernacle Church.

Generate structured sermon notes in Markdown for:
- **Title**: ${title}
- **Preacher**: ${preacher}
${scripture ? `- **Scripture**: ${scripture}` : ''}
${summary ? `- **Description**: ${summary}` : ''}

## Sermon Outline
3–5 main points relevant to the title and theme.

## Key Takeaways
5 practical bullet points for the congregation.

## Scripture References
The main scripture${scripture ? ` (${scripture})` : ''} plus 2–3 supporting verses that relate to this theme.

## Application Questions
3 reflection questions for personal or group study.

## Closing Prayer
A 2–3 sentence prayer reflecting the sermon theme.

Use concise, faith-based language for a modern church congregation.`;

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: hasTranscript ? 2000 : 1200,
      temperature: hasTranscript ? 0.2 : 0.6,
      messages: [{ role: 'user', content: prompt }],
    });

    const notes = completion.choices[0]?.message?.content ?? '';
    return res.status(200).json({ notes });
  } catch (e: unknown) {
    console.error('[generate-notes]', e);
    return res.status(500).json({ error: 'Failed to generate notes' });
  }
}
