

export const projects = [
  {
    slug: "planora",
    name: "Planora",
    status: "live",
    statusLabel: "Live",
    summary:
      "A free task manager for Android and web with a built-in AI assistant called Nora. Tasks, notes, and goals in one place — no accounts, no ads, works offline.",
    spec: ["Under 5 MB", "Works offline", "No account", "Android + Web"],
    tags: ["HTML", "CSS", "JavaScript", "Vercel"],
    links: [
      { kind: "live", href: "https://planora-official.vercel.app" },
      { kind: "source", href: "https://github.com/kkyleee23/Planora-Official" },
    ],
    kind: "web",
    feature: true,
    shots: [
      { src: "/img/planora-web.png", alt: "Planora running in the browser", width: 2442, height: 1166 },
    ],
  },
  {
    slug: "printscreen",
    name: "PrintScreen",
    status: "redeploying",
    statusLabel: "Redeploying",
    summary:
      "Upload a PDF, PPTX, DOCX, XLSX or image and get back a structured reviewer — a summary, key terms, flashcards and a practice quiz. Parsing runs server-side before anything reaches a model.",
    spec: ["5 file types", "Express API", "Groq + Gemini"],
    tags: ["Node.js", "Express", "Groq", "Gemini", "Render"],
    links: [
      { kind: "source", href: "https://github.com/kkyleee23/PrintScreen" },
      { kind: "preview", href: "https://printscreen.onrender.com" },
    ],
    kind: "web",
    shots: [
      { src: "/img/printscreen-1.png", alt: "PrintScreen turning an uploaded document into a reviewer", width: 2390, height: 1150 },
    ],
  },
  {
    slug: "studs",
    name: "Studs",
    status: "building",
    statusLabel: "Building",
    summary:
      "Student–teacher management that runs outside the LMS your school already has. Teachers get attendance, activities and scores in one place without waiting on IT to provision anything.",
    spec: ["8 screens", "Repo-per-entity data layer", "No framework"],
    tags: ["Vite", "JavaScript", "Supabase", "PostgreSQL"],
    links: [{ kind: "source", href: "https://github.com/kkyleee23/Studs" }],
    kind: "none",
    shots: [],
  },
];


export const nowCards = [
  {
    title: "Agos",
    badge: "Building",
    status: "building",
    body: "Crowdsourced hazard reporting for the Philippines. Drop a pin, tag it flood, traffic or landslide, add a photo or a note, and everyone else on the map sees it.",
    tags: ["Flutter", "Dart", "Geolocation"],
    foot: "v1.0.1 built — repo not public yet",
  },
  {
    title: "Nora",
    badge: "Fixing",
    status: "building",
    body: "Planora's built-in assistant. Right now it answers without enough of your board in front of it, so I'm rebuilding the context it gets before it replies.",
    tags: ["JavaScript", "Prompt design", "LLM"],
    foot: "Part of Planora",
  },
  {
    title: "Learning",
    badge: "Ongoing",
    status: "live",
    body: "Working through certifications worth putting on this page, and finishing senior high before a degree. Past that I learn by building — a project teaches me more than a course does.",
    tags: ["Certifications", "Grade 12", "Side projects"],
    foot: "Weekday afternoons & Sundays",
  },
];
