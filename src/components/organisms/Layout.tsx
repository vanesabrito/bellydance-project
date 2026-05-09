"use client";
import React from "react";
import Sidebar from "../molecules/Sidebar";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "@/mui/theme";
import Box from "@mui/material/Box";
import { usePathname } from "next/navigation";

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";

  // pages where we don't want to show the sidebar
  const hideSidebarOn = ["/", "/login", "/register"];
  const showSidebar = !hideSidebarOn.includes(pathname);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        {showSidebar && (
          <Box component="aside" sx={{ width: 280 }}>
            <Sidebar />
          </Box>
        )}
        <Box component="main" sx={{ flex: 1, p: 3 }}>
          {children}
        </Box>
      </Box>
    </ThemeProvider>
  );
}
