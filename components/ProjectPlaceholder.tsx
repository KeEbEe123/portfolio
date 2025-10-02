"use client";

import React from "react";

export default function ProjectPlaceholder() {
  return (
    <div className="h-[100dvh] w-full bg-[#141414] p-4 overflow-hidden">
      <div className="grid h-full w-full gap-4 grid-cols-6 grid-rows-6">
        <div data-from="up" className="col-span-6 row-span-1 bg-[#2a2a2a] rounded-lg" />
        <div data-from="left" className="col-span-3 row-span-3 bg-[#1e1e1e] rounded-lg" />
        <div data-from="right" className="col-span-3 row-span-3 bg-[#1e1e1e] rounded-lg" />
        <div data-from="down" className="col-span-2 row-span-2 bg-[#2a2a2a] rounded-lg" />
        <div data-from="left" className="col-span-2 row-span-2 bg-[#2a2a2a] rounded-lg" />
        <div data-from="right" className="col-span-2 row-span-2 bg-[#2a2a2a] rounded-lg" />
      </div>
    </div>
  );
}
