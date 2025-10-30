import React from 'react';
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import "react-pro-sidebar/dist/css/styles.css";
import { tokens } from "../../theme";
import Logo from "../../components/Logo";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import HealingOutlinedIcon from "@mui/icons-material/HealingOutlined";
import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import PieChartOutlinedIcon from "@mui/icons-material/PieChartOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import MedicationOutlinedIcon from "@mui/icons-material/MedicationOutlined";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import ContactMailOutlinedIcon from "@mui/icons-material/ContactMailOutlined";

function Item({ title, to, icon, isActive }) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <MenuItem
      active={isActive}
      style={{
        color: colors.grey[100],
      }}
      icon={icon}
    >
      <Typography>{title}</Typography>
      <Link to={to} />
    </MenuItem>
  );
}

function Sidebar({ isCollapsed, setIsCollapsed }) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const location = useLocation();

  return (
    <Box
      sx={{
        "& .pro-sidebar-inner": {
          background: `${colors.primary[400]} !important`,
        },
        "& .pro-icon-wrapper": {
          backgroundColor: "transparent !important",
        },
        "& .pro-inner-item": {
          padding: "5px 35px 5px 20px !important",
        },
        "& .pro-inner-item:hover": {
          color: "#868dfb !important",
        },
        "& .pro-menu-item.active": {
          color: "#6870fa !important",
        },
      }}
    >
      <ProSidebar collapsed={isCollapsed}>
        <Menu iconShape="square">
          {/* LOGO AND MENU ICON */}
          <MenuItem
            onClick={() => setIsCollapsed(!isCollapsed)}
            icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
            style={{
              margin: "10px 0 20px 0",
              color: colors.grey[100],
            }}
          >
            {!isCollapsed && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                ml="15px"
              >
                <Typography variant="h3" color={colors.grey[100]}>
                  Vaccine Analytics
                </Typography>
                <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
                  <MenuOutlinedIcon />
                </IconButton>
              </Box>
            )}
          </MenuItem>

          {!isCollapsed && (
            <Box mb="25px" display="flex" justifyContent="center" alignItems="center">
              <Logo size="medium" />
            </Box>
          )}

          <Box paddingLeft={isCollapsed ? undefined : "10%"}>
            <Item
              title="HOME"
              to="/"
              icon={<HomeOutlinedIcon />}
              isActive={location.pathname === "/"}
            />

            {!isCollapsed && (
              <Typography
                variant="h6"
                color={colors.grey[300]}
                sx={{ m: "15px 0 5px 20px" }}
              >
                Analysis Modules
              </Typography>
            )}
            <Item
              title="Epidemiology"
              to="/epidemiology"
              icon={<LocalHospitalOutlinedIcon />}
              isActive={location.pathname === "/epidemiology"}
            />
            <Item
              title="Vaccination Rate"
              to="/vaccination-rate"
              icon={<HealingOutlinedIcon />}
              isActive={location.pathname === "/vaccination-rate"}
            />
            <Item
              title="Pricing Analysis"
              to="/pricing"
              icon={<AttachMoneyOutlinedIcon />}
              isActive={location.pathname === "/pricing"}
            />
            <Item
              title="CAGR Analysis"
              to="/cagr"
              icon={<TrendingUpOutlinedIcon />}
              isActive={location.pathname === "/cagr"}
            />
            <Item
              title="MSA Comparison"
              to="/msa-comparison"
              icon={<PieChartOutlinedIcon />}
              isActive={location.pathname === "/msa-comparison"}
            />
            <Item
              title="Procurement"
              to="/procurement"
              icon={<ShoppingCartOutlinedIcon />}
              isActive={location.pathname === "/procurement"}
            />
            <Item
              title="Brand-Demographic"
              to="/brand-demographic"
              icon={<MedicationOutlinedIcon />}
              isActive={location.pathname === "/brand-demographic"}
            />
            <Item
              title="FDF Analysis"
              to="/fdf"
              icon={<ScienceOutlinedIcon />}
              isActive={location.pathname === "/fdf"}
            />
            <Item
              title="Contact Us"
              to="/contact"
              icon={<ContactMailOutlinedIcon />}
              isActive={location.pathname === "/contact"}
            />
          </Box>
        </Menu>
      </ProSidebar>
    </Box>
  );
}

export default Sidebar;

