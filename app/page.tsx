import { Hero } from "@/components/home/hero";
import { MarqueeStrip } from "@/components/home/marquee-strip";
import { About } from "@/components/home/about";
import { HorizontalSkills } from "@/components/home/horizontal-skills";
import { SectionDivider } from "@/components/ui/section-divider";
import { ProjectGrid } from "@/components/projects/project-grid";
import { seedProjects } from "@/lib/data";
import { getProjects } from "@/lib/projects";

export default async function Home() {
  const projects = await getProjects(true);
  const featuredProjects = projects.length ? projects : seedProjects;

  return (
    <>
      {/* Hero Section */}
      <Hero />

      {/* Marquee Skills Strip */}
      <MarqueeStrip />

      {/* Hero to About Divider */}
      <SectionDivider variant="subtle" />

      {/* About Section */}
      <About />

      {/* About to Skills Divider */}
      <SectionDivider variant="indigo" label="CAPABILITIES" />

      {/* Horizontal Scroll Skills Section */}
      <HorizontalSkills />

      {/* Skills to Projects Divider */}
      <SectionDivider variant="jade" label="SELECTED WORK" />

      {/* Featured Projects Section */}
      <section className="section-projects border-b border-[var(--b1)] bg-[#0A0A09]">
        
        {/* Top Fade */}
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-[var(--bg-deep)] to-transparent pointer-events-none z-10" />

        <div className="mx-auto max-w-6xl px-5 py-24 relative z-10">
          <div className="mb-12">
            {/* Header */}
            <span 
              style={{ fontFamily: '"Space Grotesk", sans-serif', letterSpacing: "0.15em" }}
              className="text-[11px] font-semibold text-[var(--jade)] uppercase"
            >
              Selected Work
            </span>
            <h2 
              style={{ fontFamily: '"Cormorant Garamond", serif', letterSpacing: "-0.02em" }}
              className="mt-3 text-4xl md:text-5xl font-light text-[var(--text-primary)]"
            >
              Featured projects
            </h2>
            <p className="mt-4 max-w-2xl text-sm text-[var(--text-secondary)] font-light">
              A handpicked selection of artificial intelligence agents, data retrieval pipelines, and responsive web platforms.
            </p>
          </div>

          {/* Project Grid */}
          <ProjectGrid projects={featuredProjects.filter((p) => p.is_featured)} />
        </div>

        {/* Bottom Fade */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[var(--bg-void)] to-transparent pointer-events-none z-10" />

      </section>

      {/* Final Bottom Divider before Footer */}
      <SectionDivider variant="subtle" />
    </>
  );
}
