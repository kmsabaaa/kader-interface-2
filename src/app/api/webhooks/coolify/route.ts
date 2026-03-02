import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    
    // Log the event for the agent to see in logs
    console.log('--- COOLIFY EVENT RECEIVED ---');
    console.log(JSON.stringify(payload, null, 2));

    // In a real production environment, we would use a library to send 
    // a message back to the OpenClaw/WhatsApp gateway here.
    // For now, by logging it, I (Nahla) will see it in the runtime monitor.

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
}
