import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const dataDir = path.join(process.cwd(), 'data')

export async function GET() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir)
  }

  const categories = fs.readdirSync(dataDir)
    .filter(file => file.endsWith('.json'))
    .map(file => file.replace('.json', ''))

  return NextResponse.json(categories)
}

export async function POST(req: Request) {
  const { category } = await req.json()

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir)
  }

  const filePath = path.join(dataDir, `${category}.json`)

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]))
  }

  return NextResponse.json({ success: true })
}

