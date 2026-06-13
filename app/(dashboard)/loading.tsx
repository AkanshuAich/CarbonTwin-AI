import { RefreshCw } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full animate-in fade-in duration-500">
      <div className="w-16 h-16 rounded-full gradient-brand-subtle flex items-center justify-center mb-4">
        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
      </div>
      <h2 className="text-xl font-semibold mb-2">Loading data...</h2>
      <p className="text-muted-foreground">Preparing your dashboard</p>
    </div>
  );
}
