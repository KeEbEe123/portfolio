"use client";

import { useState } from "react";
import Image from "next/image";

const photos = ["/images/pic1.jpg", "/images/pic2.jpg", "/images/pic3.jpg"];

export default function DigiCam() {
  const [current, setCurrent] = useState(0);

  const nextPhoto = () => {
    setCurrent((prev) => (prev + 1) % photos.length);
  };

  return (
    <div className="w-80 h-60 bg-gray-900 rounded-2xl border-4 border-gray-700 shadow-lg relative flex flex-col items-center justify-between p-4">
      {/* Screen */}
      <div className="w-full h-32 bg-black rounded-md overflow-hidden flex items-center justify-center">
        <Image
          src={photos[current]}
          alt="DigiCam Photo"
          width={220}
          height={140}
          className="object-cover rounded"
        />
      </div>

      {/* Buttons */}
      <div className="flex justify-between w-full mt-3">
        <button
          onClick={nextPhoto}
          className="bg-red-500 hover:bg-red-400 px-4 py-2 rounded-lg text-white font-bold shadow-md"
        >
          📸 Snap
        </button>
        <button
          onClick={() => setCurrent(0)}
          className="bg-blue-500 hover:bg-blue-400 px-4 py-2 rounded-lg text-white font-bold shadow-md"
        >
          🔄 Reset
        </button>
      </div>
    </div>
  );
}
