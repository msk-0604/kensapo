import { cn } from "@/lib/utils";
import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

interface FieldProps {
  label: string;
  error?: string;
  hint?: string;
}

export function Input({
  label,
  error,
  hint,
  className,
  id,
  ...props
}: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  const fieldId = id ?? label;
  return (
    <section className="space-y-2">
      <label
        htmlFor={fieldId}
        className="block text-[1.0625rem] font-bold text-gray-800"
      >
        {label}
      </label>
      <input
        id={fieldId}
        className={cn(
          "w-full rounded-2xl border-2 border-gray-300 bg-white px-5 py-4 text-lg text-gray-900 placeholder:text-gray-400 focus:border-navy-700 focus:outline-none focus:ring-4 focus:ring-navy-700/15",
          error && "border-red-500 focus:border-red-500 focus:ring-red-500/15",
          className
        )}
        {...props}
      />
      {hint && !error ? (
        <p className="text-base text-gray-500">{hint}</p>
      ) : null}
      {error ? <p className="text-base text-red-600">{error}</p> : null}
    </section>
  );
}

export function Textarea({
  label,
  error,
  hint,
  className,
  id,
  ...props
}: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const fieldId = id ?? label;
  return (
    <section className="space-y-2">
      <label
        htmlFor={fieldId}
        className="block text-[1.0625rem] font-bold text-gray-800"
      >
        {label}
      </label>
      <textarea
        id={fieldId}
        className={cn(
          "min-h-[140px] w-full resize-y rounded-2xl border-2 border-gray-300 bg-white px-5 py-4 text-lg text-gray-900 placeholder:text-gray-400 focus:border-navy-700 focus:outline-none focus:ring-4 focus:ring-navy-700/15",
          error && "border-red-500",
          className
        )}
        {...props}
      />
      {hint && !error ? (
        <p className="text-base text-gray-500">{hint}</p>
      ) : null}
      {error ? <p className="text-base text-red-600">{error}</p> : null}
    </section>
  );
}

export function Select({
  label,
  error,
  children,
  className,
  id,
  ...props
}: FieldProps & SelectHTMLAttributes<HTMLSelectElement>) {
  const fieldId = id ?? label;
  return (
    <section className="space-y-2">
      <label
        htmlFor={fieldId}
        className="block text-[1.0625rem] font-bold text-gray-800"
      >
        {label}
      </label>
      <select
        id={fieldId}
        className={cn(
          "w-full rounded-2xl border-2 border-gray-300 bg-white px-5 py-4 text-lg text-gray-900 focus:border-navy-700 focus:outline-none focus:ring-4 focus:ring-navy-700/15",
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error ? <p className="text-base text-red-600">{error}</p> : null}
    </section>
  );
}
