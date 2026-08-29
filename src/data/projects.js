export const projects = [
  {
    slug: "planora",
    name: "Planora",
    status: "live",
    statusLabel: "Live",
    summary:
      "A free task manager for Android and web with a built-in AI assistant called Nora. Tasks, notes and goals in one place, with no accounts, no ads, and full offline support.",
    spec: ["Under 5 MB", "Works offline", "No account", "Android + Web"],
    tags: ["HTML", "CSS", "JavaScript", "Vercel"],
    links: [
      { kind: "live", href: "https://planora-official.vercel.app" },
      { kind: "source", href: "https://github.com/kkyleee23/Planora-Official" },
    ],
    kind: "web",
    feature: true,
    shots: [
      {
        src: "/img/planora-web.png",
        alt: "Planora running in the browser",
        width: 2430,
        height: 1172,
      },
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
    name: "PrintScreen",
    status: "redeploying",
    statusLabel: "Redeploying",
    summary:
      "Upload a PDF, PPTX, DOCX, XLSX or image and get back a structured reviewer: a summary, key terms, flashcards and a practice quiz. Parsing runs on the server before anything reaches a model.",
    spec: ["5 file types", "Express API", "Groq + Gemini"],
    tags: ["Node.js", "Express", "Groq", "Gemini", "Render"],
    links: [
      { kind: "source", href: "https://github.com/kkyleee23/PrintScreen" },
      { kind: "preview", href: "https://printscreen.onrender.com" },
    ],
    kind: "web",
    shots: [
      {
        src: "/img/printscreen-1.png",
        alt: "PrintScreen turning an uploaded document into a reviewer",
        width: 2390,
        height: 1150,
      },
    ],
    study: {
      problem:
        "Revising meant re-reading slide decks the night before an exam, which is slow and does not tell you what you actually forgot.",
      approach:
        "Extract text per format on the server, then send clean text to a model rather than raw files. PPTX has no parser worth using, so it unzips the archive and reads the slide XML directly.",
      broke:
        "The deployed build asks each visitor for their own API key, which makes it look broken to anyone who opens it cold. Free tier hosting also sleeps, so the first request waits about twenty seconds.",
      next: "Move the key server-side, keep the instance warm, and cap the context so a forty slide deck does not blow the window.",
    },
  },
  {
    slug: "studs",
    name: "Studs",
    status: "building",
    statusLabel: "Building",
    summary:
      "Student and teacher management that runs outside the LMS a school already has. Attendance, activities and scores in one place, without waiting on IT to provision anything.",
    spec: ["8 screens", "Repo-per-entity data layer", "No framework"],
    tags: ["Vite", "JavaScript", "Supabase", "PostgreSQL"],
    links: [{ kind: "source", href: "https://github.com/kkyleee23/Studs" }],
    kind: "none",
    shots: [],
    study: {
      problem:
        "Recording attendance and scores took more clicks than it should, and the school system made simple things slow enough that people kept paper backups.",
      approach:
        "One repository module per entity, so every page talks to a data layer instead of reaching for the database directly. That keeps queries in one place and makes each page short enough to read in a sitting.",
      broke:
        "The first version put Supabase calls inside the pages. Adding a second screen meant copying query logic, and a schema change meant editing five files.",
      next: "Finish the reports view, then move the database to a fresh project with row level security switched on from the start.",
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
    body: "Data model, endpoints, auth and the deployment. You get something your front end can talk to, with the queries in one place rather than scattered through the app.",
    fit: "Best fit if you have a front end and nothing behind it.",
  },
  {
    title: "A capstone that has to ship",
    body: "I have built four of these end to end this year. I can take the half nobody on the team wants, usually the database and the server, and get it running before the defence.",
    fit: "Best fit for a college team on a deadline.",
  },
  {
    title: "An internal tool",
    body: "The small thing a business keeps doing in a spreadsheet. Attendance, records, uploads, a reviewer. Built plain so it stays cheap to host and easy to hand over.",
    fit: "Best fit for a small company with one annoying process.",
  },
];
