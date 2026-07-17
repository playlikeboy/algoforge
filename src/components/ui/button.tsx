import { cn } from "@/lib/utils/cn";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "sm" | "md" | "lg" | "icon";
};

export function Button({
  className,
  variant = "default",
  size = "md",
  ...props
}: Props) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        variant === "default" &&
          "bg-primary text-primary-foreground hover:opacity-90",
        variant === "outline" &&
          "border border-border bg-card hover:bg-muted text-foreground",
        variant === "ghost" && "hover:bg-muted text-foreground",
        variant === "secondary" && "bg-muted text-foreground hover:bg-muted/80",
        size === "sm" && "h-8 px-3 text-sm",
        size === "md" && "h-10 px-4 text-sm",
        size === "lg" && "h-11 px-6 text-base",
        size === "icon" && "h-9 w-9",
        className
      )}
      {...props}
    />
  );
}
