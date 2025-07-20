import { 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Button, 
  Chip, 
  Skeleton, 
  Box, 
  Typography,
  useTheme,
  useMediaQuery
} from "@mui/material";
import { Check, ErrorOutline } from "@mui/icons-material";
import { formatTime, formatPhoneNumber, truncateText } from "@/lib/utils";
import type { CallDto } from "@/types/api";

interface CallTableProps {
  calls: CallDto[];
  isLoading: boolean;
  onViewTranscript: (callId: number) => void;
}

export default function CallTable({ calls, isLoading, onViewTranscript }: CallTableProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  const getOutcomeColor = (outcome: string) => {
    switch (outcome.toLowerCase()) {
      case 'booked':
        return 'success';
      case 'transferred':
        return 'info';
      default:
        return 'default';
    }
  };

  const getVerificationColor = (isVerified: boolean) => {
    return isVerified ? 'success' : 'warning';
  };

  if (isLoading) {
    return (
      <Paper sx={{ overflow: 'hidden' }}>
        <Box sx={{ p: 3 }}>
          <Skeleton variant="text" width={192} height={32} sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[...Array(5)].map((_, i) => (
              <Box key={i} sx={{ display: 'flex', gap: 2 }}>
                <Skeleton variant="text" width={64} height={22} />
                <Skeleton variant="text" width={192} height={22} />
                <Skeleton variant="text" width={256} height={22} />
                <Skeleton variant="text" width={96} height={22} />
                <Skeleton variant="text" width={64} height={22} />
                <Skeleton variant="text" width={64} height={22} />
                <Skeleton variant="text" width={128} height={22} />
              </Box>
            ))}
          </Box>
        </Box>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: 'grey.100' }}>
            <TableCell 
              sx={{ 
                px: { xs: 1.5, sm: 3 }, 
                py: { xs: 1, sm: 1.2 },
                fontSize: { xs: '0.75rem', sm: '0.875rem' }
              }}
            >
              Time
            </TableCell>
            <TableCell 
              sx={{ 
                px: { xs: 1.5, sm: 3 }, 
                py: { xs: 1, sm: 1.2 },
                fontSize: { xs: '0.75rem', sm: '0.875rem' }
              }}
            >
              Patient
            </TableCell>
            <TableCell 
              sx={{ 
                px: { xs: 1.5, sm: 3 }, 
                py: { xs: 1, sm: 1.2 },
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                display: { xs: 'none', lg: 'table-cell' }
              }}
            >
              Appointment
            </TableCell>
            <TableCell 
              sx={{ 
                px: { xs: 1.5, sm: 3 }, 
                py: { xs: 1, sm: 1.2 },
                fontSize: { xs: '0.75rem', sm: '0.875rem' }
              }}
            >
              Outcome
            </TableCell>
            <TableCell 
              sx={{ 
                px: { xs: 1.5, sm: 3 }, 
                py: { xs: 1, sm: 1.2 },
                fontSize: { xs: '0.75rem', sm: '0.875rem' }
              }}
            >
              Transcript
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {calls.length === 0 ? (
            <TableRow>
              <TableCell 
                colSpan={5} 
                sx={{ 
                  textAlign: 'center', 
                  py: { xs: 3, sm: 4 }, 
                  px: 2 
                }}
              >
                <Typography 
                  variant="body2" 
                  sx={{ color: 'text.secondary' }}
                >
                  No calls found. Calls will appear here when they are received from ElevenLabs.
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            calls.map((call) => (
              <TableRow 
                key={call.id} 
                sx={{ 
                  '&:hover': { bgcolor: 'grey.50' },
                  transition: 'background-color 0.2s'
                }}
              >
                <TableCell 
                  sx={{ 
                    px: { xs: 1.5, sm: 3 }, 
                    py: { xs: 1, sm: 1.2 },
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography 
                      variant="body2" 
                      sx={{ color: 'text.secondary', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    >
                      {formatTime(call.timestamp)}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: 'text.secondary', 
                        display: { xs: 'none', sm: 'block' } 
                      }}
                    >
                      {new Date(call.timestamp).toLocaleDateString('en-AU', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell 
                  sx={{ 
                    px: { xs: 1.5, sm: 3 }, 
                    py: { xs: 1, sm: 1.2 }
                  }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 500, 
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                      }}
                    >
                      {call.patientName}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: 'text.secondary', 
                        display: { xs: 'none', sm: 'block' } 
                      }}
                    >
                      {formatPhoneNumber(call.phoneNumber)}
                    </Typography>
                    <Chip 
                      size="small"
                      label={
                        call.isVerified ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Check sx={{ fontSize: 12 }} />
                            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                              Verified
                            </Box>
                            <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                              ✓
                            </Box>
                          </Box>
                        ) : (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <ErrorOutline sx={{ fontSize: 12 }} />
                            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                              Unverified
                            </Box>
                            <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                              !
                            </Box>
                          </Box>
                        )
                      }
                      color={getVerificationColor(call.isVerified)}
                      variant="outlined"
                      sx={{ 
                        width: 'fit-content',
                        fontSize: '0.75rem',
                        height: 20
                      }}
                    />
                  </Box>
                </TableCell>
                <TableCell 
                  sx={{ 
                    px: 3, 
                    py: 2,
                    display: { xs: 'none', lg: 'table-cell' }
                  }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {call.appointmentType || "Unknown Type"}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {truncateText(call.reason, 35)}
                    </Typography>
                    {call.doctor && (
                      <Typography 
                        variant="caption" 
                        sx={{ color: 'primary.main', fontWeight: 500 }}
                      >
                        {call.doctor.startsWith('Dr.') ? call.doctor : `Dr. ${call.doctor}`}
                      </Typography>
                    )}
                    {call.appointmentDateTime && (
                      <Typography variant="caption" sx={{ color: 'primary.main' }}>
                        {new Date(call.appointmentDateTime).toLocaleDateString('en-AU', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell 
                  sx={{ 
                    px: { xs: 1.5, sm: 3 }, 
                    py: { xs: 1, sm: 1.2 }
                  }}
                >
                  <Chip 
                    label={call.outcome}
                    color={getOutcomeColor(call.outcome)}
                    size="small"
                    sx={{ fontSize: '0.75rem' }}
                  />
                </TableCell>
                <TableCell 
                  sx={{ 
                    px: { xs: 1.5, sm: 3 }, 
                    py: { xs: 1, sm: 1.2 }
                  }}
                >
                  <Button 
                    variant="text" 
                    size="small"
                    onClick={() => onViewTranscript(call.id)}
                    sx={{ 
                      color: 'primary.main',
                      p: 0,
                      minWidth: 'auto',
                      fontWeight: 500,
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      '&:hover': {
                        bgcolor: 'transparent',
                        color: 'primary.dark'
                      }
                    }}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
