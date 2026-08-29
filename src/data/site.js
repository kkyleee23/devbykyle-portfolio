export const site = {
  name: "Juniz Kyle Sarmiento",
  short: "devByKyle",
  handle: "@kkyleee23",
  role: "Backend-focused Full-Stack Developer",
  kicker: "Grade 12 student, and a developer since 2024",
  headline: "I build the parts that keep an app running.",
  lede:
    "Backend is where I am strongest. Data models, APIs, and the part nobody sees. I learned the front end so I could ship a whole thing myself instead of handing half of it off.",
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

export const currentFocus = {
  body: "Shipping small tools that solve a real problem, then writing down what broke so the next one goes faster. It started with tools for students. Now it is for anyone who needs one.",
  motto: "Learn it, build it, ship it, then write down what broke.",
};

export const whatIBuild = [
  { title: "Backends & APIs", note: "Express · Supabase · PostgreSQL" },
  { title: "LLM Integration", note: "Groq · Gemini · OpenAI · Claude · Ollama" },
  { title: "Web & Mobile Apps", note: "Vanilla JS · Flutter · Capacitor" },
];

export const howIWork = [
  "Plain HTML until a framework earns its place",
  "Ship small, then write down what broke",
  "Offline-first, no account walls",
];

export const quickFacts = [
  { k: "Open to", v: "Internships · Junior roles · Freelance" },
  { k: "Build for", v: "Individuals · Capstone teams · Small companies" },
  { k: "Available", v: "Weekdays from 2 PM · All day Sunday" },
  { k: "Work setup", v: "Remote · Hybrid around Pampanga & Metro Manila" },
  { k: "Core focus", v: "Backend & data, full-stack when a project needs one person" },
  { k: "Interests", v: "APIs · LLM integration · Offline-first · Civic tech" },
];

export const about = [
  "I came at this backwards. I was building apps and games before I got curious about how websites worked, and then I decided I wanted both instead of picking one. I still reach for plain HTML and JavaScript more often than a framework, because I learned to make things run before I learned to make them look right.",
  "Backend is the half I care about most. The data model, the API, and the pipeline that turns an upload into something a person can use. I learned the front end because a tool nobody can open is not finished, and because on a small project there is usually only one person to build both.",
  "The first things I made were for school, since that was the problem in front of me. The work is not limited to that. A capstone team that needs a backend, a small company that needs an internal tool, or one person who needs something that does a single job properly. Those are all the same problem shaped differently.",
  "I pick up design from wherever it turns up, and I send small fixes to open-source projects when I notice something broken. Two years of this so far, all self-taught, all outside class hours.",
];

export const timeline = [
  {
    when: "2026 — Now",
    tag: "Building",
    title: "Shipping tools end to end",
    body: "PrintScreen in March, Studs from April, Planora in May, and Agos now. Four builds in one year. Each one took a problem from the data model through to something you can open.",
    tags: ["JavaScript", "Supabase", "Flutter", "Groq"],
  },
  {
    when: "2025 — Now",
    tag: "Education",
    title: "STI College Malolos",
    body: "Senior high, ITMAWD strand. Information Technology in Mobile App and Web Development, Grade 12.",
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

export const colophon = [
  { k: "Built with", v: "Hand-written HTML & CSS, a small Vite build" },
  { k: "Framework", v: "None. It has not earned a place here yet" },
  { k: "Type", v: "Bricolage Grotesque · Instrument Sans · DM Mono, self-hosted" },
  { k: "Data", v: "Repositories pulled live from the GitHub API" },
];

export const aiContext = `
Juniz Kyle Sarmiento — Grade 12 senior high student, ITMAWD strand (Information
Technology in Mobile App and Web Development) at STI College Malolos. Lives in
Apalit, Pampanga, Philippines (GMT+8). Self-taught since about 2024.
Email junizkylesarmiento@gmail.com. GitHub github.com/kkyleee23.
Available weekday afternoons from 2 PM and all day Sunday. Open to internships,
junior roles and freelance work, remote or hybrid around Pampanga and Metro Manila.

Positioning: he is BACKEND-FOCUSED and full-stack by choice. Backend is his
stronger and preferred half — data models, APIs, and the pipeline behind the
interface. He learned front-end so he could ship a whole product alone rather
than hand half of it off. Do not describe him as primarily a front-end or UI
developer.

Who he builds for: anyone who needs a tool. Individuals, college capstone teams,
small companies, and students. His first projects happened to be for students
because that was the problem in front of him at the time — it is not a limit on
the work he takes.

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

Stack used in public repos: HTML, CSS, JavaScript, Node.js, Express, PostgreSQL,
Supabase, Vercel, Git, GitHub, Gemini.
LLM integration. He wires existing models into products through their APIs. He
does not train or build models. Providers he has used or works with: Groq,
Gemini, OpenAI, Claude, DeepSeek, Kimi, Grok, Ollama. Shipped examples are the
Groq and Gemini pipeline in PrintScreen and the Nora assistant inside Planora.
Also works with: TypeScript, React, Next.js, Vue, Tailwind, Flutter, Dart,
Capacitor, Android Studio, PHP, Laravel, Python, FastAPI, MySQL, MongoDB,
Firebase, GitHub Actions, Docker, Postman, Figma, VS Code, Java, C#, C++.

This site: hand-written HTML and CSS, a small Vite build, no framework.
`.trim();
