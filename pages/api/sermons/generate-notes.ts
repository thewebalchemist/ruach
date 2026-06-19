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

  const prompt = `You are a skilled pastoral assistant and content writer for Ruach Tabernacle Church.

**Sermon Information:**
- Title: ${title}
- Preacher: ${preacher}
${scripture ? `- Scripture: ${scripture}` : ''}
${summary ? `- Key Theme: ${summary}` : ''}
${hasTranscript ? `\n**Full Sermon Transcript:**\n--- TRANSCRIPT START ---\n${transcript!.trim().substring(0, 12000)}\n--- TRANSCRIPT END ---\n\nIMPORTANT: Use the transcript above as your PRIMARY source. All points, quotes, and scripture references must come directly from what was preached. Do NOT invent or add content not found in the transcript.` : ''}

**Instructions:**
Create a comprehensive, engaging, and SEO-optimized sermon summary with the following sections:

## Opening Hook
Start with 1-2 compelling sentences that capture the essence of the sermon. Make it engaging and relatable to draw readers in.

## Main Theme
Clearly state the central message or theme of the sermon in one paragraph. Explain why this message is relevant and important for today's believers.

## Key Points
Break down 3-5 main teachings and insights from the sermon as bullet points. Each point should be clear, actionable, and memorable. Include relevant scripture references where applicable.

## Biblical Foundation
Explain the key scripture passages used in the sermon in one paragraph. Provide context and show how they support the main message. Connect Old and New Testament references if applicable.

## Practical Application
Provide 2-3 practical ways believers can apply this teaching in their daily lives. Make it specific and actionable. Address common challenges or questions.

## Powerful Quote
Include the most memorable or impactful statement from the sermon (1-2 sentences). Something that can stand alone and be shared on social media.

## Call to Action
End with an encouraging call to action. Invite readers to reflect, pray, or take specific steps. Create a sense of urgency or importance.

## Discussion Questions
Provide 3-5 thought-provoking questions for small groups or personal reflection. Questions should encourage deeper thinking and application.

**Writing Style Requirements:**
- Write in a warm, pastoral, and accessible tone
- Use clear, concise language that anyone can understand
- Avoid overly theological jargon unless necessary
- Make it engaging and inspiring, not just informative
- Keep paragraphs short (3-5 sentences) for easy reading
- Total length: 500-800 words
- Optimize for SEO by naturally including relevant keywords like: faith, Christian living, Bible study, spiritual growth

**Special Considerations:**
- Write for both new believers and mature Christians
- Be culturally sensitive and inclusive in language
- Maintain biblical accuracy and theological soundness
- Make it shareable — people should want to forward this to friends
- End on a note of hope and encouragement
${hasTranscript ? '- CRITICAL: Stay strictly within the content of the transcript. Do NOT add scriptures, stories, or points not in the transcript.' : ''}

Format the output in clean Markdown with clear section headings. The summary should make someone who missed the sermon feel like they got the core message, while also making them want to watch the full video.`;

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: hasTranscript ? 2500 : 1800,
      temperature: hasTranscript ? 0.25 : 0.5,
      messages: [{ role: 'user', content: prompt }],
    });

    const notes = completion.choices[0]?.message?.content ?? '';

    let description = '';
    if (notes) {
      const descGroq = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 150,
        temperature: 0.3,
        messages: [{
          role: 'user',
          content: `Based on these sermon notes, write a short 2-3 sentence SEO-friendly description for a sermon titled "${title}" by ${preacher} at Ruach Tabernacle Church.${hasTranscript ? ' Ground it in the actual sermon content.' : ''}\n\nNotes:\n${notes.substring(0, 2000)}\n\nReturn ONLY the description. No quotes, no prefix, no "Here is...". Just the 2-3 sentences.`,
        }],
      });
      description = descGroq.choices[0]?.message?.content?.trim() ?? '';
    }

    return res.status(200).json({ notes, description });
  } catch (e: unknown) {
    console.error('[generate-notes]', e);
    return res.status(500).json({ error: 'Failed to generate notes' });
  }
}
