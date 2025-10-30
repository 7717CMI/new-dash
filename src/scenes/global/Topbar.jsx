import React, { useContext } from "react";
import { Box, IconButton, Button, Typography, useTheme } from "@mui/material";
import { ColorModeContext, tokens } from "../../theme";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";

function Topbar({ isSidebarOpen, setIsSidebarOpen }) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);

  const iconColor = theme.palette.mode === "dark" ? colors.grey[100] : "#000000";

  return (
    <Box sx={{ 
      backgroundColor: theme.palette.mode === "dark" ? colors.primary[600] : "#ffffff",
      borderBottom: `1px solid ${theme.palette.mode === "dark" ? colors.primary[400] : colors.grey[300]}`,
      py: 1,
      px: 2
    }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" position="relative">
        {/* LEFT SIDE - MENU BUTTON */}
        <Box>
          <IconButton onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <MoreVertIcon sx={{ color: iconColor }} />
          </IconButton>
        </Box>

        {/* CENTER - DISCLAIMER TEXT & SUBSCRIPTION BUTTON */}
        <Box 
          display="flex" 
          alignItems="center" 
          gap={2}
          position="absolute"
          left="50%"
          sx={{
            transform: "translateX(-50%)",
          }}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              color: iconColor,
              fontSize: "0.875rem",
              display: { xs: "none", md: "block" }
            }}
          >
            For real dataset and completely accessible dashboard
          </Typography>
          <Button
            variant="contained"
            href="https://docs.google.com/forms/d/e/1FAIpQLSecSDnPds-ppbwMQG2Z0oTWipWAn3gGMNFXFBI_JP0RkM-b-A/viewform"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              backgroundColor: colors.greenAccent[500],
              color: "#ffffff",
              "&:hover": {
                backgroundColor: colors.greenAccent[600],
              },
              textTransform: "none",
              px: 3,
              py: 1,
              fontSize: "0.875rem",
              fontWeight: 600,
              borderRadius: "8px",
            }}
          >
            Subscription
          </Button>
        </Box>

        {/* RIGHT SIDE - ICONS */}
        <Box display="flex" alignItems="center" gap={2} ml="auto">
          <IconButton onClick={colorMode.toggleColorMode}>
            {theme.palette.mode === "dark" ? (
              <DarkModeOutlinedIcon sx={{ color: iconColor }} />
            ) : (
              <LightModeOutlinedIcon sx={{ color: iconColor }} />
            )}
          </IconButton>
          <IconButton
            onClick={() => window.open("https://docs.google.com/forms/d/e/1FAIpQLSecSDnPds-ppbwMQG2Z0oTWipWAn3gGMNFXFBI_JP0RkM-b-A/viewform", "_blank", "noopener,noreferrer")}
            sx={{ cursor: "pointer" }}
          >
            <NotificationsOutlinedIcon sx={{ color: iconColor }} />
          </IconButton>
          <IconButton
            onClick={() => window.open("https://docs.google.com/forms/d/e/1FAIpQLSecSDnPds-ppbwMQG2Z0oTWipWAn3gGMNFXFBI_JP0RkM-b-A/viewform", "_blank", "noopener,noreferrer")}
            sx={{ cursor: "pointer" }}
          >
            <SettingsOutlinedIcon sx={{ color: iconColor }} />
          </IconButton>
          <IconButton
            onClick={() => window.open("https://docs.google.com/forms/d/e/1FAIpQLSecSDnPds-ppbwMQG2Z0oTWipWAn3gGMNFXFBI_JP0RkM-b-A/viewform", "_blank", "noopener,noreferrer")}
            sx={{ cursor: "pointer" }}
          >
            <PersonOutlinedIcon sx={{ color: iconColor }} />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}

export default Topbar;
