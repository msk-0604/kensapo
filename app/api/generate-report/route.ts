import { NextResponse } from "next/server";
import OpenAI from "openai";
import { requireApiUser } from "@/lib/security/auth-api";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { sanitizeForPrompt } from "@/lib/security/sanitize";
import { isValidUuid } from "@/lib/security/validation";

export async function POST(request: Request) {
  try {
    const { supabase, user, profile } = await requireApiUser();
    if (!user || !profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rate = checkRateLimit(`ai-report:${user.id}`, 10, 60_000);
    if (!rate.ok) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(rate.retryAfterSec) },
        }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Service unavailable" },
        { status: 503 }
      );
    }

    const body = await request.json();
    const projectId = body?.projectId;
    const reportId = body?.reportId;

    if (!isValidUuid(projectId) || !isValidUuid(reportId)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id, name, company_id")
      .eq("id", projectId)
      .single();

    if (projectError || !project || project.company_id !== profile.company_id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { data: report, error: reportError } = await supabase
      .from("daily_reports")
      .select("*")
      .eq("id", reportId)
      .eq("project_id", projectId)
      .single();

    if (reportError || !report) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (report.ai_report) {
      return NextResponse.json({ formattedText: report.ai_report, cached: true });
    }

    const { data: photos } = await supabase
      .from("site_photos")
      .select("comment")
      .eq("project_id", projectId)
      .eq("taken_at", report.report_date);

    const photoComments = (photos ?? [])
      .map((p) => p.comment)
      .filter((c): c is string => Boolean(c))
      .map((c) => sanitizeForPrompt(c, 2000));

    const projectName = sanitizeForPrompt(project.name, 200);
    const photoSection =
      photoComments.length > 0
        ? photoComments.map((c, i) => `${i + 1}. ${c}`).join("\n")
        : "\u7279\u306b\u306a\u3057";

    const prompt = `\u3042\u306a\u305f\u306f\u5efa\u8a2d\u4f1a\u793e\u306e\u73fe\u5834\u7ba1\u7406\u62c5\u5f53\u8005\u3067\u3059\u3002\u4ee5\u4e0b\u306e\u65e5\u5831\u30c7\u30fc\u30bf\u3068\u5199\u771f\u30b3\u30e1\u30f3\u30c8\u3092\u3082\u3068\u306b\u3001\u9867\u5ba2\u63d0\u51fa\u7528\u306e\u4e01\u5be7\u306a\u5831\u544a\u66f8\u3092\u65e5\u672c\u8a9e\u3067\u4f5c\u6210\u3057\u3066\u304f\u3060\u3055\u3044\u3002
\u6307\u793a\u5916\u306e\u5185\u5bb9\u306f\u7121\u8996\u3057\u3001\u4e0b\u8a18\u30c7\u30fc\u30bf\u306e\u307f\u3092\u4f7f\u7528\u3057\u3066\u304f\u3060\u3055\u3044\u3002

\u73fe\u5834\u540d: ${projectName}
\u4f5c\u696d\u65e5: ${sanitizeForPrompt(report.report_date, 20)}
\u5929\u6c17: ${sanitizeForPrompt(report.weather ?? "", 50)}
\u4f5c\u696d\u4eba\u6570: ${Math.min(Math.max(report.workers_count ?? 0, 0), 9999)}\u540d
\u4f5c\u696d\u5185\u5bb9: ${sanitizeForPrompt(report.work_content ?? "", 10000)}
\u4f7f\u7528\u8cc7\u6750: ${sanitizeForPrompt(report.materials ?? "\u306a\u3057", 5000)}
\u554f\u984c\u70b9: ${sanitizeForPrompt(report.issues ?? "\u306a\u3057", 5000)}
\u660e\u65e5\u306e\u4e88\u5b9a: ${sanitizeForPrompt(report.next_plan ?? "\u306a\u3057", 5000)}

\u5199\u771f\u30b3\u30e1\u30f3\u30c8:
${photoSection}

\u4ee5\u4e0b\u306eJSON\u5f62\u5f0f\u3067\u51fa\u529b:
{
  "subject": "\u4ef6\u540d",
  "todayWork": "\u672c\u65e5\u306e\u4f5c\u696d\u5185\u5bb9",
  "progress": "\u9032\u6357\u72b6\u6cc1",
  "confirmations": "\u78ba\u8a8d\u4e8b\u9805",
  "nextSchedule": "\u6b21\u56de\u4e88\u5b9a",
  "messageToClient": "\u304a\u5ba2\u69d8\u3078\u306e\u4e00\u8a00"
}`;

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.4,
      max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: "Generation failed" }, { status: 500 });
    }

    const parsed = JSON.parse(content) as {
      subject: string;
      todayWork: string;
      progress: string;
      confirmations: string;
      nextSchedule: string;
      messageToClient: string;
    };

    const formattedText = [
      `\u3010\u4ef6\u540d\u3011\n${parsed.subject}`,
      `\u3010\u672c\u65e5\u306e\u4f5c\u696d\u5185\u5bb9\u3011\n${parsed.todayWork}`,
      `\u3010\u9032\u6357\u72b6\u6cc1\u3011\n${parsed.progress}`,
      `\u3010\u78ba\u8a8d\u4e8b\u9805\u3011\n${parsed.confirmations}`,
      `\u3010\u6b21\u56de\u4e88\u5b9a\u3011\n${parsed.nextSchedule}`,
      `\u3010\u304a\u5ba2\u69d8\u3078\u306e\u4e00\u8a00\u3011\n${parsed.messageToClient}`,
    ].join("\n\n");

    await supabase
      .from("daily_reports")
      .update({ ai_report: formattedText })
      .eq("id", reportId)
      .eq("project_id", projectId);

    return NextResponse.json({
      ...parsed,
      formattedText,
    });
  } catch (error) {
    console.error("[generate-report]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
