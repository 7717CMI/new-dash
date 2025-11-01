import React, { useState, useMemo } from 'react';
import { Box, Grid, Button, Typography, useTheme, Dialog, DialogTitle, DialogContent, IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import CloseIcon from "@mui/icons-material/Close";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import StatBox from "../../components/StatBox";
import FilterDropdown from "../../components/FilterDropdown";
import BarChart from "../../components/BarChart";
import PieChart from "../../components/PieChart";
import LineChart from "../../components/LineChart";
import DemoNotice from "../../components/DemoNotice";
import { getData, filterDataframe, formatNumber, formatWithCommas } from "../../utils/dataGenerator";

function Procurement() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  
  const data = getData();
  
  const [filters, setFilters] = useState({
    year: [],
    market: [],
    region: [],
    incomeType: [],
    country: [],
    publicPrivate: [],
    brand: [],
  });

  const filteredData = useMemo(() => {
    return filterDataframe(data, {
      year: filters.year,
      market: filters.market,
      region: filters.region,
      incomeType: filters.incomeType,
      country: filters.country,
      publicPrivate: filters.publicPrivate,
      brand: filters.brand,
    });
  }, [data, filters]);

  const [openModal, setOpenModal] = useState(null);

  const uniqueOptions = useMemo(() => {
    return {
      years: [...new Set(data.map(d => d.year))].sort(),
      markets: [...new Set(data.map(d => d.market))].sort(),
      regions: [...new Set(data.map(d => d.region))].sort(),
      incomeTypes: [...new Set(data.map(d => d.incomeType))].sort(),
      countries: [...new Set(data.map(d => d.country))].sort(),
      publicPrivates: ["Public", "Private"],
      brands: [...new Set(data.map(d => d.brand))].sort(),
    };
  }, [data]);

  const kpis = useMemo(() => {
    if (filteredData.length === 0) {
      return {
        totalQty: "N/A",
        publicPct: "0%",
        privatePct: "0%",
        topProcurement: "N/A",
      };
    }

    const totalQty = filteredData.reduce((sum, d) => sum + (d.qty || d.volumeUnits || 0), 0);
    const publicCount = filteredData.filter(d => d.publicPrivate === "Public").length;
    const privateCount = filteredData.filter(d => d.publicPrivate === "Private").length;
    const publicPct = filteredData.length > 0 ? ((publicCount / filteredData.length) * 100).toFixed(1) : 0;
    const privatePct = filteredData.length > 0 ? ((privateCount / filteredData.length) * 100).toFixed(1) : 0;
    
    const procurementGroups = filteredData.reduce((acc, d) => {
      const proc = d.procurement || "N/A";
      if (!acc[proc]) acc[proc] = 0;
      acc[proc] += (d.qty || d.volumeUnits || 0);
      return acc;
    }, {});
    const topProcurement = Object.entries(procurementGroups).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

    return {
      totalQty: `${formatWithCommas(totalQty / 1000)}M`, // With commas in millions
      publicPct: `${publicPct}%`,
      privatePct: `${privatePct}%`,
      topProcurement,
    };
  }, [filteredData]);

  const chartData1 = useMemo(() => {
    const grouped = filteredData.reduce((acc, d) => {
      const proc = d.procurement || "N/A";
      acc[proc] = (acc[proc] || 0) + (d.qty || d.volumeUnits || 0);
      return acc;
    }, {});
    return Object.entries(grouped).map(([procurement, qty]) => ({
      procurement,
      qty,
    }));
  }, [filteredData]);

  const chartData2 = useMemo(() => {
    const publicQty = filteredData
      .filter(d => d.publicPrivate === "Public")
      .reduce((sum, d) => sum + (d.qty || d.volumeUnits || 0), 0);
    const privateQty = filteredData
      .filter(d => d.publicPrivate === "Private")
      .reduce((sum, d) => sum + (d.qty || d.volumeUnits || 0), 0);
    
    return [
      { type: "Public", qty: publicQty },
      { type: "Private", qty: privateQty },
    ].filter(d => d.qty > 0);
  }, [filteredData]);

  const chartData3 = useMemo(() => {
    const grouped = filteredData.reduce((acc, d) => {
      const year = d.year;
      const type = d.publicPrivate || "Unknown";
      if (!acc[year]) acc[year] = { Public: 0, Private: 0 };
      if (type === "Public") {
        acc[year].Public += (d.qty || d.volumeUnits || 0);
      } else if (type === "Private") {
        acc[year].Private += (d.qty || d.volumeUnits || 0);
      }
      return acc;
    }, {});
    return Object.entries(grouped)
      .map(([year, values]) => ({
        year: parseInt(year),
        Public: values.Public,
        Private: values.Private,
      }))
      .sort((a, b) => a.year - b.year);
  }, [filteredData]);

  // Pie chart data for quantity breakdown by brand
  const quantityPieData = useMemo(() => {
    const grouped = filteredData.reduce((acc, d) => {
      acc[d.brand] = (acc[d.brand] || 0) + (d.qty || d.volumeUnits || 0);
      return acc;
    }, {});
    const total = Object.values(grouped).reduce((sum, val) => sum + val, 0);
    return Object.entries(grouped)
      .map(([brand, qty]) => ({
        brand,
        value: qty,
        percent: total > 0 ? ((qty / total) * 100).toFixed(1) : 0,
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredData]);

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb="20px">
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/")}
          sx={{
            backgroundColor: colors.blueAccent[700],
            color: colors.grey[100],
            "&:hover": {
              backgroundColor: colors.blueAccent[800],
            },
          }}
        >
          Back to Home
        </Button>
      </Box>

      <Header title="Procurement Analysis" subtitle="Public and private procurement tracking" />

      <DemoNotice />

      <Box sx={{ backgroundColor: colors.primary[400], padding: "20px", borderRadius: "8px", mb: "20px" }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <FilterDropdown label="Year" value={filters.year} onChange={(e) => setFilters({ ...filters, year: e.target.value })} options={uniqueOptions.years} />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <FilterDropdown label="Market" value={filters.market} onChange={(e) => setFilters({ ...filters, market: e.target.value })} options={uniqueOptions.markets} />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <FilterDropdown label="Region" value={filters.region} onChange={(e) => setFilters({ ...filters, region: e.target.value })} options={uniqueOptions.regions} />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <FilterDropdown label="Income Type" value={filters.incomeType} onChange={(e) => setFilters({ ...filters, incomeType: e.target.value })} options={uniqueOptions.incomeTypes} />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <FilterDropdown label="Country" value={filters.country} onChange={(e) => setFilters({ ...filters, country: e.target.value })} options={uniqueOptions.countries} />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <FilterDropdown label="Public/Private" value={filters.publicPrivate} onChange={(e) => setFilters({ ...filters, publicPrivate: e.target.value })} options={uniqueOptions.publicPrivates} />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <FilterDropdown label="Brand" value={filters.brand} onChange={(e) => setFilters({ ...filters, brand: e.target.value })} options={uniqueOptions.brands} />
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={2} sx={{ mb: "20px" }}>
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ backgroundColor: colors.primary[400], padding: "20px", borderRadius: "8px" }}>
            <StatBox title={kpis.totalQty} subtitle="Total Quantity" icon={<ShoppingCartOutlinedIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />} progress="0.75" onCircleClick={() => setOpenModal('quantity')} />
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ backgroundColor: colors.primary[400], padding: "20px", borderRadius: "8px" }}>
            <StatBox title={kpis.publicPct} subtitle="Public Procurement %" icon={<ShoppingCartOutlinedIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />} progress={null} />
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ backgroundColor: colors.primary[400], padding: "20px", borderRadius: "8px" }}>
            <StatBox title={kpis.privatePct} subtitle="Private Procurement %" icon={<ShoppingCartOutlinedIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />} progress={null} />
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ backgroundColor: colors.primary[400], padding: "20px", borderRadius: "8px" }}>
            <StatBox title={kpis.topProcurement} subtitle="Top Procurement Type" icon={<ShoppingCartOutlinedIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />} progress={null} />
          </Box>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Box sx={{ backgroundColor: colors.primary[400], padding: "20px", borderRadius: "8px", height: "450px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <Typography variant="h6" color={colors.grey[100]} sx={{ mb: "10px" }}>Quantity by Procurement Type</Typography>
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <BarChart data={chartData1} dataKey="qty" nameKey="procurement" color={colors.blueAccent[500]} xAxisLabel="Procurement Type" yAxisLabel="Quantity (Units)" />
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box sx={{ backgroundColor: colors.primary[400], padding: "20px", borderRadius: "8px", height: "450px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <Typography variant="h6" color={colors.grey[100]} sx={{ mb: "10px" }}>Public vs Private Procurement</Typography>
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <PieChart data={chartData2} dataKey="qty" nameKey="type" title="Public vs Private (% Share)" />
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ backgroundColor: colors.primary[400], padding: "20px", borderRadius: "8px", height: "450px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <Typography variant="h6" color={colors.grey[100]} sx={{ mb: "10px" }}>Procurement Trend</Typography>
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <LineChart data={chartData3} dataKeys={["Public", "Private"]} nameKey="year" colors={[colors.blueAccent[500], colors.greenAccent[500]]} xAxisLabel="Year" yAxisLabel="Quantity (Units)" />
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Pie Chart Modal for Quantity Breakdown */}
      <Dialog
        open={openModal !== null}
        onClose={() => setOpenModal(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.mode === "dark" ? colors.primary[400] : "#ffffff",
            borderRadius: "12px",
          },
        }}
      >
        <DialogTitle sx={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          color: theme.palette.mode === "dark" ? colors.grey[100] : colors.grey[900],
          pb: 1
        }}>
          <Typography variant="h4" fontWeight="bold">
            Total Quantity by Brand
          </Typography>
          <IconButton 
            onClick={() => setOpenModal(null)}
            sx={{ color: theme.palette.mode === "dark" ? colors.grey[100] : colors.grey[900] }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ height: "500px", mt: 2 }}>
            <PieChart
              data={quantityPieData}
              dataKey="value"
              nameKey="brand"
              colors={[
                colors.blueAccent[500],
                colors.greenAccent[500],
                colors.redAccent[500],
                colors.blueAccent[300],
                colors.greenAccent[300],
                colors.redAccent[300],
              ]}
            />
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default Procurement;

