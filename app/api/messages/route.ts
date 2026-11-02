import { siteConfig } from "@/content/site"
import { type NextRequest, NextResponse } from "next/server"

// Google Apps Script URL for Messages sheet
const MESSAGES_SCRIPT_URL = siteConfig.googleAPI.message

export interface Message {
  timestamp: string
  name: string
  message: string
}

// GET: Fetch all messages from Google Sheets
export async function GET() {
  try {
    console.log('Fetching messages from:', MESSAGES_SCRIPT_URL)
    
    const response = await fetch(MESSAGES_SCRIPT_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      console.error('Failed to fetch from Google Script:', response.status, response.statusText)
      throw new Error('Failed to fetch messages')
    }

    const data = await response.json()
    console.log('Raw data from Google Script:', data)

    // Handle various response formats from Google Sheets
    const possibleRows = (data && (data.GoogleSheetData ?? data.rows ?? data.values ?? data)) as unknown
    
    if (!Array.isArray(possibleRows)) {
      console.warn("Unexpected messages payload shape; expected an array", data)
      return NextResponse.json([], { status: 200 })
    }

    const rows = possibleRows as string[][]
    
    if (rows.length === 0) {
      return NextResponse.json([], { status: 200 })
    }

    // Extract header row
    const [header, ...entries] = rows
    
    if (!Array.isArray(header)) {
      console.warn("Unexpected header row format", header)
      return NextResponse.json([], { status: 200 })
    }

    // Find column indices (case-insensitive)
    const idxName = header.findIndex((h: string) => typeof h === "string" && h.toLowerCase().includes("name"))
    const idxMsg = header.findIndex((h: string) => typeof h === "string" && h.toLowerCase().includes("message"))
    const idxTime = header.findIndex((h: string) => typeof h === "string" && h.toLowerCase().includes("timestamp"))

    const safeIdxName = idxName >= 0 ? idxName : 0
    const safeIdxMsg = idxMsg >= 0 ? idxMsg : 1
    const safeIdxTime = idxTime >= 0 ? idxTime : 2

    // Parse and filter messages
    const parsed: Message[] = entries
      .filter((row: unknown) => Array.isArray(row))
      .map((row: string[]) => ({
        timestamp: row[safeIdxTime] ?? "",
        name: row[safeIdxName] ?? "",
        message: row[safeIdxMsg] ?? "",
      }))
      .filter((m) => m.name.trim() && m.message.trim())
    
    console.log('Parsed messages:', parsed.length)
    return NextResponse.json(parsed, { status: 200 })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// POST: Add a new message (if you want to enable posting from dashboard)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, message } = body

    // Validation
    if (!name || !message || typeof name !== "string" || typeof message !== "string") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }

    if (name.trim().length === 0 || message.trim().length === 0) {
      return NextResponse.json({ error: "Name and message cannot be empty" }, { status: 400 })
    }

    // Post to Google Sheets
    const response = await fetch(MESSAGES_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name.trim(),
        message: message.trim(),
        timestamp: new Date().toISOString(),
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to post message to Google Sheets')
    }

    const data = await response.json()
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("Error posting message:", error)
    return NextResponse.json({ error: "Failed to post message" }, { status: 500 })
  }
}
