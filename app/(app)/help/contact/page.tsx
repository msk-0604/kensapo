import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { HelpPrintActions } from "@/components/help/HelpPrintActions";
import { getContact } from "@/lib/help/load";

export default async function HelpContactPage() {
  const contact = await getContact();

  const fields = [
    { label: "サービス名", value: contact.serviceName },
    { label: "本番URL", value: contact.productionUrl },
    { label: "提供会社", value: contact.companyName },
    { label: "担当者", value: contact.contactPerson },
    { label: "電話", value: contact.phone },
    { label: "メール", value: contact.email },
    { label: "LINE / チャット", value: contact.lineOrChat },
    { label: "受付時間", value: contact.hours },
  ];

  return (
    <>
      <PageHeader
        title="お問い合わせ"
        description="困ったときの連絡先です。空欄は導入時に記入します。"
        backHref="/help"
        backLabel="取扱説明書に戻る"
        action={<HelpPrintActions title="お問い合わせ" />}
      />

      <div className="help-print-area space-y-6">
        <Card>
          <h2 className="mb-4 text-xl font-bold text-navy-950">
            {contact.serviceName} サポート窓口
          </h2>
          <dl className="space-y-3 text-lg">
            {fields.map((f) => (
              <div key={f.label}>
                <dt className="text-base text-gray-500">{f.label}</dt>
                <dd className="font-medium text-navy-950">
                  {f.value?.trim() ? f.value : "（導入時に記入）"}
                </dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card>
          <h2 className="mb-3 text-xl font-bold text-navy-950">
            問い合わせ時に伝えると早い情報
          </h2>
          <ol className="list-decimal space-y-2 pl-6 text-lg text-gray-800">
            {contact.tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ol>
        </Card>

        <Card>
          <h2 className="mb-3 text-xl font-bold text-navy-950">よくある確認</h2>
          <ul className="list-disc space-y-2 pl-6 text-lg text-gray-800">
            {contact.commonChecks.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </Card>

        <Card className="!border-amber-300 !bg-amber-50">
          <h2 className="mb-3 text-xl font-bold text-navy-950">緊急時</h2>
          <p className="text-lg leading-relaxed text-gray-800">
            {contact.emergencyNote}
          </p>
        </Card>
      </div>
    </>
  );
}
