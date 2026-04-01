import { NextResponse } from 'next/server';

// Demo auth endpoints - in production, use NextAuth.js
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'login') {
      const { email, password } = body;
      // Demo authentication
      if (!email) {
        return NextResponse.json({ error: 'Email is required' }, { status: 400 });
      }

      let role = 'customer';
      if (email.includes('admin')) role = 'admin';
      else if (email.includes('seller')) role = 'seller';

      const user = {
        id: 'user_' + Date.now(),
        name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        email,
        role,
        token: 'demo_token_' + Date.now(),
      };

      return NextResponse.json({ user, token: user.token });
    }

    if (action === 'register') {
      const { name, email } = body;
      const user = {
        id: 'user_' + Date.now(),
        name,
        email,
        role: 'customer',
        token: 'demo_token_' + Date.now(),
      };
      return NextResponse.json({ user, token: user.token }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
