export const AuthButton = ({ onClick, text }) => {
  return (
    <button
      type="submit"
      onClick={onClick}
      className="mt-2 cursor-pointer w-full px-4 py-3 rounded-lg font-semibold text-white
        bg-gradient-to-b from-[#1f5afe] to-[#0f4cf5] 
        shadow-[inset_0_4px_3px_-2px_#386fff,0_4px_5px_-3px_#0009]
        border-b-[2pt] border-[#083acd]
        transition-all duration-500 ease-in-out
        hover:translate-y-[-1px] hover:border-b-[4pt]
        active:translate-y-0 active:border-b active:shadow-[inset_0_4px_3px_-2px_#386fff,0_4px_5px_-3px_#0000]"
    >
      {text}
    </button>
  );
};
