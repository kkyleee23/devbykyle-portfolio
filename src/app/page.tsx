import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Now } from "@/components/Now";
import { Work } from "@/components/Work";
import { Stack } from "@/components/Stack";
import { GithubPanel } from "@/components/GithubPanel";
import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-100 focus:rounded-sm focus:bg-ink focus:px-4 focus:py-2.5 focus:font-semibold focus:text-paper"
      >
        Skip to content
      </a>
      <Nav />
      <main id="main">
        <Hero />
        <Now />
        <Work />
        <Stack />
        <GithubPanel />
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
