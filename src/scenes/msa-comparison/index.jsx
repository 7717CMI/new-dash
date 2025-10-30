import React, { useState, useMemo } from 'react';
import { Box, Grid, Typography, useTheme, Dialog, DialogTitle, DialogContent, IconButton } from "@mui/material";
import PieChartOutlinedIcon from "@mui/icons-material/PieChartOutlined";
import CloseIcon from "@mui/icons-material/Close";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import StatBox from "../../components/StatBox";
import FilterDropdown from "../../components/FilterDropdown";
import BarChart from "../../components/BarChart";
import PieChart from "../../components/PieChart";
import LineChart from "../../components/LineChart";
import { getData, filterDataframe, formatNumber } from "../../utils/dataGenerator";

function MSAComparison() {
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

  const [openModal, setOpenModal] = useState(null);

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
        totalValue: "N/A",
        totalVolume: "N/A",
        avgShare: "N/A",
        avgYoY: "N/A",
      };
    }

    const totalValue = filteredData.reduce((sum, d) => sum + (d.value || d.marketValueUsd || 0), 0);
    const totalVolume = filteredData.reduce((sum, d) => sum + (d.volumeUnits || 0), 0);
    const avgShare = filteredData.reduce((sum, d) => sum + (d.share || d.marketSharePct || 0), 0) / filteredData.length;
    const avgYoY = filteredData.reduce((sum, d) => sum + (d.yoy || d.yoyGrowth || 0), 0) / filteredData.length;

    return {
      totalValue: formatNumber(totalValue),
      totalVolume: formatNumber(totalVolume),
      avgShare: `${avgShare.toFixed(1)}%`,
      avgYoY: `${avgYoY.toFixed(1)}%`,
    };
  }, [filteredData]);

  const chartData1 = useMemo(() => {
    const grouped = filteredData.reduce((acc, d) => {
      const market = d.market || d.disease;
      const value = d.value || d.marketValueUsd || 0;
      acc[market] = (acc[market] || 0) + value;
      return acc;
    }, {});
    return Object.entries(grouped)
      .map(([market, value]) => ({ market, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [filteredData]);

  const chartData2 = useMemo(() => {
    const grouped = filteredData.reduce((acc, d) => {
      if (!acc[d.brand]) acc[d.brand] = [];
      acc[d.brand].push(d.share || d.marketSharePct || 0);
      return acc;
    }, {});
    return Object.entries(grouped)
      .map(([brand, shares]) => ({
        brand,
        share: shares.reduce((a, b) => a + b, 0) / shares.length,
      }))
      .sort((a, b) => b.share - a.share)
      .slice(0, 8);
  }, [filteredData]);

  const chartData3 = useMemo(() => {
    const grouped = filteredData.reduce((acc, d) => {
      if (!acc[d.year]) acc[d.year] = [];
      acc[d.year].push(d.yoy || d.yoyGrowth || 0);
      return acc;
    }, {});
    return Object.entries(grouped)
      .map(([year, yoys]) => ({
        year: parseInt(year),
        yoy: yoys.reduce((a, b) => a + b, 0) / yoys.length,
      }))
      .sort((a, b) => a.year - b.year);
  }, [filteredData]);

  // Pie chart data for value breakdown by brand
  const valuePieData = useMemo(() => {
    const grouped = filteredData.reduce((acc, d) => {
      acc[d.brand] = (acc[d.brand] || 0) + (d.value || d.marketValueUsd || 0);
      return acc;
    }, {});
    const total = Object.values(grouped).reduce((sum, val) => sum + val, 0);
    return Object.entries(grouped)
      .map(([brand, value]) => ({
        brand,
        value: value,
        percent: total > 0 ? ((value / total) * 100).toFixed(1) : 0,
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredData]);

  // Pie chart data for volume breakdown by brand
  const volumePieData = useMemo(() => {
    const grouped = filteredData.reduce((acc, d) => {
      acc[d.brand] = (acc[d.brand] || 0) + (d.volumeUnits || 0);
      return acc;
    }, {});
    const total = Object.values(grouped).reduce((sum, val) => sum + val, 0);
    return Object.entries(grouped)
      .map(([brand, volume]) => ({
        brand,
        value: volume,
        percent: total > 0 ? ((volume / total) * 100).toFixed(1) : 0,
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredData]);

  return (
    <Box m="20px">
      <Header title="MSA Comparison" subtitle="Market share comparative analysis" />

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

      <Grid container spacing={2} sx={{ mb: "20px" }}>
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ backgroundColor: colors.primary[400], padding: "20px", borderRadius: "8px" }}>
            <StatBox title={kpis.totalValue} subtitle="Total Market Value" icon={<PieChartOutlinedIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />} progress="0.75" onCircleClick={() => setOpenModal('value')} />
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ backgroundColor: colors.primary[400], padding: "20px", borderRadius: "8px" }}>
            <StatBox title={kpis.totalVolume} subtitle="Total Volume" icon={<PieChartOutlinedIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />} progress="0.70" onCircleClick={() => setOpenModal('volume')} />
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ backgroundColor: colors.primary[400], padding: "20px", borderRadius: "8px" }}>
            <StatBox title={kpis.avgShare} subtitle="Avg Market Share" icon={<PieChartOutlinedIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />} progress={null} />
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ backgroundColor: colors.primary[400], padding: "20px", borderRadius: "8px" }}>
            <StatBox title={kpis.avgYoY} subtitle="Avg YoY Growth" icon={<PieChartOutlinedIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />} progress={null} />
          </Box>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Box sx={{ backgroundColor: colors.primary[400], padding: "20px", borderRadius: "8px", height: "450px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <Typography variant="h6" color={colors.grey[100]} sx={{ mb: "10px" }}>Top Markets by Value</Typography>
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <BarChart data={chartData1} dataKey="value" nameKey="market" color={colors.blueAccent[500]} />
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box sx={{ backgroundColor: colors.primary[400], padding: "20px", borderRadius: "8px", height: "450px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <Typography variant="h6" color={colors.grey[100]} sx={{ mb: "10px" }}>Market Share by Brand</Typography>
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <PieChart data={chartData2} dataKey="share" nameKey="brand" />
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ backgroundColor: colors.primary[400], padding: "20px", borderRadius: "8px", height: "450px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <Typography variant="h6" color={colors.grey[100]} sx={{ mb: "10px" }}>YoY Growth Trend</Typography>
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <LineChart data={chartData3} dataKeys={["yoy"]} nameKey="year" colors={[colors.blueAccent[500]]} />
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Pie Chart Modal */}
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
            {openModal === 'value' ? 'Total Market Value by Brand' : 'Total Volume by Brand'}
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
              data={openModal === 'value' ? valuePieData : volumePieData}
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
              {(openModal === 'value' ? valuePieData : volumePieData).map((item, index) => (
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

export default MSAComparison;

