export function NavButton({ text, onClick }) {
  return (
    <button onClick={onClick} className="w-full px-4 py-2 text-left cursor-pointer rounded-md bg-slate-700 text-white hover:bg-blue-600 transition font-semibold font-quick">
      {text}
    </button>
  );
}
