import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Drawer,
  Box,
  Typography,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Paper,
  useTheme,
  useMediaQuery
} from "@mui/material";
import {
  Close,
  ExpandMore
} from "@mui/icons-material";
import { apiRequest } from "@/lib/queryClient";
import { formatTime, highlightKeywords } from "@/lib/utils";
import type { CallDto } from "@/types/api";

interface CallDrawerProps {
  call: CallDto | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CallDrawer({ call, isOpen, onClose }: CallDrawerProps) {
  const queryClient = useQueryClient();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const escalateMutation = useMutation({
    mutationFn: async (callId: number) => {
      const response = await apiRequest("POST", `/api/calls/${callId}/escalate`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calls"] });
      onClose();
    },
  });

  const handleEscalate = () => {
    if (call) {
      escalateMutation.mutate(call.id);
    }
  };

  if (!call) return null;

  const formatDateTime = (timestamp: Date | string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();

    if (isToday) {
      return `Today, ${formatTime(date)}`;
    }

    return date.toLocaleDateString('en-AU', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: '100%', sm: '40%' },
            minWidth: { sm: 400 },
            maxWidth: 400,
          }
        }
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: '8px 16px',
            borderBottom: 1,
            borderColor: 'divider'
          }}
        >
          <Box>
            <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
              {call.patientName}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: '0px' }}>
              {formatDateTime(call.timestamp)}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Patient Information */}
            <Paper sx={{ bgcolor: 'grey.50', p: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 500, mb: 1.5 }}>
                Patient Information
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Phone:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {call.phoneNumber}
                  </Typography>
                </Box>
                {call.dob && (
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      DOB:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {(() => {
                        const date = new Date(call.dob);
                        return isNaN(date.getTime()) ? call.dob : date.toLocaleDateString('en-AU', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        });
                      })()}
                    </Typography>
                  </Box>
                )}
                {call.appointmentType && (
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Appointment Type:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {call.appointmentType}
                    </Typography>
                  </Box>
                )}
                {call.doctor && (
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Doctor:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {call.doctor.startsWith('Dr.') ? call.doctor : `Dr. ${call.doctor}`}
                    </Typography>
                  </Box>
                )}
                {call.appointmentDateTime && (
                  <Box sx={{ gridColumn: 'span 2' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Scheduled:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {new Date(call.appointmentDateTime).toLocaleDateString('en-AU', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>

            {/* Transcript Section */}
            <Paper sx={{ bgcolor: 'grey.50' }}>
              <Accordion defaultExpanded sx={{ bgcolor: 'transparent', boxShadow: 'none' }}>
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  sx={{ px: 2, minHeight: 'auto' }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                    Call Transcript
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pb: 2, px: 2 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {call.transcript && call.transcript.length > 0 ? (
                      call.transcript.map((entry, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                          <Chip
                            label={entry.timestamp}
                            size="small"
                            variant="outlined"
                            sx={{
                              fontSize: '0.75rem',
                              height: 24,
                              flexShrink: 0
                            }}
                          />
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: 500,
                                color: entry.speaker === 'AI Assistant' ? 'primary.main' : 'text.primary'
                              }}
                            >
                              {entry.speaker}:
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ mt: 0.5 }}
                              dangerouslySetInnerHTML={{
                                __html: highlightKeywords(entry.message, entry.keywords)
                              }}
                            />
                          </Box>
                        </Box>
                      ))
                    ) : (
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                        No transcript available for this call.
                      </Typography>
                    )}
                  </Box>
                </AccordionDetails>
              </Accordion>
            </Paper>

            {/* AI Decision Log */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 500, mb: 1.5 }}>
                AI Decision Log
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {call.aiDecisions && call.aiDecisions.length > 0 ? (
                  call.aiDecisions.map((decision, index) => (
                    <Chip
                      key={index}
                      label={decision}
                      variant="outlined"
                      size="small"
                    />
                  ))
                ) : (
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                    No AI decisions recorded for this call.
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
}
