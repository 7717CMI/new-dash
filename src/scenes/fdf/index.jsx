import React, { useState, useMemo } from 'react';
import { Box, Grid, Button, Typography, useTheme, Dialog, DialogTitle, DialogContent, IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
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

function FDF() {
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
    brand: [],
    fdf: [],
    roa: [],
  });

  const [openModal, setOpenModal] = useState(null);

  const filteredData = useMemo(() => {
    return filterDataframe(data, {
      year: filters.year,
      market: filters.market,
      region: filters.region,
      incomeType: filters.incomeType,
      country: filters.country,
      brand: filters.brand,
      fdf: filters.fdf,
      roa: filters.roa,
    });
  }, [data, filters]);

  const uniqueOptions = useMemo(() => {
    return {
      years: [...new Set(data.map(d => d.year))].sort(),
      markets: [...new Set(data.map(d => d.market))].sort(),
      regions: [...new Set(data.map(d => d.region))].sort(),
      incomeTypes: [...new Set(data.map(d => d.incomeType))].sort(),
      countries: [...new Set(data.map(d => d.country))].sort(),
      brands: [...new Set(data.map(d => d.brand))].sort(),
      fdfs: [...new Set(data.map(d => d.fdf))].sort(),
      roas: [...new Set(data.map(d => d.roa))].sort(),
    };
  }, [data]);

  const kpis = useMemo(() => {
    if (filteredData.length === 0) {
      return {
        totalMarketValue: "N/A",
        totalQuantity: "N/A",
        revenuePerFDF: "N/A",
        topFDF: "N/A",
      };
    }

    // Total Market Value in US$ Million
    const totalMarketValue = filteredData.reduce((sum, d) => sum + (d.marketValueUsd || d.revenue || 0), 0);
    
    // Total Quantity in Units Million (Box)
    const totalQuantity = filteredData.reduce((sum, d) => sum + (d.volumeUnits || d.qty || 0), 0);
    
    // Total Revenue per FDF (Million US$)
    const fdfGroups = filteredData.reduce((acc, d) => {
      acc[d.fdf] = (acc[d.fdf] || 0) + (d.revenue || d.marketValueUsd || 0);
      return acc;
    }, {});
    const numFDFs = Object.keys(fdfGroups).length;
    const revenuePerFDF = numFDFs > 0 ? totalMarketValue / numFDFs : 0;
    
    const topFDF = Object.entries(fdfGroups).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

    return {
      totalMarketValue: `${formatWithCommas(totalMarketValue / 1000)}M`, // In millions
      totalQuantity: `${formatWithCommas(totalQuantity / 1000)}M`, // In millions
      revenuePerFDF: `${formatWithCommas(revenuePerFDF / 1000)}M`, // In millions
      topFDF,
    };
  }, [filteredData]);

  const chartData1 = useMemo(() => {
    const grouped = filteredData.reduce((acc, d) => {
      acc[d.fdf] = (acc[d.fdf] || 0) + (d.revenue || d.marketValueUsd || 0);
      return acc;
    }, {});
    return Object.entries(grouped).map(([fdf, revenue]) => ({
      fdf,
      revenue,
    }));
  }, [filteredData]);

  const chartData2 = useMemo(() => {
    const grouped = filteredData.reduce((acc, d) => {
      acc[d.roa] = (acc[d.roa] || 0) + (d.revenue || d.marketValueUsd || 0);
      return acc;
    }, {});
    return Object.entries(grouped).map(([roa, revenue]) => ({
      roa,
      revenue,
    }));
  }, [filteredData]);

  const chartData3 = useMemo(() => {
    const matrix = filteredData.reduce((acc, d) => {
      if (!acc[d.fdf]) acc[d.fdf] = {};
      acc[d.fdf][d.roa] = (acc[d.fdf][d.roa] || 0) + (d.revenue || d.marketValueUsd || 0);
      return acc;
    }, {});
    
    return Object.entries(matrix).flatMap(([fdf, roaGroups]) =>
      Object.entries(roaGroups).map(([roa, revenue]) => ({
        fdf,
        roa,
        revenue,
      }))
    );
  }, [filteredData]);

  // Pie chart data for revenue breakdown by brand
  const revenuePieData = useMemo(() => {
    const grouped = filteredData.reduce((acc, d) => {
      acc[d.brand] = (acc[d.brand] || 0) + (d.revenue || d.marketValueUsd || 0);
      return acc;
    }, {});
    const total = Object.values(grouped).reduce((sum, val) => sum + val, 0);
    return Object.entries(grouped)
      .map(([brand, revenue]) => ({
        brand,
        value: revenue,
        percent: total > 0 ? ((revenue / total) * 100).toFixed(1) : 0,
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

      <Header title="FDF Analysis" subtitle="Formulation and ROA performance" />

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
            <FilterDropdown label="Brand" value={filters.brand} onChange={(e) => setFilters({ ...filters, brand: e.target.value })} options={uniqueOptions.brands} />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <FilterDropdown label="FDF" value={filters.fdf} onChange={(e) => setFilters({ ...filters, fdf: e.target.value })} options={uniqueOptions.fdfs} />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <FilterDropdown label="ROA" value={filters.roa} onChange={(e) => setFilters({ ...filters, roa: e.target.value })} options={uniqueOptions.roas} />
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={2} sx={{ mb: "20px" }}>
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ backgroundColor: colors.primary[400], padding: "20px", borderRadius: "8px" }}>
            <StatBox 
              title={kpis.totalMarketValue} 
              subtitle="Total Market Value (US$ Million)" 
              icon={<ScienceOutlinedIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />} 
              progress={null} 
            />
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ backgroundColor: colors.primary[400], padding: "20px", borderRadius: "8px" }}>
            <StatBox 
              title={kpis.totalQuantity} 
              subtitle="Total Quantity (Units Million)" 
              icon={<ScienceOutlinedIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />} 
              progress={null} 
            />
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ backgroundColor: colors.primary[400], padding: "20px", borderRadius: "8px" }}>
            <StatBox 
              title={kpis.revenuePerFDF} 
              subtitle="Revenue per FDF (Million US$)" 
              icon={<ScienceOutlinedIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />} 
              progress={null} 
            />
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ backgroundColor: colors.primary[400], padding: "20px", borderRadius: "8px" }}>
            <StatBox 
              title={kpis.topFDF} 
              subtitle="Top Formulation" 
              icon={<ScienceOutlinedIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />} 
              progress={null} 
            />
          </Box>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Box sx={{ backgroundColor: colors.primary[400], padding: "20px", borderRadius: "8px", height: "450px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <Typography variant="h6" color={colors.grey[100]} sx={{ mb: "10px" }}>Revenue by Formulation</Typography>
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <BarChart data={chartData1} dataKey="revenue" nameKey="fdf" color={colors.blueAccent[500]} xAxisLabel="Formulation (FDF)" yAxisLabel="Revenue (USD)" />
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box sx={{ backgroundColor: colors.primary[400], padding: "20px", borderRadius: "8px", height: "450px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <Typography variant="h6" color={colors.grey[100]} sx={{ mb: "10px" }}>Revenue Distribution by ROA</Typography>
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <PieChart data={chartData2} dataKey="revenue" nameKey="roa" title="Revenue by ROA (% Share)" />
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ backgroundColor: colors.primary[400], padding: "20px", borderRadius: "8px", height: "450px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <Typography variant="h6" color={colors.grey[100]} sx={{ mb: "10px" }}>Revenue Matrix: FDF vs ROA</Typography>
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <BarChart data={chartData3} dataKey="revenue" nameKey="fdf" color={colors.blueAccent[500]} xAxisLabel="Formulation (FDF)" yAxisLabel="Revenue (USD)" />
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Pie Chart Modal for Revenue Breakdown */}
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
            Total Revenue by Brand
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
              data={revenuePieData}
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
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" color={theme.palette.mode === "dark" ? colors.grey[300] : colors.grey[700]} sx={{ mb: 1 }}>
              Brand Distribution:
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={2}>
              {revenuePieData.map((item, index) => (
                <Box
                  key={item.brand}
                  sx={{
                    backgroundColor: theme.palette.mode === "dark" ? colors.primary[500] : colors.grey[200],
                    padding: "8px 16px",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: "16px",
                      height: "16px",
                      borderRadius: "50%",
                      backgroundColor: [
                        colors.blueAccent[500],
                        colors.greenAccent[500],
                        colors.redAccent[500],
                        colors.blueAccent[300],
                        colors.greenAccent[300],
                        colors.redAccent[300],
                      ][index % 6],
                    }}
                  />
                  <Typography variant="body2" color={theme.palette.mode === "dark" ? colors.grey[100] : colors.grey[900]}>
                    <strong>{item.brand}:</strong> {item.percent}%
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default FDF;

