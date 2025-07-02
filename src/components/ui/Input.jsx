export function Input({ placeholder, reference }) {
    return (
        <div>
            <input
                ref={reference}
                placeholder={placeholder}
                type="text"
                className="px-4 py-3 border rounded m-2 font-mont font-thin w-full text-base"
            />
        </div>
    );
}