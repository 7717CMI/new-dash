import React from 'react';
import { Box, Typography, useTheme, Divider } from "@mui/material";
import { tokens } from "../../theme";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";

function Contact() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const contactInfo = [
    {
      title: "Primary Business Email",
      subtitle: "Sales / Inquiries",
      content: "sales@coherentmarketinsights.com",
      icon: <EmailOutlinedIcon sx={{ fontSize: "40px" }} />,
      color: colors.blueAccent[500],
    },
    {
      title: "Alternate Email",
      subtitle: "Billing / Accounts (listed in corporate registries)",
      content: "accounts@coherentmarketinsights.com",
      icon: <EmailOutlinedIcon sx={{ fontSize: "40px" }} />,
      color: colors.blueAccent[500],
    },
    {
      title: "Head / Asia Pacific Office — India",
      subtitle: "Address",
      content: "Coherent Market Insights Pvt Ltd — Office No 401-402, Bremen Business Center, University Road, Aundh, Pune – 411007, India.",
      icon: <LocationOnOutlinedIcon sx={{ fontSize: "40px" }} />,
      color: colors.greenAccent[500],
    },
    {
      title: "India Phone",
      subtitle: "Listed on company pages and business directories",
      content: "+91 84828 50837",
      icon: <PhoneOutlinedIcon sx={{ fontSize: "40px" }} />,
      color: colors.greenAccent[500],
    },
    {
      title: "US Sales Office",
      subtitle: "Address",
      content: "533 Airport Boulevard, Suite 400, Burlingame, CA 94010, United States.",
      icon: <LocationOnOutlinedIcon sx={{ fontSize: "40px" }} />,
      color: colors.redAccent[500],
    },
    {
      title: "US Phone",
      subtitle: "Main US number",
      content: "+1-252-477-1362",
      additionalContent: "Other local/alternative US numbers: +1 206 701 6702",
      icon: <PhoneOutlinedIcon sx={{ fontSize: "40px" }} />,
      color: colors.redAccent[500],
    },
    {
      title: "United Kingdom Phone",
      subtitle: "",
      content: "+44-203-957-8553",
      additionalContent: "+44-203-949-5508",
      icon: <PhoneOutlinedIcon sx={{ fontSize: "40px" }} />,
      color: colors.blueAccent[500],
    },
    {
      title: "Australia Phone",
      subtitle: "",
      content: "+61-8-7924-7805",
      icon: <PhoneOutlinedIcon sx={{ fontSize: "40px" }} />,
      color: colors.greenAccent[500],
    },
  ];

  return (
    <Box m="20px">
      <Box textAlign="center" mb="40px">
        <Typography
          variant="h1"
          color={colors.grey[100]}
          fontWeight="bold"
          sx={{ mb: "10px" }}
        >
          Contact Us
        </Typography>
        <Typography variant="h5" color={colors.greenAccent[400]}>
          Get in touch with Coherent Market Insights
        </Typography>
      </Box>

      <Box
        display="grid"
        gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))"
        gap="30px"
      >
        {contactInfo.map((info, index) => (
          <Box
            key={index}
            sx={{
              backgroundColor: colors.primary[400],
              padding: "30px",
              borderRadius: "12px",
              transition: "transform 0.2s, box-shadow 0.2s",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: `0 8px 16px ${colors.primary[600]}`,
              },
            }}
          >
            <Box
              sx={{
                width: "60px",
                height: "60px",
                margin: "0 auto 20px",
                backgroundColor: info.color,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
              }}
            >
              {info.icon}
            </Box>
            <Typography
              variant="h4"
              color={colors.grey[100]}
              fontWeight="bold"
              textAlign="center"
              sx={{ mb: "10px" }}
            >
              {info.title}
            </Typography>
            {info.subtitle && (
              <Typography
                variant="h6"
                color={colors.grey[300]}
                textAlign="center"
                sx={{ mb: "15px", fontStyle: "italic" }}
              >
                {info.subtitle}
              </Typography>
            )}
            <Divider sx={{ mb: "15px", borderColor: colors.grey[700] }} />
            <Typography
              variant="h6"
              color={colors.grey[200]}
              textAlign="center"
              sx={{ mb: info.additionalContent ? "10px" : "0" }}
            >
              {info.content}
            </Typography>
            {info.additionalContent && (
              <Typography
                variant="body1"
                color={colors.grey[400]}
                textAlign="center"
              >
                {info.additionalContent}
              </Typography>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default Contact;

