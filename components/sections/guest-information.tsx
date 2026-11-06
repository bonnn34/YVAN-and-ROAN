"use client"

import { Section } from "@/components/section"
import { useSiteConfig } from "@/hooks/use-site-config"
import { Car, Navigation, MapPin } from "lucide-react"
import { Cormorant_Garamond, Cinzel } from "next/font/google"
import Image from "next/image"

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400"],
})

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: "400",
})

// Guest information color palette
const GUEST_LIGHT = "#FBC8AF"   // blush peach
const GUEST_MEDIUM = "#333C63"   // slate navy
const GUEST_DARK = "#25253D"    // midnight navy
const GUEST_BG = "#FFFAF7"      // warm white container background

// Guest attire motif palette (swatches shown in Wedding Attire)
const GUEST_ATTIRE_PALETTE = [
  "#25253D",
  "#333C63",
  "#EFA27C",
  "#FBC8AF",
  "#FFFFFF",
  "#FFFAF7",
]

export function GuestInformation() {
  const siteConfig = useSiteConfig()

  return (
    <Section
      id="guest-information"
      className="relative py-8 sm:py-12 md:py-16 lg:py-20 overflow-hidden bg-white"
    >
      {/* Header - tighter on iPhone SE */}
      <div className="relative z-30 text-center mb-4 sm:mb-6 md:mb-9 lg:mb-12 px-4 sm:px-4 max-w-[100vw]">
        <p
          className={`${cormorant.className} text-[0.7rem] sm:text-xs md:text-sm uppercase tracking-[0.2em] sm:tracking-[0.28em] mb-1.5 sm:mb-2`}
          style={{ color: GUEST_DARK }}
        >
          Important Guidelines
        </p>

        <h2
          className="style-script-regular text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl mb-1 sm:mb-1.5 md:mb-3 md:mb-4 break-words"
          style={{ color: GUEST_DARK }}
        >
          Guest Information
        </h2>

        <p className={`${cormorant.className} text-xs sm:text-sm md:text-base font-light max-w-xl mx-auto leading-relaxed px-1 sm:px-2 mb-2 sm:mb-3 min-w-0`} style={{ color: GUEST_MEDIUM }}>
          Everything you need to know to make your experience smooth and enjoyable
        </p>

        <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-2 sm:mt-3 md:mt-4">
          <div className="w-6 sm:w-8 md:w-12 lg:w-16 h-px opacity-50" style={{ backgroundColor: GUEST_MEDIUM }} />
          <div className="w-1.5 h-1.5 rounded-full opacity-80 flex-shrink-0" style={{ backgroundColor: GUEST_DARK }} />
          <div className="w-1.5 h-1.5 rounded-full opacity-60 flex-shrink-0" style={{ backgroundColor: GUEST_MEDIUM }} />
          <div className="w-1.5 h-1.5 rounded-full opacity-80 flex-shrink-0" style={{ backgroundColor: GUEST_DARK }} />
          <div className="w-6 sm:w-8 md:w-12 lg:w-16 h-px opacity-50" style={{ backgroundColor: GUEST_MEDIUM }} />
        </div>
      </div>

      {/* Content - comfortable padding on small screens */}
      <div className="relative z-10 mb-4 sm:mb-7 max-w-4xl mx-auto px-4 sm:px-5 min-w-0">
        <div className="space-y-4 sm:space-y-4">
          {/* Attire - open layout, no container - mobile-optimized */}
          <div className="py-4 sm:py-6 md:py-8 lg:py-10">
            <h4 className={`${cinzel.className} text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-[0.08em] sm:tracking-[0.12em] uppercase text-center mb-1 sm:mb-2`} style={{ color: GUEST_DARK }}>
              Wedding Attire
            </h4>
            <p className={`${cormorant.className} text-[11px] sm:text-xs md:text-sm font-normal tracking-[0.15em] sm:tracking-[0.2em] uppercase text-center mb-5 sm:mb-8 md:mb-10 lg:mb-12`} style={{ color: GUEST_MEDIUM }}>
              We kindly request our guests to dress in formal attire following our theme.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-12 lg:gap-14 max-w-4xl mx-auto justify-items-center md:justify-items-stretch">
              {/* Left: Principal Sponsors - centered on mobile */}
              <div className="text-center md:text-left flex flex-col items-center md:items-start w-full min-w-0 max-w-[280px] md:max-w-none">
                <h5 className={`${cinzel.className} text-xs sm:text-sm md:text-base lg:text-lg font-bold tracking-[0.1em] sm:tracking-[0.15em] uppercase mb-0.5 sm:mb-1`} style={{ color: GUEST_DARK }}>
                  Principal Sponsors
                </h5>
                <p className={`${cormorant.className} text-[11px] sm:text-xs md:text-sm font-normal tracking-[0.12em] sm:tracking-[0.18em] uppercase mb-2 sm:mb-3 md:mb-4`} style={{ color: GUEST_MEDIUM }}>
                  Strictly Formal
                </p>
                <ul className={`${cormorant.className} text-[11px] sm:text-xs md:text-sm lg:text-base italic space-y-1 sm:space-y-1.5 mb-3 sm:mb-5 md:mb-6 leading-snug`} style={{ color: GUEST_DARK }}>
                  <li>Gentlemen: Black Suit and Pants</li>
                  <li>Ladies: Champagne Long Gown</li>
                </ul>
                <div className="relative w-full aspect-[4/3] max-w-[260px] sm:max-w-[280px] md:max-w-xs mx-auto md:mx-0 md:mr-auto">
                  <Image
                    src="/Details/principalsponsornew.png"
                    alt="Principal Sponsors attire - strictly formal"
                    fill
                    className="object-contain object-center md:object-left"
                    sizes="(max-width: 375px) 260px, (max-width: 640px) 280px, 50vw"
                    priority={false}
                  />
                </div>
              </div>

              {/* Right: Guests - centered on mobile when stacked */}
              <div className="text-center md:text-right flex flex-col items-center md:items-end w-full min-w-0 max-w-[280px] md:max-w-none">
                <div className="relative w-full aspect-[4/3] max-w-[260px] sm:max-w-[280px] md:max-w-xs mx-auto md:ml-auto md:mr-0 mb-3 sm:mb-5 md:mb-6 order-first">
                  <Image
                    src="/Details/guest.png"
                    alt="Guests attire - semi formal"
                    fill
                    className="object-contain object-center md:object-right"
                    sizes="(max-width: 375px) 260px, (max-width: 640px) 280px, 50vw"
                    priority={false}
                  />
                </div>
                <h5 className={`${cinzel.className} text-xs sm:text-sm md:text-base lg:text-lg font-bold tracking-[0.1em] sm:tracking-[0.15em] uppercase mb-0.5 sm:mb-1`} style={{ color: GUEST_DARK }}>
                  Guests
                </h5>
                <p className={`${cormorant.className} text-[11px] sm:text-xs md:text-sm font-normal tracking-[0.12em] sm:tracking-[0.18em] uppercase mb-2 sm:mb-3 md:mb-4`} style={{ color: GUEST_MEDIUM }}>
                  Semi-Formal
                </p>
                <ul className={`${cormorant.className} text-[11px] sm:text-xs md:text-sm lg:text-base italic space-y-1 sm:space-y-1.5 mb-3 sm:mb-5 md:mb-6 leading-snug`} style={{ color: GUEST_DARK }}>
                  <li>Gentlemen: Long Sleeves and Pants</li>
                  <li>Ladies: Floor-Length Dress</li>
                </ul>
                <div className="flex items-center justify-center md:justify-end gap-1.5 sm:gap-2 md:gap-2.5 flex-wrap mt-auto">
                  {GUEST_ATTIRE_PALETTE.map((color) => (
                    <div
                      key={color}
                      className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 rounded-full flex-shrink-0 border border-white/50 shadow-sm"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Arrival Time & Reception Guidelines - tighter padding on mobile */}
          <div
            className="relative rounded-xl sm:rounded-2xl border-2 backdrop-blur-lg p-3 sm:p-4 md:p-5 lg:p-6 overflow-hidden"
            style={{
              borderColor: `${GUEST_LIGHT}99`,
              backgroundColor: GUEST_BG,
              boxShadow: `0 18px 40px ${GUEST_MEDIUM}12`,
            }}
          >
            <div className="space-y-3 sm:space-y-4 md:space-y-5">
              <div
                className="relative w-full rounded-xl sm:rounded-2xl overflow-hidden border-2 shadow-lg p-3 sm:p-4 md:p-5 lg:p-6 min-w-0"
                style={{ borderColor: `${GUEST_LIGHT}99`, backgroundColor: GUEST_BG }}
              >
                <div className="mb-1 sm:mb-2 md:mb-3">
                  <h4 className={`${cinzel.className} text-[11px] sm:text-xs md:text-sm lg:text-base font-semibold tracking-[0.2em] sm:tracking-[0.25em] uppercase mb-1.5 sm:mb-2 md:mb-3`} style={{ color: GUEST_DARK }}>
                    Arrival Time
                  </h4>
                  <div className="space-y-1.5 sm:space-y-2 md:space-y-2.5">
                    <p className={`${cormorant.className} text-xs sm:text-sm md:text-base leading-relaxed`} style={{ color: GUEST_MEDIUM }}>
                      We kindly request guests to arrive by{" "}
                      <span className="font-semibold" style={{ color: GUEST_DARK }}>
                        {siteConfig.ceremony.guestsTime ?? "1:30 PM"}
                      </span>{" "}
                      to allow ample time to settle in before the ceremony, which will begin promptly at{" "}
                      <span className="font-semibold" style={{ color: GUEST_DARK }}>
                        {siteConfig.ceremony.time}
                      </span>
                      .
                    </p>
                    <p className={`${cormorant.className} text-xs sm:text-sm md:text-base leading-relaxed`} style={{ color: GUEST_MEDIUM }}>
                      The reception will follow at{" "}
                      <span className="font-semibold" style={{ color: GUEST_DARK }}>
                        {siteConfig.reception.time ?? "5:00 PM"}
                      </span>
                      .
                    </p>
                  </div>
                </div>
              </div>

              <div
                className="relative w-full rounded-xl sm:rounded-2xl overflow-hidden border-2 shadow-lg p-3 sm:p-4 md:p-5 lg:p-6 min-w-0"
                style={{ borderColor: `${GUEST_LIGHT}99`, backgroundColor: GUEST_BG }}
              >
                <div className="mb-1 sm:mb-2 md:mb-3">
                  <h4 className={`${cinzel.className} text-[11px] sm:text-xs md:text-sm lg:text-base font-semibold tracking-[0.2em] sm:tracking-[0.25em] uppercase mb-1.5 sm:mb-2 md:mb-3`} style={{ color: GUEST_DARK }}>
                    Reception Guidelines
                  </h4>
                  <div className="space-y-1.5 sm:space-y-2 md:space-y-2.5">
                    <p className={`${cormorant.className} text-xs sm:text-sm md:text-base leading-relaxed`} style={{ color: GUEST_MEDIUM }}>
                      The seating will be formal, RSVP-style. That&apos;s why we&apos;re asking you to fill out this invitation form to secure your spot. Kindly do not bring plus ones unless explicitly stated in your invitation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Travel & Parking - mobile padding */}
          <div
            className="relative rounded-xl sm:rounded-2xl border-2 backdrop-blur-lg p-3 sm:p-4 md:p-5 lg:p-6 overflow-hidden min-w-0"
            style={{
              borderColor: `${GUEST_LIGHT}99`,
              backgroundColor: GUEST_BG,
              boxShadow: `0 18px 40px ${GUEST_MEDIUM}12`,
            }}
          >
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-2 sm:mb-2.5 md:mb-3 relative z-10">
              <div className="p-1.5 rounded-full shadow-md border-2 flex-shrink-0" style={{ backgroundColor: GUEST_BG, borderColor: `${GUEST_LIGHT}99` }}>
                <Car className="w-3.5 h-3.5" style={{ color: GUEST_DARK }} />
              </div>
              <h4 className={`${cinzel.className} font-semibold text-xs sm:text-sm md:text-base`} style={{ color: GUEST_DARK }}>Parking &amp; Travel</h4>
            </div>

            <div className="space-y-2.5 sm:space-y-3 relative z-10">
              <div className="rounded-lg sm:rounded-xl p-2.5 sm:p-3 border-2 shadow-sm min-w-0" style={{ borderColor: `${GUEST_LIGHT}99`, backgroundColor: GUEST_BG }}>
                <div className="flex items-start gap-2.5 sm:gap-3">
                  <div className="p-1.5 sm:p-2 rounded-lg text-white flex-shrink-0" style={{ backgroundColor: GUEST_DARK }}>
                    <Car className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`${cormorant.className} text-xs sm:text-sm md:text-base font-semibold`} style={{ color: GUEST_DARK }}>Parking Available</p>
                    <p className={`${cormorant.className} text-xs sm:text-xs md:text-sm opacity-85 leading-snug`} style={{ color: GUEST_MEDIUM }}>
                      Parking is available at the venue. Please arrive early to find a comfortable spot.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg sm:rounded-xl p-2.5 sm:p-3 border-2 shadow-sm min-w-0" style={{ borderColor: `${GUEST_LIGHT}99`, backgroundColor: GUEST_BG }}>
                <div className="flex items-start gap-2.5 sm:gap-3">
                  <div className="p-1.5 sm:p-2 rounded-lg text-white flex-shrink-0" style={{ backgroundColor: GUEST_DARK }}>
                    <Navigation className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`${cormorant.className} text-xs sm:text-sm md:text-base font-semibold`} style={{ color: GUEST_DARK }}>Transportation</p>
                    <p className={`${cormorant.className} text-xs sm:text-xs md:text-sm opacity-85 leading-snug`} style={{ color: GUEST_MEDIUM }}>
                      Private vehicles and local transport are welcome. Coordinate with friends or family and plan your route ahead of time.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg sm:rounded-xl p-2.5 sm:p-3 border-2 min-w-0" style={{ borderColor: `${GUEST_LIGHT}99`, backgroundColor: GUEST_BG }}>
                <p className={`${cormorant.className} text-xs sm:text-sm md:text-base font-semibold mb-1.5 sm:mb-2 flex items-center gap-2`} style={{ color: GUEST_DARK }}>
                  <span className="inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full flex-shrink-0" style={{ backgroundColor: "rgba(37, 37, 61, 0.12)", color: GUEST_DARK }}>
                    <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </span>
                  Quick Tips
                </p>
                <ul className={`${cormorant.className} text-xs sm:text-xs md:text-sm space-y-1 opacity-90 leading-snug`} style={{ color: GUEST_MEDIUM }}>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 flex-shrink-0" style={{ color: GUEST_DARK }}>•</span>
                    <span>Plan your route ahead to avoid unexpected delays.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 flex-shrink-0" style={{ color: GUEST_DARK }}>•</span>
                    <span>Please avoid walking during the ceremony. Approach the coordinator or wait to be guided.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 flex-shrink-0" style={{ color: GUEST_DARK }}>•</span>
                    <span>Coordinate carpooling with friends or family when possible.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}

