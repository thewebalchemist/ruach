# RUACH WEBSITE — Design Refinement Tasks
## Instructions for Claude Code
### Read everything before starting. Work through each section in order. Do not skip items.

---

## CONSTANTS (use these everywhere)

```
MAPS_LINK = "https://www.google.com/maps/dir//Ruach+Tabernacle+Assembly+(A+Ministry+of+Ruach+Assemblies)+Rhema+Grounds,+Rhema+Avenue,+Off+Northern+Bypass+Rd+Nairobi+Kenya/@-1.2147391,36.8476721,16z/data=!4m8!4m7!1m0!1m5!1m1!1s0x182f3df45daed397:0xf4b86ad49e78ca05!2m2!1d36.8476721!2d-1.2147391?entry=ttu&g_ep=EgoyMDI1MTAyOC4wIKXMDSoASAFQAw%3D%3D"

BRAND_RED = "#BF0A30"
HERO_IMG  = "/images/church-photos/IMG_1716.jpg"
```

---

## TASK 1 — SHARED NAVBAR (`components/shared/Navbar.tsx`)

### 1A. Transparent-to-glass behavior

The navbar must behave differently depending on scroll position:

**When NOT scrolling (top of page):**
- Background: fully transparent (`background: transparent`)
- All nav link text: white
- Logo: white version (add `filter: brightness(0) invert(1)` to the logo img)
- "Watch Online" button: white border, white text, transparent fill
- Do NOT show any shadow or blur

**When scrolling (scrolled > 10px):**
- Background: `rgba(255, 255, 255, 0.92)` with `backdrop-filter: blur(20px)`
- All nav link text: `#374151` (dark), active = `#BF0A30`
- Logo: normal (remove white filter)
- "Watch Online" button: solid red `#BF0A30` fill, white text
- Add subtle shadow: `0 1px 12px rgba(0,0,0,0.08)`

Use a `useEffect` + `useState(false)` listening to `window.scrollY > 10` to toggle a `scrolled` boolean that switches between the two states.

### 1B. Position fix

The navbar must be `fixed` (not `sticky`) so the hero image renders behind it and fills to the very top of the viewport. Change from `sticky top-0` to `fixed top-0 left-0 right-0`. Add a `z-index: 50`.

**Important:** Because the navbar is now `fixed`, remove the `<div className="h-[60px]" />` spacer that was compensating for sticky positioning. The hero section itself should start at `top: 0` and use `padding-top` on its content to push text below the navbar height.

---

## TASK 2 — ANNOUNCEMENT BAR (`components/shared/AnnouncementBar.tsx`)

Replace the current "Get Directions →" button AND remove any "Attend Live" button.

The only CTA button in the bar should be:

```tsx
<a
  href={MAPS_LINK}
  target="_blank"
  rel="noopener noreferrer"
  className="flex-shrink-0 bg-white text-[#BF0A30] font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full hover:bg-red-50 transition-colors"
>
  See Directions →
</a>
```

---

## TASK 3 — HOMEPAGE (`pages/index_full.tsx`)

### 3A. Hero section

- The hero `<section>` must be `min-h-screen` (not `min-h-[85vh]`) so the image fills edge-to-edge including behind the fixed navbar
- Do NOT add a top spacer — the hero content div should use `pt-28` or `pt-32` to push headline text below the navbar
- The background image must use `object-cover` filling the full section

### 3B. Info cards — color fix

Find the four info cards (Service Times, Location, Watch Sermons, Kids). Change ALL four to pure black:

```
background: #000000
border: 1px solid rgba(255, 255, 255, 0.08)
```

Previously some were `#111827`. Change every instance to `#000000`.

### 3C. Location card — See Directions button

Replace the current "See Directions →" Link with:

```tsx
<a
  href="https://www.google.com/maps/dir//Ruach+Tabernacle+Assembly+(A+Ministry+of+Ruach+Assemblies)+Rhema+Grounds,+Rhema+Avenue,+Off+Northern+Bypass+Rd+Nairobi+Kenya/@-1.2147391,36.8476721,16z/data=!4m8!4m7!1m0!1m5!1m1!1s0x182f3df45daed397:0xf4b86ad49e78ca05!2m2!1d36.8476721!2d-1.2147391?entry=ttu&g_ep=EgoyMDI1MTAyOC4wIKXMDSoASAFQAw%3D%3D"
  target="_blank"
  rel="noopener noreferrer"
  className="mt-4 flex items-center justify-center gap-1.5 border border-[#BF0A30] text-[#BF0A30] hover:bg-[#BF0A30] hover:text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg transition-all"
>
  See Directions →
</a>
```

Also improve the Location card readability: increase the description text to `text-sm` and add the full address:
```
Rhema Grounds, Rhema Avenue
Off Northern Bypass Rd, Nairobi
Next to Shell Windsor
```

### 3D. Two CTA cards ("We're People Just Like You" + "Connect to Your Life's Purpose")

The `<section>` wrapping these two cards must have a dark background image, not solid black.

Replace:
```tsx
<section className="bg-[#111827] py-16">
```

With:
```tsx
<section className="relative py-16 overflow-hidden">
  {/* Background image, fixed, dark overlay */}
  <div className="absolute inset-0">
    <img
      src="/images/church-photos/RHEMA-FEAST-91-scaled.jpg"
      alt=""
      className="w-full h-full object-cover"
      style={{ filter: 'brightness(0.25)' }}
    />
    <div className="absolute inset-0 bg-[#0A0C10]/70" />
  </div>
  <div className="relative max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-6">
    {/* cards here */}
  </div>
</section>
```

The two cards themselves stay the same design, but the "We're People Just Like You" card background changes to `rgba(0,0,0,0.6)` with `backdrop-filter: blur(12px)` and `border: 1px solid rgba(255,255,255,0.1)` to feel glassy against the image.

### 3E. Communities section — glassmorphic text labels

On each community card, the text overlay at the bottom (name + sub-label) must have a glassmorphic background behind it instead of a plain gradient:

```tsx
<div className="absolute bottom-0 left-0 right-0 p-4">
  <div
    className="rounded-xl p-3"
    style={{
      background: 'rgba(0, 0, 0, 0.55)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.1)',
    }}
  >
    <p className="text-white font-black text-sm">{c.name}</p>
    <p className="text-white/70 text-[10px] uppercase tracking-wider mt-0.5">{c.sub}</p>
    <span className="mt-2 inline-flex items-center gap-1 text-white/90 text-[10px] font-bold">
      Learn More →
    </span>
  </div>
</div>
```

Remove the old `gradient-to-t from-black/80` overlay from these cards — the glassmorphic label replaces it. Keep a subtle `from-black/30` just so the top of the card stays readable.

### 3F. Impact section — add below communities

Insert a new section BETWEEN the communities grid and the Events section:

```tsx
{/* IMPACT */}
<section className="bg-[#0A0C10] py-16">
  <div className="max-w-7xl mx-auto px-6">
    <p className="text-[#BF0A30] text-xs font-bold uppercase tracking-widest mb-3 text-center">
      Our Impact
    </p>
    <h2 className="text-3xl md:text-4xl font-black text-white text-center mb-12">
      God Is Moving at Ruach
    </h2>

    {/* Stats */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
      {[
        { number: '10,000+', label: 'At Rhema Feast 2025' },
        { number: '3,000+',  label: 'Weekly Congregation' },
        { number: '5',       label: 'Nairobi Assemblies' },
        { number: '18+',     label: 'Years of Ministry' },
      ].map((s) => (
        <div key={s.label} className="text-center p-6 rounded-2xl border border-white/6 bg-[#12151C]">
          <p className="text-4xl font-black text-[#BF0A30] mb-1">{s.number}</p>
          <p className="text-[#8B95A8] text-sm">{s.label}</p>
        </div>
      ))}
    </div>

    {/* Rhema Feast image */}
    <div className="relative rounded-3xl overflow-hidden aspect-[21/9]">
      <img
        src="/images/church-photos/RHEMA-FEAST-91-scaled.jpg"
        alt="Rhema Feast 2025 — Uhuru Park"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0A0C10] via-transparent to-transparent" />
      <div className="absolute bottom-6 left-8">
        <p className="text-white font-black text-2xl">Rhema Feast 2025</p>
        <p className="text-[#8B95A8] text-sm mt-1">10th Edition · Uhuru Park, Nairobi</p>
      </div>
    </div>
  </div>
</section>
```

### 3G. Events section — fix event card image

The event card currently has a hardcoded date block. Make the card look clean:

- Replace the corrupt or empty image area with the `crossover.jpeg` image as a proper rounded thumbnail:
```tsx
<div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
  <img src="/images/church-photos/crossover.jpeg" alt="Event" className="w-full h-full object-cover"
    onError={(e) => {
      const t = e.target as HTMLImageElement;
      t.parentElement!.innerHTML = `<div class="w-full h-full bg-[#BF0A30] flex flex-col items-center justify-center text-white"><span class="text-xs font-bold">JAN</span><span class="text-2xl font-black">5</span></div>`;
    }}
  />
</div>
```

### 3H. "Here's What to Expect" gallery

This gallery section is a shared component. Extract it from the homepage into its own file:

**Create `components/shared/ExpectGallery.tsx`:**

```tsx
const GALLERY = [
  '/images/church-photos/RHEMA-FEAST-91-scaled.jpg',
  '/images/church-photos/june-2025.jpg',
  '/images/church-photos/aug-2025-a.jpg',
  '/images/church-photos/aug-2025-b.jpg',
  '/images/church-photos/advancing-kingdom.jpg',
  '/images/church-photos/dec-2024.jpg',
  '/images/church-photos/IMG_2277.jpeg',
  '/images/church-photos/IMG_2279.jpeg',
  '/images/church-photos/IMG_7023.jpg',
  '/images/church-photos/crossover.jpeg',
  '/images/church-photos/IMG_1716.jpg',
  '/images/church-photos/about-carousel.avif',
];

export default function ExpectGallery() {
  return (
    <section className="bg-white py-16 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-black text-[#111827] mb-8">Here&apos;s What to Expect</h2>
        <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
          {GALLERY.map((src, i) => (
            <div key={i} className="break-inside-avoid rounded-xl overflow-hidden">
              <img
                src={src}
                alt={`Ruach ${i + 1}`}
                className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500"
                loading="lazy"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

Then in the homepage, replace the inline gallery section with `<ExpectGallery />`.

### 3I. All content sections — enforce max-width container

Every `<section>` inner div must use `max-w-7xl mx-auto px-6`. Go through the homepage and verify every section has this. Nothing should touch the screen edges on desktop.

---

## TASK 4 — SHARED MARQUEE COMPONENT

The animated "You're Family" marquee is now a shared component used on ALL pages.

**Create `components/shared/Marquee.tsx`:**

```tsx
interface MarqueeProps {
  text?: string;
  speed?: number;
  reverse?: boolean;
  className?: string;
}

export default function Marquee({
  text = "You're Family.",
  speed = 25,
  reverse = false,
  className = '',
}: MarqueeProps) {
  return (
    <section className={`bg-[#F5F0E8] py-4 overflow-hidden border-y border-[#E8E0D0] ${className}`}>
      <div className="flex whitespace-nowrap">
        <div
          className="flex items-center gap-12 whitespace-nowrap"
          style={{
            animation: `marquee ${speed}s linear infinite ${reverse ? 'reverse' : ''}`,
          }}
        >
          {Array.from({ length: 10 }).map((_, i) => (
            <span
              key={i}
              className="text-4xl md:text-5xl font-black text-[#BF0A30]/15 tracking-tight flex-shrink-0"
            >
              {text}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
```

Import and use `<Marquee />` on: homepage, new-here, who-we-are, r-communities, r-connect, our-team pages. Each page can pass a different `text` prop:
- homepage: `"You're Family."`
- new-here: `"Welcome Home."`
- who-we-are: `"Who We Are."`
- r-communities: `"Join Community."`
- r-connect: `"Connect."`
- our-team: `"Meet the Team."`

---

## TASK 5 — NEW HERE PAGE (`pages/new-here.tsx`)

### 5A. Hero — single image, lighter

Remove all multi-image logic. Single full-height hero image using `IMG_1716.jpg`. Reduce the dark overlay so the image is more visible:

```tsx
<div className="absolute inset-0 bg-gradient-to-t from-[#0A0C10] via-[#0A0C10]/40 to-[#0A0C10]/5" />
```

Previously it was `via-[#0A0C10]/50` — lighten it so the congregation photo shows through properly.

### 5B. After hero — insert `<Marquee text="Welcome Home." />`

### 5C. Info cards — replicate homepage card style

The "You're So Loved" section's three cards must match the homepage info card style exactly:
- Pure black background (`#000000`)
- White text for titles, `text-[#D1D5DB]` for descriptions
- Red icon top-left
- Red-bordered CTA button at bottom of each card
- Same padding, same border radius (`rounded-2xl`)
- Same hover: `hover:border-[rgba(191,10,48,0.3)]` subtle border glow

### 5D. Leadership messages — boxed and sized correctly

The section with Rev. Julian and Pst. Zino welcome messages:
- Wrap in `max-w-5xl mx-auto` (narrower than full width)
- Increase quote text to `text-base` or `text-lg` (it was `text-sm` — too small)
- Pastor images must be portrait aspect ratio: `aspect-[3/4]` not `aspect-[4/3]`
- Images should be properly contained with `object-cover object-top` (faces at top)
- No stretching to screen edges — must feel boxed and editorial

### 5E. Replace "Here's What to Expect" with `<ExpectGallery />`

Remove the inline gallery and import the shared component.

### 5F. Remove any duplicate FAQ accordion

The New Here page should NOT have its own FAQ section — it links to `/all-about-ruach` for that.

---

## TASK 6 — WHO WE ARE PAGE (`pages/who-we-are.tsx`)

### 6A. Hero image visibility

The hero image is being hidden behind the navbar because of the overlay. Since the navbar is now fixed and transparent, the image IS visible — but ensure:
- Hero section is `min-h-[70vh]` minimum
- Overlay lightened: `from-[#0A0C10] via-[#0A0C10]/50 to-[#0A0C10]/10`
- Hero content: headline `text-5xl md:text-6xl font-black text-white`, subtext `text-[#D1D5DB]`

### 6B. After hero — insert `<Marquee text="Who We Are." />`

### 6C. Global design consistency

Apply the same card + section design patterns from the homepage:
- Three Pursuits cards → pure black (`#000000`) background, match homepage info card style
- Vision/Mission/Values → boxed section, `max-w-5xl mx-auto`, larger text
- Our Story timeline → keep the numbered steps but ensure it's properly boxed
- Essential Beliefs accordion → matches the FAQ style from homepage (white cards, red chevron)

### 6D. Section content padding

Every section on this page: inner div must use `max-w-7xl mx-auto px-6` — content must not touch screen edges.

---

## TASK 7 — R-COMMUNITIES PAGE (`pages/r-communities.tsx`)

### 7A. After hero — insert `<Marquee text="Join Community." />`

### 7B. Community cards — glassmorphic labels (same as Task 3E)

Apply the same glassmorphic text label treatment described in Task 3E to all 14 community cards.

### 7C. Boxed content

All inner divs: `max-w-7xl mx-auto px-6`.

### 7D. Replace gallery with `<ExpectGallery />`

---

## TASK 8 — R-CONNECT PAGE (`pages/r-connect.tsx`)

### 8A. After hero — insert `<Marquee text="Connect." />`

### 8B. Design consistency with homepage

Three-step cards: use pure black (`#000000`) background to match the homepage card aesthetic.

### 8C. Boxed content

---

## TASK 9 — OUR TEAM PAGE (`pages/our-team.tsx`)

### 9A. Boxed, not edge-to-edge

All sections: `max-w-7xl mx-auto px-6`. Nothing touches screen edges.

### 9B. After hero — insert `<Marquee text="Meet the Team." />`

### 9C. Senior pastor layout — portrait images, right-side float

For Rev. Julian Kyula and Pst. Zino — redesign the layout:

```tsx
<div className="grid md:grid-cols-5 gap-10 items-start">
  {/* Text — takes 3 columns */}
  <div className="md:col-span-3">
    <p className="text-[#BF0A30] text-xs font-bold uppercase tracking-widest mb-2">{p.title}</p>
    <h3 className="text-3xl font-black text-[#111827] mb-5">{p.name}</h3>
    <p className="text-[#6B7280] leading-relaxed text-base mb-5">{p.bio}</p>
    {/* links */}
  </div>
  {/* Portrait image — takes 2 columns, floats right */}
  <div className="md:col-span-2">
    <div className="relative rounded-3xl overflow-hidden aspect-[3/4] shadow-xl shadow-black/10">
      <img src={p.photo} alt={p.name} className="w-full h-full object-cover object-top" />
    </div>
  </div>
</div>
```

### 9D. Individual pastor pages — create them properly

Each associate pastor card currently has a "Read More" button. This must link to individual pages. Create these 7 pages:

`pages/pastors/[slug].tsx` — a single dynamic page that renders any pastor.

Create `data/pastors.ts` with an array of pastor objects containing: `slug`, `name`, `title`, `photo`, `bio` (full bio text), `departments` (array of dept names they oversee), `links`.

The individual pastor page layout:
- Hero section: pastor name + title on LEFT, their portrait photo floating on RIGHT (within a `rounded-3xl` frame, `aspect-[3/4]`, `object-top`)
- Everything on a clean white background for this page
- Full bio below the hero
- "Departments Overseen" pills
- Back to Our Team link

### 9E. All pastor card "Read More" buttons

Update all 7 associate pastor cards to link to `/pastors/[slug]`:
- Emmanuel Mule → `/pastors/emmanuel-mule`
- David Kimani → `/pastors/david-kimani`
- Beverly Mwangombe → `/pastors/beverly-mwangombe`
- Elizabeth Akinyi → `/pastors/elizabeth-akinyi`
- Maureen Wanjiku → `/pastors/maureen-wanjiku`
- Kevin Owino → `/pastors/kevin-owino`
- Ivlyn Mutua → `/pastors/ivlyn-mutua`

---

## TASK 10 — SERMONS PAGE (`pages/sermons/index.tsx`)

### 10A. Netflix-style layout

The page must have a large featured sermon banner at the top, then sermon rows below — like Netflix.

**Structure:**

```
┌──────────────────────────────────────────────────────┐
│  FEATURED SERMON — full-width, large, cinematic      │
│  Thumbnail fills width, title overlay at bottom      │
│  Play button centered                                │
└──────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────┐
│  Latest Sermons                        [See All →]   │
│  [card] [card] [card] [card] [card]  ← horizontal scroll │
└──────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────┐
│  By Series                             [See All →]   │
│  [card] [card] [card] [card]                         │
└──────────────────────────────────────────────────────┘
```

Page background: `#0A0C10` (dark, like Netflix).

Featured sermon:
```tsx
<section className="relative w-full aspect-[21/9] md:aspect-[16/7] overflow-hidden">
  {/* Use YouTube thumbnail or R2 thumbnail */}
  <img src={featuredSermon.thumbnail_url || '/images/church-photos/IMG_1716.jpg'} 
    className="w-full h-full object-cover" />
  <div className="absolute inset-0 bg-gradient-to-r from-[#0A0C10] via-[#0A0C10]/60 to-transparent" />
  <div className="absolute bottom-8 left-8 max-w-xl">
    <span className="badge badge-primary mb-3">Latest Sermon</span>
    <h1 className="text-3xl md:text-4xl font-black text-white mb-2">{featured.title}</h1>
    <p className="text-[#8B95A8] mb-4">{featured.preacher} · {formatted date}</p>
    <div className="flex gap-3">
      <Link href={`/sermons/${featured.slug}`} className="btn btn-primary">
        <Play className="w-4 h-4" /> Play
      </Link>
      <button className="btn btn-secondary">+ Watchlist</button>
    </div>
  </div>
</section>
```

Sermon cards in horizontal scroll rows — use `overflow-x-auto scrollbar-hide` on a flex container.

### 10B. Ask Ruach floating button — desktop

Add a fixed Ask Ruach button at bottom-right of the sermons page (and all streaming pages):

```tsx
{/* Ask Ruach floating button — desktop only */}
<div className="hidden md:block fixed bottom-6 right-6 z-50">
  <button
    onClick={() => setAskOpen(true)}
    className="flex items-center gap-2 bg-[#BF0A30] hover:bg-[#9A0826] text-white font-bold text-sm px-5 py-3 rounded-full shadow-xl shadow-[rgba(191,10,48,0.4)] transition-all hover:-translate-y-1"
  >
    <MessageCircle className="w-5 h-5" />
    Ask Ruach
  </button>
</div>

{/* Ask Ruach popup modal */}
{askOpen && (
  <div className="fixed inset-0 z-50 flex items-end md:items-end md:justify-end p-4 md:p-6">
    <div className="w-full md:w-96 h-[520px] glass-primary flex flex-col rounded-3xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#BF0A30] flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-bold">Ask Ruach</span>
        </div>
        <button onClick={() => setAskOpen(false)} className="text-[#8B95A8] hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>
      {/* Chat area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* messages */}
      </div>
      {/* Input */}
      <div className="p-4 border-t border-white/10">
        <input className="input w-full text-sm" placeholder="Ask anything about Ruach..." />
      </div>
    </div>
  </div>
)}
```

### 10C. Ask Ruach — mobile

On mobile, add an "Ask Ruach" icon button to the mobile bottom navigation bar (if one exists) or place it as a floating button at bottom-center (so it doesn't overlap the content).

### 10D. Fix `/live` page error

The `/live` page is currently throwing an error. 

Check `pages/live.tsx` for:
1. Any missing imports — fix them
2. Any component being imported that doesn't exist in `components/streaming/` — either remove the import or create a stub
3. Make sure `getServerSideProps` handles Supabase returning null gracefully (use `?? null` and `?? false`)
4. Minimum working version of the live page if all else fails:

```tsx
export default function LivePage({ isLive, streamUrl }) {
  return (
    <Layout title="Watch Live" noFooter>
      <div className="min-h-screen bg-[#0A0C10] flex flex-col items-center justify-center p-6">
        <div className="live-badge mb-6">
          <span className="live-dot" /> {isLive ? 'Live Now' : 'Next Service Sunday'}
        </div>
        <h1 className="text-4xl font-black text-white mb-4 text-center">Ruach Tabernacle Live</h1>
        <p className="text-[#8B95A8] text-center max-w-md mb-8">
          {isLive ? 'Service is live right now. Join us!' : 'Join us every Sunday at 8:00AM, 10:00AM, and 12:30PM.'}
        </p>
        {isLive && streamUrl && (
          <div className="w-full max-w-4xl aspect-video rounded-2xl overflow-hidden bg-black">
            <iframe src={streamUrl} className="w-full h-full" allowFullScreen />
          </div>
        )}
        {!isLive && (
          <div className="grid grid-cols-3 gap-4 text-center">
            {[{ t: 'First', time: '8:00 AM' }, { t: 'Second', time: '10:00 AM' }, { t: 'Third', time: '12:30 PM' }].map(s => (
              <div key={s.t} className="glass-card p-4">
                <p className="text-[#8B95A8] text-xs mb-1">{s.t} Service</p>
                <p className="text-white font-black">{s.time}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
```

---

## TASK 11 — GLOBAL RULES (apply to ALL pages)

### 11A. Content must be boxed — never edge-to-edge

On EVERY page, every section's content wrapper must be:
```tsx
<div className="max-w-7xl mx-auto px-6">
```

Search for any `w-full` divs inside sections that don't have this wrapper — add it.

### 11B. Consistent headline sizing

Across all pages, section headings should follow this pattern:
- **H1 (page title):** `text-5xl md:text-6xl font-black tracking-tight`
- **H2 (section title):** `text-3xl md:text-4xl font-black`
- **H3 (card title):** `text-xl md:text-2xl font-black`
- **Section label (small uppercase above H2):** `text-xs font-bold uppercase tracking-widest text-[#BF0A30]`

### 11C. `ExpectGallery` on all public pages

Import and place `<ExpectGallery />` near the bottom of every public page, before the FAQ section (if it has one) and before the footer. Pages that should have it: homepage (already there), new-here, who-we-are, r-communities, r-connect, our-team, new-here.

### 11D. Verify all pages use `components/shared/Layout`

Run a search:
```bash
grep -rL "from '@/components/shared/Layout'" pages/*.tsx pages/**/*.tsx
```
Any page not importing from the shared Layout must be fixed.

---

## VERIFICATION CHECKLIST

After all tasks are complete, test each of these:

- [ ] Homepage hero image fills to very top of viewport (behind transparent navbar)
- [ ] Navbar is transparent when at top, glassmorphic when scrolling on ALL pages
- [ ] "See Directions" opens Google Maps in new tab on announcement bar
- [ ] "See Directions" on location card opens Google Maps in new tab
- [ ] All four info cards are pure black `#000000`
- [ ] Two CTA cards have church photo background behind them
- [ ] Community cards have glassmorphic text labels (not just a dark gradient)
- [ ] Impact section with stats and Rhema Feast image appears between communities and events
- [ ] `<ExpectGallery />` appears on all public pages
- [ ] `<Marquee />` appears on all public pages with page-specific text
- [ ] All content sections are boxed (max-w-7xl, not touching edges)
- [ ] `/live` page loads without errors
- [ ] Ask Ruach button floats at bottom-right on sermon/streaming pages (desktop)
- [ ] All 7 pastor "Read More" buttons link to `/pastors/[slug]`
- [ ] `/pastors/emmanuel-mule` (and all others) renders correctly
- [ ] `npm run build` completes with zero errors


Here are the sermon links:

https://youtu.be/MxfidoCebZc?si=PK_pyBGWcqbBEbR0
https://youtu.be/yO_7r2U_hN8?si=V7SprP1tBv35xzc8
https://youtu.be/Vks1fMXKMfg?si=p8RfW09aYSl4DLkA
https://youtu.be/BRMy37ZHzX0?si=AX-8d1syL9fo6LkA
https://youtu.be/aa3HrKJLf9o?si=CScQ0Ydg3DCds2Kq
https://youtu.be/g780BzATRpc?si=tx3hiz1w0msVh_ob
https://youtu.be/-h0OTNmAjZI?si=uXjhO5ZO8GUE6ixd
https://youtu.be/j02RsIkJj9s?si=iJ3Yp61CUBjU76mq
https://youtu.be/nznXwkJlJ44?si=IqDstqprQQC24KPO