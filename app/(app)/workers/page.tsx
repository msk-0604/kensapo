import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { WORKER_STATUS_LABELS } from "@/lib/constants";
import { getWorkers } from "@/lib/workers";

export default async function WorkersPage() {
  const workers = await getWorkers();

  return (
    <>
      <PageHeader
        title="作業員一覧"
        description={
          workers.length > 0
            ? `${workers.length}人の作業員が登録されています`
            : "作業員を登録して、予定管理に使えます"
        }
        backHref="/dashboard"
        backLabel="ホームに戻る"
        action={
          <Link href="/workers/new">
            <Button fullWidth size="md">
              作業員を登録する
            </Button>
          </Link>
        }
      />

      {workers.length === 0 ? (
        <EmptyState
          title="作業員がまだいません"
          description="名前・電話番号・職種を登録すると、作業員予定に割り当てられるようになります。"
          action={
            <Link href="/workers/new">
              <Button fullWidth>作業員を登録する</Button>
            </Link>
          }
        />
      ) : (
        <ul className="space-y-4">
          {workers.map((worker) => (
            <li key={worker.id}>
              <Card>
                <h3 className="text-xl font-bold text-navy-950">{worker.name}</h3>
                <p className="mt-2 text-base text-gray-600">
                  職種：{worker.trade || "未設定"}
                </p>
                <p className="mt-1 text-base text-gray-600">
                  電話：{worker.phone || "未登録"}
                </p>
                <p className="mt-2 text-base font-bold text-navy-800">
                  {WORKER_STATUS_LABELS[worker.status]}
                </p>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
