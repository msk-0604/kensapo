import { redirect } from "next/navigation";

/** 旧一覧画面。ホームへ誘導する */
export default function AiReportsRedirect() {
  redirect("/dashboard");
}
