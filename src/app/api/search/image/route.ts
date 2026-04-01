import { NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: Request) {
  try {
    const { imageBase64, mimeType } = await request.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }

    const zai = await ZAI.create();

    const response = await zai.chat.completions.createVision({
      model: 'glm-4v-flash',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'You are a product search assistant for an e-commerce platform called Shopnexa. Analyze this image and return ONLY a short search query (2-5 words) that would find similar products on an e-commerce site. Focus on: product type, brand, color, key features. Return ONLY the search query text, nothing else. No explanations, no JSON, no quotes.',
            },
            {
              type: 'image_url',
              image_url: {
                url: 'data:' + (mimeType || 'image/jpeg') + ';base64,' + imageBase64,
              },
            },
          ],
        },
      ],
      thinking: { type: 'disabled' },
    });

    const query = (response.choices[0]?.message?.content || '').trim();

    if (!query) {
      return NextResponse.json({ error: 'Could not analyze image' }, { status: 500 });
    }

    return NextResponse.json({ success: true, query });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Image search failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
