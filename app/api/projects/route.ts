import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/security/auth-api";
import type { ProjectStatus } from "@/types/database";

const ALLOWED_STATUS = new Set<ProjectStatus>([
  "not_started",
  "in_progress",
  "completed",
]);

function cleanText(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

function cleanDate(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  return /^\d{4}-\d{2}-\d{2}$/.test(value.trim()) ? value.trim() : null;
}

export async function POST(request: Request) {
  const { user, profile, supabase } = await requireApiUser();
  if (!user || !profile) {
    return NextResponse.json({ error: "ログインし直してください" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "入力が正しくありません" }, { status: 400 });
  }

  const name = cleanText(body.name, 200);
  if (!name) {
    return NextResponse.json({ error: "現場の名前を入力してください" }, { status: 400 });
  }

  const statusRaw = typeof body.status === "string" ? body.status : "not_started";
  const status = ALLOWED_STATUS.has(statusRaw as ProjectStatus)
    ? (statusRaw as ProjectStatus)
    : "not_started";

  const payload = {
    company_id: profile.company_id,
    name,
    address: cleanText(body.address, 500),
    manager_name: cleanText(body.manager_name, 100),
    prime_contractor_name: cleanText(body.prime_contractor_name, 200),
    start_date: cleanDate(body.start_date),
    end_date: cleanDate(body.end_date),
    status,
    memo: cleanText(body.memo, 2000),
  };

  const { data, error } = await supabase
    .from("projects")
    .insert(payload)
    .select("id, name")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message || "現場の保存に失敗しました" },
      { status: 500 }
    );
  }

  // 工程は現場ごとにドラッグ／タップで追加（一括シードは工事進行画面から）
  return NextResponse.json({ ok: true, id: data.id, name: data.name });
}

export async function PATCH(request: Request) {
  const { user, profile, supabase } = await requireApiUser();
  if (!user || !profile) {
    return NextResponse.json({ error: "ログインし直してください" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "入力が正しくありません" }, { status: 400 });
  }

  const id = typeof body.id === "string" ? body.id : "";
  if (!id) {
    return NextResponse.json({ error: "現場が見つかりません" }, { status: 400 });
  }

  const name = cleanText(body.name, 200);
  if (!name) {
    return NextResponse.json({ error: "現場の名前を入力してください" }, { status: 400 });
  }

  const statusRaw = typeof body.status === "string" ? body.status : "not_started";
  const status = ALLOWED_STATUS.has(statusRaw as ProjectStatus)
    ? (statusRaw as ProjectStatus)
    : "not_started";

  const payload = {
    name,
    address: cleanText(body.address, 500),
    manager_name: cleanText(body.manager_name, 100),
    prime_contractor_name: cleanText(body.prime_contractor_name, 200),
    start_date: cleanDate(body.start_date),
    end_date: cleanDate(body.end_date),
    status,
    memo: cleanText(body.memo, 2000),
  };

  const { data, error } = await supabase
    .from("projects")
    .update(payload)
    .eq("id", id)
    .eq("company_id", profile.company_id)
    .select("id, name")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message || "現場の更新に失敗しました" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, id: data.id, name: data.name });
}
