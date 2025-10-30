import React from "react";
import { Box, useTheme } from "@mui/material";
import { tokens } from "../theme";

function ProgressCircle({ progress = "0.75", size = "40", onClick }) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const angle = progress * 360;
  return (
    <Box
      onClick={onClick}
      sx={{
        background: `radial-gradient(${colors.primary[400]} 55%, transparent 56%),
            conic-gradient(transparent 0deg ${angle}deg, ${colors.blueAccent[500]} ${angle}deg 360deg),
            ${colors.greenAccent[500]}`,
        borderRadius: "50%",
        width: `${size}px`,
        height: `${size}px`,
        cursor: onClick ? "pointer" : "default",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": onClick ? {
          transform: "scale(1.1)",
          boxShadow: `0 4px 8px ${colors.grey[700]}`,
        } : {},
      }}
    />
  );
}

export default ProgressCircle;

