import { NextResponse } from "next/server";

/** 旧・自動生成API（廃止） */
export async function POST() {
  return NextResponse.json(
    { error: "この機能は利用できません" },
    { status: 410 }
  );
}
