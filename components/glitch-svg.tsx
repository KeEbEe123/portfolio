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
}

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
}) => {
  const [isGlitching, setIsGlitching] = useState(false);

  // Manage the timed glitch loop when `glitch` is enabled
  useEffect(() => {
    if (!glitch) {
      setIsGlitching(false);
      return;
    }

    let cancelled = false;
    const timers: number[] = [];

    const runCycle = () => {
      if (cancelled) return;
      // Glitch for 1s
      setIsGlitching(true);
      timers.push(
        window.setTimeout(() => {
          if (cancelled) return;
          // Pause for 2s
          setIsGlitching(false);
          timers.push(
            window.setTimeout(() => {
              if (cancelled) return;
              // Glitch for 1s
              setIsGlitching(true);
              timers.push(
                window.setTimeout(() => {
                  if (cancelled) return;
                  // Pause for 1s then loop
                  setIsGlitching(false);
                  timers.push(
                    window.setTimeout(() => {
                      if (cancelled) return;
                      runCycle();
                    }, 1000)
                  );
                }, 300)
              );
            }, 2000)
          );
        }, 1000)
      );
    };

    runCycle();

    return () => {
      cancelled = true;
      timers.forEach((t) => clearTimeout(t));
      setIsGlitching(false);
    };
  }, [glitch]);

  // During glitching, force 0.1s durations; otherwise use provided speed
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
    </div>
  );
};

export default GlitchSvg;
