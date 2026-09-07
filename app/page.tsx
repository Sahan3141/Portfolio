"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
import VisualIntro from "./components/VisualIntro";
import GitHubProjects from "./components/GitHubProjects";
import ContactConnect from "./components/ContactConnect";
import Interactions from "./components/Interactions";

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    const name = nameRef.current;
    const subtitle = subtitleRef.current;
    const cover = coverRef.current;

    if (!hero || !name || !subtitle || !cover) return;

    const ctx = gsap.context(() => {
      const isSmall = typeof window !== 'undefined' && window.matchMedia('(max-width: 430px)').matches;
      const nameY = isSmall ? "-8vh" : "-18vh";
      const nameScale = isSmall ? 0.86 : 0.72;
      const subtitleY = isSmall ? "-6vh" : "-10vh";

      gsap
        .timeline({
          scrollTrigger: {
            trigger: hero,
            start: "top top",
            end: "bottom top",
            scrub: 1,
            pin: true,
          },
        })
        .to(
          name,
          {
            y: nameY,
            scale: nameScale,
            ease: "none",
          },
          0,
        )
        .to(
          subtitle,
          {
            y: subtitleY,
            opacity: 0,
            ease: "none",
          },
          0,
        )
        .to(
          cover,
          {
            y: "-100%",
            ease: "none",
          },
          0.15,
        );
    }, hero);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const about = aboutRef.current;
    if (!about) return;

    const ctx = gsap.context(() => {
      gsap.from(about.querySelectorAll(".about-fade"), {
        y: 18,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
        stagger: 0.06,
        immediateRender: false,
        scrollTrigger: {
          trigger: about,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });
    }, about);

    return () => ctx.revert();
  }, []);

  return (
    <main className="bg-[#111111] text-[#111111] overflow-x-hidden">
      {/* INTRO / COVER */}
      <section
        ref={heroRef}
        className="relative h-screen w-full overflow-hidden"
      >
        {/* Ivory cover */}
        <div
          ref={coverRef}
          className="absolute inset-0 z-20 flex h-screen w-full flex-col bg-[#efede7]"
        >
          {/* Navigation */}
          <nav className="absolute left-0 top-0 flex w-full items-center justify-between px-6 py-5 md:px-10 md:py-7">
            <div className="text-[11px] font-medium tracking-[0.12em]">
              H SAHAN KUMAR
            </div>

            <div className="hidden items-center gap-8 text-[10px] font-medium tracking-[0.15em] md:flex">
              <a href="#about" className="nav-link">ABOUT</a>
              <a href="#work" className="nav-link">WORK</a>
              <a href="#lab" className="nav-link">GITHUB</a>
              <a href="#contact" className="nav-link">CONTACT</a>
            </div>
          </nav>

          {/* Main typography */}
          <div className="flex flex-1 flex-col items-center justify-center px-4">
            <h1
              ref={nameRef}
              className="md:whitespace-nowrap bodoni-moda-heavy text-[clamp(4rem,19vw,9rem)] font-normal leading-[0.72] tracking-[-0.07em] md:text-[23vw]"
            >
              Sahan <span className="sr-only">Kumar</span>
            </h1>

            <p
              ref={subtitleRef}
              className="font-parisienne mt-10 text-3xl leading-none md:mt-12 md:text-6xl"
            >
              Building my way through
            </p>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-7 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3">
            <span className="text-[9px] tracking-[0.3em]">SCROLL TO EXPLORE</span>

            <div className="h-10 w-px bg-black/50" />
          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section
        ref={aboutRef}
        id="about"
        className="relative min-h-screen bg-[#111111] px-6 py-16 text-[#efede7] md:px-16 overflow-hidden"
      >
        <div className="mx-auto w-full max-w-7xl">
          <div
            className="grid w-full items-start gap-y-8 md:gap-x-12 md:grid-cols-[minmax(0,1.6fr)_minmax(300px,1fr)]"
          >
            {/* LEFT: Heading */}
            <div className="about-fade min-w-0 overflow-hidden">
              <div className="mb-6 flex items-center gap-5">
                <span className="text-xs tracking-[0.25em]">01</span>
                <div className="h-px w-20 bg-[#efede7]/40" />
              </div>

              <h2 className="font-serif whitespace-pre-line text-[clamp(4rem,19vw,7rem)] font-normal leading-[0.78] tracking-[-0.05em] md:text-[12vw] lg:text-[10vw]">
                ABOUT
                <br />
                ME
              </h2>
            </div>

            {/* RIGHT: Introduction */}
            <div className="about-fade min-w-0 self-start">
              <div className="max-w-none md:max-w-[480px] text-base leading-7 text-[#efede7]/90 md:text-lg md:leading-9">
                <p className="mb-5 text-lg md:text-xl font-semibold">
                  I'm Sahan Kumar —
                  <br />an AI &amp; ML student,
                  <br />developer, and builder.
                </p>

                <p className="mb-6">
                  I like taking ideas apart,
                  <br />understanding how they work,
                  <br />and then building my own
                  <br />version of them.
                </p>

                <p className="mb-6">
                  From web applications and
                  <br />AI experiments to 3D and
                  <br />systems, I'm constantly
                  <br />learning by building.
                </p>

                <p className="mb-2 font-semibold">Currently exploring</p>

                <p className="mb-8 tracking-[0.18em]">AI • ML • Web • Systems</p>

                <a href="#contact" className="underline-animate group inline-flex items-center gap-2 text-sm font-medium text-[#efede7]/95 nav-link">
                  <span>MORE ABOUT ME</span>
                  <span className="transform transition-transform duration-2000 group-hover:translate-x-1">→</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* SECTION 02: Editorial visual intro */}
      <VisualIntro />
      {/* SECTION 03: Black transition section (About / Introduction) */}
      <section id="work" className="bg-black w-full text-[#efede7]" style={{ marginTop: 'var(--black-offset, 0px)' }}>
        <div className="mx-auto w-full max-w-7xl px-6 py-20 md:px-16 md:py-28">
          <div className="max-w-6xl">
            <h2 className="bodoni-moda-heavy text-[18vw] leading-[0.72] tracking-[-0.03em] font-normal md:text-[14vw] lg:text-[10vw]">
              Hello,
            </h2>

            <div className="mt-8 grid gap-10 lg:grid-cols-2">
              <div className="max-w-[62ch] text-lg leading-8">
                <p className="mb-4">
                  I’m <strong className="font-semibold">Sahan Kumar</strong>, a student and aspiring developer exploring technology, artificial intelligence, web development, creative coding, cybersecurity, and digital products.
                </p>

                <p className="mb-4">
                  I have a foundation in <strong>HTML, CSS, JavaScript, and Python</strong>, and I’m actively developing my programming skills. A major part of how I build today is through <strong>AI-assisted development</strong>: I take ideas, break them into requirements, prompt and guide AI systems, read and adapt generated code, troubleshoot issues, connect technologies, and iterate until the product works.
                </p>

                <p className="mb-4">
                  This is AI-native building — using AI as a collaborator to move quickly from concept to functioning product while still learning the craft of programming.
                </p>
              </div>

              <aside className="self-start">
                <div className="mb-8">
                  <h3 className="text-sm tracking-[0.18em] mb-3">AI Skills & Interests</h3>
                  <ul className="space-y-2 text-sm leading-6">
                    <li>AI-assisted software development</li>
                    <li>Prompt engineering & local LLMs (Ollama)</li>
                    <li>AI coding agents & multi-agent concepts</li>
                    <li>AI-assisted web & game development</li>
                    <li>MCP / OpenCode / AI-tool integrations</li>
                    <li>Rapid AI-assisted prototyping & automation</li>
                    <li>Turning natural-language ideas into technical implementations</li>
                  </ul>
                </div>

                <div className="mb-8">
                  <h3 className="text-sm tracking-[0.18em] mb-3">Selected Projects</h3>
                  <div className="space-y-2 text-sm leading-6">
                    <div><strong>Neon Arcade</strong> — web-based gaming experiments.</div>
                    <div><strong>Zenway / NeonDrive</strong> — browser driving experience (Three.js, Vite).</div>
                    <div><strong>Dropforge</strong> — file conversion & tooling.</div>
                    <div><strong>Kalcio</strong> — calculator app.</div>
                    <div><strong>KCET Predictor</strong> — mock-test & prediction tools.</div>
                    <div><strong>Nightshift AI</strong> — experimental autonomous/local AI workflows.</div>
                    <div><strong>GLPS Mulkadu</strong> — website & digital project work.</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm tracking-[0.18em] mb-3">Achievements</h3>
                  <div className="space-y-1 text-sm leading-6">
                    <div>JEE B.Arch — AIR 667</div>
                    <div>JEE B.Planning — AIR 450</div>
                    <div>KCET — Rank 19,937</div>
                    <div>Now studying CSE — Artificial Intelligence & Machine Learning</div>
                  </div>
                </div>
              </aside>
            </div>

            <div className="mt-12 max-w-[60ch] text-base leading-7">
              <p>
                I learn by building: I experiment, break things, figure out why they broke, and build them again. I’m early in the journey, curious and ambitious, and I use every project to sharpen my skills and turn ideas into tools people can use.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* SECTION 04: GitHub Projects (dynamically fetched) */}
      <GitHubProjects />
      {/* SECTION 05: Contact / Connect */}
      <ContactConnect />
      {/* Non-invasive interactions (client-side only) */}
      <Interactions />
    </main>
  );
}
