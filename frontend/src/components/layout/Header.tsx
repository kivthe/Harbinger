export function Header() {
  return (
    <header className="flex h-14 items-center justify-between border-b bg-white px-6">
      <h1 className="text-lg font-semibold text-gray-800">Harbinger</h1>
      <div className="text-sm text-gray-500">
        <span>Гость</span>
      </div>
    </header>
  );
}