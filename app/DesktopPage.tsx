"use client";

import Image from "next/image";
import { useState, useLayoutEffect, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import GitHubCalendar from "react-github-calendar";
import me from "../public/images/me.png";
import GlitchText from "@/components/GlitchText";
import SpotifyLastPlayed from "@/components/SpotifyLastPlayed";
import Lottie from "lottie-react";
// Removed Spiderman intro from DesktopPage
import SplitText from "gsap/SplitText"; // ✅ requires GSAP bonus plugin

export default function Home() {
  const aboutTextRef = useRef<HTMLParagraphElement | null>(null);
  const splitRef = useRef<any>(null); // holds the SplitText instance between replays
  const [hovered, setHovered] = useState<number | null>(null);
  const calendarScrollRef = useRef<HTMLDivElement | null>(null);
  const [totalContributions, setTotalContributions] = useState<number>(0);
  const navbarRef = useRef<HTMLDivElement | null>(null);
  const navButtonsRef = useRef<HTMLDivElement | null>(null);
  const [spectrumData, setSpectrumData] = useState<any | null>(null);
  const photoRef = useRef<HTMLDivElement | null>(null);
  // Removed spidermanRef; intro is handled in app/page.tsx
  // add this near your other refs
  const rootRef = useRef<HTMLDivElement | null>(null);
  const nameCardRef = useRef<HTMLDivElement | null>(null);
  // Recolor any RGBA arrays in the Lottie JSON to the target color (preserve alpha)
  function recolorLottieJson(json: any, targetHex: string) {
    const hex = targetHex.replace("#", "");
    const r = parseInt(hex.slice(0, 2), 16) / 255;
    const g = parseInt(hex.slice(2, 4), 16) / 255;
    const b = parseInt(hex.slice(4, 6), 16) / 255;

    const isColorArray = (arr: any): arr is number[] =>
      Array.isArray(arr) &&
      arr.length === 4 &&
      arr.every((n) => typeof n === "number") &&
      arr[0] >= 0 &&
      arr[0] <= 1 &&
      arr[1] >= 0 &&
      arr[1] <= 1 &&
      arr[2] >= 0 &&
      arr[2] <= 1 &&
      arr[3] >= 0 &&
      arr[3] <= 1;

    const walk = (node: any, parentKey?: string) => {
      if (!node) return;
      if (Array.isArray(node)) {
        // Some Lottie colors are directly arrays in certain contexts
        if (isColorArray(node)) {
          const alpha = node[3];
          node[0] = r;
          node[1] = g;
          node[2] = b;
          node[3] = alpha;
          return;
        }
        for (let i = 0; i < node.length; i++) walk(node[i]);
      } else if (typeof node === "object") {
        for (const key of Object.keys(node)) {
          const val = (node as any)[key];
          // Typical pattern: { c: { k: [r,g,b,a] } }
          if (key === "k" && isColorArray(val)) {
            const alpha = val[3];
            (node as any)[key] = [r, g, b, alpha];
            continue;
          }
          walk(val, key);
        }
      }
    };

    try {
      walk(json);
    } catch (e) {
      console.warn("Lottie recolor encountered an issue (non-fatal):", e);
    }
    return json;
  }

  // Fly the name card image from off-screen to the top-right of the photo box
  const flyInNameCard = () => {
    const card = nameCardRef.current;
    const photo = photoRef.current;
    if (!card || !photo) return;
    const rect = photo.getBoundingClientRect();
    const vw = window.innerWidth;
    const targetX = rect.right + 12; // a little to the right of the photo box
    const targetY = rect.top - 12; // a little above the photo box

    // Position card via transforms relative to top-left of viewport
    gsap.set(card, {
      position: "fixed",
      top: 0,
      left: "-35%",
      zIndex: 60,
      pointerEvents: "none",
      opacity: 1,
    });

    gsap.fromTo(
      card,
      { x: vw + 200, y: -200, rotation: 15, scale: 1 },
      { x: targetX, y: targetY, rotation: 0, duration: 0.6, ease: "power3.out" }
    );
  };

  const flyOutNameCard = () => {
    const card = nameCardRef.current;
    if (!card) return;
    const vw = window.innerWidth;
    gsap.to(card, {
      x: vw + 200,
      y: -200,
      rotation: 15,
      duration: 0.5,
      ease: "power3.in",
      onComplete: () => { gsap.set(card, { opacity: 0 }); },
    });
  };

  useLayoutEffect(() => {
    gsap.registerPlugin(SplitText);

    const ctx = gsap.context(() => {
      const html = document.documentElement;
      const body = document.body;
      const restoreScroll = () => {
        html.style.overflowY = "";
        body.style.overflowY = "";
      };
      html.style.overflowY = "hidden";
      body.style.overflowY = "hidden";

      const boxes = gsap.utils.toArray<HTMLElement>("[data-from]");

      gsap.set(boxes, { autoAlpha: 0 });
      gsap.set(navbarRef.current, {
        opacity: 1,
        y: "-200%",
      });

      // No spiderman intro here
      // gsap.set(photoRef.current, { opacity: 1, x: "400%" });

      // Split text into words but don’t animate yet
      splitRef.current = new SplitText(aboutTextRef.current, { type: "words" });
      gsap.set(splitRef.current.words, { opacity: 0, y: 150 });

      const tl = gsap.timeline({
        defaults: { duration: 1, ease: "power3.out" },
        onComplete: restoreScroll,
      });

      // Step 1: Navbar
      // tl.to(photoRef.current, {
      //   opacity: 1,
      //   x: 0,
      //   duration: 2,
      //   ease: "power3.out",
      // });
      // // Clear inline transform so CSS hover scale can apply
      // tl.set(photoRef.current, { clearProps: "transform" });
      // Immediately reveal content
      tl.set(rootRef.current, { visibility: "visible" });
      tl.to(navbarRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        clearProps: "transform",
      });

      // Step 2: Boxes with stagger
      tl.fromTo(
        boxes,
        {
          autoAlpha: 1,
          x: (i, el) =>
            el.dataset.from === "left"
              ? "-100%"
              : el.dataset.from === "right"
              ? "100%"
              : "0",
          y: (i, el) =>
            el.dataset.from === "up"
              ? "-200%"
              : el.dataset.from === "down"
              ? "100%"
              : "0",
        },
        {
          x: 0,
          y: 0,
          autoAlpha: 1,
          clearProps: "transform",
          stagger: 0.2,
        }
      );
      // Step 3: About Me text after boxes
      tl.to(splitRef.current.words, {
        y: 0,
        opacity: 1,
        duration: 0.7,
        ease: "power4.out",
        stagger: 0.04,
      });
    });

    return () => {
      ctx.revert();
      if (splitRef.current?.revert) splitRef.current.revert();
    };
  }, []);

  // Load spectrum Lottie JSON from public/
  useEffect(() => {
    let mounted = true;
    fetch("/spectrum.json")
      .then((r) =>
        r.ok
          ? r.json()
          : Promise.reject(new Error("Failed to load spectrum.json"))
      )
      .then((json) => {
        if (mounted) {
          const recolored = recolorLottieJson(json, "#FAE3AC");
          setSpectrumData(recolored);
        }
      })
      .catch((e) => console.error(e));
    return () => {
      mounted = false;
    };
  }, []);
  // Scroll the GitHub calendar to the rightmost position so latest activity is visible by default
  useLayoutEffect(() => {
    const el = calendarScrollRef.current;
    if (!el) return;
    const toRight = () => {
      el.scrollLeft = el.scrollWidth;
    };
    // Try immediately and on next frame to ensure content is measured
    toRight();
    const id = requestAnimationFrame(toRight);
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    // Use 100dvh so the whole thing matches the visible viewport height precisely.
    // Keep horizontal overflow hidden so slide-ins don't create a horizontal scrollbar.
    // If you only want bottom padding, use pb-4 instead of p-4.
    <div className="h-[100dvh] bg-[#141414] p-4 overflow-x-hidden overscroll-none">
      {/* Spiderman intro removed on DesktopPage */}
      {/* Floating name card element (positioned with GSAP) */}
      <div
        ref={nameCardRef}
        className="fixed top-0 left-0 z-[60] pointer-events-none opacity-0"
        style={{ willChange: "transform, opacity" }}
      >
        <Image src="/namecard.png" alt="Name card" width={250} height={250} />
      </div>

      {/* Make the grid fill the padded area exactly */}
      <div
        ref={rootRef}
        // data-from="up"
        className="grid h-full w-full gap-4 grid-cols-6 grid-rows-6 overflow-hidden invisible"
      >
        {/* Header (no hover effects) */}
        <div
          ref={navbarRef}
          className="col-span-6 row-span-1 bg-[#01344F] rounded-lg shadow-md flex items-center justify-between px-8"
        >
          <h1 className="font-bangers font-bold text-[#D12128] text-[100px] tracking-wider">
            <GlitchText
              speed={0.1}
              enableShadows={true}
              enableOnHover={true}
              className="leading-none"
            >
              KEERTAN KUPPILI
            </GlitchText>
          </h1>
          <nav ref={navButtonsRef} className="flex gap-8">
            <button className="text-[#D12128] font-bold font-figtree text-lg hover:opacity-80 transition-opacity">
              HOME
            </button>
            <button className="text-[#D12128] font-bold font-figtree text-lg hover:opacity-80 transition-opacity">
              PROJECTS
            </button>
            <button className="text-[#D12128] font-bold font-figtree text-lg hover:opacity-80 transition-opacity">
              ABOUT
            </button>
          </nav>
        </div>

        {/* About Me */}
        <div
          data-from="left"
          onMouseEnter={() => setHovered(0)}
          onMouseLeave={() => setHovered(null)}
          className={cn(
            "col-span-3 row-span-3 bg-[#01344F] rounded-lg shadow-md flex flex-col p-6",
            "transition-all duration-300 ease-out will-change-transform",
            hovered !== null && hovered !== 0 && "blur-[1px] scale-[0.96]"
          )}
        >
          <div className="flex-1 flex flex-col">
            <h2 className="text-[#D12128] text-3xl font-bangers mb-4">
              ABOUT ME
            </h2>

            {/* wrapper prevents scrollbars while chars slide up */}
            <div className="relative flex-1 overflow-hidden">
              <p
                ref={aboutTextRef}
                className="text-[#D12128] text-2xl font-figtree leading-relaxed opacity-100"
              >
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer
                a tristique urna. Vestibulum ante ipsum primis in faucibus orci
                luctus et ultrices posuere cubilia curae; Aliquam erat volutpat.
                Donec fermentum efficitur justo, vitae interdum metus vehicula
                a. Curabitur non lorem sed arcu feugiat euismod.
              </p>
            </div>
          </div>
        </div>

        {/* Center beige */}
        <div
          data-from="up"
          onMouseEnter={() => setHovered(1)}
          onMouseLeave={() => setHovered(null)}
          className={cn(
            "col-span-1 row-span-3 bg-[#D12128] rounded-lg shadow-md flex items-center justify-center",
            "transition-all duration-300 ease-out will-change-transform",
            hovered !== null && hovered !== 1 && "blur-[1px] scale-[0.96]"
          )}
        />

        {/* Photo */}
        <div
          ref={photoRef}
          data-from="right"
          onMouseEnter={() => {
            setHovered(2);
            flyInNameCard();
          }}
          onMouseLeave={() => {
            setHovered(null);
            flyOutNameCard();
          }}
          className={cn(
            "col-span-2 row-span-4 bg-[#01344F] rounded-lg shadow-md flex items-center justify-center overflow-hidden",
            "transition-all duration-300 ease-out will-change-transform",
            hovered !== null && hovered !== 2 && "blur-[1px] scale-[0.96]"
          )}
        >
          <Image
            src={me}
            alt="Keertan K making peace sign"
            width={400}
            height={600}
            className="object-contain w-full h-full rounded-lg"
          />
        </div>

        {/* Bottom left */}
        <div
          data-from="left"
          onMouseEnter={() => setHovered(3)}
          onMouseLeave={() => setHovered(null)}
          className={cn(
            "col-span-2 row-span-2 bg-transparent rounded-lg shadow-md flex items-center justify-center relative overflow-hidden",
            "transition-all duration-300 ease-out will-change-transform ",
            hovered !== null && hovered !== 3 && "blur-[1px] scale-[0.96]"
          )}
        >
          {/* WebM animation */}
          <video
            src="/mixtape.webm"
            autoPlay
            loop
            muted
            playsInline
            onError={(e) => {
              // Helps debug if asset path fails to resolve
              console.error(
                "Failed to load /mixtape.webm",
                e.currentTarget.error
              );
            }}
            className="absolute top-0 left-0 w-full h-full object-contain"
          />

          {/* Spectrum Lottie overlay (position from here) */}
          <div className="absolute left-[25%] top-[50%] 2xl:left-[30%] 2xl:top-[60%] z-10 pointer-events-none select-none w-60 h-44">
            {spectrumData ? (
              <Lottie
                animationData={spectrumData}
                loop
                autoplay
                style={{ width: "100%", height: "100%" }}
              />
            ) : null}
          </div>

          {/* Spotify last played overlay (position from here) */}
          <div className="absolute left-[20%] top-[8.333%] bottom-6">
            <SpotifyLastPlayed />
          </div>

          {/* Overlay example (remove if not needed) */}
          <div className="absolute font-bangers text-[55px] left-0 top-3/4 -translate-y-1/2 -rotate-90 origin-left text-[#D12128] pt-20">
            Mixtape
          </div>
        </div>

        {/* Bottom center */}
        <div
          data-from="down"
          onMouseEnter={() => setHovered(4)}
          onMouseLeave={() => setHovered(null)}
          className={cn(
            "col-span-2 row-span-2 bg-[#01344F] rounded-lg shadow-md flex flex-col items-stretch justify-end p-3 calendar-theme",
            "transition-all duration-300 ease-out will-change-transform -ml-16",
            hovered !== null && hovered !== 4 && "blur-[1px] scale-[0.96]"
          )}
        >
          {/* horizontally scrollable container; default scrolled to the right via useLayoutEffect */}
          <div
            ref={calendarScrollRef}
            className="w-full overflow-x-auto overflow-y-hidden no-scrollbar"
          >
            {/* ensure content has intrinsic width for horizontal scrolling */}
            <div className="inline-block min-w-max">
              <GitHubCalendar
                username="KeEbEe123"
                blockSize={10}
                blockMargin={3}
                fontSize={12}
                hideColorLegend
                transformData={(contributions: any[]) => {
                  const total = contributions.reduce(
                    (sum: number, day: any) => sum + (day?.count || 0),
                    0
                  );
                  // schedule state update after render to avoid setState during render
                  queueMicrotask(() => setTotalContributions(total));
                  return contributions;
                }}
              />
            </div>
          </div>
          {/* custom legend */}
          <div className="mt-2 flex items-center justify-center gap-3 select-none">
            <span className="text-[#FAE3AC] font-figtree text-xs opacity-90">
              Less
            </span>
            <div className="flex items-center gap-1">
              <span
                className="inline-block h-3 w-3 rounded-[2px]"
                style={{ backgroundColor: "#fde7e8" }}
              />
              <span
                className="inline-block h-3 w-3 rounded-[2px]"
                style={{ backgroundColor: "#f8c6c8" }}
              />
              <span
                className="inline-block h-3 w-3 rounded-[2px]"
                style={{ backgroundColor: "#f19497" }}
              />
              <span
                className="inline-block h-3 w-3 rounded-[2px]"
                style={{ backgroundColor: "#e85e66" }}
              />
              <span
                className="inline-block h-3 w-3 rounded-[2px]"
                style={{ backgroundColor: "#d12128" }}
              />
            </div>
            <span className="text-[#FAE3AC] font-figtree text-xs opacity-90">
              More
            </span>
          </div>
          {/* total contributions below */}
          <div className="pt-2 text-center">
            <span className="text-[#FAE3AC] font-figtree text-sm">
              {totalContributions} contributions in the last year
            </span>
          </div>
        </div>

        {/* Socials */}
        <div
          data-from="right"
          onMouseEnter={() => setHovered(5)}
          onMouseLeave={() => setHovered(null)}
          className={cn(
            "col-span-2 row-span-1 bg-[#01344F] rounded-lg shadow-md flex items-center justify-evenly px-6",
            "transition-all duration-300 ease-out will-change-transform",
            hovered !== null && hovered !== 5 && "blur-[1px] scale-[0.96]"
          )}
        >
          <h3 className="text-[#D12128] text-3xl font-marcellus">SOCIALS</h3>
          <i
            className="bi bi-github text-[#D12128] text-6xl mr-2 ml-10"
            aria-hidden="true"
          ></i>
          <i
            className="bi bi-linkedin text-[#D12128] text-6xl mr-2"
            aria-hidden="true"
          ></i>
          <i
            className="bi bi-twitter text-[#D12128] text-6xl mr-2"
            aria-hidden="true"
          ></i>
        </div>
      </div>
    </div>
  );
}
