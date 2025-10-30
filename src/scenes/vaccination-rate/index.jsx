import React, { useState, useMemo } from 'react';
import { Box, Grid, Button, Typography, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HealingOutlinedIcon from "@mui/icons-material/HealingOutlined";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import StatBox from "../../components/StatBox";
import FilterDropdown from "../../components/FilterDropdown";
import BarChart from "../../components/BarChart";
import PieChart from "../../components/PieChart";
import LineChart from "../../components/LineChart";
import { getData, filterDataframe } from "../../utils/dataGenerator";

function VaccinationRate() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  
  const data = getData();
  
  const [filters, setFilters] = useState({
    year: [],
    disease: [],
    region: [],
    incomeType: [],
    country: [],
  });

  const filteredData = useMemo(() => {
    return filterDataframe(data, {
      year: filters.year,
      disease: filters.disease,
      region: filters.region,
      incomeType: filters.incomeType,
      country: filters.country,
    });
  }, [data, filters]);

  const uniqueOptions = useMemo(() => {
    return {
      years: [...new Set(data.map(d => d.year))].sort(),
      diseases: [...new Set(data.map(d => d.disease))].sort(),
      regions: [...new Set(data.map(d => d.region))].sort(),
      incomeTypes: [...new Set(data.map(d => d.incomeType))].sort(),
      countries: [...new Set(data.map(d => d.country))].sort(),
    };
  }, [data]);

  const kpis = useMemo(() => {
    if (filteredData.length === 0) {
      return {
        avgVaxRate: "N/A",
        avgCovRate: "N/A",
        topRegion: "N/A",
        numCountries: 0,
      };
    }

    const avgVaxRate = filteredData.reduce((sum, d) => sum + d.vaccinationRate, 0) / filteredData.length;
    const avgCovRate = filteredData.reduce((sum, d) => sum + d.coverageRate, 0) / filteredData.length;
    const regionGroups = filteredData.reduce((acc, d) => {
      if (!acc[d.region]) acc[d.region] = [];
      acc[d.region].push(d.vaccinationRate);
      return acc;
    }, {});
    const topRegion = Object.entries(regionGroups)
      .map(([region, rates]) => [region, rates.reduce((a, b) => a + b, 0) / rates.length])
      .sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
    const numCountries = new Set(filteredData.map(d => d.country)).size;

    return {
      avgVaxRate: `${avgVaxRate.toFixed(1)}%`,
      avgCovRate: `${avgCovRate.toFixed(1)}%`,
      topRegion,
      numCountries,
    };
  }, [filteredData]);

  const chartData1 = useMemo(() => {
    const grouped = filteredData.reduce((acc, d) => {
      if (!acc[d.region]) acc[d.region] = [];
      acc[d.region].push(d.vaccinationRate);
      return acc;
    }, {});
    return Object.entries(grouped).map(([region, rates]) => ({
      region,
      vaccinationRate: rates.reduce((a, b) => a + b, 0) / rates.length,
    }));
  }, [filteredData]);

  const chartData2 = useMemo(() => {
    const grouped = filteredData.reduce((acc, d) => {
      if (!acc[d.disease]) acc[d.disease] = [];
      acc[d.disease].push(d.vaccinationRate);
      return acc;
    }, {});
    return Object.entries(grouped).map(([disease, rates]) => ({
      disease,
      vaccinationRate: rates.reduce((a, b) => a + b, 0) / rates.length,
    }));
  }, [filteredData]);

  const chartData3 = useMemo(() => {
    const grouped = filteredData.reduce((acc, d) => {
      if (!acc[d.year]) acc[d.year] = [];
      acc[d.year].push(d.vaccinationRate);
      return acc;
    }, {});
    return Object.entries(grouped)
      .map(([year, rates]) => ({
        year: parseInt(year),
        vaccinationRate: rates.reduce((a, b) => a + b, 0) / rates.length,
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
            "&:hover": {
              backgroundColor: colors.blueAccent[800],
            },
          }}
        >
          Back to Home
        </Button>
      </Box>

      <Header title="Vaccination Rate Analysis" subtitle="Coverage and vaccination rate tracking" />

      {/* Filters */}
      <Box
        sx={{
          backgroundColor: colors.primary[400],
          padding: "20px",
          borderRadius: "8px",
          mb: "20px",
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <FilterDropdown
              label="Year"
              value={filters.year}
              onChange={(e) => setFilters({ ...filters, year: e.target.value })}
              options={uniqueOptions.years}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <FilterDropdown
              label="Disease"
              value={filters.disease}
              onChange={(e) => setFilters({ ...filters, disease: e.target.value })}
              options={uniqueOptions.diseases}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <FilterDropdown
              label="Region"
              value={filters.region}
              onChange={(e) => setFilters({ ...filters, region: e.target.value })}
              options={uniqueOptions.regions}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <FilterDropdown
              label="Income Type"
              value={filters.incomeType}
              onChange={(e) => setFilters({ ...filters, incomeType: e.target.value })}
              options={uniqueOptions.incomeTypes}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <FilterDropdown
              label="Country"
              value={filters.country}
              onChange={(e) => setFilters({ ...filters, country: e.target.value })}
              options={uniqueOptions.countries}
            />
          </Grid>
        </Grid>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2} sx={{ mb: "20px" }}>
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ backgroundColor: colors.primary[400], padding: "20px", borderRadius: "8px" }}>
            <StatBox
              title={kpis.avgVaxRate}
              subtitle="Avg Vaccination Rate"
              icon={<HealingOutlinedIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />}
              progress={null}
            />
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ backgroundColor: colors.primary[400], padding: "20px", borderRadius: "8px" }}>
            <StatBox
              title={kpis.avgCovRate}
              subtitle="Coverage Rate"
              icon={<HealingOutlinedIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />}
              progress={null}
            />
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ backgroundColor: colors.primary[400], padding: "20px", borderRadius: "8px" }}>
            <StatBox
              title={kpis.topRegion}
              subtitle="Top Performing Region"
              icon={<HealingOutlinedIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />}
              progress={null}
            />
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ backgroundColor: colors.primary[400], padding: "20px", borderRadius: "8px" }}>
            <StatBox
              title={kpis.numCountries}
              subtitle="Countries Analyzed"
              icon={<HealingOutlinedIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />}
              progress={null}
            />
          </Box>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Box sx={{ backgroundColor: colors.primary[400], padding: "20px", borderRadius: "8px", height: "450px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <Typography variant="h6" color={colors.grey[100]} sx={{ mb: "10px" }}>Vaccination Rate by Region</Typography>
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <BarChart data={chartData1} dataKey="vaccinationRate" nameKey="region" color={colors.blueAccent[500]} />
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box sx={{ backgroundColor: colors.primary[400], padding: "20px", borderRadius: "8px", height: "450px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <Typography variant="h6" color={colors.grey[100]} sx={{ mb: "10px" }}>Vaccination Rate by Disease</Typography>
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <PieChart data={chartData2} dataKey="vaccinationRate" nameKey="disease" />
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ backgroundColor: colors.primary[400], padding: "20px", borderRadius: "8px", height: "450px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <Typography variant="h6" color={colors.grey[100]} sx={{ mb: "10px" }}>Vaccination Rate Trend</Typography>
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <LineChart data={chartData3} dataKeys={["vaccinationRate"]} nameKey="year" colors={[colors.blueAccent[500]]} />
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

export default VaccinationRate;

