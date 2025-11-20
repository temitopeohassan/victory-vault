import { NextResponse } from 'next/server'

// Return a minimal 1x1 transparent PNG favicon to prevent 404 errors
// This is a minimal valid ICO file (actually a PNG)
// Base64 encoded 1x1 transparent PNG
const favicon = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
)

export async function GET() {
  return new NextResponse(favicon, {
    status: 200,
    headers: {
      'Content-Type': 'image/x-icon',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}

