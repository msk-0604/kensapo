import {
  PreviewPageHeader,
  PreviewScheduleCard,
} from "@/components/preview/PreviewSchedule";

export default function PreviewScheduleDetailPage() {
  return (
    <>
      <PreviewPageHeader
        title="予定の詳細"
        description="一覧の予定を開いたあとの画面イメージです"
      />
      <PreviewScheduleCard
        workerName="佐藤一郎"
        title="給水配管工事"
        workContent="2階給水配管の接続"
        status="予定"
        showStart
      />
    </>
  );
}
