export default function AppLoading() {
  return (
    <div className="space-y-5 animate-pulse" aria-busy="true" aria-label="読み込み中">
      <div className="h-10 w-2/3 rounded-xl bg-gray-200" />
      <div className="h-6 w-1/2 rounded-lg bg-gray-100" />
      <div className="h-20 w-full rounded-2xl bg-gray-200" />
      <div className="h-20 w-full rounded-2xl bg-gray-100" />
      <div className="h-32 w-full rounded-2xl bg-gray-200" />
    </div>
  );
}
