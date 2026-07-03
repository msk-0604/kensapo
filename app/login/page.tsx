"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  isStrongEnoughPassword,
  isValidEmail,
  LIMITS,
} from "@/lib/security/validation";

type Mode = "login" | "signup";

export default function LoginPage() {
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
    const supabase = createClient();

    try {
      const normalizedEmail = email.trim().toLowerCase();
      if (!isValidEmail(normalizedEmail)) {
        throw new Error("\u6709\u52b9\u306a\u30e1\u30fc\u30eb\u30a2\u30c9\u30ec\u30b9\u3092\u5165\u529b\u3057\u3066\u304f\u3060\u3055\u3044");
      }
      if (!isStrongEnoughPassword(password)) {
        throw new Error("\u30d1\u30b9\u30ef\u30fc\u30c9\u306f8\u6587\u5b57\u4ee5\u4e0a\u3067\u5165\u529b\u3057\u3066\u304f\u3060\u3055\u3044");
      }

      if (mode === "login") {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });
        if (authError) throw authError;
        router.push("/dashboard");
        router.refresh();
        return;
      }

      const trimmedCompany = companyName.trim().slice(0, LIMITS.companyName);
      const trimmedName = name.trim().slice(0, LIMITS.userName);
      if (!trimmedCompany || !trimmedName) {
        throw new Error("\u4f1a\u793e\u540d\u3068\u304a\u540d\u524d\u3092\u5165\u529b\u3057\u3066\u304f\u3060\u3055\u3044");
      }

      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({ email: normalizedEmail, password });
      if (signUpError) throw signUpError;
      if (!signUpData.user) throw new Error("\u767b\u9332\u306b\u5931\u6557\u3057\u307e\u3057\u305f");

      const { error: rpcError } = await supabase.rpc("register_company", {
        company_name: trimmedCompany,
        user_name: trimmedName,
      });
      if (rpcError) throw rpcError;

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "\u30a8\u30e9\u30fc\u304c\u767a\u751f\u3057\u307e\u3057\u305f");
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
            Kensapo
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            {"\u73fe\u5834\u306e\u65e5\u5831\u30fb\u5199\u771f\u30fb\u5831\u544a\u66f8\u3092\u3001\u3053\u3053\u3067\u3002"}
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
            {"\u30ed\u30b0\u30a4\u30f3"}
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
            {"\u65b0\u898f\u767b\u9332"}
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
        >
          {mode === "signup" ? (
            <>
              <Input
                label={"\u4f1a\u793e\u540d"}
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                placeholder={"\u682a\u5f0f\u4f1a\u793e\u25cb\u25cb\u5efa\u8a2d"}
              />
              <Input
                label={"\u304a\u540d\u524d"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder={"\u5c71\u7530 \u592a\u90ce"}
              />
            </>
          ) : null}

          <Input
            label={"\u30e1\u30fc\u30eb\u30a2\u30c9\u30ec\u30b9"}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <Input
            label={"\u30d1\u30b9\u30ef\u30fc\u30c9"}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
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
            {mode === "login" ? "\u30ed\u30b0\u30a4\u30f3" : "\u30a2\u30ab\u30a6\u30f3\u30c8\u4f5c\u6210"}
          </Button>
        </form>
      </div>
    </div>
  );
}
