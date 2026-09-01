export const projects = [
  {
    slug: "planora",
    name: "Planora",
    status: "live",
    statusLabel: "Live",
    summary:
      "A free task manager for Android and web with a built-in AI assistant called Nora. Tasks, notes and goals in one place. No accounts, no ads, and it works with the network off.",
    spec: ["Under 5 MB", "Works offline", "No account", "Android + Web"],
    tags: ["HTML", "CSS", "JavaScript", "Vercel"],
    links: [
      { kind: "live", href: "https://planora-official.vercel.app" },
      { kind: "source", href: "https://github.com/kkyleee23/Planora-Official" },
    ],
    kind: "web",
    feature: true,
    shots: [
      { src: "/img/planora-1.webp", alt: "Planora landing page", width: 1440, height: 900 },
      { src: "/img/planora-2.webp", alt: "Planora feature overview", width: 1440, height: 900 },
      { src: "/img/planora-3.webp", alt: "Planora app preview", width: 1440, height: 900 },
    ],
    study: {
      problem:
        "I kept losing track of my own work across three different apps, and every planner I tried wanted an account before it would show me a single screen.",
      approach:
        "Local-first storage, so the app opens straight into your board with nothing to sign up for. No build step at all, which keeps the whole thing under 5 MB and means it loads on a bad connection.",
      broke:
        "Nora, the assistant, answers without enough of the board in front of it, so its suggestions are generic. That is a context problem rather than a model problem, and it is what I am rebuilding now.",
      next: "Give Nora the actual task state before it answers, and add a proper sync path for people who do want their board on two devices.",
    },
  },
  {
    slug: "printscreen",
    name: "PrintScr",
    status: "live",
    statusLabel: "Live",
    summary:
      "Upload a PDF, a deck, or a photo of your notes and get back a summary, the key terms, flashcards and a practice quiz, built only from what is in the file. Parsing runs on the server before anything reaches a model.",
    spec: ["5 file types", "Express API", "Server-side keys"],
    tags: ["Node.js", "Express", "Groq", "Gemini", "Vercel"],
    links: [
      { kind: "live", href: "https://printscr.vercel.app" },
      { kind: "source", href: "https://github.com/kkyleee23/PrintScreen" },
    ],
    kind: "web",
    shots: [
      { src: "/img/printscr-1.webp", alt: "PrintScr upload screen", width: 1600, height: 1000 },
      { src: "/img/printscr-2.webp", alt: "A generated study review, with the summary open", width: 1600, height: 1000 },
      { src: "/img/printscr-3.webp", alt: "Flashcards generated from the uploaded file", width: 1600, height: 1000 },
    ],
    study: {
      problem:
        "Revising meant re-reading slide decks the night before an exam, which is slow and does not tell you what you actually forgot.",
      approach:
        "Extract text per format on the server, then send clean text to a model rather than raw files. PPTX has no parser worth using, so it unzips the archive and reads the slide XML directly.",
      broke:
        "The first build asked each visitor for their own API key, which made it look broken cold, and it ran on a free tier that slept between requests.",
      next: "Moved it to Vercel with the keys server-side and a comma-separated Groq key pool that fails over when one is revoked, and tuned the completion budget so a reasoning model finishes the JSON instead of running out of room.",
    },
  },
  {
    slug: "studs",
    name: "Studs",
    status: "live",
    statusLabel: "Live",
    summary:
      "Student and teacher management that runs outside the LMS a school already has. Attendance, activities and scores in one place, without waiting on IT to provision anything.",
    spec: ["8 screens", "Repo-per-entity data layer", "No framework"],
    tags: ["Vite", "JavaScript", "Supabase", "PostgreSQL"],
    links: [
      { kind: "live", href: "https://studs-web.vercel.app" },
      { kind: "source", href: "https://github.com/kkyleee23/Studs" },
    ],
    kind: "web",
    shots: [
      { src: "/img/studs-1.webp", alt: "The Studs teacher dashboard", width: 1600, height: 1000 },
      { src: "/img/studs-2.webp", alt: "A class overview with its grading settings", width: 1600, height: 1000 },
      { src: "/img/studs-3.webp", alt: "The class grade report", width: 1600, height: 1000 },
      { src: "/img/studs-4.webp", alt: "Creating a class", width: 1600, height: 1000 },
    ],
    study: {
      problem:
        "Recording attendance and scores took more clicks than it should, and the school system made simple things slow enough that people kept paper backups.",
      approach:
        "One repository module per entity, so every page talks to a data layer instead of reaching for the database directly. That keeps queries in one place and makes each page short enough to read in a sitting.",
      broke:
        "The first version put Supabase calls inside the pages. Adding a second screen meant copying query logic, and a schema change meant editing five files.",
      next: "Polish the login screen, and finish the reports view now that the data layer and row-level security are locked down.",
    },
  },
];

export const nowCards = [
  {
    title: "Agos",
    badge: "Building",
    status: "building",
    body: "Crowdsourced hazard reporting for the Philippines. Drop a pin, tag it flood, traffic or landslide, add a photo or a note, and everyone else on the map sees it.",
    tags: ["Flutter", "Dart", "Geolocation"],
    foot: "v1.0.1 built, repo not public yet",
  },
  {
    title: "Nora",
    badge: "Fixing",
    status: "building",
    body: "Planora's built-in assistant. Right now it answers without enough of your board in front of it, so I am rebuilding the context it gets before it replies.",
    tags: ["JavaScript", "Prompt design", "LLM"],
    foot: "Part of Planora",
  },
  {
    title: "Learning",
    badge: "Ongoing",
    status: "live",
    body: "Working through certifications worth putting on this page, and finishing senior high before a degree. Past that I learn by building, because a project teaches me more than a course does.",
    tags: ["Certifications", "Grade 12", "Side projects"],
    foot: "Weekday afternoons and Sundays",
  },
];

export const services = [
  {
    title: "An API or a backend",
    body: "The data model, the endpoints, auth, and the deployment. You get something your front end can talk to, with the queries in one place rather than scattered through the app.",
    fit: "Best fit if you have a front end and nothing behind it.",
  },
  {
    title: "A capstone that has to ship",
    body: "I have built four of these end to end this year. I can take the half nobody on the team wants, usually the database and the server, and get it running before the defence.",
    fit: "One capstone at a time, so the slot may be taken. Ask before you plan around it.",
  },
  {
    title: "An internal tool",
    body: "The small thing a business keeps doing in a spreadsheet. Attendance, records, uploads, a reviewer. Built plain so it stays cheap to host and easy to hand over.",
    fit: "Best fit for a small company with one annoying process.",
  },
];

export const terminalShots = [
  {
    src: "/img/cybernant-1.webp",
    alt: "Cybernant running in a terminal, analysing a phone number",
    width: 1280,
    height: 835,
  },
  {
    src: "/img/nightshade-1.webp",
    alt: "Nightshade, the offensive counterpart, showing its engagement menu",
    width: 1280,
    height: 784,
  },
];

export const terminalTools = [
  {
    name: "Cybernant",
    tagline: "Phone number OSINT reconnaissance",
    body: "A command-line tool that takes a phone number and returns carrier, line type, region, timezone, number formats, and approximate registration-area coordinates, plus manual lookup links for Telegram and Truecaller. Runs on Windows and Linux.",
    spec: ["Python 3.10+", "Windows + Linux", "MIT", "Signed licence keys"],
    features: [
      "Validation, parsing and carrier identification",
      "Line type detection for mobile, fixed line and VoIP",
      "E.164, national and international format conversion",
      "Registration-area coordinates with a Maps link",
      "Cryptographically signed licence key system",
    ],
    note: "Built for authorised security testing and education. Using it against someone without consent is illegal, and the disclaimer in the repo says so.",
    cta: "Want it for authorised testing, or interested? Send me a message.",
    status: "building",
    statusLabel: "Not public yet",
  },
  {
    name: "Nightshade",
    tagline: "The offensive counterpart, key-gated",
    body: "A private build for security professionals doing counter-offensive work. Where Cybernant is the defensive, read-only half, Nightshade is the side that acts. Distribution is by key from me, and it is not open source.",
    spec: ["Private", "Key required", "Professional use"],
    features: [],
    note: "Not published, and not handed out on request. Ask directly if your work calls for it.",
    cta: "For professional counter-offensive work. Message me to talk access.",
    status: "building",
    statusLabel: "Private",
  },
];
