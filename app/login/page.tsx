import {
  getSupabasePublicEnv,
  SUPABASE_ENV_SETUP_MESSAGE,
} from "@/lib/supabase/env";
import { LoginForm } from "@/components/auth/LoginForm";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  const env = getSupabasePublicEnv();

  if (!env) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <p className="max-w-md rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {SUPABASE_ENV_SETUP_MESSAGE}
        </p>
      </div>
    );
  }

  return (
    <LoginForm
      supabaseUrl={env.url}
      supabaseAnonKey={env.anonKey}
    />
  );
}
