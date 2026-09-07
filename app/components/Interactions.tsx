"use client";

import { useEffect } from "react";

function lerp(a: number, b: number, n: number) {
  return (1 - n) * a + n * b;
}

export default function Interactions() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Inject minimal styles for interaction overlays (non-layout)
    const style = document.createElement("style");
    style.innerHTML = `
      .interaction-cursor { position:fixed; left:0; top:0; width:22px; height:22px; border-radius:50%; pointer-events:none; transform:translate(-50%,-50%); transition:transform 220ms ease, width 220ms ease, height 220ms ease, background 220ms ease, opacity 200ms ease; z-index:9999; mix-blend-mode:normal; opacity:0.9; border:1px solid rgba(255,255,255,0.06); backdrop-filter: blur(2px); }
      .interaction-cursor.hidden { opacity:0; }
      .interaction-cursor.interactive { transform:translate(-50%,-50%) scale(1.6); background: rgba(255,255,255,0.04); }
      .tile-highlight { position: absolute; left:0; top:0; width:100%; height:100%; pointer-events:none; border-radius:6px; transition: opacity 260ms ease; opacity:0; mix-blend-mode:normal; }
      .tile-glass { position:absolute; width:160px; height:110px; left:50%; top:50%; transform:translate(-50%,-50%); border-radius:12px; pointer-events:none; transition: opacity 260ms ease, transform 260ms ease; opacity:0; backdrop-filter: blur(6px); background: rgba(255,255,255,0.02); box-shadow: 0 6px 18px rgba(0,0,0,0.06); mix-blend-mode: normal; }
      .tile-tilt { transition: transform 260ms cubic-bezier(.2,.9,.2,1); transform-origin: center; will-change: transform; }
      .reveal-anim { transition: opacity 520ms ease, transform 520ms ease; opacity:0; transform: translateY(10px); }
      .reveal-anim.is-revealed { opacity:1; transform: translateY(0); }
    `;
    document.head.appendChild(style);

    // Create cursor element for desktop only
    let cursor: HTMLDivElement | null = null;
    if (!isTouch && !prefersReduced) {
      cursor = document.createElement("div");
      cursor.className = "interaction-cursor hidden";
      document.body.appendChild(cursor);
    }

    // Smooth parallax targets
    const portrait = document.querySelector<HTMLImageElement>('img[alt*="portrait"], img[src*="Untitled-1"]');
    const heroText = document.querySelector<HTMLElement>('h1.bodoni-moda-heavy, h1');
    const aiMicro = Array.from(document.querySelectorAll("*:not(script):not(style)"))
      .find((n) => n.textContent && n.textContent.includes("AI &")) as HTMLElement | undefined;

    // For github tiles: articles inside the section that contains "Things I've built." header
    const projectSection = Array.from(document.querySelectorAll('section')).find((s) => s.textContent && s.textContent.includes("Things I've built"));
    const projectTiles = projectSection ? Array.from(projectSection.querySelectorAll('article')) : [];

    // About reveals: elements with class 'about-fade' or .about-fade
    const aboutFade = Array.from(document.querySelectorAll('.about-fade')) as HTMLElement[];
    const revealTargets = aboutFade;

    // Intersection observer for reveals
    if (typeof IntersectionObserver !== 'undefined') {
      const obs = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            el.classList.add('is-revealed');
            el.classList.add('reveal-anim');
            obs.unobserve(el);
          }
        }
      }, { threshold: 0.12 });
      revealTargets.forEach((t) => obs.observe(t));
    } else {
      revealTargets.forEach((t) => t.classList.add('is-revealed', 'reveal-anim'));
    }

    // Tile highlight creation per tile
    const tileData = new Map<Element, { highlight: HTMLDivElement; glass: HTMLDivElement; targetX: number; targetY: number; currentX: number; currentY: number; glassX: number; glassY: number; glassCurX: number; glassCurY: number; rotX: number; rotY: number; rotCurX: number; rotCurY: number }>();
    projectTiles.forEach((tile) => {
      const highlight = document.createElement('div');
      highlight.className = 'tile-highlight';
      highlight.style.background = 'radial-gradient(300px circle at var(--x,50%) var(--y,50%), rgba(0,0,0,0.06), transparent 25%)';
      (tile as HTMLElement).style.position = (tile as HTMLElement).style.position || 'relative';
      tile.appendChild(highlight);
      // add a subtle glass element that follows the cursor inside the tile
      const glass = document.createElement('div');
      glass.className = 'tile-glass';
      tile.appendChild(glass);

      tile.classList.add('tile-tilt');

      tileData.set(tile, { highlight, glass, targetX: 50, targetY: 50, currentX: 50, currentY: 50, glassX: 50, glassY: 50, glassCurX: 50, glassCurY: 50, rotX: 0, rotY: 0, rotCurX: 0, rotCurY: 0 });

      const title = tile.querySelector('a') as HTMLElement | null;
      const buttons = Array.from(tile.querySelectorAll('a, button')) as HTMLElement[];

      tile.addEventListener('pointerenter', () => {
        highlight.style.opacity = '1';
        glass.style.opacity = '1';
        if (cursor) cursor.classList.add('interactive');
      });
      tile.addEventListener('pointerleave', () => {
        highlight.style.opacity = '0';
        glass.style.opacity = '0';
        if (cursor) cursor.classList.remove('interactive');
        if (title) title.style.transform = '';
        buttons.forEach(b => b.style.transform = '');
        (tile as HTMLElement).style.transform = '';
      });

      tile.addEventListener('pointermove', (e) => {
        const rect = tile.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        const d = tileData.get(tile);
        if (d) {
          d.targetX = x;
          d.targetY = y;
          // glass target position inside tile in px
          d.glassX = (e.clientX - rect.left);
          d.glassY = (e.clientY - rect.top);
          // compute small rotation targets (-1.5..1.5 deg)
          const nx = (x - 50) / 50; // -1..1
          const ny = (y - 50) / 50;
          d.rotX = Math.max(-1.5, Math.min(1.5, -ny * 1.6));
          d.rotY = Math.max(-1.5, Math.min(1.5, nx * 1.6));
        }
        // Subtle transforms for text/buttons
        if (title) title.style.transform = `translateY(-2px) translateX(${(x - 50) * 0.02}px)`;
        buttons.forEach((b, i) => b.style.transform = `translate(${(x - 50) * 0.03}px, ${(y - 50) * 0.01}px)`);
      });
    });

    let raf = 0;
    function frame() {
      tileData.forEach((d, tile) => {
        d.currentX = lerp(d.currentX, d.targetX, 0.15);
        d.currentY = lerp(d.currentY, d.targetY, 0.15);
        d.highlight.style.backgroundPosition = `${d.currentX}% ${d.currentY}%`;
        d.highlight.style.setProperty('--x', `${d.currentX}%`);
        d.highlight.style.setProperty('--y', `${d.currentY}%`);

        // glass follow
        d.glassCurX = lerp(d.glassCurX ?? d.glassX, d.glassX, 0.18);
        d.glassCurY = lerp(d.glassCurY ?? d.glassY, d.glassY, 0.18);
        d.glass.style.transform = `translate(${d.glassCurX - 80}px, ${d.glassCurY - 55}px)`;

        // tilt
        d.rotCurX = lerp(d.rotCurX ?? d.rotX, d.rotX, 0.12);
        d.rotCurY = lerp(d.rotCurY ?? d.rotY, d.rotY, 0.12);
        (tile as HTMLElement).style.transform = `perspective(800px) rotateX(${d.rotCurX}deg) rotateY(${d.rotCurY}deg)`;
      });

      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    // Global pointer handling for portrait and hero text
    let px = 0, py = 0, tx = 0, ty = 0;
    const handlePointer = (e: PointerEvent) => {
      if (isTouch || prefersReduced) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      px = (e.clientX / w - 0.5) * 2; // -1..1
      py = (e.clientY / h - 0.5) * 2;

      if (cursor) {
        cursor.classList.remove('hidden');
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
      }
    };
    const handleLeave = () => {
      if (cursor) cursor.classList.add('hidden');
      px = 0; py = 0;
    };
    window.addEventListener('pointermove', handlePointer);
    window.addEventListener('pointerout', handleLeave);

    // micro parallax loop
    let loopRaf = 0;
    function parallaxLoop() {
      tx = lerp(tx, px, 0.06);
      ty = lerp(ty, py, 0.06);
      // portrait moves slightly toward cursor (increased amplitude ~2x)
      if (portrait) portrait.style.transform = `translate3d(${tx * 12}px, ${ty * 12}px, 0) scale(${1 + Math.abs(tx) * 0.004 + Math.abs(ty) * 0.004})`;
      if (heroText) heroText.style.transform = `translate3d(${tx * -10}px, ${ty * -6}px, 0)`;
      if (aiMicro) {
        aiMicro.style.transition = 'letter-spacing 220ms ease, opacity 220ms ease, transform 220ms ease';
        aiMicro.style.letterSpacing = `${0.02 + Math.abs(tx) * 0.02}em`;
        aiMicro.style.opacity = `${0.9 - Math.abs(ty) * 0.05}`;
      }
      loopRaf = requestAnimationFrame(parallaxLoop);
    }
    loopRaf = requestAnimationFrame(parallaxLoop);

    // Cursor hover enter/leave toggles
    const interactiveSelector = 'a, button, article, .interactive, [data-interactive], input, select';
    const pointerOverHandler = (e: Event) => {
      const t = e.target as Element;
      const interactive = t.closest && t.closest(interactiveSelector);
      if (cursor) {
        if (interactive) cursor.classList.add('interactive');
        else cursor.classList.remove('interactive');
      }
    };
    document.addEventListener('pointerover', pointerOverHandler);
    document.addEventListener('pointerout', pointerOverHandler);

    // Skills hover subtle effects: find list items inside AI skills area
    const skillEls = Array.from(document.querySelectorAll('aside li, .skills li')) as HTMLElement[];
    skillEls.forEach((el) => {
      el.style.transition = 'transform 180ms ease, opacity 180ms ease';
      el.addEventListener('pointerenter', () => {
        el.style.transform = 'translateY(-3px)';
        el.style.opacity = '0.95';
      });
      el.addEventListener('pointerleave', () => {
        el.style.transform = '';
        el.style.opacity = '';
      });
    });

    // Contact arrows magnetic: find links in contact area (by mailto or linkedin/instagram/github)
    const contactLinks = Array.from(document.querySelectorAll('a[href*="instagram"], a[href*="linkedin"], a[href*="github"], a[href^="mailto:"]')) as HTMLElement[];
    contactLinks.forEach((a) => {
      const arrow = a.querySelector('span, svg');
      if (!arrow) return;
      a.addEventListener('pointermove', (e) => {
        const rect = a.getBoundingClientRect();
        const dx = e.clientX - (rect.left + rect.width - 40);
        const dy = e.clientY - (rect.top + rect.height / 2);
        const txa = Math.max(-10, Math.min(10, dx * 0.08));
        (arrow as HTMLElement).style.transform = `translate3d(${txa}px, ${dy * 0.02}px, 0)`;
      });
      a.addEventListener('pointerleave', () => {
        (arrow as HTMLElement).style.transform = '';
      });
    });

    // Cleanup
    return () => {
      document.head.removeChild(style);
      if (cursor && cursor.parentNode) cursor.parentNode.removeChild(cursor);
      tileData.forEach((d) => d.highlight.remove());
      cancelAnimationFrame(raf);
      cancelAnimationFrame(loopRaf);
      window.removeEventListener('pointermove', handlePointer);
      window.removeEventListener('pointerout', handleLeave);
      document.removeEventListener('pointerover', pointerOverHandler);
      document.removeEventListener('pointerout', pointerOverHandler);
    };
  }, []);

  return null;
}
