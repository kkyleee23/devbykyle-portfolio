import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { site, currentFocus, quickFacts, howIWork } from "../src/data/site.js";
import { projects, nowCards, services } from "../src/data/projects.js";
import { stack } from "../src/data/stack.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const SLUG = {
  HTML5: "html5", CSS: "css", JavaScript: "javascript", TypeScript: "typescript",
  React: "react", "Next.js": "nextdotjs", "Vue.js": "vuedotjs", "Tailwind CSS": "tailwindcss",
  Flutter: "flutter", Dart: "dart", Capacitor: "capacitor", "Android Studio": "androidstudio",
  "Node.js": "nodedotjs", Express: "express", PHP: "php", Laravel: "laravel",
  Python: "python", FastAPI: "fastapi", PostgreSQL: "postgresql", MySQL: "mysql",
  MongoDB: "mongodb", Supabase: "supabase", Firebase: "firebase", Vercel: "vercel",
  Claude: "claude", Gemini: "googlegemini", DeepSeek: "deepseek", Kimi: "kimi",
  Grok: "x", Ollama: "ollama", Git: "git", GitHub: "github",
  "GitHub Actions": "githubactions", Docker: "docker", Postman: "postman",
  Figma: "figma", "C++": "cplusplus", Java: "openjdk", "C#": "dotnet",
};

const enc = (s) =>
  encodeURIComponent(s.replace(/-/g, "--").replace(/_/g, "__").replace(/ /g, "_"));

const badge = (name) => {
  const slug = SLUG[name];
  const base = `https://img.shields.io/badge/${enc(name)}-0d1117?style=flat-square`;
  return `![${name}](${base}${slug ? `&logo=${slug}&logoColor=58a6ff` : ""})`;
};

const shipped = stack
  .flatMap((g) => g.tools)
  .filter((t) => t.shipped)
  .map((t) => t.name);

const groups = stack
  .map(
    (g) =>
      `**${g.label}**\n\n${g.tools.map((t) => badge(t.name)).join("\n")}\n`,
  )
  .join("\n");

const status = { live: "Live", building: "Building", redeploying: "Redeploying" };

const projectRows = projects
  .map((p) => {
    const live = p.links.find((l) => l.kind === "live" || l.kind === "preview");
    const src = p.links.find((l) => l.kind === "source");
    const name = src ? `**[${p.name}](${src.href})**` : `**${p.name}**`;
    const link = live ? `[${live.href.replace(/^https?:\/\//, "")}](${live.href})` : "—";
    return `| ${name} | ${p.summary} | ${status[p.status] ?? ""} | ${link} |`;
  })
  .join("\n");

const md = `<div align="center">
<br/>

## ${site.name}

**${site.role}**

${site.lede}

<br/>

[![Portfolio](https://img.shields.io/badge/Portfolio-0d1117?style=flat-square&logo=vercel&logoColor=58a6ff)](${site.url})
[![Email](https://img.shields.io/badge/Email-0d1117?style=flat-square&logo=gmail&logoColor=58a6ff)](mailto:${site.email})

</div>

<br/>

### Right now

${currentFocus.body}

${nowCards.map((c) => `- **${c.title}** — ${c.body.split(". ")[0]}.`).join("\n")}

<br/>

### Projects

| | What it does | Status | Live |
|---|---|---|---|
${projectRows}

<br/>

### What I can build

${services.map((s) => `- **${s.title}.** ${s.fit.replace(/^Best fit /, "")}`).join("\n")}

<br/>

### Tech

<div align="center">

${groups}
</div>

<sub>Used in public, readable code: ${shipped.join(" · ")}. The rest I am still building fluency in.</sub>

<br/>

### How I work

${howIWork.map((h) => `- ${h}`).join("\n")}

<br/>

### Details

| | |
|---|---|
${quickFacts.map((f) => `| **${f.k}** | ${f.v} |`).join("\n")}
| **Based in** | ${site.location} (${site.timezone}) |
| **Studying** | ${site.school} at ${site.schoolShort} |

<br/>

<div align="center">
<sub>${site.email}</sub>
</div>
`;

mkdirSync(join(root, "github"), { recursive: true });
writeFileSync(join(root, "github", "PROFILE_README.md"), md, "utf8");

const total = stack.reduce((a, g) => a + g.tools.length, 0);
console.log(
  `github/PROFILE_README.md - ${(md.length / 1024).toFixed(1)}KB | ${total} badges | ${projects.length} projects`,
);
