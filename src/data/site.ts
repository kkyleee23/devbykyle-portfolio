export const site = {
  name: "Juniz Kyle Sarmiento",
  short: "devByKyle",
  role: "Web & software developer",
  headline: "I build web and mobile tools for students.",
  lede:
    "The kind that do one thing, load fast, and don't ask you to make an account first. I reach for a framework when a project earns it and keep things plain when it doesn't.",
  location: "Apalit, Pampanga",
  timezone: "GMT+8",
  school: "Grade 12 · ITMAWD strand · STI College Malolos",
  availability: "Free weekdays from 2 PM, and all day Sunday",
  email: "junizkylesarmiento@gmail.com",
  github: "https://github.com/kkyleee23",
  githubHandle: "kkyleee23",
  linkedin: "",
  resume: "",
  openToWork: true,
  url: "https://devbykyle.vercel.app",
} as const;

export const about = [
  "I came at this backwards. I was building apps and games before I got curious about how websites worked, and then I decided I wanted both instead of picking one. It is why I still reach for plain HTML and JavaScript more often than a framework: I learned to make things run before I learned to make them look right.",
  "Everything on this page solves a problem I had in school. Planora came from losing track of my own tasks. PrintScreen came from re-reading slide decks the night before an exam. Studs came from school software that made simple things slow.",
  "I pick up design from wherever it turns up, mostly screenshots and whatever scrolls past me, and I send small fixes to open-source projects when I notice something broken. Two years of this so far, all self-taught, all outside class hours.",
];

export type TimelineEntry = { when: string; title: string; body: string };

export const timeline: TimelineEntry[] = [
  {
    when: "2026 — Now",
    title: "Shipping student tools",
    body: "PrintScreen in March, Studs from April, Planora in May, and Agos now. Four builds in one year, all aimed at the same problem: school software that gets in the way.",
  },
  {
    when: "2025 — Now",
    title: "STI College Malolos",
    body: "Senior high, ITMAWD strand — Information Technology in Mobile App and Web Development. Grade 12.",
  },
  {
    when: "2024 — 2025",
    title: "AMA Basic Education · ACLC Apalit",
    body: "Junior high, Grade 10. Started teaching myself to build apps and games around here.",
  },
  {
    when: "2021 — 2024",
    title: "La Verdad Christian School",
    body: "Junior high, Grades 7 to 9.",
  },
];
