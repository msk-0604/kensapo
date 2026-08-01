import {
  PreviewPageHeader,
  PreviewScheduleForm,
} from "@/components/preview/PreviewSchedule";

export default function PreviewScheduleNewPage() {
  return (
    <>
      <PreviewPageHeader
        title="新しい予定を追加する"
        description="現場・作業員・日時を入れて登録します"
      />
      <PreviewScheduleForm mode="new" />
    </>
  );
}
