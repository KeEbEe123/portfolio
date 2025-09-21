import type React from "react";
import "./glitch-me.css";

interface GlitchMeProps {
  speed?: number;
  enableShadows?: boolean;
  enableOnHover?: boolean;
  className?: string;
  width?: number;
  height?: number;
}

const GlitchMe: React.FC<GlitchMeProps> = ({
  speed = 1,
  enableShadows = true,
  enableOnHover = true,
  className = "",
  width = 200,
  height = 200,
}) => {
  const inlineStyles = {
    "--after-duration": `${speed * 3}s`,
    "--before-duration": `${speed * 2}s`,
    "--after-filter": enableShadows ? "drop-shadow(-5px 0 purple)" : "none",
    "--before-filter": enableShadows ? "drop-shadow(5px 0 cyan)" : "none",
  } as React.CSSProperties;

  const hoverClass = enableOnHover ? "enable-on-hover" : "";

  return (
    <div
      className={`glitch-me ${hoverClass} ${className}`}
      style={inlineStyles}
    >
      <img
        src="/me.svg"
        alt="Me - Glitch Effect"
        width={width}
        height={height}
        className="glitch-me-main"
      />
      <img
        src="/me.svg"
        alt=""
        width={width}
        height={height}
        className="glitch-me-before"
        aria-hidden="true"
      />
      <img
        src="/me.svg"
        alt=""
        width={width}
        height={height}
        className="glitch-me-after"
        aria-hidden="true"
      />
    </div>
  );
};

export default GlitchMe;
