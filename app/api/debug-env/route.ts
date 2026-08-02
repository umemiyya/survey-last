import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    DATABASE_URL: process.env.DATABASE_URL
      ? process.env.DATABASE_URL.substring(0, 40) + '...'
      : 'TIDAK ADA',
    NODE_ENV: process.env.NODE_ENV,
  })
}