import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { db } from '../../../../lib/db'

export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.SIGNING_SECRET
  if (!SIGNING_SECRET) return new Response('Error: Missing Secret', { status: 500 })

  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) return new Response('Error: Missing Headers', { status: 400 })

  const payload = await req.json()
  const body = JSON.stringify(payload)
  const wh = new Webhook(SIGNING_SECRET)
  let evt: WebhookEvent

  try {
    evt = wh.verify(body, { 'svix-id': svix_id, 'svix-timestamp': svix_timestamp, 'svix-signature': svix_signature }) as WebhookEvent
  } catch (err) {
    return new Response('Error: Verification Failed', { status: 400 })
  }

  const { id } = evt.data
  const eventType = evt.type
  
  if (eventType === 'user.created' || eventType === 'user.updated') {
    await db.user.upsert({
      where: { clerkId: id },
      update: {},
      create: { clerkId: id as string, role: "CONSUMER" },
    })
  }
  if (eventType === 'user.deleted') {
    await db.user.delete({ where: { clerkId: id } })
  }
  return new Response('Sync OK', { status: 200 })
}
