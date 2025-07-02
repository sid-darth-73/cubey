const baseClasses =
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

const variantClasses = {
  default:
    "border-transparent bg-green-600 text-primary-foreground shadow hover:bg-primary/80",
  secondary:
    "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
  destructive:
    "border-transparent bg-red-500 text-destructive-foreground shadow hover:bg-destructive/80",
  outline: "text-foreground",
};

export function Badge({ className = "", variant = "default", ...props }) {
  const variantClass = variantClasses[variant] || variantClasses.default;

  return (
    <div className={`${baseClasses} ${variantClass} ${className}`} {...props} />
  );
}
