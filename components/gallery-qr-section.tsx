"use client"

import Image from "next/image"

export function GalleryQRSection() {
  return (
    <div className="mt-8 sm:mt-12 md:mt-16 text-center max-w-2xl mx-auto">
      <div className="bg-[#F7B7A3]/40 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border-2 border-[#1A3A6E]/30 shadow-xl hover:shadow-2xl transition-all duration-300">
        <div className="relative">
          {/* Corner accents - hidden on mobile */}
          <div className="hidden sm:block absolute -top-7 -left-7 w-4 h-4 border-t-2 border-l-2 border-[#1A3A6E] rounded-tl-lg" />
          <div className="hidden sm:block absolute -top-7 -right-7 w-4 h-4 border-t-2 border-r-2 border-[#1A3A6E] rounded-tr-lg" />
          <div className="hidden sm:block absolute -bottom-7 -left-7 w-4 h-4 border-b-2 border-l-2 border-[#1A3A6E] rounded-bl-lg" />
          <div className="hidden sm:block absolute -bottom-7 -right-7 w-4 h-4 border-b-2 border-r-2 border-[#1A3A6E] rounded-br-lg" />

          {/* Capture the Love Image */}
          <div className="relative w-full rounded-xl overflow-hidden shadow-lg">
            <Image
              src="/Couple_img/Capture the Love.png"
              alt="Capture the Love"
              width={800}
              height={533}
              className="w-full h-auto object-contain"
              priority={false}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

