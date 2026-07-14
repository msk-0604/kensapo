import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/security/auth-api";
import { getVapidPublicKey, isPushConfigured } from "@/lib/push/server";

export async function GET() {
  const publicKey = getVapidPublicKey();
  return NextResponse.json({
    configured: isPushConfigured(),
    publicKey,
  });
}

export async function POST(request: Request) {
  const { user, profile, supabase } = await requireApiUser();
  if (!user || !profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isPushConfigured()) {
    return NextResponse.json(
      { error: "Push is not configured" },
      { status: 503 }
    );
  }

  let body: {
    endpoint?: string;
    keys?: { p256dh?: string; auth?: string };
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const endpoint = body.endpoint?.trim();
  const p256dh = body.keys?.p256dh?.trim();
  const auth = body.keys?.auth?.trim();
  if (!endpoint || !p256dh || !auth) {
    return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
  }

  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: user.id,
      company_id: profile.company_id,
      endpoint,
      p256dh,
      auth,
      user_agent: request.headers.get("user-agent")?.slice(0, 300) ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "endpoint" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const { user, profile, supabase } = await requireApiUser();
  if (!user || !profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { endpoint?: string } = {};
  try {
    body = await request.json();
  } catch {
    // endpoint 省略時は自分の購読をすべて削除
  }

  let query = supabase
    .from("push_subscriptions")
    .delete()
    .eq("user_id", user.id);

  if (body.endpoint?.trim()) {
    query = query.eq("endpoint", body.endpoint.trim());
  }

  const { error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
