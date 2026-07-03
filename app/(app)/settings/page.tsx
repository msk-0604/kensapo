import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { getProfile, getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const user = await getSessionUser();
  const profile = await getProfile();
  if (!user || !profile) redirect("/login");

  const supabase = await createClient();
  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("id", profile.company_id)
    .single();

  return (
    <>
      <PageHeader
        title={"\u8a2d\u5b9a"}
        description={"\u30a2\u30ab\u30a6\u30f3\u30c8\u60c5\u5831"}
      />

      <section className="space-y-4">
        <Card>
          <h2 className="mb-3 text-sm font-semibold text-gray-500">
            {"\u4f1a\u793e\u60c5\u5831"}
          </h2>
          <dl className="space-y-2 text-sm">
            <section>
              <dt className="text-gray-500">{"\u4f1a\u793e\u540d"}</dt>
              <dd className="font-medium text-navy-950">{company?.name}</dd>
            </section>
          </dl>
        </Card>

        <Card>
          <h2 className="mb-3 text-sm font-semibold text-gray-500">
            {"\u30d7\u30ed\u30d5\u30a3\u30fc\u30eb"}
          </h2>
          <dl className="space-y-2 text-sm">
            <section>
              <dt className="text-gray-500">{"\u304a\u540d\u524d"}</dt>
              <dd className="font-medium text-navy-950">{profile.name}</dd>
            </section>
            <section>
              <dt className="text-gray-500">{"\u30e1\u30fc\u30eb"}</dt>
              <dd className="font-medium">{user.email}</dd>
            </section>
            <section>
              <dt className="text-gray-500">{"\u6a29\u9650"}</dt>
              <dd className="font-medium">{profile.role}</dd>
            </section>
          </dl>
        </Card>

        <Card className="!bg-navy-900/5">
          <p className="text-sm text-gray-600">
            Kensapo MVP - {"\u73fe\u5834\u306e\u65e5\u5831\u30fb\u5199\u771f\u30fbAI\u5831\u544a\u66f8\u3092\u4e00\u5143\u7ba1\u7406"}
          </p>
        </Card>
      </section>
    </>
  );
}
