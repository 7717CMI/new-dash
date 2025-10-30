import React, { useState } from 'react';
import { Box } from "@mui/material";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";
import Home from "./scenes/home";
import Epidemiology from "./scenes/epidemiology";
import VaccinationRate from "./scenes/vaccination-rate";
import Pricing from "./scenes/pricing";
import CAGR from "./scenes/cagr";
import MSAComparison from "./scenes/msa-comparison";
import Procurement from "./scenes/procurement";
import BrandDemographic from "./scenes/brand-demographic";
import FDF from "./scenes/fdf";
import Contact from "./scenes/contact";

function App() {
  const [theme, colorMode] = useMode();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <BrowserRouter>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <div className="app">
            <Topbar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
            <Box display="flex" sx={{ height: "calc(100vh - 60px)", flex: 1 }}>
              {isSidebarOpen && (
                <Sidebar 
                  isCollapsed={isSidebarCollapsed} 
                  setIsCollapsed={setIsSidebarCollapsed} 
                />
              )}
              <main className="content" style={{ flex: 1, overflowY: "auto" }}>
                <Box sx={{ width: "100%" }}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/epidemiology" element={<Epidemiology />} />
                    <Route path="/vaccination-rate" element={<VaccinationRate />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/cagr" element={<CAGR />} />
                    <Route path="/msa-comparison" element={<MSAComparison />} />
                    <Route path="/procurement" element={<Procurement />} />
                    <Route path="/brand-demographic" element={<BrandDemographic />} />
                    <Route path="/fdf" element={<FDF />} />
                    <Route path="/contact" element={<Contact />} />
                  </Routes>
                </Box>
              </main>
            </Box>
          </div>
        </ThemeProvider>
      </ColorModeContext.Provider>
    </BrowserRouter>
  );
}

export default App;
