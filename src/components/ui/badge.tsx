import { cn } from "@/lib/utils/cn";

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "easy" | "medium" | "hard" | "outline" | "muted";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide",
        variant === "default" && "bg-primary/15 text-primary",
        variant === "easy" && "bg-easy/15 text-easy",
        variant === "medium" && "bg-medium/15 text-medium",
        variant === "hard" && "bg-hard/15 text-hard",
        variant === "outline" && "border border-border text-muted-foreground",
        variant === "muted" && "bg-muted text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}

export function DifficultyBadge({
  difficulty,
}: {
  difficulty: "Easy" | "Medium" | "Hard";
}) {
  const variant =
    difficulty === "Easy" ? "easy" : difficulty === "Medium" ? "medium" : "hard";
  return <Badge variant={variant}>{difficulty}</Badge>;
}
