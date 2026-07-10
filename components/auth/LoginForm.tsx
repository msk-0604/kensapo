"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList } from "lucide-react";
import { createClientWithConfig } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  isStrongEnoughPassword,
  isValidEmail,
  LIMITS,
} from "@/lib/security/validation";
import { PasskeyLoginButton } from "@/components/auth/PasskeyLoginButton";

type Mode = "login" | "signup";

type LoginFormProps = {
  supabaseUrl: string;
  supabaseAnonKey: string;
};

function withTimeout<T>(
  promise: PromiseLike<T>,
  ms: number,
  message: string
): Promise<T> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(message)), ms);
    }),
  ]);
}

export function LoginForm({ supabaseUrl, supabaseAnonKey }: LoginFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClientWithConfig(supabaseUrl, supabaseAnonKey);
      const normalizedEmail = email.trim().toLowerCase();
      if (!isValidEmail(normalizedEmail)) {
        throw new Error("有効なメールアドレスを入力してください");
      }
      if (!isStrongEnoughPassword(password)) {
        throw new Error("パスワードは8文字以上で入力してください");
      }

      if (mode === "login") {
        const { error: authError } = await withTimeout(
          supabase.auth.signInWithPassword({
            email: normalizedEmail,
            password,
          }),
          20000,
          "ログインがタイムアウトしました。通信環境を確認してください。"
        );
        if (authError) throw authError;
        router.push("/dashboard");
        router.refresh();
        return;
      }

      const trimmedCompany = companyName.trim().slice(0, LIMITS.companyName);
      const trimmedName = name.trim().slice(0, LIMITS.userName);
      if (!trimmedCompany || !trimmedName) {
        throw new Error("会社名とお名前を入力してください");
      }

      const { data: signUpData, error: signUpError } = await withTimeout(
        supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        }),
        20000,
        "登録がタイムアウトしました。しばらく待ってからもう一度お試しください。"
      );
      if (signUpError) throw signUpError;
      if (!signUpData.user) throw new Error("登録に失敗しました");

      if (!signUpData.session) {
        throw new Error(
          "確認メールを送信しました。メールのリンクを開いてから、ログインしてください。"
        );
      }

      const rpcResult = await withTimeout(
        supabase.rpc("register_company", {
          company_name: trimmedCompany,
          user_name: trimmedName,
        }),
        15000,
        "会社情報の登録がタイムアウトしました。"
      );
      const rpcError = rpcResult.error;
      if (rpcError) {
        if (rpcError.message.includes("already exists")) {
          throw new Error(
            "このアカウントはすでに登録済みです。ログインタブからログインしてください。"
          );
        }
        throw rpcError;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      let message =
        err instanceof Error ? err.message : "エラーが発生しました";
      if (message.includes("User already registered")) {
        message =
          "このメールアドレスはすでに登録済みです。ログインタブからログインしてください。";
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col justify-center bg-gray-50 px-4 py-8">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-900 shadow-lg">
            <ClipboardList className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-950">
            ケンサポ
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            現場の日報・写真・報告書を、ここで。
          </p>
        </div>

        <div className="mb-6 flex rounded-xl bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors ${
              mode === "login"
                ? "bg-navy-900 text-white"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            ログイン
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors ${
              mode === "signup"
                ? "bg-navy-900 text-white"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            新規登録
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
        >
          {mode === "signup" ? (
            <>
              <Input
                label="会社名"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                placeholder="株式会社○○建設"
              />
              <Input
                label="お名前"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="山田 太郎"
              />
            </>
          ) : null}

          <Input
            label="メールアドレス"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <Input
            label="パスワード"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
          />

          {error ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <Button type="submit" fullWidth loading={loading}>
            {mode === "login" ? "ログイン" : "アカウント作成"}
          </Button>

          {mode === "login" ? (
            <PasskeyLoginButton
              supabaseUrl={supabaseUrl}
              supabaseAnonKey={supabaseAnonKey}
            />
          ) : null}
        </form>
      </div>
    </div>
  );
}
