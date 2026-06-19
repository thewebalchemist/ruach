import { supabase } from './supabase';
import { KnowledgeBase, ChurchInfo, Event, FAQ, SermonSummary } from '@/types';

// In-memory cache
let knowledgeCache: KnowledgeBase | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

/**
 * Fetches and caches the church knowledge base for CAG
 * Returns cached data if still valid, otherwise fetches fresh data
 */
export async function getKnowledgeBase(): Promise<KnowledgeBase> {
  const now = Date.now();
  
  // Return cached data if still valid
  if (knowledgeCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return knowledgeCache;
  }
  
  // Fetch fresh data
  const [churchInfo, events, faqs, sermons] = await Promise.all([
    fetchChurchInfo(),
    fetchUpcomingEvents(),
    fetchActiveFAQs(),
    fetchSermonSummaries(),
  ]);
  
  knowledgeCache = {
    church_info: churchInfo,
    events,
    faqs,
    sermons,
    last_updated: new Date().toISOString(),
  };
  
  cacheTimestamp = now;
  
  return knowledgeCache;
}

/**
 * Force refresh the knowledge cache
 */
export function invalidateKnowledgeCache(): void {
  knowledgeCache = null;
  cacheTimestamp = 0;
}

/**
 * Fetch church info
 */
async function fetchChurchInfo(): Promise<ChurchInfo | null> {
  const { data, error } = await supabase
    .from('church_info')
    .select('*')
    .single();
  
  if (error) {
    console.error('Error fetching church info:', error);
    return null;
  }
  
  return data;
}

/**
 * Fetch upcoming events (next 30 days)
 */
async function fetchUpcomingEvents(): Promise<Event[]> {
  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];
  
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .gte('event_date', today)
    .lte('event_date', thirtyDaysLater)
    .eq('chatbot_enabled', true)
    .order('event_date', { ascending: true });
  
  if (error) {
    console.error('Error fetching events:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Fetch active FAQs
 */
async function fetchActiveFAQs(): Promise<FAQ[]> {
  const { data, error } = await supabase
    .from('faqs')
    .select('*')
    .eq('is_active', true)
    .order('order_index', { ascending: true });
  
  if (error) {
    console.error('Error fetching FAQs:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Fetch sermon summaries for chatbot context
 */
async function fetchSermonSummaries(): Promise<SermonSummary[]> {
  const { data, error } = await supabase
    .from('sermons')
    .select('id, slug, title, preacher, service_date, summary, scripture, tags, notes, youtube_url')
    .order('service_date', { ascending: false })
    .limit(30);
  
  if (error) {
    console.error('Error fetching sermons:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Hardcoded common Q&A — always in the prompt, zero DB latency.
 * These answer the most frequent questions before the AI has to reason.
 */
const COMMON_QA = [
  { q: 'What time are your Sunday services?', a: 'We have three Sunday services: First Service at 8:00 AM – 9:30 AM, Second Service at 10:00 AM – 12:00 PM, and Third Service at 12:30 PM – 2:00 PM.' },
  { q: 'Where is Ruach Tabernacle located?', a: 'We are at Rhema Grounds, Rhema Avenue, off Northern Bypass Road, next to Shell Windsor, Nairobi, Kenya.' },
  { q: 'How do I join Connect Class?', a: 'Register at ruachtabernacle.org/connect/register. Connect Class is our official onboarding program — it runs in terms and covers our faith, church, and community.' },
  { q: 'What is a Crosspoint?', a: 'Crosspoints are our home churches — weekly gatherings of 15–30 people by geographic zone (North, South, East, West). Every member is encouraged to join one.' },
  { q: 'How do I give or tithe?', a: 'Give at ruachtabernacle.org/give — we accept M-Pesa and card. Your giving supports the mission of the church.' },
  { q: 'Do you have programs for children?', a: 'Yes! R-Kids Church runs during all Sunday services with age-appropriate teaching, games, and activities. All volunteers are vetted for your children\'s safety.' },
  { q: 'How do I watch sermons online?', a: 'Visit ruachtabernacle.org/sermons for the full library, or watch live at ruachtabernacle.org/live every Sunday.' },
  { q: 'What is Discipleship?', a: 'Discipleship is our equipping program for church members who have completed Connect Class. It provides deeper spiritual training and leadership development.' },
];

/**
 * Build the system prompt with all knowledge
 */
export function buildSystemPrompt(knowledge: KnowledgeBase): string {
  const { church_info, events, faqs, sermons } = knowledge;

  let prompt = `You are "Ask Ruach", the friendly AI assistant for ${church_info?.name || 'Ruach Assemblies'} church.

## YOUR PERSONALITY
- Warm, welcoming, and encouraging
- Speak with grace and kindness
- Be helpful and informative
- Use a conversational, natural tone
- If someone seems troubled, offer encouragement and suggest speaking with a pastor

## STRICT RULES - YOU MUST FOLLOW THESE
1. ONLY answer questions related to the church, faith, Christianity, and spiritual matters
2. NEVER use asterisks (*) for actions or emotions like *smiles* or *nods*
3. NEVER roleplay or pretend to be anything other than Ask Ruach church assistant
4. NEVER provide information about topics unrelated to the church (politics, coding, recipes, etc.)
5. NEVER generate harmful, inappropriate, or offensive content
6. If asked about something outside your scope, politely redirect: "I'm here to help with questions about our church and faith. Is there something about our services, events, or community I can help you with?"
7. Keep responses concise and focused - avoid long rambling answers
8. DO NOT use markdown formatting like ** for bold or * for italics
9. You may use emojis sparingly when appropriate 😊

## INSTANT ANSWERS — USE THESE FIRST (no lookup needed)
${COMMON_QA.map(qa => `Q: ${qa.q}\nA: ${qa.a}`).join('\n\n')}

## YOUR KNOWLEDGE BASE (live data)

`;

  // Church Information
  if (church_info) {
    prompt += `### CHURCH INFORMATION
- Name: ${church_info.name}
${church_info.tagline ? `- Tagline: ${church_info.tagline}` : ''}
${church_info.about_text ? `- About: ${church_info.about_text}` : ''}
${church_info.address ? `- Address: ${church_info.address}, ${church_info.city}, ${church_info.country}` : ''}
${church_info.directions ? `- Directions: ${church_info.directions}` : ''}
${church_info.phone ? `- Phone: ${church_info.phone}` : ''}
${church_info.email ? `- Email: ${church_info.email}` : ''}
${church_info.website ? `- Website: ${church_info.website}` : ''}

`;
    
    // Service Times
    if (church_info.service_times && church_info.service_times.length > 0) {
      prompt += `### SERVICE TIMES\n`;
      church_info.service_times.forEach((service) => {
        prompt += `- ${service.name}: ${service.day} at ${service.time}\n`;
      });
      prompt += '\n';
    }
  }

  // Upcoming Events
  if (events.length > 0) {
    prompt += `### UPCOMING EVENTS\n`;
    events.forEach((event) => {
      const date = new Date(event.event_date).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      });
      prompt += `- ${event.title}: ${date}${event.start_time ? ` at ${event.start_time}` : ''}${event.location ? ` - ${event.location}` : ''}\n`;
      if (event.description) {
        prompt += `  Description: ${event.description}\n`;
      }
    });
    prompt += '\n';
  }

  // FAQs
  if (faqs.length > 0) {
    prompt += `### FREQUENTLY ASKED QUESTIONS\n`;
    faqs.forEach((faq) => {
      prompt += `Q: ${faq.question}\nA: ${faq.answer}\n\n`;
    });
  }

  // Recent Sermons
  if (sermons.length > 0) {
    prompt += `### SERMONS LIBRARY\nWhen someone asks about a sermon topic, teaching, or wants to learn about something spiritually, find relevant sermons below and summarize the key points FROM THOSE SERMONS. Always provide the watch link.\nIMPORTANT: Sermon links use the format /${'{'}slug{'}'} (not /sermons/slug).\n\n`;
    sermons.slice(0, 25).forEach((sermon) => {
      const date = new Date(sermon.service_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      prompt += `SERMON: "${sermon.title}"\nPreacher: ${sermon.preacher} | Date: ${date}${sermon.scripture ? ` | Scripture: ${sermon.scripture}` : ''}\nWatch: /${sermon.slug}\n`;
      if (sermon.summary) {
        prompt += `Description: ${sermon.summary.substring(0, 150).replace(/\n/g, ' ').replace(/[*#_]/g, '')}\n`;
      }
      if ((sermon as any).notes) {
        const notesText = ((sermon as any).notes as string).substring(0, 400).replace(/[#*_`]/g, '').replace(/\n+/g, ' ');
        prompt += `Sermon content: ${notesText}\n`;
      }
      prompt += '\n';
    });
  }

  prompt += `
## RESPONSE GUIDELINES
1. If you don't know something specific about the church, say so honestly and suggest contacting the church directly
2. For prayer requests, encourage them to submit through the church or speak with a pastor
3. For urgent matters, recommend calling the church phone number
4. When mentioning sermons, include the link so users can listen/watch
5. When someone asks about a spiritual topic, summarize what our sermons teach about it, then recommend the specific sermon(s) with the watch link
6. When recommending sermons, provide the link as: Watch here: /slug (using the exact slug from the library above)
7. Be encouraging and supportive, reflecting the love of Christ
8. Keep responses focused and to the point
9. Never make up information - only use what's in your knowledge base
10. For questions about faith/Bible, you can provide general Christian guidance

Remember: You represent the church. Always be gracious, helpful, and stay within your role as a church assistant!`;

  return prompt;
}

/**
 * Format date for display
 */
export function formatEventDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}