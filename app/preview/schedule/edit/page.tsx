import {
  PreviewPageHeader,
  PreviewScheduleForm,
} from "@/components/preview/PreviewSchedule";

export default function PreviewScheduleEditPage() {
  return (
    <>
      <PreviewPageHeader
        title="予定を変更する"
        description="登録済みの予定を直す画面です"
      />
      <PreviewScheduleForm mode="edit" />
    </>
  );
}
