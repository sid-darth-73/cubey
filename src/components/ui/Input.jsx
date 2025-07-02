export function Input({
  placeholder = "enter",
  reference = null,
  value,
  onChange,
  type = "text",
}) {
  return (
    <div>
      <input
        ref={reference}
        value={value}
        onChange={onChange}
        type={type}
        placeholder={placeholder}
        className="px-4 py-3 border rounded m-2 font-mont font-thin w-full text-base"
      />
    </div>
  );
}