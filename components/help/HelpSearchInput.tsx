"use client";

import { Search } from "lucide-react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
};

export function HelpSearchInput({
  value,
  onChange,
  placeholder = "キーワードで検索",
  id = "help-search",
}: Props) {
  return (
    <label htmlFor={id} className="relative block">
      <span className="sr-only">{placeholder}</span>
      <Search
        className="pointer-events-none absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-gray-500"
        aria-hidden
      />
      <input
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-[4rem] w-full rounded-2xl border-2 border-gray-300 bg-white py-3 pl-14 pr-4 text-xl text-navy-950 outline-none placeholder:text-gray-400 focus:border-navy-800"
        autoComplete="off"
      />
    </label>
  );
}
