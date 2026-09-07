"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function VisualIntro() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const [sectionHeight, setSectionHeight] = useState<string | null>(null);
  const [metaLeft, setMetaLeft] = useState<string | null>(null);
  const [metaTop, setMetaTop] = useState<string | null>(null);

  useEffect(() => {
    const el = sectionRef.current;
    const img = imgRef.current;
    const text = textRef.current;

    let ctx: any = null;
    if (el && img && text) {
      ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: "top center",
            end: "bottom top",
            scrub: 0.8,
          },
        });

        tl.fromTo(
          img,
          { scale: 0.98, y: 18 },
          { scale: 1, y: 0, ease: "power1.out" },
          0,
        ).fromTo(
          text,
          { x: -40 },
          { x: 0, ease: "power1.out" },
          0,
        );
      }, el);
    }

    const updateLayout = () => {
      const imgEl = imgRef.current;
      const sectionEl = sectionRef.current;
      const metaEl = metaRef.current;
      const blackEl = document.getElementById("black-next");
      if (!imgEl || !sectionEl) return;

      const sectionRect = sectionEl.getBoundingClientRect();
      const imgRect = imgEl.getBoundingClientRect();

      // Compute the section height so its bottom aligns with the image bottom.
      const newSectionHeight = imgRect.bottom - sectionRect.top;
      if (newSectionHeight > 0) {
        setSectionHeight(`${newSectionHeight}px`);
      }

      // Compute metadata position over lower-right area of the image (avoid face)
      if (metaEl) {
        const left = imgRect.left - sectionRect.left + imgRect.width * 0.78;
        const top = imgRect.top - sectionRect.top + imgRect.height * 0.84;
        setMetaLeft(`${Math.max(12, left)}px`);
        setMetaTop(`${Math.max(12, top)}px`);
      }

      // Compute the gap between image bottom and section bottom and expose as a CSS var
      if (blackEl) {
        const delta = sectionRect.bottom - imgRect.bottom; // positive when section extends below image
        document.documentElement.style.setProperty('--black-offset', `${-delta}px`);
      }
    };

    // Update on load/resize/scroll. Run once on next frame so layout has settled.
    requestAnimationFrame(() => updateLayout());
    window.addEventListener("resize", updateLayout);
    window.addEventListener("scroll", updateLayout, { passive: true });

    const imgLoadHandler = () => requestAnimationFrame(updateLayout);
    const imgEl = imgRef.current;
    if (imgEl) imgEl.addEventListener("load", imgLoadHandler);

    return () => {
      if (ctx) ctx.revert();
      window.removeEventListener("resize", updateLayout);
      window.removeEventListener("scroll", updateLayout);
      if (imgEl) imgEl.removeEventListener("load", imgLoadHandler);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-[#efede7]"
      aria-label="Editorial portrait"
      style={sectionHeight ? { height: sectionHeight } : undefined}
    >
      {/* Photograph (behind typography) - keep image in normal flow so section height matches image bottom */}
      <div className="flex items-start justify-center">
        <div className="relative flex items-center justify-center w-full">
          <img
            ref={imgRef}
            src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/img/Untitled-1.png`}
            alt="Sahan Kumar"
            className="z-10 pointer-events-none object-contain block w-auto max-w-[90vw] max-h-[88vh] md:max-w-[78vw] md:max-h-[86vh] lg:max-w-[72vw] lg:max-h-[92vh] filter grayscale brightness-95"
            style={{ objectPosition: "50% 38%" }}
          />

          {/* Giant typography over the image */}
          <h2
            ref={textRef}
            className="z-20 pointer-events-none absolute inset-0 m-auto w-full text-center font-sans text-[22vw] leading-[0.72] tracking-[-0.03em] font-extrabold text-black md:text-[20vw] lg:text-[18vw]"
          >
            
          </h2>
        </div>
      </div>

      {/* Small editorial label */}
      <div className="absolute left-6 top-6 z-30 flex items-center gap-4">
        <span className="text-xs tracking-[0.25em]">02</span>
        <div className="h-px w-20 bg-black/30" />
      </div>

      {/* Supporting microcopy (positioned over portrait) */}
      <div
        ref={metaRef}
        className="z-30 text-sm text-black/70 tracking-[0.12em]"
        style={metaLeft && metaTop ? { position: 'absolute', left: metaLeft, top: metaTop } : undefined}
      >
        AI &amp; ML • DEVELOPER • BUILDER
      </div>
    </section>
  );
}
