"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ScanFace } from "lucide-react";
import { createPasskeyClientWithConfig } from "@/lib/supabase/client";
import { getPasskeyErrorMessage, isPasskeySupported } from "@/lib/auth/passkey";
import { Button } from "@/components/ui/Button";

type PasskeyLoginButtonProps = {
  supabaseUrl: string;
  supabaseAnonKey: string;
};

export function PasskeyLoginButton({
  supabaseUrl,
  supabaseAnonKey,
}: PasskeyLoginButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const supported = isPasskeySupported();

  async function handlePasskeyLogin() {
    setError("");
    setLoading(true);
    const supabase = createPasskeyClientWithConfig(
      supabaseUrl,
      supabaseAnonKey
    );

    try {
      const { error: authError } = await supabase.auth.signInWithPasskey();
      if (authError) throw authError;
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(getPasskeyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  if (!supported) return null;

  return (
    <section className="space-y-3">
      <div className="relative flex items-center py-2">
        <div className="flex-grow border-t border-gray-200" />
        <span className="mx-4 flex-shrink text-base text-gray-500">または</span>
        <div className="flex-grow border-t border-gray-200" />
      </div>

      <Button
        type="button"
        variant="secondary"
        fullWidth
        loading={loading}
        onClick={handlePasskeyLogin}
        className="gap-3"
      >
        <ScanFace className="h-6 w-6 shrink-0" aria-hidden />
        顔認証・指紋でログイン
      </Button>

      <p className="text-center text-sm leading-relaxed text-gray-500">
        iPhoneのFace IDやAndroidの指紋認証が使えます。
        <br />
        初回はメールでログイン後、設定から登録してください。
      </p>

      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </section>
  );
}
