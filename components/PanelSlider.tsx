"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";

// A full-screen panel slider that:
// - Treats each child as a full-screen panel
// - On scroll/swipe/arrow key, slides current panel out and next panel in
// - Animates any elements inside each panel that have data-from="left|right|up|down"
// - If a panel doesn't use data-from, it will be cross-faded
//
// Usage:
// <PanelSlider>
//   <YourPanel1 />
//   <YourPanel2 />
// </PanelSlider>
//
// Note: If your panel also runs its own intro animation, that's fine. PanelSlider
// only runs transitions when navigating between panels.

export type PanelSliderProps = {
  children: React.ReactNode | React.ReactNode[];
  duration?: number; // duration for in/out animations
  ease?: string; // gsap ease
  wheelThreshold?: number; // deltaY threshold to trigger navigation
};

export default function PanelSlider({
  children,
  duration = 0.9,
  ease = "power3.inOut",
  wheelThreshold = 12,
}: PanelSliderProps) {
  const slides = useMemo(
    () => (Array.isArray(children) ? children : [children]).filter(Boolean) as React.ReactNode[],
    [children]
  );

  const [index, setIndex] = useState(0);
  const indexRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  panelRefs.current = [];

  const setPanelRef = (el: HTMLDivElement | null) => {
    panelRefs.current.push(el);
  };

  const getOffsetForDir = (dir: string) => {
    switch (dir) {
      case "left":
        return { x: "-100%", y: "0%" };
      case "right":
        return { x: "100%", y: "0%" };
      case "up":
        return { x: "0%", y: "-100%" };
      case "down":
        return { x: "0%", y: "100%" };
      default:
        return { x: "0%", y: "0%" };
    }
  };

  const getOppositeDir = (dir: string) => {
    switch (dir) {
      case "left":
        return "right";
      case "right":
        return "left";
      case "up":
        return "down";
      case "down":
        return "up";
      default:
        return "down";
    }
  };

  const animateOut = (panel: HTMLElement) => {
    const items = panel.querySelectorAll<HTMLElement>("[data-from]");
    if (items.length === 0) {
      // Fallback: cross-fade panel out
      return gsap.to(panel, { autoAlpha: 0, duration: duration * 0.8, ease });
    }

    const tl = gsap.timeline();
    items.forEach((el, i) => {
      const fromDir = (el.dataset.from || "down").toLowerCase();
      const outDir = getOppositeDir(fromDir);
      const to = getOffsetForDir(outDir);
      tl.to(
        el,
        {
          x: to.x,
          y: to.y,
          autoAlpha: 0,
          duration,
          ease,
        },
        i * 0.06
      );
    });
    // Fade the whole panel later so the user can see elements slide out first
    tl.to(panel, { autoAlpha: 0, duration: duration * 0.5, ease }, duration * 0.5);
    return tl;
  };

  const animateIn = (panel: HTMLElement) => {
    const items = panel.querySelectorAll<HTMLElement>("[data-from]");
    if (items.length === 0) {
      gsap.set(panel, { autoAlpha: 0 });
      return gsap.to(panel, { autoAlpha: 1, duration: duration * 0.8, ease });
    }

    // Prepare items from their entrance direction
    items.forEach((el) => {
      const fromDir = (el.dataset.from || "down").toLowerCase();
      const from = getOffsetForDir(fromDir);
      gsap.set(el, { x: from.x, y: from.y, autoAlpha: 0 });
    });

    const tl = gsap.timeline();
    items.forEach((el, i) => {
      tl.to(
        el,
        {
          x: 0,
          y: 0,
          autoAlpha: 1,
          duration,
          ease,
          clearProps: "transform",
        },
        i * 0.06
      );
    });
    // And show the panel
    tl.set(panel, { autoAlpha: 1 }, 0);
    return tl;
  };

  const goTo = useCallback(
    (next: number) => {
      if (isAnimatingRef.current) return;
      const current = indexRef.current;
      if (next < 0 || next >= slides.length) return;
      if (next === current) return;

      const currentPanel = panelRefs.current[current];
      const nextPanel = panelRefs.current[next];
      if (!currentPanel || !nextPanel) return;

      isAnimatingRef.current = true;

      // Layering: current above next so we can see its elements fly out
      gsap.set(currentPanel, { zIndex: 3 });
      gsap.set(nextPanel, { autoAlpha: 1, zIndex: 2 });

      const outTl = animateOut(currentPanel);
      const inTl = animateIn(nextPanel);

      // Overlap the timelines slightly for a more fluid feel
      const master = gsap.timeline({
        onComplete: () => {
          // Hide the old panel to avoid tab traps and pointer events
          gsap.set(currentPanel, { autoAlpha: 0, zIndex: 1 });
          gsap.set(nextPanel, { zIndex: 2 });
          isAnimatingRef.current = false;
          indexRef.current = next;
          setIndex(next);
        },
      });
      master.add(outTl, 0).add(inTl, duration * 0.2);
    },
    [duration, ease, slides.length]
  );

  // Wheel handling with accumulator to support small trackpad deltas
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let acc = 0;
    let timeout: number | null = null;

    const reset = () => {
      acc = 0;
      if (timeout) {
        window.clearTimeout(timeout);
        timeout = null;
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (isAnimatingRef.current) return;
      e.preventDefault();
      acc += e.deltaY;

      // Reset accumulator if the user pauses for a bit
      if (timeout) window.clearTimeout(timeout);
      timeout = window.setTimeout(reset, 220);

      if (Math.abs(acc) >= wheelThreshold) {
        const dir = acc > 0 ? 1 : -1;
        reset();
        goTo(indexRef.current + dir);
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel as any);
      window.removeEventListener("wheel", onWheel as any);
      if (timeout) window.clearTimeout(timeout);
    };
  }, [goTo, wheelThreshold]);

  // Keyboard arrows/PageUp/PageDown
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isAnimatingRef.current) return;
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        goTo(indexRef.current + 1);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        goTo(indexRef.current - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goTo]);

  // Touch swipe
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let startY = 0;
    let endY = 0;

    const onTouchStart = (e: TouchEvent) => {
      startY = e.touches[0]?.clientY ?? 0;
      endY = startY;
    };
    const onTouchMove = (e: TouchEvent) => {
      endY = e.touches[0]?.clientY ?? endY;
    };
    const onTouchEnd = () => {
      const dy = startY - endY;
      if (Math.abs(dy) > 50) {
        if (dy > 0) goTo(indexRef.current + 1);
        else goTo(indexRef.current - 1);
      }
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [goTo]);

  // Ensure only current panel is fully interactive
  useEffect(() => {
    panelRefs.current.forEach((panel, i) => {
      if (!panel) return;
      const active = i === index;
      panel.style.pointerEvents = active ? "auto" : "none";
      panel.style.zIndex = String(active ? 2 : 1);
    });
  }, [index, slides.length]);

  return (
    <div
      ref={containerRef}
      className="relative h-[100dvh] w-full overflow-hidden bg-[#141414]"
    >
      {slides.map((child, i) => (
        <div
          key={i}
          ref={setPanelRef}
          className="absolute inset-0"
          style={{
            willChange: "transform, opacity",
            opacity: i === 0 ? 1 : 0,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
