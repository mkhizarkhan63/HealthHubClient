"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Container,
  Typography,
  Paper,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  useTheme,
  useMediaQuery,
  Alert,
  AlertTitle
} from "@mui/material";
import Navigation from "@/components/navigation";
import FiltersBar from "@/components/filters-bar";
import CallTable from "@/components/call-table";
import CallDrawer from "@/components/call-drawer";
import type { CallDto } from "@/types/api";

export default function Dashboard() {
  const [selectedCallId, setSelectedCallId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");

  const queryClient = useQueryClient();
  // debugger;
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (error) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
        <Navigation />
        <Container
          maxWidth="xl"
          sx={{
            pt: { xs: 10, sm: 12 },
            px: { xs: 2, sm: 3 }
          }}
        >
          <Paper sx={{ p: { xs: 3, sm: 4 }, textAlign: 'center' }}>
            <Alert severity="error">
              <AlertTitle>Error Loading Calls</AlertTitle>
              Failed to connect to ElevenLabs API. Please check your API configuration.
            </Alert>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      <Navigation />

      <Container
        maxWidth="xl"
        component="main"
        sx={{
          pt: { xs: 10, sm: 12 },
          px: { xs: 2, sm: 3 },
          maxWidth: { xs: '100%', sm: '1280px' },
        }}
      >
        {/* Header Section */}
        <Box sx={{ mb: { xs: 2, sm: 3 } }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { sm: 'center' },
              justifyContent: { sm: 'space-between' },
              mb: { xs: 2, sm: 3 },
              gap: { xs: 1, sm: 0 }
            }}
          >
            <Typography
              variant={isMobile ? "h5" : "h4"}
              component="h2"
              sx={{ fontWeight: 600, color: 'text.primary' }}
            >
              Today's Calls
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  {/* <InputLabel>Date Range</InputLabel> */}
                  <InputLabel id="date-filter-label">Date Range</InputLabel>
                  <Select
                    labelId="date-filter-label"
                    value={dateFilter}
                    label="Date Range"
                    onChange={(e) => setDateFilter(e.target.value)}
                  >
                    <MenuItem value="all">
                      All
                    </MenuItem>
                    <MenuItem value="today">Today</MenuItem>
                    <MenuItem value="week">Last 7 days</MenuItem>
                    <MenuItem value="custom">Custom range</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="attention">Attention Needed</MenuItem>
                    <MenuItem value="approved">Approved</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </Box>

          <FiltersBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            totalCalls={filteredCalls.length}
            onRefresh={handleRefresh}
            isRefreshing={isFetching}
          />
        </Box>

        <CallTable
          calls={filteredCalls}
          isLoading={isLoading}
          onViewTranscript={setSelectedCallId}
        />
      </Container>

      <CallDrawer
        call={selectedCall ?? null}
        isOpen={!!selectedCall}
        onClose={() => setSelectedCallId(null)}
      />
    </Box>
  );
} 