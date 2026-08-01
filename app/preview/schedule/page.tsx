import Link from "next/link";
import {
  PREVIEW_DATE,
  PreviewCalendar,
  PreviewPageHeader,
  PreviewScheduleCard,
} from "@/components/preview/PreviewSchedule";
import { formatDate } from "@/lib/utils";

export default function PreviewScheduleListPage() {
  return (
    <>
      <PreviewPageHeader
        title="今日の行動予定"
        description={`${formatDate(PREVIEW_DATE)}の予定（プレビュー）`}
      />

      <section className="mb-6">
        <Link
          href="/preview/schedule/new"
          className="flex min-h-[4rem] w-full items-center justify-center rounded-2xl bg-navy-900 px-5 text-xl font-bold text-white"
        >
          新しい予定を追加する
        </Link>
        <p className="mt-2 text-center text-base font-medium text-gray-600">
          日付・現場・作業員を選んで登録します
        </p>
      </section>

      <PreviewCalendar selectedDate={PREVIEW_DATE} />

      <section className="mb-6">
        <div className="flex min-h-[4rem] w-full items-center justify-center rounded-2xl border-2 border-gray-300 bg-white px-5 text-xl font-bold text-navy-900">
          作業員の登録・一覧を見る
        </div>
      </section>

      <section className="mb-8">
        <div className="mb-4 rounded-2xl border-2 border-navy-900 bg-navy-900 px-5 py-4 text-white">
          <p className="text-base font-bold text-white/80">現場</p>
          <h2 className="mt-1 text-2xl font-bold leading-snug">
            ○○マンション改修工事
          </h2>
        </div>
        <div className="space-y-4">
          <Link href="/preview/schedule/detail" className="block">
            <PreviewScheduleCard
              workerName="佐藤一郎"
              title="給水配管工事"
              workContent="2階給水配管の接続"
              status="予定"
              showStart
            />
          </Link>
          <PreviewScheduleCard
            workerName="鈴木次郎"
            title="外壁補修"
            workContent="北側外壁のひび補修"
            status="作業中"
            showStart={false}
          />
        </div>
      </section>
    </>
  );
}
