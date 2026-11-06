"use client"

import { Section } from "@/components/section"
import { useSiteConfig } from "@/hooks/use-site-config"
import Stack from "@/components/stack"
import { motion } from "motion/react"
import { Cormorant_Garamond } from "next/font/google"

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
})

export function Narrative() {
  const siteConfig = useSiteConfig()
  const ourStory = siteConfig.narratives?.ourStory || ""
  const storyParagraphs = ourStory
    .trim()
    .split(/\n\s*\n/)
    .filter(Boolean)

  return (
    <Section
      id="narrative"
      className="relative py-12 md:py-16 lg:py-20 overflow-hidden bg-gradient-to-br from-[#FBC8AF] via-[#EFA27C] to-[#FFFAF7]"
    >
      {/* Background elements with blush & sand motif */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Vertical blush gradients to frame the story */}
        <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-[#EFA27C]/90 via-[#FBC8AF]/78 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-[#EFA27C]/88 via-[#EFA27C]/70 to-transparent" />
        {/* Soft radial light in warm blush */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(251,200,175,0.42),transparent_55%)] opacity-90" />
        {/* Subtle diagonal wash of sand & rose */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FBC8AF]/30 via-transparent to-[#FBC8AF]/24 mix-blend-soft-light" />
      </div>

      <div className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <motion.div 
          className="text-center mb-8 md:mb-12"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="space-y-2 sm:space-y-3">
            <p
              className={`${cormorant.className} text-[0.7rem] sm:text-xs md:text-sm uppercase tracking-[0.28em] text-[#25253D]`}
              style={{ textShadow: "0 2px 10px rgba(255,255,255,0.45)" }}
            >
              Francis &amp; Monique&apos;s Love Story
            </p>
            <h2
              className="style-script-regular text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#25253D]"
              style={{ textShadow: "0 4px 18px rgba(255,255,255,0.6)" }}
            >
              Our Story
            </h2>

            {/* Decorative flourish */}
            <div className="flex items-center justify-center gap-3 pt-1">
              <div className="w-8 md:w-12 h-px bg-gradient-to-r from-transparent via-[#FBC8AF]/80 to-transparent" />
              <motion.div
                animate={{ scale: [1, 1.15, 1], rotate: [0, 8, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <svg className="w-5 h-5 md:w-6 md:h-6 text-[#25253D]/80" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
              </motion.div>
              <div className="w-8 md:w-12 h-px bg-gradient-to-l from-transparent via-[#FBC8AF]/80 to-transparent" />
            </div>
          </div>
        </motion.div>

        {/* Main Content - Centered Layout */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10 items-center lg:items-start"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Left Spacer */}
          <div className="hidden lg:block"></div>

          {/* Interactive Stack Component - Center */}
          <div className="flex justify-center">
            <div className="relative">
              {/* Enhanced glow effect with blush & sand motif */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#FFF0E7]/35 via-[#FBC8AF]/24 to-[#FFFAF7]/32 rounded-full blur-3xl -z-10 w-full h-full max-w-sm animate-pulse" />
              <div className="absolute inset-0 bg-gradient-to-tr from-[#FBC8AF]/30 via-transparent to-[#EFA27C]/26 rounded-full blur-2xl -z-10 w-full h-full max-w-sm" />
              <div className="absolute inset-0 bg-gradient-to-bl from-[#EFA27C]/24 via-transparent to-[#EFA27C]/22 rounded-full blur-xl -z-10 w-full h-full max-w-sm" />

              <Stack
                randomRotation={true}
                sensitivity={180}
                sendToBackOnClick={false}
                cardDimensions={{ width: 240, height: 280 }}
                cardsData={[
                  { id: 1, img: "/mobile-background/couple-1.webp" },
                  { id: 2, img: "/mobile-background/couple-2.webp" },
                  { id: 3, img: "/mobile-background/couple-3.webp" },
                  { id: 4, img: "/mobile-background/couple-4.webp" },
                  { id: 5, img: "/mobile-background/couple-5.webp" },
                  { id: 6, img: "/mobile-background/couple-6.webp" },

                ]}
                animationConfig={{ stiffness: 260, damping: 20 }}
              />

              <motion.p 
                className="text-center text-xs md:text-sm text-[#25253D] mt-4 font-sans font-medium tracking-wide"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 1 }}
              >
                <span className="text-[#FBC8AF]">✨</span> Drag to explore our moments <span className="text-[#FBC8AF]">✨</span>
              </motion.p>
            </div>
          </div>

          {/* Right Spacer */}
          <div className="hidden lg:block"></div>
        </motion.div>

        {/* Story Text + Tabs */}
        <motion.div 
          className="mt-10 md:mt-16 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="flex flex-col items-center text-center gap-3 md:gap-5 mb-8 md:mb-12">
            <p className={`${cormorant.className} text-[0.7rem] sm:text-xs md:text-sm text-[#25253D] tracking-[0.16em] uppercase`}>
              Two hearts, one promise
            </p>
          </div>

          <div id="story-panel" className="space-y-4 md:space-y-6" aria-live="polite">
            {storyParagraphs.map((paragraph, index) => (
              <motion.div 
                key={index} 
                className="relative"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
              >
                {/* First paragraph with drop cap */}
                {index === 0 ? (
                  <p className="text-sm md:text-base leading-relaxed text-[#25253D] text-pretty font-sans font-light pl-3 md:pl-6">
                    <span className="float-left text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-[#25253D] leading-none mr-2 mt-1 drop-shadow-[0_4px_16px_rgba(133,140,164,0.45)]">
                      {paragraph.charAt(0)}
                    </span>
                    {paragraph.slice(1)}
                  </p>
                ) : (
                  <p className="text-sm md:text-base leading-relaxed text-[#25253D] text-pretty font-sans font-light pl-3 md:pl-6">
                    {paragraph}
                  </p>
                )}
              </motion.div>
            ))}
          </div>

          {/* Divider and CTA */}
          <motion.div 
            className="mt-10 md:mt-14 space-y-6 md:space-y-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {/* Decorative divider with sage & gold motif */}
            <div className="flex items-center justify-center gap-4">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#FBC8AF]/70 to-[#FBC8AF]/65" />
              <motion.div
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <svg className="w-5 h-5 text-[#FBC8AF]/85" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-5c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/>
                </svg>
              </motion.div>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent via-[#FBC8AF]/70 to-[#FBC8AF]/65" />
            </div>

            {/* Enhanced CTA Button with sage motif */}
            <div className="flex justify-center">
              <motion.a
                href="#guest-list"
                className="group relative w-full sm:w-auto px-6 sm:px-10 md:px-12 py-4 sm:py-5 md:py-6 text-[#25253D] font-sans font-bold text-sm sm:text-base md:text-lg rounded-[2rem] transition-all duration-500 text-center overflow-hidden shadow-xl hover:shadow-2xl border-2 border-[#FBC8AF] hover:border-[#FBC8AF]"
                style={{ 
                  backgroundImage: "linear-gradient(135deg, #FFF0E7, #EFA27C)",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.35), 0 4px 12px rgba(133,140,164,0.45)"
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundImage = "linear-gradient(135deg, #EFA27C, #FBC8AF)";
                  e.currentTarget.style.boxShadow = "0 16px 55px rgba(0,0,0,0.45), 0 6px 18px rgba(133,140,164,0.6)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundImage = "linear-gradient(135deg, #FFF0E7, #EFA27C)";
                  e.currentTarget.style.boxShadow = "0 10px 40px rgba(0,0,0,0.35), 0 4px 12px rgba(133,140,164,0.45)";
                }}
              >
                {/* Pulsing glow effect with gold accent */}
                <motion.div 
                  className="absolute inset-0 bg-[#FBC8AF]/40 rounded-[2rem] blur-2xl"
                  animate={{
                    opacity: [0.4, 0.7, 0.4],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                {/* Secondary glow with soft neutral accent */}
                <motion.div 
                  className="absolute inset-0 bg-[#FFFAF7]/26 rounded-[2rem] blur-xl"
                  animate={{
                    opacity: [0.2, 0.4, 0.2],
                    scale: [1, 1.15, 1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5,
                  }}
                />
                
                {/* Enhanced gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-transparent rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Double shimmer effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/25 to-transparent"></div>
                <div className="absolute inset-0 translate-x-full group-hover:-translate-x-full transition-transform duration-1200 delay-200 bg-gradient-to-l from-transparent via-white/15 to-transparent"></div>
                
                {/* Enhanced sparkle effects */}
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      top: `${20 + i * 15}%`,
                      left: `${10 + (i % 3) * 40}%`,
                    }}
                    animate={{
                      scale: [0, 1.2, 1],
                      rotate: [0, 180, 360],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    delay: i * 0.28,
                      ease: "easeInOut",
                    }}
                  >
                    <svg className="w-3 h-3 text-[#25253D]/70" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                    </svg>
                  </motion.div>
                ))}
                
                {/* Animated gradient border */}
                <div className="absolute inset-0 rounded-[2rem] border-2 border-white/10 group-hover:border-[#EFA27C]/60 transition-all duration-500"></div>
                <motion.div 
                  className="absolute inset-0 rounded-[2rem] border-2 border-white/25"
                  animate={{
                    opacity: [0.2, 0.5, 0.2],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                
                {/* Decorative waves on hover */}
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  initial={{ y: 0 }}
                  animate={{
                    y: [0, -5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <svg className="w-full h-full" fill="none" viewBox="0 0 400 100" preserveAspectRatio="none">
                    <path d="M0,50 Q100,20 200,50 T400,50 L400,100 L0,100 Z" fill="white" opacity="0.1"/>
                  </svg>
                </motion.div>
                
                {/* Button content */}
                <span className="relative z-10 tracking-wide uppercase inline-flex items-center gap-3 font-bold text-[#25253D]">
                  Join Our Celebration
                  <motion.svg 
                    className="w-5 h-5 md:w-6 md:h-6 text-[#25253D]"
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    animate={{
                      x: [0, 4, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </motion.svg>
                </span>
                
                {/* Enhanced decorative corner ornaments */}
                <motion.div 
                  className="absolute top-2 left-2 w-2 h-2 bg-white/50 rounded-full opacity-0 group-hover:opacity-100"
                  initial={{ scale: 0 }}
                  whileHover={{ scale: [0, 1.5, 1] }}
                  transition={{ duration: 0.5 }}
                />
                <motion.div 
                  className="absolute top-2 right-2 w-2 h-2 bg-white/50 rounded-full opacity-0 group-hover:opacity-100"
                  initial={{ scale: 0 }}
                  whileHover={{ scale: [0, 1.5, 1] }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                />
                <motion.div 
                  className="absolute bottom-2 left-2 w-2 h-2 bg-white/50 rounded-full opacity-0 group-hover:opacity-100"
                  initial={{ scale: 0 }}
                  whileHover={{ scale: [0, 1.5, 1] }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                />
                <motion.div 
                  className="absolute bottom-2 right-2 w-2 h-2 bg-white/50 rounded-full opacity-0 group-hover:opacity-100"
                  initial={{ scale: 0 }}
                  whileHover={{ scale: [0, 1.5, 1] }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                />
              </motion.a>
            </div>
          </motion.div>
        </motion.div>

      </div>
    </Section>
  )
}
