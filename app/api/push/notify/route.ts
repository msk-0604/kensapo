import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/security/auth-api";
import {
  isPushConfigured,
  sendPushToSubscription,
  type PushPayload,
} from "@/lib/push/server";

export async function POST(request: Request) {
  const { user, profile, supabase } = await requireApiUser();
  if (!user || !profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isPushConfigured()) {
    return NextResponse.json({ ok: false, skipped: true });
  }

  let body: {
    title?: string;
    body?: string;
    url?: string;
    tag?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const title = (body.title ?? "KenSapo").trim().slice(0, 80) || "KenSapo";
  const text = (body.body ?? "更新がありました").trim().slice(0, 200);
  const url = (body.url ?? "/dashboard").trim().slice(0, 200) || "/dashboard";
  const tag = (body.tag ?? "kensapo-update").trim().slice(0, 80);

  const payload: PushPayload = { title, body: text, url, tag };

  const { data: subscriptions, error } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth, user_id")
    .eq("company_id", profile.company_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const targets = (subscriptions ?? []).filter((s) => s.user_id !== user.id);
  if (targets.length === 0) {
    return NextResponse.json({ ok: true, sent: 0 });
  }

  let sent = 0;
  const goneIds: string[] = [];

  await Promise.all(
    targets.map(async (sub) => {
      const result = await sendPushToSubscription(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        payload
      );
      if (result === "ok") sent += 1;
      if (result === "gone") goneIds.push(sub.id);
    })
  );

  if (goneIds.length > 0) {
    await supabase.from("push_subscriptions").delete().in("id", goneIds);
  }

  return NextResponse.json({ ok: true, sent });
}
