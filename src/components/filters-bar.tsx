import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, RefreshCw } from "lucide-react";

interface FiltersBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  totalCalls: number;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export default function FiltersBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  totalCalls,
  onRefresh,
  isRefreshing
}: FiltersBarProps) {
  return (
    <Card className="p-4 sm:p-6 mb-4 sm:mb-6">
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div className="flex flex-col space-y-3 sm:space-y-4 lg:flex-row lg:items-center lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="relative flex-1 lg:max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search patients, calls..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 text-sm sm:text-base"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground hidden sm:inline">Status:</span>
            <select 
              value={statusFilter}
              onChange={(e) => onStatusChange(e.target.value)}
              className="appearance-none bg-card border border-border rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent min-w-0 flex-1 sm:flex-none sm:w-auto"
            >
              <option value="all">All</option>
              <option value="attention">Attention Needed</option>
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Summary and Refresh */}
        <div className="flex items-center justify-between lg:justify-end space-x-3 mt-2 lg:mt-0">
          <span className="text-xs sm:text-sm text-muted-foreground">
            <span className="font-medium">{totalCalls}</span> calls
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>
    </Card>
  );
}
