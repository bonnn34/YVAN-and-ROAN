import type { ProposalRoleDefinition } from "@/lib/proposal-types"

/**
 * Proposal invite roles — edit this file to add, remove, or update roles.
 * `roleCategory` must match the RoleCategory column in your entourage Google Sheet.
 *
 * For Matron vs Maid of Honor, use the honor-attendant entry + `proposal.honorAttendant` in site.ts.
 */
export const proposalRoleDefinitions: ProposalRoleDefinition[] = [
  {
    id: "best-man",
    title: "Best Man",
    category: "Entourage",
    type: "entourage",
    roleCategory: "Best Man",
    description:
      "To stand beside the groom on one of the most important days of his life — offering counsel, steady support, and a trusted presence from preparation through celebration, and helping keep every moment joyful and meaningful.",
  },
  {
    id: "honor-attendant",
    variant: "honorAttendant",
    category: "Entourage",
    type: "entourage",
    descriptions: {
      "Matron of Honor":
        "To stand beside the bride with love and grace — lending a steady hand through every step of the day, sharing in her joy and excitement, and helping make each moment leading up to and on our wedding day truly unforgettable.",
      "Maid of Honor":
        "To stand beside the bride with love and loyalty — lending a steady hand through every step of the day, sharing in her joy and excitement, and helping make each moment leading up to and on our wedding day truly unforgettable.",
    },
  },
  {
    id: "bridesmaid",
    title: "Bridesmaid",
    category: "Entourage",
    type: "entourage",
    roleCategory: "Bridesmaids",
    description:
      "To walk alongside the bride with warmth and encouragement — sharing in her joy, lifting her spirits, and standing with her through this beautiful chapter as she prepares to begin a new life filled with love.",
  },
  {
    id: "groomsman",
    title: "Groomsman",
    category: "Entourage",
    type: "entourage",
    roleCategory: "Groomsmen",
    description:
      "To stand with the groom as he begins this new chapter — celebrating his happiness, offering your friendship and support, and helping ensure the day unfolds smoothly so every memory we make together is one to cherish.",
  },
  {
    id: "flower-girl",
    title: "Flower Girl",
    category: "Entourage",
    type: "entourage",
    roleCategory: "Flower Girls",
    description:
      "To scatter petals down the aisle with delight and wonder — bringing sweetness, innocence, and a touch of magic to the ceremony that will make our walk toward forever even more beautiful.",
  },
  {
    id: "ring-bearer",
    title: "Ring Bearer",
    category: "Entourage",
    type: "entourage",
    roleCategory: "Ring Bearer",
    description:
      "To carry the rings with care and present them at the altar — holding symbols of our promise with pride and tenderness, and playing a cherished part in the moment we exchange our vows.",
  },
  {
    id: "coin-bearer",
    title: "Coin Bearer",
    category: "Entourage",
    type: "entourage",
    roleCategory: "Coin Bearer",
    description:
      "To carry the arrhae with reverence during our wedding ceremony — honoring this beautiful Filipino tradition and representing the blessings, prosperity, and shared future we gratefully begin together.",
  },
  {
    id: "bible-bearer",
    title: "Bible Bearer",
    category: "Entourage",
    type: "entourage",
    roleCategory: "Bible Bearer",
    description:
      "To carry the Bible with reverence during our wedding ceremony — honoring the Word that guides our faith and our marriage, and playing a meaningful part as we pledge our lives to one another before God.",
  },
  {
    id: "herald-bearer",
    title: "Herald Bearer",
    category: "Entourage",
    type: "entourage",
    roleCategory: "Herald Bearer",
    description:
      "To carry the herald with reverence during our wedding ceremony — honoring the symbol of our faith and our marriage, and playing a meaningful part as we pledge our lives to one another before God.",
  },
  {
    id: "banner-bearer",
    title: "Banner Bearer",
    category: "Entourage",
    type: "entourage",
    roleCategory: "Banner Bearer",
    description:
      "To carry our wedding banner down the aisle with joy and pride — announcing the bride's arrival and bringing a little extra excitement to the beginning of our forever.",
  },
  {
    id: "little-bride",
    title: "Little Bride",
    category: "Entourage",
    type: "entourage",
    roleCategory: "Little Bride",
    description:
      "To walk gracefully down the aisle and add a touch of innocence and charm — bringing light and joy to our ceremony and making the beginning of our forever feel even more special.",
  },
  {
    id: "candle-sponsor",
    title: "Candle Sponsor",
    category: "Entourage",
    type: "entourage",
    roleCategory: "Candle Sponsors",
    description:
      "To light the candles that symbolize the union of two families — a sacred gesture of love, faith, and the joining of our lives, witnessed with honor and heartfelt blessing.",
  },
  {
    id: "veil-sponsor",
    title: "Veil Sponsor",
    category: "Entourage",
    type: "entourage",
    roleCategory: "Veil Sponsors",
    description:
      "To place the veil over us as a symbol of unity and protection — covering us with love and grace, and blessing our marriage with the warmth of your presence and prayers.",
  },
  {
    id: "cord-sponsor",
    title: "Cord Sponsor",
    category: "Entourage",
    type: "entourage",
    roleCategory: "Cord Sponsors",
    description:
      "To bind the cord around us, signifying our lifelong bond — a beautiful act of faith that ties our hearts together and blesses the commitment we make before God and those we love.",
  },
  {
    id: "principal-sponsor-ninong",
    title: "Ninong",
    category: "Principal Sponsor",
    type: "sponsor-ninong",
    roleCategory: "Principal Sponsors",
    description:
      "To serve as our Ninong and principal sponsor — a spiritual guide and second father whose wisdom, prayers, and steady support will help light our path as husband and wife through every season of married life.",
  },
  {
    id: "principal-sponsor-ninang",
    title: "Ninang",
    category: "Principal Sponsor",
    type: "sponsor-ninang",
    roleCategory: "Principal Sponsors",
    description:
      "To serve as our Ninang and principal sponsor — a spiritual guide and second mother whose love, counsel, and prayers will surround our marriage with grace, strength, and enduring blessing.",
  },
]

/** Legacy proposal URLs that should still open the correct role. */
export const proposalRoleIdAliases: Record<string, string> = {
  "matron-of-honor": "honor-attendant",
  "maid-of-honor": "honor-attendant",
  "Herald Bearer": "herald-bearer",
  "herald bearer": "herald-bearer",
}
