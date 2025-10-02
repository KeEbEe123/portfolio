"use client";

import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import GlitchSvg from "@/components/glitch-svg";
import GlitchText from "@/components/GlitchText";
import DesktopPage from "./DesktopPage";
import PanelSlider from "@/components/PanelSlider";
import ProjectPlaceholder from "@/components/ProjectPlaceholder";
import MobilePage from "./MobilePage";

export default function Page() {
  const spidermanRef = useRef<HTMLDivElement | null>(null);
  const nameRef = useRef<HTMLDivElement | null>(null);
  const redBoxRef = useRef<HTMLDivElement | null>(null);
  const dragPromptRef = useRef<HTMLDivElement | null>(null);
  const [showName, setShowName] = useState(false);
  const [showDragPrompt, setShowDragPrompt] = useState(false);
  const [glitchEnabled, setGlitchEnabled] = useState(true);
  const [ready, setReady] = useState<null | "desktop" | "mobile">(null);

  useLayoutEffect(() => {
    gsap.registerPlugin(Draggable);

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

    // Step 1: Glitch from Spiderman to Name
    gsap.set(spidermanRef.current, { opacity: 1, scale: 1 });
    gsap.set(nameRef.current, { opacity: 0, scale: 1 });

    const tl = gsap.timeline();

    // Show spiderman for 1 second
    tl.to({}, { duration: 1 });

    // Glitch transition: rapid alternating between spiderman and name
    for (let i = 0; i < 8; i++) {
      tl.to(spidermanRef.current, { opacity: 0, duration: 0.05 })
        .to(nameRef.current, { opacity: 1, duration: 0.05 }, "<")
        .to(spidermanRef.current, { opacity: 1, duration: 0.05 })
        .to(nameRef.current, { opacity: 0, duration: 0.05 }, "<");
    }

    // Final transition to name
    tl.to(spidermanRef.current, { opacity: 0, duration: 0.1 })
      .to(nameRef.current, { opacity: 1, duration: 0.1 }, "<")
      .call(() => {
        setShowName(true);
        setGlitchEnabled(false); // Stop glitch effect when name becomes static
      });

    // Step 2: After 1 second, show drag prompt
    tl.to({}, { duration: 1 }).call(() => setShowDragPrompt(true));

    // Pulse animation for drag prompt
    tl.to(dragPromptRef.current, {
      scale: 1.1,
      duration: 0.8,
      ease: "power1.inOut",
      repeat: -1,
      yoyo: true,
    });

    return () => {
      tl.kill();
      restoreScroll();
    };
  }, []);

  // Separate effect to setup draggable after red box renders
  useLayoutEffect(() => {
    if (!showDragPrompt || !redBoxRef.current) return;

    const restoreScroll = () => {
      document.documentElement.style.overflowY = "";
      document.body.style.overflowY = "";
    };

    // Animate red box sliding up from bottom with fade in
    gsap.fromTo(
      redBoxRef.current,
      { y: window.innerHeight, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power2.out",
      }
    );

    // Setup draggable after a short delay to ensure box is rendered
    const setupTimer = setTimeout(() => {
      if (!redBoxRef.current) return;

      const draggableInstance = Draggable.create(redBoxRef.current, {
        type: "y",
        bounds: { minY: -window.innerHeight, maxY: 0 },
        inertia: true,
        onDrag: function () {
          // Sync name position with drag - progress is how far up we've dragged
          const progress = Math.abs(this.y) / window.innerHeight;
          if (nameRef.current) {
            // Move name from center (0) to top as user drags up
            // this.y is negative when dragging up, so progress increases
            const targetY = progress * (window.innerHeight / 2 - 80); // Move up as progress increases

            // Scale down the name as it moves up
            const startScale = 1;
            const endScale = 0.533; // 100px / 120px = 0.833
            const currentScale =
              startScale - (startScale - endScale) * progress;

            gsap.set(nameRef.current, {
              y: -targetY,
              scale: currentScale,
            });
          }

          // Check if dragged up enough (more than 50% of screen height)
          if (this.y < -window.innerHeight * 0.5) {
            this.disable();

            // Animate name to final navbar position
            const tl = gsap.timeline();

            tl.to(nameRef.current, {
              y: -(window.innerHeight / 2 - 80),
              scale: 0.533,
              duration: 0.4,
              ease: "power2.inOut",
            });

            // Animate red box completely up and fade out
            tl.to(
              redBoxRef.current,
              {
                y: -window.innerHeight,
                duration: 0.4,
                ease: "power2.in",
              },
              0
            );

            tl.call(() => {
              // Decide layout and show content
              const w = window.innerWidth;
              setReady(w > 700 ? "desktop" : "mobile");
              restoreScroll();
            });
          }
        },
        onRelease: function () {
          // If not dragged enough, snap back
          if (this.y > -window.innerHeight * 0.5) {
            gsap.to(redBoxRef.current, {
              y: 0,
              duration: 0.3,
              ease: "power2.out",
            });

            // Reset name to center
            gsap.to(nameRef.current, {
              y: 0,
              scale: 1,
              duration: 0.3,
              ease: "power2.out",
            });
          }
        },
      })[0];

      return () => {
        if (draggableInstance) draggableInstance.kill();
      };
    }, 600);

    return () => clearTimeout(setupTimer);
  }, [showDragPrompt]);

  if (ready === "desktop") return <DesktopPage />;
  if (ready === "mobile") return <MobilePage />;

  // Intro screen with glitch animation and drag interaction
  return (
    <div className="h-[100dvh] bg-[#141414] overflow-hidden relative">
      {/* Spiderman Logo (will glitch out) */}
      <div
        ref={spidermanRef}
        className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
      >
        <GlitchSvg
          glitch={false}
          src="/spiderman.svg"
          alt="Intro SVG"
          enableOnHover={false}
          speed={0.1}
          width={200}
          height={200}
        />
      </div>

      {/* Name (will glitch in and move to navbar) */}
      <div
        ref={nameRef}
        className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
      >
        <h1 className="font-covered text-[120px] text-[#D12128] tracking-wider">
          <GlitchText
            speed={0.3}
            enableShadows={true}
            enableOnHover={false}
            glitchEnabled={glitchEnabled}
          >
            Keertan Kuppili
          </GlitchText>
        </h1>
      </div>

      {/* Drag Prompt (appears after name settles) */}
      {showDragPrompt && (
        <div
          ref={dragPromptRef}
          className="fixed top-[60%] left-1/2 -translate-x-1/2 z-[60] pointer-events-none"
        ></div>
      )}

      {/* Red Draggable Box */}
      {showDragPrompt && (
        <div
          ref={redBoxRef}
          className="fixed bottom-0 left-0 w-full h-32 bg-[#D12128] rounded-t-3xl shadow-2xl z-[55]"
          style={{
            touchAction: "none",
            cursor: "grab",
            willChange: "transform",
            opacity: 0,
          }}
        >
          <div className="flex items-center justify-center h-full pointer-events-none">
            <div className="flex flex-col items-center gap-4">
              <div className="text-[#141414] font-covered text-2xl">
                Drag Up to Enter
              </div>
              <div className="text-[#141414] text-4xl animate-bounce">↑</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
