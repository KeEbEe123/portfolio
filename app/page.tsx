"use client";

import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import GlitchSvg from "@/components/glitch-svg";
import DesktopPage from "./DesktopPage";
import MobilePage from "./MobilePage";

export default function Page() {
  const spidermanRef = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState<null | "desktop" | "mobile">(null);

  useLayoutEffect(() => {
    // Play intro animation, then decide which layout to render by viewport width
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflowY;
    const prevBody = body.style.overflowY;
    html.style.overflowY = "hidden";
    body.style.overflowY = "hidden";

    const restoreScroll = () => {
      html.style.overflowY = prevHtml;
      body.style.overflowY = prevBody;
    };

    // Initialize spiderman
    gsap.set(spidermanRef.current, { opacity: 1, scale: 1 });

    const tl = gsap.timeline({ defaults: { ease: "expo.inOut" } });
    // Hold on screen a bit, then scale/fade out
    tl.to(spidermanRef.current, {
      scale: 6,
      opacity: 0,
      duration: 2,
      delay: 2,
    });

    tl.call(() => {
      // Decide at the end of the animation based on current viewport
      const w = window.innerWidth;
      setReady(w > 700 ? "desktop" : "mobile");
      restoreScroll();
    });

    return () => {
      tl.kill();
      restoreScroll();
    };
  }, []);

  if (ready === "desktop") return <DesktopPage />;
  if (ready === "mobile") return <MobilePage />;

  // Intro screen while animation plays
  return (
    <div className="h-[100dvh] bg-[#141414] overflow-hidden">
      <div
        ref={spidermanRef}
        className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none text-red-500"
      >
        <GlitchSvg
          glitch={true}
          src="/spiderman.svg"
          alt="Intro SVG"
          enableOnHover={false}
          speed={0.1}
          width={200}
          height={200}
        />
      </div>
    </div>
  );
}
