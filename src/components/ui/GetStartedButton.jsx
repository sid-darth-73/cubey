export const GetStartedButton = ({onClick, text}) => {
  return (
    <button
      className="m-2 px-3 py-2 rounded-lg font-semibold cursor-pointer
        bg-gradient-to-b from-[#1f5afe] to-[#0f4cf5] animate-bounce text-white
        shadow-[inset_0_4px_3px_-2px_#386fff,0_4px_5px_-3px_#0009]
        border-b-[2pt]
        transition-all duration-500 ease-in-out
        hover:translate-y-[-1px] hover:border-b-[4pt]
        active:translate-y-0 active:border-b border-[#083acd]
        active:shadow-[inset_0_4px_3px_-2px_#386fff,0_4px_5px_-3px_#0000]"
        onClick={onClick}
    >
      <span>{text}</span>
      <kbd
        className="ml-2 px-2 py-0.5 rounded
          bg-[#3e6eff]
          shadow-[inset_0_-3px_3px_-2px_#1f54f0,inset_0_3px_3px_-2px_#658dff,0_2px_2px_-2px_#0005,0_0_0_2px_#0d47f0]"
      >
        G
      </kbd>
    </button>
  );
};
