import { NextResponse } from 'next/server'

const SYSTEM_PROMPT = `You are a film equipment expert. Analyse the gear in these photos and return ONLY a JSON object with these exact fields:
{
  title: string (gear name and model, concise),
  category: one of: Camera|Lens|Lighting|Audio|Support|Monitor|Other,
  condition: one of: New|Like New|Good|Fair|Poor,
  description: string (2-3 sentences, professional, include key specs visible in the photos)
}
Return only the JSON, no other text.`

type ImagePayload = {
  mediaType: string
  data: string
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Anthropic API key is not configured.' }, { status: 500 })
  }

  let body: { images?: ImagePayload[] }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const images = body.images?.filter(img => img?.data && img?.mediaType) ?? []
  if (!images.length) {
    return NextResponse.json({ error: 'At least one image is required.' }, { status: 400 })
  }

  const content: Array<
    | { type: 'image'; source: { type: 'base64'; media_type: string; data: string } }
    | { type: 'text'; text: string }
  > = images.map(img => ({
    type: 'image' as const,
    source: {
      type: 'base64' as const,
      media_type: img.mediaType,
      data: img.data,
    },
  }))
  content.push({ type: 'text', text: 'Analyse the gear shown in these photos.' })

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content }],
    }),
  })

  if (!response.ok) {
    const errText = await response.text()
    return NextResponse.json(
      { error: errText || 'Anthropic API request failed.' },
      { status: response.status }
    )
  }

  const data = await response.json()
  const text = data.content?.find((block: { type: string }) => block.type === 'text')?.text
  if (!text) {
    return NextResponse.json({ error: 'No analysis returned.' }, { status: 502 })
  }

  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    return NextResponse.json({ error: 'Could not parse analysis response.' }, { status: 502 })
  }

  try {
    const analysis = JSON.parse(jsonMatch[0])
    return NextResponse.json({ analysis })
  } catch {
    return NextResponse.json({ error: 'Invalid JSON in analysis response.' }, { status: 502 })
  }
}
