import { Groq } from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const WRITER_MODEL = 'llama-3.3-70b-versatile';

interface ArticleInput {
  title: string;
  preacher?: string;
  scripture?: string;
  summary?: string;
  transcript?: string;
  /** existing article/notes, used as the source when there's no transcript */
  notes?: string;
}

/**
 * Turn a sermon transcript (or existing notes) into a natural, editorial
 * article — NOT a fixed template. This is the RT version of the JK article
 * writer, and it's the primary human-readable text plus a RAG source.
 */
export async function generateSermonArticle(
  input: ArticleInput,
): Promise<{ article: string; description: string }> {
  const { title, preacher = 'the preacher', scripture, summary } = input;
  const source = (input.transcript && input.transcript.trim().length > 200)
    ? input.transcript
    : (input.notes || '');
  const fromTranscript = !!(input.transcript && input.transcript.trim().length > 200);

  const prompt = `Write an article capturing the sermon "${title}" preached by ${preacher} at Ruach Tabernacle.${scripture ? ` Anchor scripture: ${scripture}.` : ''}${summary ? ` Core idea: ${summary}.` : ''}

Source (${fromTranscript ? 'full transcript' : 'existing notes'} — everything you write must come from it; do not invent points, quotes, or scriptures):
--- SOURCE START ---
${source.trim().slice(0, 14000)}
--- SOURCE END ---

Write it the way a sharp church editor would write up a message they were genuinely moved by — not a summary template. Someone who missed the service should finish this feeling they caught the heart of it, and want to watch the full thing.

How to write it:
- Open with a real hook from the message itself — a line, a tension, an image. Never "In this powerful sermon, ${preacher}…".
- Let it flow as prose. Use a few natural subheadings (##) drawn from THIS sermon's actual movement — never a fixed checklist of "Key Points / Application / Reflection". Every article should be shaped differently.
- Pull one line worth quoting into a blockquote (>), in the preacher's own words.
- Where scripture is opened, name it and show what it means here.
- Land it somewhere that sits with the reader — a challenge, a question, an invitation. Don't label it "Call to Action".
- Warm, plain, faith-filled, courageous. Short paragraphs. Around 500–750 words.
- No emojis. No corporate filler. No "In conclusion".

Output clean Markdown — the body only (the page already shows the title), starting with the opening line.`;

  const completion = await groq.chat.completions.create({
    model: WRITER_MODEL,
    max_tokens: 2600,
    temperature: fromTranscript ? 0.3 : 0.5,
    messages: [{ role: 'user', content: prompt }],
  });
  const article = completion.choices[0]?.message?.content?.trim() ?? '';

  let description = '';
  if (article) {
    const d = await groq.chat.completions.create({
      model: WRITER_MODEL,
      max_tokens: 140,
      temperature: 0.3,
      messages: [{
        role: 'user',
        content: `In one or two natural sentences, describe what this sermon is about — the way you'd tell a friend why to watch it. No clichés ("powerful", "dive into"), no title-dropping.\n\nSermon: "${title}"\n${article.slice(0, 2000)}\n\nReturn only the sentences.`,
      }],
    });
    description = d.choices[0]?.message?.content?.trim() ?? '';
  }

  return { article, description };
}
