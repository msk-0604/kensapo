import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { HintBox } from "@/components/ui/HintBox";
import { getSites } from "@/lib/sites";
import { formatDate } from "@/lib/utils";

const INTENT_MESSAGES: Record<string, { title: string; body: string }> = {
  photo: {
    title: "?????????????????",
    body: "??????????????????????????????",
  },
  report: {
    title: "???????????????",
    body: "??????????????????????????????????",
  },
};

export default async function SitesPage({
  searchParams,
}: {
  searchParams: Promise<{ intent?: string }>;
}) {
  const { intent } = await searchParams;
  const sites = await getSites();
  const intentMessage = intent ? INTENT_MESSAGES[intent] : null;

  return (
    <>
      <PageHeader
        title="????"
        description={
          sites.length > 0
            ? `${sites.length}??????????????`
            : "??????????????"
        }
        backHref="/dashboard"
        backLabel="??????"
        action={
          <Link href="/sites/new">
            <Button fullWidth size="md">
              ??????????
            </Button>
          </Link>
        }
      />

      {intentMessage ? (
        <HintBox>
          <p className="font-bold">{intentMessage.title}</p>
          <p className="mt-1">{intentMessage.body}</p>
        </HintBox>
      ) : null}

      {sites.length === 0 ? (
        <EmptyState
          title="??????????"
          description="???????????????????????????????????"
          steps={[
            "??????????????????",
            "???????????????????",
            "???????????????????",
          ]}
          action={
            <Link href="/sites/new">
              <Button fullWidth>??????????</Button>
            </Link>
          }
        />
      ) : (
        <ul className="space-y-4">
          {sites.map((site) => (
            <li key={site.id}>
              <Link
                href={
                  intent === "photo"
                    ? `/sites/${site.id}/photos`
                    : intent === "report"
                      ? `/sites/${site.id}/reports/new`
                      : `/sites/${site.id}`
                }
              >
                <Card className="transition-colors hover:border-navy-700">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xl font-bold text-navy-950">
                        {site.name}
                      </h3>
                      <p className="mt-2 text-base text-gray-600">
                        {site.address || "????????"}
                      </p>
                      <p className="mt-2 text-base text-gray-500">
                        ???{site.manager_name || "???"}
                      </p>
                      <p className="mt-1 text-base text-gray-500">
                        ???{formatDate(site.start_date)} ?{" "}
                        {formatDate(site.end_date)}
                      </p>
                    </div>
                    <StatusBadge status={site.status} />
                  </div>
                  <p className="mt-4 text-base font-bold text-navy-900">
                    {intent === "photo"
                      ? "???????????? ?"
                      : intent === "report"
                        ? "?????????? ?"
                        : "?????????? ?"}
                  </p>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
