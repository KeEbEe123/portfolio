import React, { useEffect, useState } from "react";
import "./glitch-svg.css";

interface GlitchSvgProps {
  src: string;
  alt?: string;
  speed?: number;
  enableShadows?: boolean;
  enableOnHover?: boolean;
  glitch?: boolean;
  className?: string;
  width?: number;
  height?: number;
  nameText?: string; // defaults to "keertan kuppili"
}

type Phase = "logo-glitch" | "name-static" | "name-glitch" | "logo-static";

const GlitchSvg: React.FC<GlitchSvgProps> = ({
  src,
  alt = "Glitch SVG",
  speed = 1,
  enableShadows = true,
  enableOnHover = true,
  glitch = false,
  className = "",
  width,
  height,
  nameText = "keertan kuppili",
}) => {
  const [phase, setPhase] = useState<Phase>("logo-static");

  const isGlitching = phase === "logo-glitch" || phase === "name-glitch";
  const showName = phase === "name-static" || phase === "name-glitch";

  // Phase sequence controller
  useEffect(() => {
    if (!glitch) {
      setPhase("logo-static");
      return;
    }

    let cancelled = false;
    const timers: number[] = [];

    const runSequence = () => {
      if (cancelled) return;
      // Desired sequence:
      // 1) logo-static -> 2) logo-glitch -> 3) name-glitch -> 4) name-static ->
      // 5) name-glitch -> 6) logo-glitch -> 7) logo-static -> loop

      // 1) Static logo (brief hold)
      setPhase("logo-static");
      timers.push(
        window.setTimeout(() => {
          if (cancelled) return;
          // 2) Glitch logo ~1s
          setPhase("logo-glitch");
          timers.push(
            window.setTimeout(() => {
              if (cancelled) return;
              // 3) Glitch name ~1s
              setPhase("name-glitch");
              timers.push(
                window.setTimeout(() => {
                  if (cancelled) return;
                  // 4) Static name ~0.5s
                  setPhase("name-static");
                  timers.push(
                    window.setTimeout(() => {
                      if (cancelled) return;
                      // 5) Glitch name ~1s
                      setPhase("name-glitch");
                      timers.push(
                        window.setTimeout(() => {
                          if (cancelled) return;
                          // 6) Glitch logo ~1s
                          setPhase("logo-glitch");
                          timers.push(
                            window.setTimeout(() => {
                              if (cancelled) return;
                              // 7) Static logo (end + loop)
                              setPhase("logo-static");
                              timers.push(
                                window.setTimeout(() => {
                                  if (cancelled) return;
                                  runSequence();
                                }, 200) // short settle before looping
                              );
                            }, 200)
                          );
                        }, 300)
                      );
                    }, 500)
                  );
                }, 300)
              );
            }, 200)
          );
        }, 1000)
      );
    };

    runSequence();

    return () => {
      cancelled = true;
      timers.forEach((t) => clearTimeout(t));
      setPhase("logo-static");
    };
  }, [glitch]);

  // During glitching, force fast durations; otherwise use provided speed
  const inlineStyles = {
    "--after-duration": isGlitching ? `0.1s` : `${speed * 3}s`,
    "--before-duration": isGlitching ? `0.1s` : `${speed * 2}s`,
    "--after-filter": enableShadows ? "drop-shadow(-5px 0 purple)" : "none",
    "--before-filter": enableShadows ? "drop-shadow(5px 0 cyan)" : "none",
  } as React.CSSProperties;

  const hoverClass = enableOnHover ? "enable-on-hover" : "";
  const activeClass = isGlitching ? "active-glitch" : "";

  return (
    <div
      className={`glitch-svg ${hoverClass} ${activeClass} ${className}`}
      style={inlineStyles}
    >
      {showName ? (
        <>
          <span className="glitch-svg-main glitch-text" aria-label={nameText}>
            {nameText}
          </span>
          <span className="glitch-svg-before glitch-text" aria-hidden="true">
            {nameText}
          </span>
          <span className="glitch-svg-after glitch-text" aria-hidden="true">
            {nameText}
          </span>
        </>
      ) : (
        <>
          <img
            src={src || "/placeholder.svg"}
            alt={alt}
            width={width}
            height={height}
            className="glitch-svg-main"
          />
          <img
            src={src || "/placeholder.svg"}
            alt=""
            width={width}
            height={height}
            className="glitch-svg-before"
            aria-hidden="true"
          />
          <img
            src={src || "/placeholder.svg"}
            alt=""
            width={width}
            height={height}
            className="glitch-svg-after"
            aria-hidden="true"
          />
        </>
      )}
    </div>
  );
};

export default GlitchSvg;
