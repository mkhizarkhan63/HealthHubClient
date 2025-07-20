import {
  Paper,
  Box,
  TextField,
  Button,
  Typography,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  InputAdornment,
  useTheme,
  useMediaQuery
} from "@mui/material";
import { Search, Refresh } from "@mui/icons-material";

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  return (
    <Paper
      sx={{
        p: { xs: 2, sm: 3 },
        mb: { xs: 2, sm: 3 }
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          alignItems: { lg: 'center' },
          justifyContent: { lg: 'space-between' },
          gap: { xs: 2, sm: 2, lg: 0 }
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', lg: 'row' },
            alignItems: { lg: 'center' },
            gap: { xs: 1.5, sm: 2, lg: 2 }
          }}
        >
          {/* Search */}
          <Box sx={{ flex: { lg: 1 }, maxWidth: { lg: 400 } }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search patients, calls..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'background.paper'
                }
              }}
            />
          </Box>

          {/* Status Filter */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {!isMobile && (
              <Typography
                variant="body2"
                sx={{ color: 'text.secondary', minWidth: 'fit-content' }}
              >
                Status:
              </Typography>
            )}
            <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 180 } }}>
              <Select
                value={statusFilter}
                onChange={(e) => onStatusChange(e.target.value)}
                sx={{ bgcolor: 'background.paper' }}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="attention">Attention Needed</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* Summary and Refresh */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: { xs: 'space-between', lg: 'flex-end' },
            gap: 1.5,
            mt: { xs: 1, lg: 0 }
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: 'text.secondary' }}
          >
            <Box component="span" sx={{ fontWeight: 500 }}>
              {totalCalls}
            </Box>{' '}
            calls
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={onRefresh}
            disabled={isRefreshing}
            startIcon={
              <Refresh
                sx={{
                  fontSize: 16,
                  ...(isRefreshing && {
                    animation: 'spin 1s linear infinite',
                    '@keyframes spin': {
                      '0%': {
                        transform: 'rotate(0deg)',
                      },
                      '100%': {
                        transform: 'rotate(360deg)',
                      },
                    },
                  })
                }}
              />
            }
            sx={{ minWidth: 'auto' }}
          >
            {!isMobile && 'Refresh'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
