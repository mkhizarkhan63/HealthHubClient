"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import FiltersBar from "@/components/filters-bar";
import CallTable from "@/components/call-table";
import CallDrawer from "@/components/call-drawer";
import { Card } from "@/components/ui/card";
import type { CallDto } from "@/types/api";

export default function Dashboard() {
  const [selectedCallId, setSelectedCallId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");

  const queryClient = useQueryClient();
debugger;
  const { data: calls = [], isLoading, error, isFetching } = useQuery<CallDto[]>({
    queryKey: ["/api/calls"],
    refetchInterval: 30000, // Refresh every 30 seconds for real-time updates
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/calls"] });
  };

  // Filter calls based on search and filters
  const filteredCalls = calls.filter(call => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!call.patientName.toLowerCase().includes(query) &&
          !call.reason.toLowerCase().includes(query) &&
          !call.phoneNumber.includes(query)) {
        return false;
      }
    }

    // Status filter
    if (statusFilter !== "all") {
      switch (statusFilter) {
        case "attention":
          if (!call.needsAttention) return false;
          break;
        case "approved":
          if (call.status !== "approved") return false;
          break;
        case "completed":
          if (call.status !== "completed") return false;
          break;
      }
    }

    // Date filter (simplified - assumes today for now)
    if (dateFilter === "today") {
      const today = new Date();
      const callDate = new Date(call.timestamp);
      if (callDate.toDateString() !== today.toDateString()) {
        return false;
      }
    }

    return true;
  });

  const selectedCall = selectedCallId ? calls.find(call => call.id === selectedCallId) : null;

  if (error) {
    return (
      <div className="min-h-screen bg-muted">
        <Navigation />
        <main className="pt-20 sm:pt-24 px-4 sm:px-6 max-w-7xl mx-auto">
          <Card className="p-6 sm:p-8 text-center">
            <h2 className="text-xl font-semibold text-destructive mb-2">Error Loading Calls</h2>
            <p className="text-muted-foreground">
              Failed to connect to ElevenLabs API. Please check your API configuration.
            </p>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      <Navigation />
      
      <main className="pt-20 sm:pt-24 px-4 sm:px-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Today's Calls</h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <select 
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="appearance-none bg-card border border-border rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="today">Today</option>
                  <option value="week">Last 7 days</option>
                  <option value="custom">Custom range</option>
                </select>
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none bg-card border border-border rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="attention">Attention Needed</option>
                  <option value="approved">Approved</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </div>

          <FiltersBar 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            totalCalls={filteredCalls.length}
            onRefresh={handleRefresh}
            isRefreshing={isFetching}
          />
        </div>

        <CallTable 
          calls={filteredCalls}
          isLoading={isLoading}
          onViewTranscript={setSelectedCallId}
        />
      </main>

      <CallDrawer 
        call={selectedCall ?? null}
        isOpen={!!selectedCall}
        onClose={() => setSelectedCallId(null)}
      />
    </div>
  );
} 