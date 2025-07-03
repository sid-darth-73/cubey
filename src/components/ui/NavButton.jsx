export function NavButton({ text = "Button", onClick }) {
  return (
    <button
      onClick={onClick}
      className="relative inline-block min-w-48 px-8 py-2 my-1 tracking-wider rounded-full bg-slate-400 cursor-pointer "
    >
      {text}
    </button>
  );
}
