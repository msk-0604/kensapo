import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { HelpPrintActions } from "@/components/help/HelpPrintActions";
import { getChangelog } from "@/lib/help/load";

export default async function HelpChangelogPage() {
  const data = await getChangelog();

  return (
    <>
      <PageHeader
        title="更新履歴"
        description="ヘルプとシステムの主な変更点"
        backHref="/help"
        backLabel="取扱説明書に戻る"
        action={<HelpPrintActions title="更新履歴" />}
      />

      <div className="help-print-area space-y-4">
        {data.entries.map((entry) => (
          <Card key={entry.id}>
            <p className="text-base font-bold text-navy-700">{entry.date}</p>
            <h2 className="mt-1 text-xl font-bold text-navy-950">{entry.title}</h2>
            <p className="mt-3 text-lg leading-relaxed text-gray-800">
              {entry.body}
            </p>
          </Card>
        ))}
      </div>
    </>
  );
}
