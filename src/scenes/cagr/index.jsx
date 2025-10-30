import React, { useState, useMemo } from 'react';
import { Box, Grid, Typography, useTheme } from "@mui/material";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import StatBox from "../../components/StatBox";
import FilterDropdown from "../../components/FilterDropdown";
import BarChart from "../../components/BarChart";
import PieChart from "../../components/PieChart";
import LineChart from "../../components/LineChart";
import { getData, filterDataframe } from "../../utils/dataGenerator";

function CAGR() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  
  const data = getData();
  
  const [filters, setFilters] = useState({
    year: [],
    market: [],
    region: [],
    incomeType: [],
    country: [],
    segment: [],
    gender: [],
  });

  const filteredData = useMemo(() => {
    return filterDataframe(data, {
      year: filters.year,
      market: filters.market,
      region: filters.region,
      incomeType: filters.incomeType,
      country: filters.country,
      segment: filters.segment,
      gender: filters.gender,
    });
  }, [data, filters]);

  const uniqueOptions = useMemo(() => {
    return {
      years: [...new Set(data.map(d => d.year))].sort(),
      markets: [...new Set(data.map(d => d.market))].sort(),
      regions: [...new Set(data.map(d => d.region))].sort(),
      incomeTypes: [...new Set(data.map(d => d.incomeType))].sort(),
      countries: [...new Set(data.map(d => d.country))].sort(),
      segments: [...new Set(data.map(d => d.segment))].sort(),
      genders: [...new Set(data.map(d => d.gender))].sort().filter(g => g !== "All"),
    };
  }, [data]);

  const kpis = useMemo(() => {
    if (filteredData.length === 0) {
      return {
        avgCAGR: "N/A",
        topSegment: "N/A",
        maxCAGR: "N/A",
        minCAGR: "N/A",
      };
    }

    const avgCAGR = filteredData.reduce((sum, d) => sum + d.cagr, 0) / filteredData.length;
    const segmentGroups = filteredData.reduce((acc, d) => {
      if (!acc[d.segment]) acc[d.segment] = [];
      acc[d.segment].push(d.cagr);
      return acc;
    }, {});
    const topSegment = Object.entries(segmentGroups)
      .map(([segment, cagrs]) => [segment, cagrs.reduce((a, b) => a + b, 0) / cagrs.length])
      .sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
    const cagrs = filteredData.map(d => d.cagr);
    const maxCAGR = Math.max(...cagrs);
    const minCAGR = Math.min(...cagrs);

    return {
      avgCAGR: `${avgCAGR.toFixed(2)}%`,
      topSegment,
      maxCAGR: `${maxCAGR.toFixed(2)}%`,
      minCAGR: `${minCAGR.toFixed(2)}%`,
    };
  }, [filteredData]);

  const chartData1 = useMemo(() => {
    const grouped = filteredData.reduce((acc, d) => {
      if (!acc[d.segment]) acc[d.segment] = [];
      acc[d.segment].push(d.cagr);
      return acc;
    }, {});
    return Object.entries(grouped).map(([segment, cagrs]) => ({
      segment,
      cagr: cagrs.reduce((a, b) => a + b, 0) / cagrs.length,
    }));
  }, [filteredData]);

  const chartData2 = useMemo(() => {
    const grouped = filteredData.reduce((acc, d) => {
      if (!acc[d.region]) acc[d.region] = [];
      acc[d.region].push(d.cagr);
      return acc;
    }, {});
    return Object.entries(grouped).map(([region, cagrs]) => ({
      region,
      cagr: cagrs.reduce((a, b) => a + b, 0) / cagrs.length,
    }));
  }, [filteredData]);

  const chartData3 = useMemo(() => {
    const sample = filteredData.slice(0, Math.min(100, filteredData.length));
    return sample.map(d => ({
      volume: d.volumeUnits,
      cagr: d.cagr,
      market: d.market,
    }));
  }, [filteredData]);

  return (
    <Box m="20px">
      <Header title="CAGR Analysis" subtitle="Compound annual growth rate by segments" />

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
            <FilterDropdown label="Segment" value={filters.segment} onChange={(e) => setFilters({ ...filters, segment: e.target.value })} options={uniqueOptions.segments} />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <FilterDropdown label="Gender" value={filters.gender} onChange={(e) => setFilters({ ...filters, gender: e.target.value })} options={uniqueOptions.genders} />
          </Grid>
        </Grid>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2} sx={{ mb: "20px" }}>
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ backgroundColor: colors.primary[400], padding: "20px", borderRadius: "8px" }}>
            <StatBox title={kpis.avgCAGR} subtitle="Avg CAGR %" icon={<TrendingUpOutlinedIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />} progress={null} />
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ backgroundColor: colors.primary[400], padding: "20px", borderRadius: "8px" }}>
            <StatBox title={kpis.topSegment} subtitle="Highest Growth Segment" icon={<TrendingUpOutlinedIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />} progress={null} />
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ backgroundColor: colors.primary[400], padding: "20px", borderRadius: "8px" }}>
            <StatBox title={kpis.maxCAGR} subtitle="Max CAGR" icon={<TrendingUpOutlinedIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />} progress={null} />
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ backgroundColor: colors.primary[400], padding: "20px", borderRadius: "8px" }}>
            <StatBox title={kpis.minCAGR} subtitle="Min CAGR" icon={<TrendingUpOutlinedIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />} progress={null} />
          </Box>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Box sx={{ backgroundColor: colors.primary[400], padding: "20px", borderRadius: "8px", height: "450px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <Typography variant="h6" color={colors.grey[100]} sx={{ mb: "10px" }}>CAGR by Segment</Typography>
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <BarChart data={chartData1} dataKey="cagr" nameKey="segment" color={colors.blueAccent[500]} />
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box sx={{ backgroundColor: colors.primary[400], padding: "20px", borderRadius: "8px", height: "450px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <Typography variant="h6" color={colors.grey[100]} sx={{ mb: "10px" }}>CAGR Distribution by Region</Typography>
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <PieChart data={chartData2} dataKey="cagr" nameKey="region" />
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ backgroundColor: colors.primary[400], padding: "20px", borderRadius: "8px", height: "450px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <Typography variant="h6" color={colors.grey[100]} sx={{ mb: "10px" }}>CAGR vs Volume</Typography>
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <LineChart data={chartData3} dataKeys={["cagr"]} nameKey="volume" colors={[colors.blueAccent[500]]} />
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

export default CAGR;
