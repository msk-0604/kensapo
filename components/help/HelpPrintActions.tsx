"use client";

import { Printer, FileDown } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function HelpPrintActions({ title }: { title: string }) {
  function handlePrint() {
    document.title = `KenSapo_${title}`;
    window.print();
  }

  return (
    <div className="no-print flex flex-wrap gap-3">
      <Button
        type="button"
        variant="secondary"
        size="md"
        className="flex-1 !min-h-[3.5rem] !text-lg"
        onClick={handlePrint}
      >
        <Printer className="h-5 w-5" aria-hidden />
        印刷
      </Button>
      <Button
        type="button"
        variant="secondary"
        size="md"
        className="flex-1 !min-h-[3.5rem] !text-lg"
        onClick={handlePrint}
      >
        <FileDown className="h-5 w-5" aria-hidden />
        PDFダウンロード
      </Button>
    </div>
  );
}
