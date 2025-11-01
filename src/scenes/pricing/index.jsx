import React, { useState, useMemo } from 'react';
import { Box, Grid, Button, Typography, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import StatBox from "../../components/StatBox";
import FilterDropdown from "../../components/FilterDropdown";
import BarChart from "../../components/BarChart";
import LineChart from "../../components/LineChart";
import DemoNotice from "../../components/DemoNotice";
import { getData, filterDataframe, formatWithCommas } from "../../utils/dataGenerator";

function Pricing() {
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
    priceClass: [],
  });

  const filteredData = useMemo(() => {
    return filterDataframe(data, {
      year: filters.year,
      market: filters.market,
      region: filters.region,
      incomeType: filters.incomeType,
      country: filters.country,
      brand: filters.brand,
      priceClass: filters.priceClass,
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
      priceClasses: [...new Set(data.map(d => d.priceClass))].sort(),
    };
  }, [data]);

  const kpis = useMemo(() => {
    if (filteredData.length === 0) {
      return {
        volumeUnits: "N/A",
        avgPrice: "N/A",
        topBrand: "N/A",
        priceRange: "N/A",
      };
    }

    // Volume in Million Units
    const totalVolume = filteredData.reduce((sum, d) => sum + d.volumeUnits, 0);
    const avgPrice = filteredData.reduce((sum, d) => sum + d.price, 0) / filteredData.length;
    const brandGroups = filteredData.reduce((acc, d) => {
      if (!acc[d.brand]) acc[d.brand] = [];
      acc[d.brand].push(d.price);
      return acc;
    }, {});
    const topBrand = Object.entries(brandGroups)
      .map(([brand, prices]) => [brand, prices.reduce((a, b) => a + b, 0) / prices.length])
      .sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
    const prices = filteredData.map(d => d.price);
    const priceRange = `$${formatWithCommas(Math.min(...prices), 0)} - $${formatWithCommas(Math.max(...prices), 0)}`;

    return {
      volumeUnits: `${formatWithCommas(totalVolume / 1000)}M`, // In millions
      avgPrice: `$${formatWithCommas(avgPrice, 2)}`,
      topBrand,
      priceRange,
    };
  }, [filteredData]);

  const chartData1 = useMemo(() => {
    const grouped = filteredData.reduce((acc, d) => {
      if (!acc[d.brand]) acc[d.brand] = [];
      acc[d.brand].push(d.price);
      return acc;
    }, {});
    return Object.entries(grouped)
      .map(([brand, prices]) => ({
        brand,
        price: prices.reduce((a, b) => a + b, 0) / prices.length,
      }))
      .sort((a, b) => b.price - a.price)
      .slice(0, 10);
  }, [filteredData]);

  const chartData2 = useMemo(() => {
    const grouped = filteredData.reduce((acc, d) => {
      const key = d.priceClass || "Unknown";
      if (!acc[key]) acc[key] = { priceClass: key, avgPrice: 0, count: 0 };
      acc[key].avgPrice += d.price;
      acc[key].count += 1;
      return acc;
    }, {});
    return Object.values(grouped).map(item => ({
      priceClass: item.priceClass,
      avgPrice: item.avgPrice / item.count,
    })).sort((a, b) => b.avgPrice - a.avgPrice);
  }, [filteredData]);

  const chartData3 = useMemo(() => {
    const grouped = filteredData.reduce((acc, d) => {
      if (!acc[d.year]) acc[d.year] = [];
      acc[d.year].push(d.price);
      return acc;
    }, {});
    return Object.entries(grouped)
      .map(([year, prices]) => ({
        year: parseInt(year),
        price: prices.reduce((a, b) => a + b, 0) / prices.length,
      }))
      .sort((a, b) => a.year - b.year);
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
          }}
        >
          Back to Home
        </Button>
      </Box>

      <Header title="Pricing Analysis" subtitle="Price trends and elasticity insights" />

      <DemoNotice />

      {/* Filters */}
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
            <FilterDropdown label="Price Class" value={filters.priceClass} onChange={(e) => setFilters({ ...filters, priceClass: e.target.value })} options={uniqueOptions.priceClasses} />
          </Grid>
        </Grid>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2} sx={{ mb: "20px" }}>
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ backgroundColor: colors.primary[400], padding: "20px", borderRadius: "8px" }}>
            <StatBox title={kpis.volumeUnits} subtitle="Volume (Units Million)" icon={<AttachMoneyOutlinedIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />} progress={null} />
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ backgroundColor: colors.primary[400], padding: "20px", borderRadius: "8px" }}>
            <StatBox title={kpis.avgPrice} subtitle="Average Price (US$)" icon={<AttachMoneyOutlinedIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />} progress={null} />
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ backgroundColor: colors.primary[400], padding: "20px", borderRadius: "8px" }}>
            <StatBox title={kpis.topBrand} subtitle="Most Expensive Brand" icon={<AttachMoneyOutlinedIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />} progress={null} />
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ backgroundColor: colors.primary[400], padding: "20px", borderRadius: "8px" }}>
            <StatBox title={kpis.priceRange} subtitle="Price Range" icon={<AttachMoneyOutlinedIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />} progress={null} />
          </Box>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Box sx={{ backgroundColor: colors.primary[400], padding: "20px", borderRadius: "8px", height: "450px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <Typography variant="h6" color={colors.grey[100]} sx={{ mb: "10px" }}>Top Brands by Price</Typography>
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <BarChart data={chartData1} dataKey="price" nameKey="brand" color={colors.blueAccent[500]} xAxisLabel="Brand Name" yAxisLabel="Average Price (USD)" />
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box sx={{ backgroundColor: colors.primary[400], padding: "20px", borderRadius: "8px", height: "450px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <Typography variant="h6" color={colors.grey[100]} sx={{ mb: "10px" }}>Average Price by Price Class</Typography>
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <BarChart data={chartData2} dataKey="avgPrice" nameKey="priceClass" color={colors.greenAccent[500]} xAxisLabel="Price Class" yAxisLabel="Average Price (USD)" />
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ backgroundColor: colors.primary[400], padding: "20px", borderRadius: "8px", height: "450px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <Typography variant="h6" color={colors.grey[100]} sx={{ mb: "10px" }}>Price Trend Over Time</Typography>
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <LineChart data={chartData3} dataKeys={["price"]} nameKey="year" colors={[colors.blueAccent[500]]} xAxisLabel="Year" yAxisLabel="Average Price (USD)" />
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Pricing;
