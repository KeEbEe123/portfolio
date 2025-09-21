"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

type Recent = {
  trackName: string;
  artistName: string;
  imageUrl?: string;
  trackUrl?: string;
  playedAt?: string | null;
};

export default function SpotifyLastPlayed() {
  const [data, setData] = useState<Recent | null>(null);
  const [loading, setLoading] = useState(true);

  // internal scroll state
  const [isScrolling, setIsScrolling] = useState(false);
  const [duration, setDuration] = useState(10); // seconds (computed)

  const containerRef = useRef<HTMLDivElement | null>(null); // visible clip area
  const singleRef = useRef<HTMLSpanElement | null>(null); // the text element

  // fetch recent track (your existing API)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/spotify/recent", { cache: "no-store" });
        if (!res.ok) throw new Error(await res.text());
        const j = await res.json();
        setData(j);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // scroll back-and-forth animation logic
  useEffect(() => {
    if (loading || !data?.trackName) return;

    const container = containerRef.current;
    if (!container) return;

    let measureTimeout: NodeJS.Timeout | null = null;

    const measure = () => {
      // Clear any pending measurements to prevent conflicts
      if (measureTimeout) {
        clearTimeout(measureTimeout);
        measureTimeout = null;
      }

      // Create a temporary element to measure the text width accurately
      const temp = document.createElement("span");
      temp.style.cssText = `
        position: absolute;
        visibility: hidden;
        height: auto;
        width: auto;
        white-space: nowrap;
        font-family: inherit;
        font-size: inherit;
        font-weight: inherit;
        line-height: inherit;
      `;
      temp.textContent = data.trackName;
      container.appendChild(temp);

      const containerW = container.clientWidth;
      const textW = temp.offsetWidth;

      // Clean up temp element
      container.removeChild(temp);

      console.log(`Container: ${containerW}px, Text: ${textW}px`);

      const need = textW > containerW - 10; // Small buffer

      // Only update state if it actually changed to prevent unnecessary re-renders
      setIsScrolling((prev) => {
        if (prev !== need) {
          if (need) {
            // Calculate how far the text needs to move to show the hidden part
            const scrollDistance = textW - containerW + 20; // Extra padding
            // Duration based on distance - slower for longer text
            const computed = Math.max(2, scrollDistance / 30); // 30px per second
            setDuration(computed);
            console.log(
              `Scroll needed! Distance: ${scrollDistance}px, Duration: ${computed}s`
            );
          } else {
            console.log("No scroll needed");
          }
          return need;
        }
        return prev;
      });
    };

    // Single measurement with one delayed retry for font loading
    measure();
    measureTimeout = setTimeout(measure, 100);

    const ro = new ResizeObserver(() => {
      // Debounce resize measurements
      if (measureTimeout) clearTimeout(measureTimeout);
      measureTimeout = setTimeout(measure, 50);
    });
    ro.observe(container);

    const handleResize = () => {
      if (measureTimeout) clearTimeout(measureTimeout);
      measureTimeout = setTimeout(measure, 50);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      if (measureTimeout) clearTimeout(measureTimeout);
      ro.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, [data?.trackName, loading]);

  return (
    <div className="select-none flex items-center gap-4 2xl:mt-2">
      {/* Album art */}
      <div className="relative h-10 w-10 2xl:h-12 2xl:w-12 rounded-lg bg-red-600 overflow-hidden">
        {data?.imageUrl ? (
          <Image
            src={data.imageUrl}
            alt={data.trackName ?? "Album art"}
            fill
            className="object-cover"
            sizes="80px"
            priority
          />
        ) : null}
      </div>

      {/* Text block */}
      <div className="flex min-w-0 flex-col">
        <div
          ref={containerRef}
          className="relative w-[140px] 2xl:w-[200px] text-xl 2xl:text-2xl font-figtree -mb-2 font-semibold leading-7 text-[#FAE3AC] drop-shadow-[0_1px_1px_rgba(0,0,0,0.7)] overflow-hidden"
          aria-live="polite"
        >
          {loading ? (
            <span>—</span>
          ) : !data?.trackName ? (
            <span>—</span>
          ) : isScrolling ? (
            <div className="scroll-container">
              <span
                ref={singleRef}
                className="scroll-text"
                style={{
                  animation: `scroll ${duration}s ease-in-out infinite alternate`,
                }}
              >
                {data.trackName}
              </span>
            </div>
          ) : (
            <span
              ref={singleRef}
              className="truncate inline-block max-w-full align-bottom whitespace-nowrap"
            >
              {data?.trackName || "No recent track"}
            </span>
          )}
        </div>

        <div className="text-xs 2xl:text-sm font-figtree leading-7 truncate text-[#FAE3AC] drop-shadow-[0_1px_1px_rgba(0,0,0,0.7)]">
          {loading ? "" : data?.artistName || ""}
        </div>
      </div>

      <style jsx>{`
        .scroll-container {
          width: 100%;
          overflow: hidden;
          white-space: nowrap;
        }

        .scroll-text {
          display: inline-block;
          white-space: nowrap;
          will-change: transform;
        }

        .scroll-container:hover .scroll-text {
          animation-play-state: paused;
        }

        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-100% + 140px - 10px));
          }
        }
      `}</style>
    </div>
  );
}
