"use client"

import type React from "react"
import { motion } from "motion/react"
import { cinzel } from "@/lib/fonts"
import localFont from "next/font/local"
import { layeredSectionTitleSize, sectionType } from "@/lib/section-typography"


const theSeasons = localFont({
  src: "../../Font/Fontspring-DEMO-theseasons-reg.otf",
  display: "swap",
  variable: "--font-the-seasons",
})

const aboveTheBeyond = localFont({
  src: "../../Font/above-the-beyond-script.otf",
  display: "swap",
  variable: "--font-above-beyond",
})

const palette = {
  body: "var(--color-welcome-text)",
  heading: "var(--color-welcome-navy)",
  label: "var(--color-welcome-heading)",
  accent: "var(--color-welcome-green)",
} as const

const cardStyle = {
  background: "var(--color-welcome-bg)",
  borderColor: "color-mix(in srgb, var(--color-motif-deep) 14%, transparent)",
  boxShadow:
    "0 8px 28px color-mix(in srgb, var(--color-motif-deep) 7%, transparent), inset 0 1px 0 color-mix(in srgb, white 70%, transparent)",
} as const

const softPanelStyle = {
  background: "var(--color-welcome-bg-soft)",
  borderColor: "color-mix(in srgb, var(--color-motif-deep) 10%, transparent)",
} as const

const accentPanelStyle = {
  background:
    "linear-gradient(135deg, color-mix(in srgb, var(--color-welcome-green) 8%, var(--color-welcome-bg-soft)) 0%, var(--color-welcome-bg-soft) 100%)",
  borderColor: "color-mix(in srgb, var(--color-welcome-green) 22%, transparent)",
} as const

const linkClass =
  "font-semibold underline underline-offset-[3px] decoration-current/40 transition-opacity hover:opacity-80"

const sections = [
  { step: "01", title: "Arrival in Manila" },
  { step: "02", title: "Getting Around" },
  { step: "03", title: "Accommodation" },
  { step: "04", title: "Our Favorites" },
] as const

const nearbyHotels = [
  "Ascott Bonifacio Global City Manila",
  "F1 Hotel Manila",
  "Seda BGC (Seda Bonifacio Global City)",
] as const

const favoriteCategories = [
  {
    title: "Cafés",
    spots: [
      {
        name: "Harlan + Holden",
        note: "Great coffee, minimalist interiors, and a relaxing atmosphere.",
      },
      {
        name: "Elephant Grounds",
        note: "A favorite for specialty coffee, pastries, and their famous ice cream sandwiches.",
      },
      {
        name: "Toby's Estate",
        note: "Excellent coffee and a great spot for breakfast or brunch.",
      },
    ],
  },
  {
    title: "Dining",
    spots: [
      {
        name: "Manam",
        note: "A Filipino favorite serving classic dishes with a modern twist.",
      },
      {
        name: "Fat Seed Café + Roastery",
        note: "Comfort food, excellent coffee, and an all-day menu that's perfect for any time of day.",
      },
      {
        name: "Wildflour",
        note: "Best known for their famous cronuts, fresh pastries, and delicious pasta dishes. A perfect spot for brunch or a leisurely meal.",
      },
    ],
  },
  {
    title: "Bars & Cocktails",
    spots: [
      {
        name: "The Back Room",
        note: "Elegant cocktails in a glamorous Art Deco-inspired setting.",
      },
      {
        name: "Dr. Wine",
        note: "A cozy wine bar with an extensive selection of wines and delicious small plates.",
      },
      {
        name: "Agave Mexican Cantina",
        note: "Drop by during Happy Hour for their unlimited margaritas, then stay for the tacos, nachos, and lively atmosphere.",
      },
    ],
  },
  {
    title: "Shopping",
    spots: [
      {
        name: "Bonifacio High Street",
        note: "Stroll along the open-air shopping strip filled with boutiques, restaurants, cafés, and green spaces.",
      },
      {
        name: "Mitsukoshi BGC",
        note: "A Japanese-inspired shopping destination with unique stores, specialty groceries, and excellent dining options.",
      },
      {
        name: "Market! Market!",
        note: "If you enjoy treasure hunting, this is the place! Browse local food stalls, pick up affordable clothing and souvenirs, and experience one of Manila's liveliest shopping spots.",
      },
    ],
  },
] as const

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay, ease: [0.22, 0.61, 0.36, 1] as const },
  }),
}

function OrnamentalDivider({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`flex items-center justify-center ${compact ? "gap-1.5" : "gap-2"}`}>
      <span
        className={`h-px ${compact ? "w-6 sm:w-10" : "w-8 sm:w-12"}`}
        style={{
          background:
            "linear-gradient(to right, transparent, color-mix(in srgb, var(--color-motif-deep) 38%, transparent))",
        }}
      />
      <span className="h-0.5 w-0.5 rounded-full bg-motif-deep/45 sm:h-1 sm:w-1" aria-hidden />
      <span
        className={`h-px ${compact ? "w-6 sm:w-10" : "w-8 sm:w-12"}`}
        style={{
          background:
            "linear-gradient(to left, transparent, color-mix(in srgb, var(--color-motif-deep) 38%, transparent))",
        }}
      />
    </div>
  )
}

function TravelLabel() {
  const lineStyle = {
    background:
      "linear-gradient(to right, transparent, color-mix(in srgb, var(--color-welcome-navy) 35%, transparent))",
  }

  return (
    <div className="flex items-center justify-center gap-2.5 pt-1 sm:gap-3.5 sm:pt-1.5">
      <span className="h-px w-5 sm:w-7 md:w-9" style={lineStyle} aria-hidden />
      <p
        className={`${cinzel.className} ${sectionType.label} shrink-0 py-0.5 font-semibold uppercase leading-normal tracking-[0.28em] min-[400px]:tracking-[0.32em] sm:tracking-[0.38em]`}
        style={{ color: palette.heading }}
      >
        For Our Guests Abroad
      </p>
      <span
        className="h-px w-5 sm:w-7 md:w-9"
        style={{
          background:
            "linear-gradient(to left, transparent, color-mix(in srgb, var(--color-welcome-navy) 35%, transparent))",
        }}
        aria-hidden
      />
    </div>
  )
}

function AccommodationTitle() {
  return (
    <h2
      className="welcome-title-lockup relative mx-auto w-full max-w-full text-center"
      style={
        {
          "--title-size": layeredSectionTitleSize.main,
          "--script-size": layeredSectionTitleSize.script,
          "--script-overlap": layeredSectionTitleSize.overlap,
        } as React.CSSProperties
      }
    >
      <span
        className={`${theSeasons.className} block uppercase leading-[0.78] tracking-[0.08em] min-[400px]:tracking-[0.11em] sm:tracking-[0.13em] md:tracking-[0.14em]`}
        style={{
          fontSize: "var(--title-size)",
          color: palette.heading,
        }}
      >
        Accommodation and Travel
      </span>
      <span
        aria-hidden
        className={`${aboveTheBeyond.className} relative z-10 mx-auto block w-fit max-w-full px-1 leading-[0.88] sm:leading-[0.9]`}
        style={{
          marginTop: "var(--script-overlap)",
          fontSize: "var(--script-size)",
          color: palette.accent,
          textShadow:
            "0 1px 0 color-mix(in srgb, var(--color-welcome-bg) 95%, white), 0 0 10px color-mix(in srgb, var(--color-welcome-bg) 65%, white)",
        }}
      >
        plan your visit to Manila
      </span>
      <span className="sr-only">plan your visit to Manila</span>
    </h2>
  )
}

function SoftPanel({
  children,
  className = "",
  variant = "default",
}: {
  children: React.ReactNode
  className?: string
  variant?: "default" | "accent"
}) {
  return (
    <div
      className={`rounded-md border px-4 py-3.5 sm:rounded-lg sm:px-5 sm:py-4 ${className}`}
      style={variant === "accent" ? accentPanelStyle : softPanelStyle}
    >
      {children}
    </div>
  )
}

function SectionHeading({ step, title }: { step: string; title: string }) {
  return (
    <header className="mb-5 sm:mb-6 md:mb-7">
      <div className="flex items-baseline gap-3 sm:gap-3.5">
        <span
          className={`${cinzel.className} ${sectionType.label} shrink-0 font-semibold tabular-nums tracking-[0.12em]`}
          style={{ color: palette.accent }}
        >
          {step}
        </span>
        <h3
          className={`${theSeasons.className} text-lg font-semibold uppercase leading-tight tracking-[0.1em] sm:text-xl md:text-2xl md:tracking-[0.12em]`}
          style={{ color: palette.heading }}
        >
          {title}
        </h3>
      </div>
      <div
        className="mt-3 h-px w-full max-w-[10rem] sm:mt-4 sm:max-w-[12rem]"
        style={{
          background:
            "linear-gradient(to right, color-mix(in srgb, var(--color-welcome-green) 55%, transparent), transparent)",
        }}
        aria-hidden
      />
    </header>
  )
}

function SectionBlock({
  step,
  title,
  children,
  index,
}: {
  step: string
  title: string
  children: React.ReactNode
  index: number
}) {
  return (
    <motion.article
      custom={index * 0.08}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-30px" }}
      variants={fadeUp}
    >
      <SectionHeading step={step} title={title} />
      <div
        className={`font-goudy-italic space-y-3 sm:space-y-3.5 md:space-y-4 ${sectionType.textRelaxed}`}
        style={{ color: palette.body }}
      >
        {children}
      </div>
    </motion.article>
  )
}

function SectionDivider() {
  return (
    <div className="py-6 sm:py-7 md:py-8">
      <OrnamentalDivider compact />
    </div>
  )
}

function ETravelCallout() {
  return (
    <SoftPanel variant="accent">
      <p
        className={`${cinzel.className} ${sectionType.label} mb-2 font-semibold uppercase tracking-[0.18em] sm:tracking-[0.22em]`}
        style={{ color: palette.label }}
      >
        Required before arrival
      </p>
      <p className={`font-goudy-italic ${sectionType.textSnug}`} style={{ color: palette.body }}>
        Register via{" "}
        <a
          href="https://etravel.gov.ph/"
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
          style={{ color: palette.accent }}
        >
          etravel.gov.ph
        </a>{" "}
        or the eGovPH app.
      </p>
    </SoftPanel>
  )
}

function AddressBlock() {
  return (
    <SoftPanel>
      <p
        className={`${cinzel.className} ${sectionType.label} mb-2 font-semibold uppercase tracking-[0.18em] sm:tracking-[0.22em]`}
        style={{ color: palette.label }}
      >
        Grab destination
      </p>
      <p
        className={`${cinzel.className} ${sectionType.subheader} font-semibold leading-snug`}
        style={{ color: palette.heading }}
      >
        Shangri-La The Fort, Manila
      </p>
      <p className="mt-2 font-goudy-italic leading-relaxed" style={{ color: palette.body }}>
        30th Street corner 5th Avenue
        <br />
        Bonifacio Global City (BGC)
        <br />
        Taguig, Metro Manila
      </p>
      <p
        className={`font-goudy-italic mt-3 border-t pt-3 italic ${sectionType.textSnug}`}
        style={{
          color: palette.body,
          borderColor: "color-mix(in srgb, var(--color-motif-deep) 10%, transparent)",
        }}
      >
        Depending on traffic, the journey from NAIA typically takes 30–60 minutes.
      </p>
    </SoftPanel>
  )
}

function PrimaryVenuePanel() {
  return (
    <SoftPanel variant="accent">
      <p
        className={`${cinzel.className} ${sectionType.label} mb-2 font-semibold uppercase tracking-[0.18em] sm:tracking-[0.22em]`}
        style={{ color: palette.label }}
      >
        Reception venue &amp; recommended stay
      </p>
      <p
        className={`${cinzel.className} ${sectionType.subheader} font-semibold leading-snug`}
        style={{ color: palette.heading }}
      >
        Shangri-La The Fort, Manila
      </p>
      <p className={`font-goudy-italic mt-2 ${sectionType.textSnug}`} style={{ color: palette.body }}>
        We&apos;d love for you to stay here if it&apos;s convenient. Book early — availability may
        be limited.
      </p>
    </SoftPanel>
  )
}

function FavoriteSpot({ name, note }: { name: string; note: string }) {
  return (
    <li className="leading-[1.65]">
      <span className={`${cinzel.className} font-semibold`} style={{ color: palette.heading }}>
        {name}
      </span>
      <span style={{ color: palette.body }}> — {note}</span>
    </li>
  )
}

export function Accommodation() {
  return (
    <section
      id="accommodation"
      className={`${theSeasons.variable} ${aboveTheBeyond.variable} relative px-3 py-5 sm:px-5 sm:py-7 md:px-6 md:py-9`}
    >
      <div className="relative mx-auto w-full max-w-xl sm:max-w-2xl md:max-w-3xl">
        <motion.article
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.65, ease: [0.22, 0.61, 0.36, 1] }}
          className="relative min-w-0 overflow-visible rounded-lg border px-4 pt-6 pb-10 @container/accommodation sm:rounded-xl sm:px-7 sm:pt-7 sm:pb-12 md:rounded-2xl md:px-8 md:pt-8 md:pb-14"
          style={cardStyle}
        >
          <div className="wedding-frame-inner hidden min-[400px]:block" aria-hidden />

          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-5 top-0 h-px sm:inset-x-8"
            style={{
              background:
                "linear-gradient(to right, transparent, var(--color-motif-yellow), transparent)",
            }}
          />

          {/* Header */}
          <header className="relative space-y-3 px-1 pt-4 pb-2 text-center sm:space-y-3.5 sm:px-2 sm:pt-5 sm:pb-3 md:space-y-4 md:pt-6 md:pb-4">
            <TravelLabel />
            <AccommodationTitle />
            <p
              className={`font-goudy-italic mx-auto max-w-lg px-1 pt-1 sm:px-2 sm:pt-2 ${sectionType.textRelaxed}`}
              style={{ color: palette.body }}
            >
              We&apos;re so excited to celebrate with you! For our family and friends traveling from
              overseas, we&apos;ve put together a few tips to help make your trip to Manila as smooth
              as possible.
            </p>
            <div className="pt-2 sm:pt-2.5">
              <OrnamentalDivider compact />
            </div>
          </header>

          {/* Content */}
          <div className="relative mx-4 pt-6 sm:mx-6 sm:pt-8 md:mx-7 md:pt-10">
            <SectionBlock step={sections[0].step} title={sections[0].title} index={0}>
              <p>
                If you&apos;re flying into the Philippines, you&apos;ll most likely arrive at Ninoy
                Aquino International Airport (NAIA).
              </p>
              <p>
                Before your flight, please complete the Philippines&apos; eTravel registration, which
                is required for arriving passengers. You can do this online within the required
                timeframe before your arrival.
              </p>
              <ETravelCallout />
            </SectionBlock>

            <SectionDivider />

            <SectionBlock step={sections[1].step} title={sections[1].title} index={1}>
              <p>
                We recommend downloading Grab, Southeast Asia&apos;s equivalent of Uber, before your
                trip. It&apos;s the easiest and most reliable way to get around Manila, including
                airport transfers.
              </p>
              <p>
                Once you&apos;ve landed, connected to Wi-Fi or mobile data, and collected your
                luggage, simply book a Grab ride to:
              </p>
              <AddressBlock />
            </SectionBlock>

            <SectionDivider />

            <SectionBlock step={sections[2].step} title={sections[2].title} index={2}>
              <p>
                Our reception will be held at Shangri-La The Fort, Manila. If you&apos;d like to book
                a room at the hotel, we recommend making your reservation early.
              </p>
              <PrimaryVenuePanel />
              <p>
                If you prefer to stay nearby, here are a few hotels in Bonifacio Global City that
                are just a short walk or drive from the venue:
              </p>
              <ul className="list-none space-y-2 pl-0">
                {nearbyHotels.map((hotel) => (
                  <li
                    key={hotel}
                    className={`${cinzel.className} ${sectionType.subheader} rounded-md border px-4 py-2.5 font-semibold leading-snug sm:rounded-lg sm:px-5 sm:py-3`}
                    style={{ ...softPanelStyle, color: palette.heading }}
                  >
                    {hotel}
                  </li>
                ))}
              </ul>
              <p>
                All of these hotels offer convenient access to the reception venue and are located
                close to restaurants, cafés, shopping, and other attractions in BGC.
              </p>
            </SectionBlock>

            <SectionDivider />

            <SectionBlock step={sections[3].step} title={sections[3].title} index={3}>
              <p>
                If you have some free time before or after the celebration, here are a few of our
                favorite spots around BGC and Makati. We hope you enjoy them as much as we do!
              </p>

              <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2 sm:gap-4 sm:pt-2">
                {favoriteCategories.map(({ title, spots }) => (
                  <SoftPanel key={title} className="h-full">
                    <p
                      className={`${cinzel.className} ${sectionType.label} mb-3 border-b pb-2.5 font-semibold uppercase tracking-[0.18em] sm:tracking-[0.22em]`}
                      style={{
                        color: palette.label,
                        borderColor: "color-mix(in srgb, var(--color-motif-deep) 10%, transparent)",
                      }}
                    >
                      {title}
                    </p>
                    <ul className="list-none space-y-2.5 pl-0">
                      {spots.map((spot) => (
                        <FavoriteSpot key={spot.name} name={spot.name} note={spot.note} />
                      ))}
                    </ul>
                  </SoftPanel>
                ))}
              </div>
            </SectionBlock>

            {/* Sign-off */}
            <footer className="mt-8 space-y-2 px-1 pt-6 text-center sm:mt-10 sm:space-y-2.5 sm:px-2 sm:pt-7 md:mt-12 md:pt-8">
              <div className="pb-4 sm:pb-5">
                <OrnamentalDivider compact />
              </div>
              <p
                className={`${aboveTheBeyond.className} ${sectionType.script}`}
                style={{
                  color: palette.accent,
                  textShadow: "0 1px 0 color-mix(in srgb, var(--color-welcome-bg) 90%, white)",
                }}
              >
                Safe travels, and see you soon!
              </p>
              <p
                className={`${cinzel.className} ${sectionType.label} font-semibold uppercase tracking-[0.2em] sm:tracking-[0.24em]`}
                style={{ color: palette.label }}
              >
                Bonifacio Global City · Manila
              </p>
            </footer>
          </div>
        </motion.article>
      </div>
    </section>
  )
}
