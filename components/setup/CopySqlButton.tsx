"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function CopySqlButton({ sql }: { sql: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  }

  return (
    <Button type="button" fullWidth size="lg" onClick={handleCopy}>
      {copied ? "コピーしました" : "SQLをコピーする"}
    </Button>
  );
}
