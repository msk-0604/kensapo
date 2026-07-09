"use client";

import { useEffect, useState } from "react";
import { ScanFace, Trash2 } from "lucide-react";
import { createPasskeyClient } from "@/lib/supabase/client";
import { getPasskeyErrorMessage, isPasskeySupported } from "@/lib/auth/passkey";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type PasskeyItem = {
  id: string;
  friendly_name?: string | null;
  created_at?: string;
};

export function PasskeySettings() {
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [passkeys, setPasskeys] = useState<PasskeyItem[]>([]);
  const supported = isPasskeySupported();

  async function loadPasskeys() {
    setListLoading(true);
    const supabase = createPasskeyClient();
    try {
      const { data, error: listError } = await supabase.auth.passkey.list();
      if (listError) throw listError;
      setPasskeys(data ?? []);
    } catch {
      setPasskeys([]);
    } finally {
      setListLoading(false);
    }
  }

  useEffect(() => {
    if (supported) void loadPasskeys();
  }, [supported]);

  async function handleRegister() {
    setError("");
    setSuccess("");
    setLoading(true);
    const supabase = createPasskeyClient();

    try {
      const { error: registerError } = await supabase.auth.registerPasskey();
      if (registerError) throw registerError;
      setSuccess("顔認証・指紋ログインを登録しました。次回からワンタップでログインできます。");
      await loadPasskeys();
    } catch (err) {
      setError(getPasskeyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("この端末の顔認証ログインを削除しますか？")) return;

    setError("");
    setSuccess("");
    const supabase = createPasskeyClient();
    const { error: deleteError } = await supabase.auth.passkey.delete({
      passkeyId: id,
    });
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setSuccess("顔認証ログインを削除しました。");
    await loadPasskeys();
  }

  if (!supported) {
    return (
      <Card>
        <h2 className="mb-2 text-base font-bold text-gray-600">
          顔認証・指紋ログイン
        </h2>
        <p className="text-base text-gray-500">
          お使いのブラウザでは顔認証に対応していません。Safari（iPhone）やChrome（Android）をお試しください。
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="mb-2 text-base font-bold text-gray-600">
        顔認証・指紋ログイン
      </h2>
      <p className="mb-5 text-base leading-relaxed text-gray-600">
        Face IDや指紋認証で、次回からパスワードなしでログインできます。
      </p>

      <Button
        type="button"
        fullWidth
        loading={loading}
        onClick={handleRegister}
        className="gap-3"
      >
        <ScanFace className="h-6 w-6 shrink-0" aria-hidden />
        {loading ? "登録しています" : "この端末で顔認証を登録する"}
      </Button>

      {success ? (
        <p className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-base text-green-800">
          {success}
        </p>
      ) : null}
      {error ? (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-base text-red-700">
          {error}
        </p>
      ) : null}

      {listLoading ? (
        <p className="mt-5 text-base text-gray-500">読み込み中…</p>
      ) : passkeys.length > 0 ? (
        <ul className="mt-5 space-y-3">
          {passkeys.map((pk) => (
            <li
              key={pk.id}
              className="flex items-center justify-between gap-3 rounded-xl border-2 border-gray-100 bg-gray-50 px-4 py-3"
            >
              <div>
                <p className="text-base font-bold text-navy-950">
                  {pk.friendly_name || "登録済みの端末"}
                </p>
                {pk.created_at ? (
                  <p className="text-sm text-gray-500">
                    登録日：
                    {new Date(pk.created_at).toLocaleDateString("ja-JP")}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => handleDelete(pk.id)}
                className="flex min-h-[3rem] min-w-[3rem] items-center justify-center rounded-xl border-2 border-red-200 text-red-600"
                aria-label="削除"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-5 text-base text-gray-500">
          まだ登録されていません。
        </p>
      )}
    </Card>
  );
}
