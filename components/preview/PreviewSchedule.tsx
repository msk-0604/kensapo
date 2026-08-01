import Link from "next/link";
import {
  addDaysISO,
  formatYearMonth,
  getMonthMatrixISO,
  sameMonthISO,
  todayISO,
} from "@/lib/utils";

/** レビュー用の固定デモ日（カレンダーが安定して見える） */
export const PREVIEW_DATE = "2026-08-01";

export const PREVIEW_COUNTS: Record<string, number> = {
  "2026-07-28": 1,
  "2026-07-30": 2,
  "2026-08-01": 2,
  "2026-08-05": 1,
  "2026-08-12": 3,
};

export function PreviewPageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <section className="mb-8">
      <h1 className="text-[1.875rem] font-bold leading-tight text-navy-950">
        {title}
      </h1>
      {description ? (
        <p className="mt-2 text-lg leading-relaxed text-gray-600">
          {description}
        </p>
      ) : null}
    </section>
  );
}

export function PreviewCalendar({ selectedDate = PREVIEW_DATE }: { selectedDate?: string }) {
  const monthDates = getMonthMatrixISO(selectedDate);
  const today = todayISO();
  const weekdays = ["月", "火", "水", "木", "金", "土", "日"];

  return (
    <section className="mb-8 rounded-2xl border-2 border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="min-h-[3.5rem] rounded-xl border-2 border-gray-200 px-3 text-lg font-bold leading-[3.5rem] text-navy-900">
          前の月
        </span>
        <p className="text-center text-xl font-bold text-navy-950">
          {formatYearMonth(selectedDate)}
        </p>
        <span className="min-h-[3.5rem] rounded-xl border-2 border-gray-200 px-3 text-lg font-bold leading-[3.5rem] text-navy-900">
          次の月
        </span>
      </div>
      <div className="mb-4 flex min-h-[3rem] w-full items-center justify-center rounded-xl bg-navy-900 px-4 text-lg font-bold text-white">
        今日の日付に戻る
      </div>
      <div className="mb-1 grid grid-cols-7 gap-1">
        {weekdays.map((label) => (
          <div
            key={label}
            className="py-1 text-center text-base font-bold text-gray-500"
          >
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {monthDates.map((date) => {
          const selected = date === selectedDate;
          const inMonth = sameMonthISO(date, selectedDate);
          const count = PREVIEW_COUNTS[date] ?? 0;
          const dayNum = Number(date.slice(8, 10));
          const isToday = date === today;
          return (
            <div
              key={date}
              className={`flex min-h-[4.25rem] flex-col items-center justify-start rounded-xl border-2 px-0.5 py-1.5 text-center ${
                selected
                  ? "border-navy-900 bg-navy-900 text-white"
                  : inMonth
                    ? "border-gray-100 bg-gray-50 text-navy-950"
                    : "border-transparent text-gray-400"
              } ${isToday && !selected ? "border-navy-400" : ""}`}
            >
              <span className="text-lg font-bold leading-none">{dayNum}</span>
              {count > 0 ? (
                <span
                  className={`mt-1 rounded-full px-1.5 text-sm font-bold leading-tight ${
                    selected ? "bg-white/20" : "bg-navy-900 text-white"
                  }`}
                >
                  {count}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-center text-sm text-gray-500">
        ※プレビューでは月の切り替えはできません
      </p>
    </section>
  );
}

export function PreviewScheduleCard({
  workerName,
  title,
  workContent,
  status,
  showStart = true,
}: {
  workerName: string;
  title: string;
  workContent: string;
  status: string;
  showStart?: boolean;
}) {
  return (
    <div className="rounded-2xl border-2 border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 rounded-2xl border-2 border-navy-200 bg-navy-900/5 px-4 py-3">
        <p className="text-base font-bold text-navy-700">作業員</p>
        <p className="mt-1 text-2xl font-bold text-navy-950">{workerName}</p>
      </div>
      <p className="text-base font-bold text-navy-700">08:30〜17:00</p>
      <p className="mt-1 text-xl font-bold text-navy-950">{title}</p>
      <p className="mt-1 text-base text-gray-600">現場：○○マンション改修工事</p>
      <div className="mt-4 rounded-xl bg-gray-50 px-4 py-3">
        <p className="text-base font-bold text-gray-600">作業内容</p>
        <p className="mt-1 text-xl text-navy-950">{workContent}</p>
      </div>
      <p className="mt-2 text-lg font-bold text-gray-700">状態：{status}</p>

      {showStart ? (
        <div className="mt-5 space-y-3">
          <div>
            <div className="flex min-h-[4.5rem] w-full items-center justify-center rounded-2xl bg-navy-900 px-6 text-2xl font-bold text-white">
              作業を開始する
            </div>
            <p className="mt-2 text-center text-base font-medium text-gray-600">
              押すと、関係者に通知が届きます
            </p>
          </div>
          <div>
            <div className="flex min-h-[4.5rem] w-full items-center justify-center rounded-2xl border-2 border-gray-300 bg-white px-6 text-2xl font-bold text-navy-900">
              作業を終了する
            </div>
            <p className="mt-2 text-center text-base font-medium text-gray-600">
              作業が終わったことを記録します
            </p>
          </div>
        </div>
      ) : null}

      <div className="mt-4 space-y-3">
        <Link
          href="/preview/schedule/edit"
          className="flex min-h-[4rem] w-full items-center justify-center rounded-2xl border-2 border-gray-300 bg-white px-5 text-xl font-bold text-navy-900"
        >
          内容を変更する
        </Link>
        <div className="flex min-h-[4rem] w-full items-center justify-center rounded-2xl bg-red-600 px-5 text-xl font-bold text-white">
          この予定を削除する
        </div>
      </div>
    </div>
  );
}

export function PreviewScheduleForm({ mode }: { mode: "new" | "edit" }) {
  const date = mode === "edit" ? PREVIEW_DATE : addDaysISO(PREVIEW_DATE, 1);

  return (
    <div className="space-y-6">
      <Field label="作業する日">
        <div className="rounded-2xl border-2 border-gray-300 bg-white px-4 py-4 text-xl">
          {date}
        </div>
      </Field>
      <Field label="会社名（任意）">
        <div className="rounded-2xl border-2 border-gray-300 bg-white px-4 py-4 text-xl text-gray-500">
          例：○○建設
        </div>
      </Field>
      <Field label="場所（任意）">
        <div className="rounded-2xl border-2 border-gray-300 bg-white px-4 py-4 text-xl text-gray-500">
          例：東京都世田谷区
        </div>
      </Field>
      <Field label="現場名・タイトル（任意）">
        <div className="rounded-2xl border-2 border-gray-300 bg-white px-4 py-4 text-xl">
          {mode === "edit" ? "給水配管工事" : ""}
        </div>
      </Field>
      <Field label="現場（必須）">
        <div className="rounded-2xl border-2 border-gray-300 bg-white px-4 py-4 text-xl">
          ○○マンション改修工事
        </div>
      </Field>
      <Field label="作業内容">
        <div className="min-h-[6rem] rounded-2xl border-2 border-gray-300 bg-white px-4 py-4 text-xl">
          {mode === "edit" ? "2階給水配管の接続" : "例：給水配管施工"}
        </div>
      </Field>
      <Field label="担当作業員（任意）">
        <div className="rounded-2xl border-2 border-gray-300 bg-white px-4 py-4 text-xl">
          佐藤一郎
        </div>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="開始予定">
          <div className="rounded-2xl border-2 border-gray-300 bg-white px-4 py-4 text-xl">
            08:30
          </div>
        </Field>
        <Field label="終了予定">
          <div className="rounded-2xl border-2 border-gray-300 bg-white px-4 py-4 text-xl">
            17:00
          </div>
        </Field>
      </div>
      <Field label="メモ（任意）">
        <div className="min-h-[4rem] rounded-2xl border-2 border-gray-300 bg-white px-4 py-4 text-xl text-gray-500">
          {"\u00A0"}
        </div>
      </Field>
      {mode === "edit" ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="flex min-h-[4.5rem] items-center justify-center rounded-2xl border-2 border-gray-300 bg-white text-2xl font-bold text-navy-900">
            やめる
          </div>
          <div className="flex min-h-[4.5rem] items-center justify-center rounded-2xl bg-navy-900 text-2xl font-bold text-white">
            変更を保存する
          </div>
        </div>
      ) : (
        <>
          <div className="flex min-h-[4.5rem] w-full items-center justify-center rounded-2xl bg-navy-900 px-6 text-2xl font-bold text-white">
            この予定を登録する
          </div>
          <p className="text-center text-base font-medium text-gray-600">
            日付・現場・作業員を選んで登録します
          </p>
        </>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-lg font-bold text-navy-950">{label}</span>
      {children}
    </label>
  );
}
