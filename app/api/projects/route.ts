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

function toUserError(message: string | undefined, fallback: string): string {
  const m = (message || "").toLowerCase();
  if (m.includes("prime_contractor") || m.includes("progress_remarks")) {
    return "データベースの更新が必要です。supabase/RUN_CUSTOMER_WORKFLOW.sql を実行してください。";
  }
  if (m.includes("column") || m.includes("schema cache")) {
    return "データベースの準備が足りません。もう一度SQLを実行するか、管理者に連絡してください。";
  }
  return message || fallback;
}

type ProjectPayload = {
  name: string;
  address: string | null;
  manager_name: string | null;
  prime_contractor_name: string | null;
  start_date: string | null;
  end_date: string | null;
  status: ProjectStatus;
  memo: string | null;
};

function buildPayload(body: Record<string, unknown>): {
  payload?: ProjectPayload;
  error?: string;
} {
  const name = cleanText(body.name, 200);
  if (!name) {
    return { error: "現場の名前を入力してください" };
  }

  const statusRaw = typeof body.status === "string" ? body.status : "not_started";
  const status = ALLOWED_STATUS.has(statusRaw as ProjectStatus)
    ? (statusRaw as ProjectStatus)
    : "not_started";

  const start_date = cleanDate(body.start_date);
  const end_date = cleanDate(body.end_date);
  if (start_date && end_date && start_date > end_date) {
    return { error: "完了予定日は着工日と同じか、それより後にしてください" };
  }

  return {
    payload: {
      name,
      address: cleanText(body.address, 500),
      manager_name: cleanText(body.manager_name, 100),
      // 空欄は null（空文字を送ってもエラーにしない）
      prime_contractor_name: cleanText(body.prime_contractor_name, 200),
      start_date,
      end_date,
      status,
      memo: cleanText(body.memo, 2000),
    },
  };
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

  const built = buildPayload(body);
  if (!built.payload) {
    return NextResponse.json({ error: built.error }, { status: 400 });
  }

  const full = {
    company_id: profile.company_id,
    ...built.payload,
  };

  let { data, error } = await supabase
    .from("projects")
    .insert(full)
    .select("id, name")
    .single();

  // 新カラム未適用のDBでも現場登録自体は通す
  if (error && /prime_contractor|progress_remarks|column/i.test(error.message)) {
    const { prime_contractor_name: _p, ...legacy } = full;
    const retry = await supabase
      .from("projects")
      .insert(legacy)
      .select("id, name")
      .single();
    data = retry.data;
    error = retry.error;
  }

  if (error || !data) {
    return NextResponse.json(
      { error: toUserError(error?.message, "現場の保存に失敗しました") },
      { status: 500 }
    );
  }

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

  const built = buildPayload(body);
  if (!built.payload) {
    return NextResponse.json({ error: built.error }, { status: 400 });
  }

  let { data, error } = await supabase
    .from("projects")
    .update(built.payload)
    .eq("id", id)
    .eq("company_id", profile.company_id)
    .select("id, name")
    .single();

  if (error && /prime_contractor|progress_remarks|column/i.test(error.message)) {
    const { prime_contractor_name: _p, ...legacy } = built.payload;
    const retry = await supabase
      .from("projects")
      .update(legacy)
      .eq("id", id)
      .eq("company_id", profile.company_id)
      .select("id, name")
      .single();
    data = retry.data;
    error = retry.error;
  }

  if (error || !data) {
    return NextResponse.json(
      { error: toUserError(error?.message, "現場の更新に失敗しました") },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, id: data.id, name: data.name });
}
