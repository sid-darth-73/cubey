export function AddButton({ onClick = null }) {
  return (
    <button
      onClick={onClick}
      title="Add New"
      className="group cursor-pointer outline-none hover:rotate-90 duration-300 
                 h-10 w-10 flex items-center justify-center p-1 rounded-md mx-2"
    >
      <svg
        className="stroke-slate-400 fill-none group-hover:fill-slate-500 group-active:stroke-slate-200 
                   group-active:fill-slate-600 group-active:duration-0 duration-300"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
      >
        <path
          strokeWidth="1.5"
          d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z"
        />
        <path strokeWidth="1.5" d="M8 12H16" />
        <path strokeWidth="1.5" d="M12 16V8" />
      </svg>
    </button>
  );
}
