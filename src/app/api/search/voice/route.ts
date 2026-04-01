import { NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: Request) {
  try {
    const { audioBase64 } = await request.json();

    if (!audioBase64) {
      return NextResponse.json({ error: 'Audio is required' }, { status: 400 });
    }

    const zai = await ZAI.create();

    const response = await zai.audio.asr.create({
      file_base64: audioBase64,
    });

    const text = (response.text || '').trim();

    if (!text) {
      return NextResponse.json({ error: 'Could not transcribe audio' }, { status: 500 });
    }

    return NextResponse.json({ success: true, text });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Voice search failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
