import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpinningLoadingProps {
  color?: string;
  className?: string;
}

export default function SpinningLoading({ color, className }: SpinningLoadingProps) {
  return (
    <div className={cn("flex items-center justify-center", className)} role="status">
      <Loader2 className={cn("h-6 w-6 animate-spin", color)} />
      <span className="sr-only">Loading...</span>
    </div>
  );
}
