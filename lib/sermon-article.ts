import { Groq } from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const WRITER_MODEL = 'llama-3.3-70b-versatile';

// Ruach preaches Scripture into everyday life — faith, family, work, purpose,
// community ("God · Work · Community"). The writer voice is that of the pastor
// teaching directly, not a reporter describing them.
const PREACHER_VOICE =
  'a Spirit-filled pastor who grounds every point in Scripture and spiritual formation, then connects it to everyday life — faith, family, work, purpose and community';

interface ArticleInput {
  title: string;
  preacher?: string;
  keywords?: string[];
  scripture?: string;
  summary?: string;
  transcript?: string;
  /** existing article/notes, used as the source when there's no transcript */
  notes?: string;
}

/**
 * Turn a sermon transcript (or existing notes) into a natural, first-person
 * article in the preacher's own voice — the way a reader who missed the service
 * would still fully understand the message. Ported from the Julian Kyula site's
 * generateArticle (lib/ai.ts), retuned for Ruach's multiple preachers. This is
 * the primary human-readable text on the sermon page and the RAG source.
 */
export async function generateSermonArticle(
  input: ArticleInput,
): Promise<{ article: string; description: string }> {
  const { title, preacher = 'the preacher', keywords = [], scripture, summary } = input;
  const speaker = preacher || 'the preacher';
  const hasTranscript = typeof input.transcript === 'string' && input.transcript.trim().length > 100;
  const hasNotes = typeof input.notes === 'string' && input.notes.trim().length > 100;
  const topics = keywords.filter(Boolean).join(', ');

  let sourceBlock: string;
  if (hasTranscript) {
    sourceBlock = `Below is the transcript of what ${speaker} said. Use it for the ACTUAL TEACHING — his points, scriptures, stories and meaning. But this is NOT a transcription; do not copy it line by line.
--- TRANSCRIPT START ---
${input.transcript!.trim().slice(0, 14000)}
--- TRANSCRIPT END ---`;
  } else if (hasNotes) {
    sourceBlock = `There is no transcript, only these existing notes/summary. Expand them faithfully into the full teaching below — do not invent specific quotes, stories, or statistics beyond what they imply.
--- NOTES START ---
${input.notes!.trim().slice(0, 14000)}
--- NOTES END ---`;
  } else {
    sourceBlock = `There is no transcript, so write faithfully from the title, themes and scripture above. Do not invent specific quotes, stories, or statistics.`;
  }

  const prompt = `Write a written article that explains the message "${title}"${topics ? ` (themes: ${topics})` : ''}${scripture ? `, anchored in ${scripture}` : ''}, in the FIRST PERSON as ${speaker} himself (${PREACHER_VOICE}). Use "I", "we", and "you".${summary ? ` The core idea he wants remembered: ${summary}.` : ''}

PURPOSE: This is for someone who will NOT watch the video. By the end of the article they should fully UNDERSTAND the message — the point, the scriptures, and what to do about it — as if they had heard it themselves. Understanding is the whole goal.

${sourceBlock}

TURN THE SPOKEN MESSAGE INTO CLEAN WRITING:
- Rewrite what he said into clear written prose. Never quote the transcript word-for-word.
- Cut everything that only works live: telling the audience to "find/tell your neighbour", "say amen", "give God a hand", song or worship cues, announcements, side-comments, and phrases he repeats over and over for effect. A reader must never hit a line like "I need you to find a neighbour and tell them…".
- Keep only the teaching. If a spoken sentence is half-finished or rambling, state its point in one clean sentence.

LANGUAGE:
- Easy, everyday English — short sentences, common words, the plain way he talks. Explain any church or theological word in simple terms.
- Warm, pastoral, honest, and courageous. Keep his tone and any strong picture he used, but written cleanly.

COVER THE WHOLE MESSAGE so the reader truly gets it:
- Open with a real hook drawn from the message itself. Never "In this powerful message…".
- Say the main point plainly, and why it matters for us now.
- Walk through the main things he taught (a short bulleted list is fine here), naming the scriptures he opened and what they mean.
- Show how those scriptures hold the message together — connect Old and New Testament if he did.
- Give 2–3 concrete, doable ways to live this out this week.
- Pull one real teaching line into a blockquote (>), in his own words — a full, meaningful sentence, never a crowd-instruction line.
- End with a warm, direct charge — something to do, pray, or decide.
- Close with a few honest questions to sit with, alone or in a small group.

HEADINGS: use natural "##" headings that come from THIS message's own ideas. Do NOT use label headings like "Opening Hook", "Main Theme", "Key Points", "Biblical Foundation", "Practical Application", or "Call to Action". A simple "## Questions to sit with" for the closing questions is fine.

LENGTH: long enough to genuinely cover everything above — usually 800 to 1200 words. Don't pad, and don't cut it short.
No emojis. No corporate filler. No "In conclusion". Output clean Markdown with NO title (the page already shows it). Start straight with the opening line.`;

  const completion = await groq.chat.completions.create({
    model: WRITER_MODEL,
    max_tokens: hasTranscript ? 3600 : 2600,
    temperature: hasTranscript ? 0.45 : 0.55,
    messages: [{ role: 'user', content: prompt }],
  });
  const article = completion.choices[0]?.message?.content?.trim() ?? '';

  let description = '';
  if (article) {
    const d = await groq.chat.completions.create({
      model: WRITER_MODEL,
      max_tokens: 150,
      temperature: 0.3,
      messages: [{
        role: 'user',
        content: `Write a short SEO meta description for this message — one or two plain sentences, about 20–30 words. Summarise what it is about in the THIRD PERSON, in a neutral, factual tone, the way a video library or blog lists a description. Rules:\n- No second-person ("you", "we"), no telling the reader to watch or "check it out".\n- No openers like "In this message", "This teaching", "${speaker} explains", "It's basically".\n- No clichés ("powerful", "transformative", "dive into", "reminder that").\n- Just state the subject and what it covers, so it reads well in a search result.\n\nGood shape: "A teaching on <topic>, exploring <the main ideas>."\n\nMessage: "${title}" by ${speaker}\nArticle:\n${article.slice(0, 2000)}\n\nReturn only the description, nothing else.`,
      }],
    });
    description = d.choices[0]?.message?.content?.trim() ?? '';
  }

  return { article, description };
}
