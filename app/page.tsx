"use client";

import Image from "next/image";
import { useState, useLayoutEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import GitHubCalendar from "react-github-calendar";
import me from "../public/images/me.png";
import GlitchText from "@/components/GlitchText";

import SplitText from "gsap/SplitText"; // ✅ requires GSAP bonus plugin

export default function Home() {
  const aboutTextRef = useRef<HTMLParagraphElement | null>(null);
  const splitRef = useRef<any>(null); // holds the SplitText instance between replays
  const [hovered, setHovered] = useState<number | null>(null);
  const calendarScrollRef = useRef<HTMLDivElement | null>(null);
  const [totalContributions, setTotalContributions] = useState<number>(0);
  const navbarRef = useRef<HTMLDivElement | null>(null);
  const photoRef = useRef<HTMLDivElement | null>(null);

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

      gsap.set(boxes, { opacity: 0 });
      gsap.set(navbarRef.current, { opacity: 0, y: -100 });
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
      tl.to(navbarRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.5,
      });

      // Step 2: Boxes with stagger
      tl.fromTo(
        boxes,
        {
          opacity: 0,
          x: (i, el) =>
            el.dataset.from === "left"
              ? "-100%"
              : el.dataset.from === "right"
              ? "100%"
              : "0",
          y: (i, el) =>
            el.dataset.from === "up"
              ? "-100%"
              : el.dataset.from === "down"
              ? "100%"
              : "0",
        },
        {
          x: 0,
          y: 0,
          opacity: 1,
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
    <div className="h-[100dvh] bg-[#FAE3AC] p-4 overflow-x-hidden overscroll-none">
      {/* Make the grid fill the padded area exactly */}
      <div
        // data-from="up"
        className="grid h-full w-full gap-4 grid-cols-6 grid-rows-6 overflow-hidden"
      >
        {/* Header (no hover effects) */}
        <div
          ref={navbarRef}
          className="col-span-6 row-span-1 bg-[#01344F] rounded-lg shadow-md flex items-center justify-between px-8"
        >
          <h1 className="font-bangers text-[#D12128] text-[100px] tracking-wider">
            <GlitchText
              speed={0.1}
              enableShadows={true}
              enableOnHover={true}
              className="leading-none"
            >
              KEERTAN KUPPILI
            </GlitchText>
          </h1>
          <nav className="flex gap-8">
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
          // ref={photoRef}
          data-from="right"
          onMouseEnter={() => setHovered(2)}
          onMouseLeave={() => setHovered(null)}
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
