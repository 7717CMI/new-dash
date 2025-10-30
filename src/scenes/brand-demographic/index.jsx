import React, { useState, useMemo } from 'react';
import { Box, Grid, Typography, useTheme, Dialog, DialogTitle, DialogContent, IconButton } from "@mui/material";
import MedicationOutlinedIcon from "@mui/icons-material/MedicationOutlined";
import CloseIcon from "@mui/icons-material/Close";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import StatBox from "../../components/StatBox";
import FilterDropdown from "../../components/FilterDropdown";
import BarChart from "../../components/BarChart";
import PieChart from "../../components/PieChart";
import LineChart from "../../components/LineChart";
import { getData, filterDataframe, formatNumber } from "../../utils/dataGenerator";

function BrandDemographic() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  
  const data = getData();
  
  const [filters, setFilters] = useState({
    year: [],
    market: [],
    region: [],
    incomeType: [],
    country: [],
    ageGroup: [],
    gender: [],
    brand: [],
  });

  const [openModal, setOpenModal] = useState(null);

  const filteredData = useMemo(() => {
    return filterDataframe(data, {
      year: filters.year,
      market: filters.market,
      region: filters.region,
      incomeType: filters.incomeType,
      country: filters.country,
      ageGroup: filters.ageGroup,
      gender: filters.gender,
      brand: filters.brand,
    });
  }, [data, filters]);

  const uniqueOptions = useMemo(() => {
    return {
      years: [...new Set(data.map(d => d.year))].sort(),
      markets: [...new Set(data.map(d => d.market))].sort(),
      regions: [...new Set(data.map(d => d.region))].sort(),
      incomeTypes: [...new Set(data.map(d => d.incomeType))].sort(),
      countries: [...new Set(data.map(d => d.country))].sort(),
      ageGroups: [...new Set(data.map(d => d.ageGroup))].sort(),
      genders: [...new Set(data.map(d => d.gender))].sort().filter(g => g !== "All"),
      brands: [...new Set(data.map(d => d.brand))].sort(),
    };
  }, [data]);

  const kpis = useMemo(() => {
    if (filteredData.length === 0) {
      return {
        totalRevenue: "N/A",
        topBrand: "N/A",
        topAgeGroup: "N/A",
        avgRevenue: "N/A",
      };
    }

    const totalRevenue = filteredData.reduce((sum, d) => sum + (d.revenue || d.marketValueUsd || 0), 0);
    
    const brandGroups = filteredData.reduce((acc, d) => {
      acc[d.brand] = (acc[d.brand] || 0) + (d.revenue || d.marketValueUsd || 0);
      return acc;
    }, {});
    const topBrand = Object.entries(brandGroups).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
    
    const ageGroups = filteredData.reduce((acc, d) => {
      acc[d.ageGroup] = (acc[d.ageGroup] || 0) + (d.revenue || d.marketValueUsd || 0);
      return acc;
    }, {});
    const topAgeGroup = Object.entries(ageGroups).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
    
    const brandRevenues = Object.values(brandGroups);
    const avgRevenue = brandRevenues.length > 0 ? brandRevenues.reduce((a, b) => a + b, 0) / brandRevenues.length : 0;

    return {
      totalRevenue: formatNumber(totalRevenue),
      topBrand,
      topAgeGroup,
      avgRevenue: formatNumber(avgRevenue),
    };
  }, [filteredData]);

  const chartData1 = useMemo(() => {
    const grouped = filteredData.reduce((acc, d) => {
      acc[d.ageGroup] = (acc[d.ageGroup] || 0) + (d.revenue || d.marketValueUsd || 0);
      return acc;
    }, {});
    return Object.entries(grouped).map(([ageGroup, revenue]) => ({
      ageGroup,
      revenue,
    }));
  }, [filteredData]);

  const chartData2 = useMemo(() => {
    const grouped = filteredData.reduce((acc, d) => {
      acc[d.gender] = (acc[d.gender] || 0) + (d.revenue || d.marketValueUsd || 0);
      return acc;
    }, {});
    return Object.entries(grouped).map(([gender, revenue]) => ({
      gender,
      revenue,
    })).filter(d => d.gender !== "All");
  }, [filteredData]);

  const chartData3 = useMemo(() => {
    const brandPerf = filteredData.reduce((acc, d) => {
      if (!acc[d.brand]) acc[d.brand] = {};
      acc[d.brand][d.ageGroup] = (acc[d.brand][d.ageGroup] || 0) + (d.revenue || d.marketValueUsd || 0);
      return acc;
    }, {});
    
    const brandTotals = Object.entries(brandPerf).map(([brand, ageGroups]) => ({
      brand,
      total: Object.values(ageGroups).reduce((a, b) => a + b, 0),
    }));
    
    const topBrands = brandTotals.sort((a, b) => b.total - a.total).slice(0, 10).map(b => b.brand);
    
    return topBrands.flatMap(brand => 
      Object.entries(brandPerf[brand] || {}).map(([ageGroup, revenue]) => ({
        brand,
        ageGroup,
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
      <Header title="Brand-Demographic" subtitle="Brand performance by demographics" />

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
            <FilterDropdown label="Age Group" value={filters.ageGroup} onChange={(e) => setFilters({ ...filters, ageGroup: e.target.value })} options={uniqueOptions.ageGroups} />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <FilterDropdown label="Gender" value={filters.gender} onChange={(e) => setFilters({ ...filters, gender: e.target.value })} options={uniqueOptions.genders} />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <FilterDropdown label="Brand" value={filters.brand} onChange={(e) => setFilters({ ...filters, brand: e.target.value })} options={uniqueOptions.brands} />
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={2} sx={{ mb: "20px" }}>
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ backgroundColor: colors.primary[400], padding: "20px", borderRadius: "8px" }}>
            <StatBox title={kpis.totalRevenue} subtitle="Total Revenue" icon={<MedicationOutlinedIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />} progress="0.75" onCircleClick={() => setOpenModal('revenue')} />
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ backgroundColor: colors.primary[400], padding: "20px", borderRadius: "8px" }}>
            <StatBox title={kpis.topBrand} subtitle="Top Performing Brand" icon={<MedicationOutlinedIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />} progress={null} />
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ backgroundColor: colors.primary[400], padding: "20px", borderRadius: "8px" }}>
            <StatBox title={kpis.topAgeGroup} subtitle="Top Age Group" icon={<MedicationOutlinedIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />} progress={null} />
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ backgroundColor: colors.primary[400], padding: "20px", borderRadius: "8px" }}>
            <StatBox title={kpis.avgRevenue} subtitle="Avg Revenue per Brand" icon={<MedicationOutlinedIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />} progress={null} />
          </Box>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Box sx={{ backgroundColor: colors.primary[400], padding: "20px", borderRadius: "8px", height: "450px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <Typography variant="h6" color={colors.grey[100]} sx={{ mb: "10px" }}>Revenue by Age Group</Typography>
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <BarChart data={chartData1} dataKey="revenue" nameKey="ageGroup" color={colors.blueAccent[500]} />
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box sx={{ backgroundColor: colors.primary[400], padding: "20px", borderRadius: "8px", height: "450px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <Typography variant="h6" color={colors.grey[100]} sx={{ mb: "10px" }}>Revenue Distribution by Gender</Typography>
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <PieChart data={chartData2} dataKey="revenue" nameKey="gender" />
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ backgroundColor: colors.primary[400], padding: "20px", borderRadius: "8px", height: "450px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <Typography variant="h6" color={colors.grey[100]} sx={{ mb: "10px" }}>Top 10 Brands by Age Group</Typography>
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <BarChart data={chartData3} dataKey="revenue" nameKey="brand" color={colors.blueAccent[500]} />
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

export default BrandDemographic;

