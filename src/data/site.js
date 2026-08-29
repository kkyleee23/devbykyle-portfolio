export const site = {
  name: "Juniz Kyle Sarmiento",
  short: "devByKyle",
  handle: "@kkyleee23",
  role: "Web & Software Developer",
  kicker: "// grade 12 student & developer",
  headline: "I build web and mobile tools for students.",
  lede:
    "The kind that do one thing, load fast, and don't ask you to make an account first. I reach for a framework when a project earns it and keep things plain when it doesn't.",
  location: "Apalit, Pampanga, Philippines",
  timezone: "GMT+8",
  tz: "Asia/Manila",
  school: "Grade 12 · ITMAWD",
  schoolShort: "STI College Malolos",
  availability: "Free weekdays from 2 PM, and all day Sunday",
  email: "junizkylesarmiento@gmail.com",
  github: "https://github.com/kkyleee23",
  githubHandle: "kkyleee23",
  linkedin: "",
  resume: "",
  openToWork: true,
  url: "https://devbykyle.vercel.app",
};

/** Hero: one sentence on where my attention is. */
export const currentFocus = {
  body: "Shipping small tools that solve a real problem for students, then writing down what broke so the next one goes faster.",
  motto: "> learn · build · ship · write it down",
};

/** Hero: rotates. Each is something with a repo behind it. */
export const whatIBuild = [
  { title: "Student Tools", note: "Planora, PrintScreen, Studs" },
  { title: "Mobile Apps", note: "Flutter and Capacitor" },
  { title: "AI-assisted Features", note: "Groq and Gemini pipelines" },
];

export const howIWork = [
  "Plain HTML until a framework earns its place",
  "Ship small, then write down what broke",
  "Offline-first, no account walls",
];

export const quickFacts = [
  { k: "Open to", v: "Internships · Junior roles · Freelance" },
  { k: "Available", v: "Weekdays from 2 PM · All day Sunday" },
  { k: "Work setup", v: "Remote · Hybrid around Pampanga & Metro Manila" },
  { k: "Core focus", v: "Front-end engineering + practical AI" },
  { k: "Interests", v: "Student tools · Offline-first · Civic tech" },
];

export const about = [
  "I came at this backwards. I was building apps and games before I got curious about how websites worked, and then I decided I wanted both instead of picking one. It is why I still reach for plain HTML and JavaScript more often than a framework: I learned to make things run before I learned to make them look right.",
  "Everything on this page solves a problem I had in school. Planora came from losing track of my own tasks. PrintScreen came from re-reading slide decks the night before an exam. Studs came from school software that made simple things slow.",
  "I pick up design from wherever it turns up, mostly screenshots and whatever scrolls past me, and I send small fixes to open-source projects when I notice something broken. Two years of this so far, all self-taught, all outside class hours.",
];

export const timeline = [
  {
    when: "2026 — Now",
    tag: "Building",
    title: "Shipping student tools",
    body: "PrintScreen in March, Studs from April, Planora in May, and Agos now. Four builds in one year, all aimed at the same problem: school software that gets in the way.",
    tags: ["JavaScript", "Supabase", "Flutter", "Groq"],
  },
  {
    when: "2025 — Now",
    tag: "Education",
    title: "STI College Malolos",
    body: "Senior high, ITMAWD strand — Information Technology in Mobile App and Web Development. Grade 12.",
    tags: ["ITMAWD"],
  },
  {
    when: "2024 — 2025",
    tag: "Education",
    title: "AMA Basic Education · ACLC Apalit",
    body: "Junior high, Grade 10. Started teaching myself to build apps and games around here.",
    tags: [],
  },
  {
    when: "2021 — 2024",
    tag: "Education",
    title: "La Verdad Christian School",
    body: "Junior high, Grades 7 to 9.",
    tags: [],
  },
];

/** Seeds the assistant. Everything here is verifiable from the page or the repos. */
export const aiContext = `
Juniz Kyle Sarmiento — Grade 12 senior high student, ITMAWD strand (Information
Technology in Mobile App and Web Development) at STI College Malolos. Lives in
Apalit, Pampanga, Philippines (GMT+8). Self-taught since about 2024.
Email junizkylesarmiento@gmail.com. GitHub github.com/kkyleee23.
Available weekday afternoons from 2 PM and all day Sunday. Open to internships,
junior roles and freelance work, remote or hybrid around Pampanga and Metro Manila.

Projects:
- Planora (live, planora-official.vercel.app): task manager for Android and web
  with a built-in AI assistant called Nora. Tasks, notes and goals. No accounts,
  no ads, works offline, under 5 MB. Vanilla HTML, CSS and JavaScript, no build step.
- PrintScreen (github.com/kkyleee23/PrintScreen): upload a PDF, PPTX, DOCX, XLSX
  or image and get back a summary, key terms, flashcards and a practice quiz.
  Node and Express, groq-sdk and Google Generative AI, pdf-parse, mammoth,
  exceljs, jszip and xml2js for parsing. Currently being redeployed.
- Studs (github.com/kkyleee23/Studs): student-teacher management outside the
  school LMS. Attendance, activities, scores. Vite, vanilla JavaScript and
  Supabase, with a repository-per-entity data layer across 8 pages. In progress.
- Agos: crowdsourced hazard reporting for the Philippines. Drop a pin, tag it
  flood, traffic or landslide, add a photo or note, other users see it. Flutter
  and Dart. Built to v1.0.1, repo not public yet.

Currently fixing Nora, Planora's assistant, by rebuilding the context it receives
before it answers.

Stack he has used in public repos: HTML, CSS, JavaScript, Node.js, Express,
PostgreSQL, Supabase, Vercel, Git, GitHub, Gemini.
Also works with: TypeScript, React, Next.js, Vue, Tailwind, Flutter, Dart,
Capacitor, Android Studio, PHP, Laravel, Python, FastAPI, MySQL, MongoDB,
Firebase, Claude, DeepSeek, Kimi, Grok, Ollama, GitHub Actions, Docker, Postman,
Figma, VS Code, Java, C#, C++.

This site: hand-written HTML and CSS, a small Vite build, no framework.
`.trim();
