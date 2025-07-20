import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Container,
  useTheme,
  useMediaQuery
} from "@mui/material";
import { Settings, Link as LinkIcon } from "@mui/icons-material";
import Link from "next/link";

export default function Navigation() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <AppBar
      position="fixed"
      elevation={1}
      sx={{
        backgroundColor: 'background.paper',
        zIndex: theme.zIndex.appBar
      }}
    >
      <Container maxWidth="xl" sx={{ maxWidth: { xs: '100%', sm: '1280px' } }}>
        <Toolbar
          disableGutters
          sx={{
            py: { xs: 1, sm: 1 },
            minHeight: 'auto',
          }}
        >
          {/* Logo Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <Box
              sx={{
                width: { xs: 32, sm: 40 },
                height: { xs: 32, sm: 40 },
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: { xs: 1, sm: 1.5 }
              }}
            >
              <Box
                component="img"
                src="/mbspro-logo.png"
                alt="MBSPro Logo"
                sx={{
                  width: { xs: 24, sm: 32 },
                  height: { xs: 24, sm: 32 },
                  objectFit: 'contain'
                }}
              />
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                variant={isMobile ? "subtitle1" : "h6"}
                component="h1"
                sx={{
                  fontWeight: 600,
                  color: 'text.primary',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                MBSPro
              </Typography>
              {!isMobile && (
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    display: 'block'
                  }}
                >
                  AI receptionist
                </Typography>
              )}
            </Box>
          </Box>

          {/* Settings Section */}
          <Box>
            <Link href="/settings" passHref>
              <IconButton
                size="small"
                sx={{
                  color: 'text.primary',
                  '&:hover': {
                    backgroundColor: 'action.hover'
                  }
                }}
              >
                <Settings fontSize="small" />
              </IconButton>
            </Link>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
