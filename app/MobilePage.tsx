"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitText from "gsap/SplitText";
import GitHubCalendar from "react-github-calendar";
import SpotifyLastPlayed from "@/components/SpotifyLastPlayed";
import me from "../public/images/me.png";

gsap.registerPlugin(ScrollTrigger);

export default function MobilePage() {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const aboutTextRef = useRef<HTMLParagraphElement | null>(null);
  const splitRef = useRef<any>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const slides = gsap.utils.toArray<HTMLElement>(".m-slide");
      slides.forEach((slide, i) => {
        const fromX = i % 2 === 0 ? "-20%" : "20%"; // alternate left/right
        gsap.from(slide, {
          x: fromX,
          autoAlpha: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: slide,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        });
      });

      // About text SplitText animation on scroll
      if (aboutTextRef.current) {
        splitRef.current = new SplitText(aboutTextRef.current, {
          type: "words",
        });
        gsap.set(splitRef.current.words, { opacity: 0, y: 50 });
        gsap.to(splitRef.current.words, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power4.out",
          stagger: 0.04,
          scrollTrigger: {
            trigger:
              aboutTextRef.current.closest("section") || aboutTextRef.current,
            start: "top 80%",
            once: true,
          },
        });
      }
    }, wrapperRef);

    return () => {
      ctx.revert();
      if (splitRef.current?.revert) splitRef.current.revert();
    };
  }, []);

  // Smooth animate the hamburger menu open/close
  useLayoutEffect(() => {
    const el = menuRef.current;
    if (!el) return;
    if (menuOpen) {
      gsap.fromTo(
        el,
        { height: 0, opacity: 0 },
        { height: "auto", opacity: 1, duration: 0.25, ease: "power2.out" }
      );
    } else {
      gsap.to(el, { height: 0, opacity: 0, duration: 0.2, ease: "power2.in" });
    }
  }, [menuOpen]);

  return (
    <div ref={wrapperRef} className="min-h-screen bg-[#141414] text-[#FAE3AC]">
      {/* Navbar (not part of slide animations to avoid disappearing at top) */}
      <header className="sticky top-0 z-30 bg-[#01344F] px-4 py-3 shadow-md">
        <div className="flex items-center justify-between">
          <h1 className="font-bangers text-3xl text-[#D12128]">KEERTAN</h1>
          <button
            aria-label="Toggle menu"
            className="text-[#D12128] text-3xl"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <i className="bi bi-list" aria-hidden="true" />
          </button>
        </div>
        <nav
          ref={menuRef}
          className="mt-2 overflow-hidden font-figtree"
          style={{ height: 0, opacity: 0 }}
          aria-hidden={!menuOpen}
        >
          <div className="flex flex-col gap-2 py-1">
            <a className="text-[#D12128]">HOME</a>
            <a className="text-[#D12128]">PROJECTS</a>
            <a className="text-[#D12128]">ABOUT</a>
          </div>
        </nav>
      </header>

      {/* Photo */}
      <section className="m-slide px-4 pt-6">
        <div className="bg-[#01344F] rounded-lg shadow-md flex items-center justify-center overflow-hidden">
          <Image
            src={me}
            alt="Keertan K making peace sign"
            width={360}
            height={480}
            className="object-contain w-full h-auto rounded-lg"
            priority
          />
        </div>
      </section>

      {/* About */}
      <section className="m-slide px-4 py-6">
        <h2 className="font-bangers text-2xl text-[#D12128] mb-3">ABOUT ME</h2>
        <p
          ref={aboutTextRef}
          className="font-figtree text-base leading-7 opacity-90"
        >
          I’m Keertan, a developer who enjoys building playful, animated web
          experiences. This mobile layout mirrors the desktop blocks, stacked
          for small screens.
        </p>
      </section>

      {/* Mixtape */}
      <section className="m-slide px-4 py-6">
        <div className="relative w-full overflow-hidden rounded-lg bg-[#01344F]">
          <video
            src="/mixtape.webm"
            autoPlay
            loop
            muted
            playsInline
            onError={(e) =>
              console.error(
                "Failed to load /mixtape.webm",
                e.currentTarget.error
              )
            }
            className="w-full h-48 object-contain bg-black/20"
          />
          <div className="absolute left-3 top-3">
            <SpotifyLastPlayed />
          </div>
          <div className="absolute right-3 bottom-3 font-bangers text-3xl text-[#D12128]">
            Mixtape
          </div>
        </div>
      </section>

      {/* GitHub Calendar */}
      <section className="m-slide px-4 py-6">
        <h2 className="font-bangers text-2xl text-[#D12128] mb-3">GITHUB</h2>
        <div className="calendar-theme bg-[#01344F] rounded-lg p-3 overflow-x-auto">
          <GitHubCalendar
            username="KeEbEe123"
            blockSize={9}
            blockMargin={3}
            fontSize={10}
            hideColorLegend
          />
        </div>
      </section>

      {/* Socials */}
      <section className="m-slide px-4 py-8">
        <h2 className="font-bangers text-2xl text-[#D12128] mb-4">SOCIALS</h2>
        <div className="flex items-center justify-between text-[#D12128] text-4xl">
          <i className="bi bi-github" aria-hidden="true" />
          <i className="bi bi-linkedin" aria-hidden="true" />
          <i className="bi bi-twitter" aria-hidden="true" />
        </div>
      </section>
    </div>
  );
}
