"use client"

import React, { useEffect, useRef, useState } from "react";

type ContactItem = {
  id: string;
  label: string;
  handle: string;
  href: string;
  preview?: string;
};

const CONTACTS: ContactItem[] = [
  {
    id: "instagram",
    label: "INSTAGRAM",
    handle: "@sahan_kumar_3141",
    href: "https://www.instagram.com/sahan_kumar_3141/",
    preview: "@sahan_kumar_3141",
  },
  {
    id: "linkedin",
    label: "LINKEDIN",
    handle: "Sahan Kumar",
    href: "https://www.linkedin.com/in/sahan-kumar-59291b428/",
    preview: "Let's connect professionally →",
  },
  {
    id: "github",
    label: "GITHUB",
    handle: "Sahan3141",
    href: "https://github.com/Sahan3141",
    preview: "github.com/Sahan3141",
  },
  {
    id: "email",
    label: "EMAIL",
    handle: "sahankumar3141@gmail.com",
    href: "mailto:sahankumar3141@gmail.com",
    preview: "Start a conversation →",
  },
];

export default function ContactConnect() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const spotlightRef = useRef<HTMLDivElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const [isTouch, setIsTouch] = useState(false);
  const [copied, setCopied] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [previewPos, setPreviewPos] = useState({ x: 0, y: 0 });
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const touch = typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0);
    setIsTouch(!!touch);

    if (!touch && sectionRef.current && spotlightRef.current) {
      const handleMove = (e: MouseEvent) => {
        const rect = sectionRef.current!.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        // position spotlight (soft radial)
        if (spotlightRef.current) {
          spotlightRef.current.style.transform = `translate(${x - 200}px, ${y - 200}px)`;
          spotlightRef.current.style.opacity = "1";
        }
        // position preview
        setPreviewPos({ x: e.clientX + 18, y: e.clientY + 18 });
      };

      const handleLeave = () => {
        if (spotlightRef.current) spotlightRef.current.style.opacity = "0";
        setPreview(null);
      };

      const el = sectionRef.current;
      el.addEventListener("mousemove", handleMove);
      el.addEventListener("mouseleave", handleLeave);
      return () => {
        el.removeEventListener("mousemove", handleMove);
        el.removeEventListener("mouseleave", handleLeave);
      };
    }
  }, []);

  // intersection observer for reveal
  useEffect(() => {
    if (!sectionRef.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setInView(true);
        });
      },
      { threshold: 0.12 }
    );
    obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  // copy email
  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await navigator.clipboard.writeText("sahankumar3141@gmail.com");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("copy failed", err);
    }
  };

  // magnet effect for arrow: attach pointermove per row
  const attachMagnet = (el: HTMLDivElement | null, arrow: HTMLSpanElement | null) => {
    if (!el || !arrow || isTouch) return;
    const handlePointer = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const ax = rect.left + rect.width - 60; // arrow anchor
      const ay = rect.top + rect.height / 2;
      const dx = e.clientX - ax;
      const dy = e.clientY - ay;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const max = 28; // max px
      const force = Math.max(0, 1 - dist / 180);
      const tx = Math.max(-max, Math.min(max, -dx * 0.12 * force));
      const ty = Math.max(-6, Math.min(6, -dy * 0.04 * force));
      arrow.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
    };
    const leave = () => {
      if (arrow) arrow.style.transform = "translate3d(0,0,0)";
    };
    el.addEventListener("pointermove", handlePointer);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", handlePointer);
      el.removeEventListener("pointerleave", leave);
    };
  };

  return (
    <section id="contact" ref={sectionRef} className="relative z-10 overflow-hidden bg-[#070606] text-[#efede7] py-20 md:py-32 px-6 md:px-12" aria-label="Contact and Connect">
      <div ref={spotlightRef as any} className="pointer-events-none absolute left-0 top-0 w-[400px] h-[400px] rounded-full blur-3xl opacity-0 transition-opacity duration-400" style={{ background: 'radial-gradient(circle at center, rgba(255,255,255,0.06), rgba(255,255,255,0))' }} />

      <div className="max-w-6xl mx-auto">
        <h2 className={`font-extrabold leading-tight text-[clamp(36px,10vw,160px)] tracking-tight transform-gpu ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} transition-all duration-700`}>
          LET'S CONNECT
        </h2>
        <p className={`mt-6 text-lg max-w-2xl ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'} transition-all duration-700`}>
          Ideas, experiments, collaborations, or just a good conversation — I'm always up for something interesting.
        </p>

        <div className="mt-12 space-y-6 md:mt-16">
          {CONTACTS.map((c, idx) => (
            <ContactRow
              key={c.id}
              item={c}
              delay={idx * 80}
              inView={inView}
              attachMagnet={attachMagnet}
              setPreview={(text: string | null) => setPreview(text)}
              setPreviewPos={setPreviewPos}
              onCopy={handleCopy}
              copied={copied}
            />
          ))}
        </div>
      </div>

      {/* floating preview near cursor */}
      {preview && !isTouch && (
        <div ref={previewRef as any} style={{ left: previewPos.x, top: previewPos.y }} className="fixed pointer-events-none z-50 px-3 py-1 text-sm rounded-md bg-black/80 text-white backdrop-blur-sm transition-transform duration-150">
          {preview}
        </div>
      )}

      <div className="mt-16 border-t border-white/6 pt-10 text-center">
        <div className="text-sm font-medium">SAHAN KUMAR</div>
        <div className="mt-1 text-xs text-white/60">AI &amp; ML · DEVELOPER · BUILDER</div>
        <div className="mt-4 text-xs text-white/40">© 2026 Sahan Kumar</div>
      </div>
    </section>
  );
}

function ContactRow({ item, delay, inView, attachMagnet, setPreview, setPreviewPos, onCopy, copied }: any) {
  const rowRef = useRef<HTMLDivElement | null>(null);
  const arrowRef = useRef<HTMLSpanElement | null>(null);
  const preferReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    const cleanup = attachMagnet(rowRef.current, arrowRef.current);
    return typeof cleanup === 'function' ? cleanup : undefined;
  }, [attachMagnet]);

  return (
    <a
      href={item.href}
      onMouseMove={(e) => setPreviewPos({ x: e.clientX + 18, y: e.clientY + 18 })}
      onMouseEnter={() => setPreview(item.preview)}
      onMouseLeave={() => setPreview(null)}
      className={`group block w-full no-underline rounded-none`}
    >
      <div
        ref={rowRef}
        className={`relative flex items-center justify-between gap-6 py-6 px-6 md:px-10 bg-white/2 border border-white/6 backdrop-blur-sm transition-all ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'} duration-600`} style={{ transitionDelay: `${delay}ms` }}
      >
        <div>
          <div className="text-xs tracking-widest text-white/60">{item.label}</div>
          <div className="mt-1 text-base md:text-lg font-medium">{item.handle}</div>
        </div>

        <div className="flex items-center gap-4">
          {item.id === 'email' && (
            <button onClick={onCopy} onMouseDown={(e)=>e.stopPropagation()} className="text-sm text-white/60 hover:text-white transition-colors px-3 py-2" aria-label="Copy email">
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          )}
          <span ref={arrowRef} className="ml-4 inline-block text-white/60 transform transition-transform duration-200">↗</span>
        </div>
      </div>
    </a>
  );
}
