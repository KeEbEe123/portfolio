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
import SplitText from "gsap/SplitText";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
interface Project {
  id: string;
  title: string;
  description: string;
  stack: string[];
  imageGallery: string[];
  learnings: string[];
  urls: {
    github: string;
    live: string;
  };
}

export default function Home() {
  const aboutTextRef = useRef<HTMLParagraphElement | null>(null);
  const splitRef = useRef<any>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const calendarScrollRef = useRef<HTMLDivElement | null>(null);
  const [totalContributions, setTotalContributions] = useState<number>(0);
  const navbarRef = useRef<HTMLDivElement | null>(null);
  const [spectrumData, setSpectrumData] = useState<any | null>(null);
  const photoRef = useRef<HTMLDivElement | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const myNameRef = useRef<HTMLDivElement | null>(null);
  const projectNameRef = useRef<HTMLDivElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const nameCardRef = useRef<HTMLDivElement | null>(null);
  const [projectNameGlitch, setProjectNameGlitch] = useState(false);
  const projectsScrollRef = useRef<HTMLDivElement | null>(null);
  const learningsScrollRef = useRef<HTMLDivElement | null>(null);
  const [showProjectsArrow, setShowProjectsArrow] = useState(true);
  const [showLearningsArrow, setShowLearningsArrow] = useState(false);

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

    const walk = (node: any) => {
      if (!node) return;
      if (Array.isArray(node)) {
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
          if (key === "k" && isColorArray(val)) {
            const alpha = val[3];
            (node as any)[key] = [r, g, b, alpha];
            continue;
          }
          walk(val);
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
      gsap.set(boxes, { autoAlpha: 1 });

      if (aboutTextRef.current) {
        splitRef.current = new SplitText(aboutTextRef.current, {
          type: "words",
        });
        gsap.set(splitRef.current.words, { opacity: 0, y: 150 });
      }

      const tl = gsap.timeline({
        defaults: { duration: 1, ease: "power3.out" },
        onComplete: restoreScroll,
      });

      tl.set(rootRef.current, { visibility: "visible" });

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

      if (splitRef.current) {
        tl.to(splitRef.current.words, {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: "power4.out",
          stagger: 0.04,
        });
      }
    });

    return () => {
      ctx.revert();
      if (splitRef.current?.revert) splitRef.current.revert();
    };
  }, []);

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

    fetch("/projects.json")
      .then((r) =>
        r.ok
          ? r.json()
          : Promise.reject(new Error("Failed to load projects.json"))
      )
      .then((data) => {
        if (mounted) {
          setProjects(data);
        }
      })
      .catch((e) => console.error(e));

    return () => {
      mounted = false;
    };
  }, []);

  const animateBoxesOut = (onComplete: () => void) => {
    const boxes = gsap.utils.toArray<HTMLElement>("[data-from]");
    const tl = gsap.timeline({ onComplete });

    boxes.forEach((box) => {
      // Skip the projects box
      if (box === photoRef.current) return;

      const from = box.dataset.from || "down";
      const to = {
        left: "-100%",
        right: "100%",
        up: "-200%",
        down: "100%",
      }[from];

      tl.to(
        box,
        {
          [from === "left" || from === "right" ? "x" : "y"]: to,
          autoAlpha: 0,
          duration: 0.6,
          ease: "power2.in",
        },
        0
      );
    });

    return tl;
  };

  const animateBoxesIn = () => {
    const boxes = gsap.utils.toArray<HTMLElement>("[data-from]");
    const tl = gsap.timeline();

    boxes.forEach((box) => {
      // Skip the projects box
      if (box === photoRef.current) return;

      const from = box.dataset.from || "down";
      const start = {
        left: "-100%",
        right: "100%",
        up: "-200%",
        down: "100%",
      }[from];

      tl.fromTo(
        box,
        {
          [from === "left" || from === "right" ? "x" : "y"]: start,
          autoAlpha: 0,
        },
        {
          x: 0,
          y: 0,
          autoAlpha: 1,
          duration: 0.6,
          ease: "power2.out",
          clearProps: "transform",
        },
        0.1
      );
    });

    return tl;
  };

  const handleProjectClick = (projectId: string) => {
    if (selectedProject === projectId) return;

    const project = projects.find((p) => p.id === projectId);
    if (!project) return;

    const thumbnailId = `project-${projectId}-thumb`;
    const newThumbnail = document.getElementById(thumbnailId);
    if (!newThumbnail) return;

    if (selectedProject) {
      // Animate previous project's title and arrow back in
      const prevTitleId = `project-${selectedProject}-title`;
      const prevArrowId = `project-${selectedProject}-arrow`;
      const prevTitle = document.getElementById(prevTitleId);
      const prevArrow = document.getElementById(prevArrowId);
      const prevNowViewingId = `project-${selectedProject}-nowviewing`;
      const prevNowViewing = document.getElementById(prevNowViewingId);
      const prevThumbnailImgId = `project-${selectedProject}-thumb-img`;
      const prevThumbnailImg = document.getElementById(prevThumbnailImgId);

      const tl = gsap.timeline();

      // Fade out the NOW VIEWING text first
      if (prevNowViewing) {
        tl.to(prevNowViewing, {
          opacity: 0,
          duration: 0.3,
          ease: "power2.in",
        });
      }

      // Shrink previous thumbnail and fade in image
      const prevThumbnailId = `project-${selectedProject}-thumb`;
      const prevThumbnail = document.getElementById(prevThumbnailId);
      if (prevThumbnail) {
        tl.to(
          prevThumbnail,
          {
            width: "144px",
            duration: 1,
            ease: "power2.inOut",
          },
          0.3
        );
      }

      // Fade in the thumbnail image
      if (prevThumbnailImg) {
        tl.fromTo(
          prevThumbnailImg,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.4,
            ease: "power2.out",
          },
          0.6
        );
      }

      // Fade in previous title and arrow
      if (prevTitle && prevArrow) {
        tl.fromTo(
          [prevTitle, prevArrow],
          { opacity: 0, x: -20 },
          {
            opacity: 1,
            x: 0,
            duration: 1,
            ease: "power2.out",
          },
          0.5
        );
      }
    }

    // Expand new thumbnail and hide its title/arrow
    const newTitleId = `project-${projectId}-title`;
    const newArrowId = `project-${projectId}-arrow`;
    const newTitle = document.getElementById(newTitleId);
    const newArrow = document.getElementById(newArrowId);
    const newThumbnailImgId = `project-${projectId}-thumb-img`;
    const newThumbnailImg = document.getElementById(newThumbnailImgId);
    const newNowViewingId = `project-${projectId}-nowviewing`;
    const newNowViewing = document.getElementById(newNowViewingId);

    const expandTl = gsap.timeline();

    // Fade out new title and arrow first
    if (newTitle && newArrow) {
      expandTl.to([newTitle, newArrow], {
        opacity: 0,
        x: 20,
        duration: 0.3,
        ease: "power2.in",
      });
    }

    // Fade out the thumbnail image
    if (newThumbnailImg) {
      expandTl.to(
        newThumbnailImg,
        {
          opacity: 0,
          duration: 0.3,
          ease: "power2.in",
        },
        0
      );
    }

    // Then expand thumbnail
    expandTl.to(
      newThumbnail,
      {
        width: "100%",
        duration: 0.4,
        ease: "power2.inOut",
      },
      0.15
    );

    // Fade in NOW VIEWING text
    if (newNowViewing) {
      expandTl.fromTo(
        newNowViewing,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.4,
          ease: "power2.out",
        },
        0.35
      );
    }

    const tl = gsap.timeline();

    if (!selectedProject) {
      // First project selection - move name to left by wrapping content in container
      if (myNameRef.current) {
        // Create a wrapper div temporarily or animate the navbar's padding
        const navbarWidth = navbarRef.current?.offsetWidth || 0;
        const nameWidth = myNameRef.current.offsetWidth || 0;
        const shift = navbarWidth / 2 - nameWidth / 2 - 32; // 32px for left padding

        tl.to(myNameRef.current, {
          x: -shift,
          duration: 0.5,
          ease: "power2.inOut",
        });
      }

      if (projectNameRef.current) {
        gsap.set(projectNameRef.current, { opacity: 0, y: 50 });
        tl.to(
          projectNameRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "power2.inOut",
          },
          0
        );
      }

      // Animate boxes out and then in with new content
      animateBoxesOut(() => {
        setCurrentProject(project);
        setSelectedProject(projectId);
        animateBoxesIn();
      });
    } else {
      // Switching between projects - glitch transformation effect
      if (projectNameRef.current) {
        // Start glitching the old name
        setProjectNameGlitch(true);

        // After glitch effect (0.5s), switch to new name and glitch it
        setTimeout(() => {
          setCurrentProject(project);
          setSelectedProject(projectId);

          // Continue glitching the new name for a bit
          setTimeout(() => {
            setProjectNameGlitch(false);
          }, 500);
        }, 500);

        // Animate boxes
        animateBoxesOut(() => {
          animateBoxesIn();
        });
      }
    }
  };

  const handleNameClick = () => {
    if (!selectedProject) return;

    // Store the current selected project ID before animations
    const currentSelectedId = selectedProject;

    const nowViewing = document.getElementById(
      `project-${currentSelectedId}-nowviewing`
    );
    const thumb = document.getElementById(
      `project-${currentSelectedId}-thumb`
    );
    const thumbImg = document.getElementById(
      `project-${currentSelectedId}-thumb-img`
    );
    const titleContainer = document.getElementById(
      `project-${currentSelectedId}-title`
    );

    const tl = gsap.timeline();

    // Fade out the NOW VIEWING text first
    if (nowViewing) {
      tl.to(nowViewing, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
      });
    }

    // Shrink thumbnail
    if (thumb) {
      tl.to(
        thumb,
        {
          width: "144px",
          duration: 1,
          ease: "power2.inOut",
        },
        0.3
      );
    }

    // Fade in the thumbnail image
    if (thumbImg) {
      tl.fromTo(
        thumbImg,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.4,
          ease: "power2.out",
        },
        0.6
      );
    }

    // Set display and fade in title/arrow after state will be cleared
    if (titleContainer) {
      tl.call(() => {
        // This runs during the timeline, setting display before fade
        gsap.set(titleContainer, { display: "flex" });
      });
      tl.fromTo(
        titleContainer,
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration: 1,
          ease: "power2.out",
        },
        0.5
      );
    }

    // Animate navbar back to center
    if (myNameRef.current) {
      gsap.to(myNameRef.current, {
        x: 0,
        duration: 0.5,
        ease: "power2.inOut",
      });
    }

    // Hide project name
    if (projectNameRef.current) {
      gsap.to(projectNameRef.current, {
        opacity: 0,
        y: 50,
        duration: 0.5,
        ease: "power2.inOut",
      });
    }

    // Animate boxes out, THEN update state, THEN animate boxes in
    animateBoxesOut(() => {
      // Clear state AFTER boxes animate out
      setCurrentProject(null);
      setSelectedProject(null);

      // Wait for React to re-render with new content
      setTimeout(() => {
        animateBoxesIn();
      }, 100);
    });
  };

  useLayoutEffect(() => {
    const el = calendarScrollRef.current;
    if (!el) return;
    const toRight = () => {
      el.scrollLeft = el.scrollWidth;
    };
    toRight();
    const id = requestAnimationFrame(toRight);
    return () => cancelAnimationFrame(id);
  }, []);

  // Handle scroll indicators for Projects box
  useEffect(() => {
    const projectsEl = projectsScrollRef.current;
    if (!projectsEl) return;

    const handleScroll = () => {
      const isAtBottom =
        projectsEl.scrollHeight - projectsEl.scrollTop <=
        projectsEl.clientHeight + 10;
      setShowProjectsArrow(!isAtBottom);
    };

    // Check initial state
    const hasScroll = projectsEl.scrollHeight > projectsEl.clientHeight;
    setShowProjectsArrow(hasScroll);

    projectsEl.addEventListener("scroll", handleScroll);
    return () => projectsEl.removeEventListener("scroll", handleScroll);
  }, [projects]);

  // Handle scroll indicators for Learnings box
  useEffect(() => {
    const learningsEl = learningsScrollRef.current;
    if (!learningsEl || !currentProject) return;

    const handleScroll = () => {
      const isAtBottom =
        learningsEl.scrollHeight - learningsEl.scrollTop <=
        learningsEl.clientHeight + 10;
      setShowLearningsArrow(!isAtBottom);
    };

    // Check initial state
    const hasScroll = learningsEl.scrollHeight > learningsEl.clientHeight;
    setShowLearningsArrow(hasScroll);

    learningsEl.addEventListener("scroll", handleScroll);
    return () => learningsEl.removeEventListener("scroll", handleScroll);
  }, [currentProject]);

  return (
    <div className="h-[100dvh] bg-[#141414] p-4 overflow-x-hidden overflow-y-hidden">
      <div
        ref={nameCardRef}
        className="fixed top-0 left-0 z-[60] pointer-events-none opacity-0"
        style={{ willChange: "transform, opacity" }}
      >
        <Image src="/namecard.png" alt="Name card" width={250} height={250} />
      </div>

      <div
        ref={rootRef}
        className="grid h-full w-full gap-4 grid-cols-6 grid-rows-6 overflow-hidden invisible"
      >
        {/* Header */}
        <div
          ref={navbarRef}
          className="col-span-6 row-span-1 bg-transparent rounded-lg flex items-center px-8 relative overflow-hidden z-[100]"
          style={{ justifyContent: "center" }}
        >
          <div
            ref={myNameRef}
            className="flex-shrink-0 cursor-pointer"
            onClick={handleNameClick}
          >
            <h1 className="font-covered text-[#D12128] text-[70px] tracking-wider">
              <GlitchText
                speed={0.1}
                enableShadows={true}
                enableOnHover={true}
                className="leading-none"
              >
                Keertan Kuppili
              </GlitchText>
            </h1>
          </div>
          <div ref={projectNameRef} className="absolute right-8 opacity-0">
            <h2 className="font-covered text-[#D12128] text-[100px] tracking-wider">
              <GlitchText
                speed={0.1}
                enableShadows={true}
                enableOnHover={false}
                glitchEnabled={projectNameGlitch}
              >
                {projects.find((p) => p.id === selectedProject)?.title || ""}
              </GlitchText>
            </h2>
          </div>
        </div>

        {/* About Me / Project Description */}
        <div
          data-from="left"
          className="col-span-3 row-span-3 bg-transparent border-2 border-[#D12128] rounded-lg shadow-md flex flex-col p-6"
        >
          <div className="flex-1 flex flex-col">
            <h2 className="text-[#D12128] text-4xl font-covered mb-4">
              {currentProject ? "README.MD" : "About Me"}
            </h2>
            <div className="relative flex-1 overflow-hidden">
              <p
                ref={aboutTextRef}
                className="text-[#D12128] text-xl font-figtree font-extralight leading-relaxed opacity-100"
              >
                {currentProject
                  ? currentProject.description
                  : "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer a tristique urna. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Aliquam erat volutpat. Donec fermentum efficitur justo, vitae interdum metus vehicula a. Curabitur non lorem sed arcu feugiat euismod."}
              </p>
            </div>
          </div>
        </div>

        {/* Center box - Photo / Stack */}
        <div
          data-from="up"
          className="col-span-1 row-span-3 bg-transparent border-2 border-[#D12128] rounded-lg shadow-md flex items-center justify-center overflow-hidden"
        >
          {currentProject ? (
            <div className="flex flex-col items-center justify-center p-4 w-full h-full">
              {/* <h3 className="text-[#D12128] font-covered text-3xl mb-6">
                STACK
              </h3> */}
              <div className="grid grid-cols-3 gap-6 w-full px-4">
                {currentProject.stack.map((tech, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-center p-3 scale-400 hover:scale-410 transition-transform duration-300"
                  >
                    <img
                      src={`/icons/${tech}.svg`}
                      alt={tech}
                      className="object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <Image
              src={me}
              alt="Keertan K"
              width={300}
              height={450}
              className="object-contain w-full h-full p-2"
            />
          )}
        </div>

        {/* Projects */}
        <div
          ref={photoRef}
          data-from="right"
          className="col-span-2 row-span-4 bg-transparent border-2 border-[#D12128] rounded-lg shadow-md flex flex-col p-6 overflow-hidden relative"
        >
          <h2 className="text-[#D12128] text-4xl font-covered mb-6 flex-shrink-0">
            PROJECTS
          </h2>
          <div
            ref={projectsScrollRef}
            className="flex-1 overflow-y-auto space-y-4 no-scrollbar pr-2"
          >
            {projects.map((project) => (
              <div
                key={project.id}
                className="hover:bg-[#D12128]/10 transition-colors cursor-pointer "
                onClick={() => handleProjectClick(project.id)}
              >
                <div className="flex items-center justify-between gap-3">
                  <div
                    id={`project-${project.id}-thumb`}
                    className="w-36 h-26 bg-transparent border-2 border-[#D12128] rounded-md flex-shrink-0 flex items-center justify-center overflow-hidden relative"
                  >
                    <img
                      id={`project-${project.id}-thumb-img`}
                      src={project.imageGallery[0]}
                      alt={project.title}
                      className="w-full h-full object-cover absolute inset-0"
                      style={{
                        opacity: selectedProject === project.id ? 0 : 1,
                      }}
                    />
                    <span
                      id={`project-${project.id}-nowviewing`}
                      className="font-covered text-[#D12128] text-2xl absolute inset-0 flex items-center justify-center"
                      style={{
                        opacity: selectedProject === project.id ? 1 : 0,
                      }}
                    >
                      NOW VIEWING - {project.title}
                    </span>
                  </div>
                  <div
                    id={`project-${project.id}-title`}
                    className="flex items-center gap-3 flex-1 justify-end"
                    style={{
                      opacity: selectedProject === project.id ? 0 : 1,
                      display: selectedProject === project.id ? "none" : "flex",
                    }}
                  >
                    <h3 className="text-[#D12128] font-covered text-2xl">
                      {project.title}
                    </h3>
                    <div
                      id={`project-${project.id}-arrow`}
                      className="w-8 h-8 bg-[#D12128] flex items-center justify-center flex-shrink-0"
                    >
                      <ArrowUpRight className="text-[#141414]" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Bouncing arrow indicator */}
          <div
            className={cn(
              "absolute bottom-4 left-1/2 -translate-x-1/2 animate-bounce pointer-events-none transition-opacity duration-300",
              showProjectsArrow ? "opacity-100" : "opacity-0"
            )}
          >
            <ChevronDown className="text-[#D12128] w-8 h-8" strokeWidth={3} />
          </div>
        </div>

        {/* Bottom left - Mixtape / Image Gallery */}
        <div
          data-from="left"
          className="col-span-2 row-span-2 bg-transparent rounded-lg flex items-center justify-center relative overflow-hidden"
        >
          {currentProject ? (
            <div className="w-full h-full relative flex items-center justify-center">
              <Carousel className="w-full h-full">
                <CarouselContent className="h-full">
                  {currentProject.imageGallery.map((image, index) => (
                    <CarouselItem key={index} className="h-full">
                      <div className="w-full h-full flex items-center justify-center">
                        <img
                          src={image}
                          alt={`${currentProject.title} screenshot ${
                            index + 1
                          }`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {currentProject.imageGallery.length > 1 && (
                  <>
                    <CarouselPrevious className="left-4 bg-[#D12128] text-[#141414] border-[#D12128] hover:bg-[#D12128]/80 hover:text-[#141414]" />
                    <CarouselNext className="right-4 bg-[#D12128] text-[#141414] border-[#D12128] hover:bg-[#D12128]/80 hover:text-[#141414]" />
                  </>
                )}
              </Carousel>
            </div>
          ) : (
            <>
              <video
                src="/mixtape.webm"
                autoPlay
                loop
                muted
                playsInline
                className="absolute top-0 left-0 w-full h-full object-contain"
              />
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
              <div className="absolute left-[20%] top-[8.333%] bottom-6">
                <SpotifyLastPlayed />
              </div>
              <div className="absolute font-covered text-[55px] left-0 top-3/4 -translate-y-1/2 -rotate-90 origin-left text-[#D12128] pt-20">
                Mixtape
              </div>
            </>
          )}
        </div>

        {/* Bottom center - GitHub / Learnings */}
        <div
          data-from="down"
          className={cn(
            "col-span-2 row-span-2 bg-transparent border-2 border-[#D12128] rounded-lg shadow-md flex flex-col items-stretch justify-end p-3",
            !currentProject && "-ml-16",
            !currentProject && "calendar-theme"
          )}
        >
          {currentProject ? (
            <div className="flex-1 flex flex-col overflow-hidden relative">
              <h3 className="text-[#D12128] font-covered text-3xl mb-4 text-left flex-shrink-0">
                Learnings
              </h3>
              <ul
                ref={learningsScrollRef}
                className="space-y-3 overflow-y-auto no-scrollbar pr-2 flex-1"
              >
                {currentProject.learnings.map((learning, index) => (
                  <li
                    key={index}
                    className="text-[#D12128] font-figtree text-md flex items-start gap-2"
                  >
                    <span className="text-[#D12128] mt-1 flex-shrink-0">•</span>
                    <span>{learning}</span>
                  </li>
                ))}
              </ul>
              {/* Bouncing arrow indicator for learnings */}
              <div
                className={cn(
                  "absolute bottom-2 left-1/2 -translate-x-1/2 animate-bounce pointer-events-none transition-opacity duration-300",
                  showLearningsArrow ? "opacity-100" : "opacity-0"
                )}
              >
                <ChevronDown
                  className="text-[#D12128] w-6 h-6"
                  strokeWidth={3}
                />
              </div>
            </div>
          ) : (
            <>
              <div
                ref={calendarScrollRef}
                className="w-full overflow-x-auto overflow-y-hidden no-scrollbar "
              >
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
                      queueMicrotask(() => setTotalContributions(total));
                      return contributions;
                    }}
                  />
                </div>
              </div>
              <div className="mt-2 flex items-center justify-center gap-3 select-none">
                <span className="text-[#D12128] font-covered text-sm opacity-90">
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
                <span className="text-[#D12128] font-covered text-sm opacity-90">
                  More
                </span>
              </div>
              <div className="pt-2 text-center">
                <span className="text-[#D12128] font-covered text-lg">
                  {totalContributions} contributions in the last year
                </span>
              </div>
            </>
          )}
        </div>

        {/* Socials / Project URLs */}
        <div
          data-from="right"
          className="col-span-2 row-span-1 bg-transparent border-2 border-[#D12128] rounded-lg shadow-md flex items-center justify-evenly px-6"
        >
          {currentProject ? (
            <>
              <h3 className="text-[#D12128] text-3xl font-covered">Links</h3>
              <a
                href={currentProject.urls.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#D12128] hover:opacity-80 transition-opacity"
              >
                <i className="bi bi-github text-5xl" aria-hidden="true"></i>
              </a>
              <a
                href={currentProject.urls.live}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#D12128] hover:opacity-80 transition-opacity"
              >
                <i
                  className="bi bi-box-arrow-up-right text-5xl"
                  aria-hidden="true"
                ></i>
              </a>
            </>
          ) : (
            <>
              <h3 className="text-[#D12128] text-4xl font-covered">Socials</h3>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
