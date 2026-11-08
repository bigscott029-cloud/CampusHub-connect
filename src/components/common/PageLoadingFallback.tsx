import { Loader2 } from "lucide-react";

export const PageLoadingFallback = () => {
  return (
    <div className="flex min-h-[60vh] w-full flex-col items-center justify-center p-6 text-center animate-fade-in">
      <div className="relative flex items-center justify-center mb-3">
        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-xs">
          <Loader2 className="h-6 w-6 text-primary animate-spin" />
        </div>
      </div>
      <p className="text-xs font-semibold tracking-wider uppercase text-muted-foreground font-mono">
        Loading CampusHub...
      </p>
    </div>
  );
};

export default PageLoadingFallback;
