import React from 'react';
import { Box, Typography, useTheme } from "@mui/material";
import { tokens } from "../theme";

function Logo({ size = "medium" }) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  
  // Determine sizes based on prop
  const sizes = {
    small: { mainFont: 20, subFont: 12 },
    medium: { mainFont: 32, subFont: 16 },
    large: { mainFont: 48, subFont: 24 }
  };
  
  const { mainFont, subFont } = sizes[size];
  
  // Create a simple circular grid icon to replace the O
  const CircularIcon = () => (
    <Box
      sx={{
        display: "inline-flex",
        width: `${mainFont * 0.8}px`,
        height: `${mainFont * 0.8}px`,
        borderRadius: "50%",
        background: `linear-gradient(135deg, 
          rgba(67, 233, 123, 0.8) 0%,
          rgba(56, 249, 215, 0.8) 25%,
          rgba(255, 154, 86, 0.8) 50%,
          rgba(255, 106, 136, 0.8) 75%,
          rgba(102, 126, 234, 0.8) 100%
        )`,
        border: `2px solid ${theme.palette.mode === "dark" ? "#ffffff" : "#0d47a1"}`,
        position: "relative",
        alignItems: "center",
        justifyContent: "center",
        verticalAlign: "middle",
        margin: "0 2px",
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gridTemplateRows: "repeat(3, 1fr)",
          gap: "2px",
          width: "70%",
          height: "70%",
        }}
      >
        {[...Array(9)].map((_, i) => (
          <Box
            key={i}
            sx={{
              backgroundColor: i === 4 
                ? "rgba(67, 233, 123, 0.9)" // Green center
                : i % 3 === 0 
                  ? "rgba(56, 249, 215, 0.7)" // Teal
                  : i % 2 === 0 
                    ? "rgba(255, 154, 86, 0.7)" // Orange
                    : "rgba(102, 126, 234, 0.7)", // Blue
              borderRadius: "50%",
              width: "100%",
              height: "100%",
            }}
          />
        ))}
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography
          component="span"
          sx={{
            fontFamily: '"Georgia", "Times New Roman", serif',
            fontSize: `${mainFont}px`,
            fontWeight: 700,
            color: theme.palette.mode === "dark" ? "#ffffff" : "#0d47a1",
            letterSpacing: "0.5px",
            lineHeight: 1,
          }}
        >
          C
        </Typography>
        <CircularIcon />
        <Typography
          component="span"
          sx={{
            fontFamily: '"Georgia", "Times New Roman", serif',
            fontSize: `${mainFont}px`,
            fontWeight: 700,
            color: theme.palette.mode === "dark" ? "#ffffff" : "#0d47a1",
            letterSpacing: "0.5px",
            lineHeight: 1,
          }}
        >
          HERENT
        </Typography>
      </Box>
      <Typography
        sx={{
          fontFamily: '"Arial", "Helvetica", sans-serif',
          fontSize: `${subFont}px`,
          fontWeight: 400,
          color: theme.palette.mode === "dark" ? "#e0e0e0" : "#0a0a1a",
          letterSpacing: "1px",
          marginTop: "4px",
          textAlign: "center",
        }}
      >
        MARKET INSIGHTS
      </Typography>
    </Box>
  );
}

export default Logo;

