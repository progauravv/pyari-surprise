# Craft a Surprise — Personalized Surprise Link Generator

## 1. Concept
A web app where **Person A** creates a personalized surprise page for **Person B** and shares it as a single link. Person B opens the link on any device and experiences an animated "reveal" tailored to the occasion and mood Person A picked.

**Flow:** Pick occasion → Pick mood/style → Enter recipient details → Get a shareable link → Recipient opens link → Sees animated build-up → Final reveal message.

## 2. User Flow (sender side)
1. **Step 1 — Occasion:** Birthday (MVP). Grid of occasion cards; more (Anniversary, Congrats, Apology, Get Well) added later without touching core logic.
2. **Step 2 — Style/Mood:**
   - 😈 **Prank** — fake system error / countdown before reveal
   - 🥹 **Emotional** — slow heartfelt build-up
   - 😡 **Angry (joke)** — fake rant that flips into affection
   - 🤯 **Confusing** — scrambled/riddle text that resolves into clarity
3. **Step 3 — Details:** recipient name (required), age (optional), sender name (required), custom personal message (optional).
4. **Step 4 — Generate:** save entry to database, return a unique link `card.html?id=<uuid>`, show copy button + preview link.

## 3. Recommended Tech Stack
No backend server required — keeps hosting free and simple:
- **Frontend:** plain HTML/CSS/JavaScript (no build step needed; can upgrade to React later if desired)
- **Database:** Supabase (free tier Postgres, accessed directly from the browser via `@supabase/supabase-js`)
- **Hosting:** GitHub Pages (static hosting, free); can move to Vercel/Netlify/own domain later without code changes
- **Fonts/Icons:** Google Fonts (self-host or CDN), emoji instead of icon libraries to avoid dependencies

## 4. Architecture
```
[Browser: index.html/app.js] --insert row--> [Supabase Postgres: cards table]
                                                        |
[Browser: card.html?id=xyz] --select row by id-------->/
```
No custom backend server. All logic runs client-side. Supabase's Row Level Security (RLS) controls what the public/anonymous key is allowed to do.

## 5. Database Schema (Supabase SQL)
```sql
create extension if not exists "pgcrypto";

create table cards (
  id uuid primary key default gen_random_uuid(),
  occasion text not null,
  style text not null,
  ceremony text not null default 'gift_box',
  soundtrack text not null default 'birthday_funny',
  photo_url text,
  recipient_name text not null,
  recipient_age int,
  sender_name text not null,
  custom_message text,
  created_at timestamptz default now()
);

alter table cards enable row level security;

-- Allow the browser app to create valid cards without allowing arbitrary rows.
create policy "Anyone can insert a valid card"
  on cards for insert
  to anon
  with check (
    occasion in ('birthday', 'anniversary', 'friendship', 'congrats', 'apology', 'just_because')
    and style in ('prank', 'romantic', 'celebration', 'confusing')
    and ceremony in ('gift_box', 'wax_seal', 'scratch_card', 'balloons_pop')
    and soundtrack in (
      'birthday_funny', 'birthday_clown', 'sad_trombone',
      'celebration_fanfare', 'romantic_strings', 'retro_arcade'
    )
    and char_length(recipient_name) between 1 and 100
    and char_length(sender_name) between 1 and 100
    and (custom_message is null or char_length(custom_message) <= 2000)
  );

-- Allow anyone to read a card by id (needed so the recipient's link works without login)
create policy "Anyone can view a card"
  on cards for select
  to anon
  using (true);
```
> Cards are public-by-link (unguessable UUID), not private accounts — that's intentional for a shareable-link product. If abuse becomes a concern later, add rate limiting via a Supabase Edge Function.

If the `cards` table already exists, add the newer fields with:
```sql
alter table cards add column if not exists ceremony text not null default 'gift_box';
alter table cards add column if not exists soundtrack text not null default 'birthday_funny';
alter table cards add column if not exists photo_url text;
```

## 6. File/Folder Structure
```
/
├── index.html          # Sender-facing wizard (occasion → style → details → link)
├── style.css           # Wizard styling
├── app.js              # Wizard logic + Supabase insert
├── card.html           # Recipient-facing reveal page
├── card.css            # All 4 style animations + shared final celebration screen
├── card.js             # Fetches card by id, plays the right animation sequence
├── occasions.js         # Data file: occasion + style definitions (edit to extend)
├── config.js            # Supabase URL + anon public key
└── README.md
```
Adding a new occasion or style later = editing `occasions.js` + adding its copy/animation branch — no restructuring.

## 7. Feature Spec — Per Screen
**Wizard (index.html):**
- 4-step progress indicator (Occasion → Style → Details → Link)
- Occasion/style choices rendered from a data object, not hardcoded HTML, so new ones can be added in one place
- Disabled/"coming soon" state for occasions not yet built
- Form validation: recipient name + sender name required; age optional numeric; message optional, reasonable character limit (~300 chars)
- On submit: insert into Supabase, disable button + show loading state, handle errors gracefully (e.g., network failure, Supabase misconfigured)
- Result screen: full link in a read-only input with one-tap Copy button, plus a "preview it yourself" link

**Reveal page (card.html):**
- Reads `id` from the URL query string
- Fetches the row from Supabase; shows a friendly "link not found" state if missing
- Plays the animation sequence matching the saved `style`
- Ends on a shared final celebration screen with occasion title, recipient name/age, custom message, and sender name

## 8. Style Engine — Animation Specs
Each style is a **build-up phase** (5–12 seconds) followed by the **same final celebration screen** (confetti + balloons + message card), so the codebase only needs one "big finish" component.

- **Prank:** terminal-style typing log (green monospace on black), fake "critical error" warning, countdown from 5 with screen-shake/glitch effect, then transition.
- **Emotional:** soft radial-gradient background, italic serif lines fading in one at a time, slow pacing, no jarring motion.
- **Angry (joke):** red background, bold shaking text escalating in mock anger ("I CANNOT BELIEVE YOU..."), then a hard cut/flip revealing it was about how much they're loved.
- **Confusing:** scrambled/jumbled words that visually "unscramble" into a coherent riddle, then resolve into clarity right before the reveal.
- **Shared finale:** confetti (canvas or capped DOM particles, ~80–100 pieces), floating balloons, big title with recipient name + age, personal message, sender's name, and a "more confetti" replay button.
- Include a small, delayed "skip" control on longer builds (accessibility + impatient friends).

## 9. Cross-Device / Cross-OS Requirements
This must work identically well on **desktop, tablet, and mobile**, across **Chrome, Safari, Firefox, Edge**, iOS and Android:
- Use relative units (`vw`, `vh`, `clamp()`) for type and spacing instead of fixed pixels
- Use `100dvh` (dynamic viewport height) instead of `100vh` alone to avoid the iOS Safari address-bar jump bug
- All tap targets ≥ 44×44px; no hover-only interactions (buttons must work on tap, not just `:hover`)
- Test both portrait and landscape on mobile
- `<meta name="viewport" content="width=device-width, initial-scale=1.0">` on every page
- Respect `prefers-reduced-motion` — provide a reduced/no-animation fallback that still shows the message clearly
- Keep total page weight light (no heavy animation libraries required — CSS keyframes + small JS handle everything here) so it loads fast on slower mobile connections
- Graceful fallback UI if Supabase fails to load or the card ID is invalid/expired

## 10. Animation Quality Bar
- Orchestrate **one strong "wow" moment** per style rather than scattering lots of small effects
- Prefer CSS transitions/keyframes over heavy JS animation libraries — they're smoother on low-end phones and don't need extra dependencies
- Cap particle counts (confetti/balloons) so it doesn't lag on older phones — aim for smooth 60fps, test on a mid-range Android if possible
- Keep each build-up phase under ~12 seconds total so the recipient doesn't lose interest before the reveal
- Add subtle micro-interactions (button hover/tap feedback, smooth step transitions) — polish is in the details, not just the big finish

## 11. Setup & Deployment Steps
1. Create a free project at supabase.com
2. Run the SQL from Section 5 in the Supabase SQL editor
3. Copy your **Project URL** and **anon public API key** (Project Settings → API) into `config.js`
4. Push the project folder to a GitHub repo
5. In the repo: Settings → Pages → deploy from the `main` branch root
6. Visit the published GitHub Pages URL, test the full flow: create a card → open the generated link on a different device (e.g., your phone) → confirm it renders and animates correctly

## 12. Roadmap
- **Phase 0 — Setup:** repo, Supabase project, GitHub Pages pipeline
- **Phase 1 — MVP:** Birthday occasion, all 4 styles, full wizard, shareable link, responsive on all devices — this is the version to ship first
- **Phase 2 — Polish:** refine each animation, add optional background sound toggle, add a simple view counter, add WhatsApp/Instagram share buttons
- **Phase 3 — Expand occasions:** Anniversary, Congratulations, Apology, Get Well — each reuses the same 4 style engines with occasion-specific copy
- **Phase 4 — Accounts (optional):** sender login, dashboard of previously created cards
- **Phase 5 — Own domain, PWA install support, premium/extra styles**

## 13. Future Extensibility Notes
- All occasion/style copy and behavior branches off a single data object (`occasions.js`) — never hardcode a new occasion directly into the wizard markup
- Keep the "build-up phase" and "final celebration" components decoupled so new styles only need to plug into the existing finale
- If spam/abuse becomes an issue, add a Supabase Edge Function with rate limiting before allowing inserts, instead of exposing table inserts directly