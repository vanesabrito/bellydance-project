"use client";
import React from "react";
import Sidebar from "../molecules/Sidebar";
import UserMenu from "../molecules/UserMenu";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "@/mui/theme";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";

  // pages where we don't want to show the sidebar
  const hideSidebarOn = ["/", "/login", "/register"];
  const showSidebar = !hideSidebarOn.includes(pathname);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        {showSidebar && (
          <AppBar
            position="static"
            elevation={0}
            sx={{
              bgcolor: "#ec407a",
              width: "100%",
              left: 0,
              right: 0,
              px: 0,
              m: 0,
              flexShrink: 0,
            }}
          >
            <Toolbar sx={{ justifyContent: "flex-end", width: "100%", px: 0, mx: 0 }}>
              <Box sx={{ pr: 2 }}>
                <UserMenu />
              </Box>
            </Toolbar>
          </AppBar>
        )}
        <Box sx={{ display: "flex", flex: 1, width: "100%" }}>
          {showSidebar && (
            <Box component="aside" sx={{ width: 240, flexShrink: 0 }}>
              <Sidebar />
            </Box>
          )}
          <Box component="main" sx={{ flex: 1, p: showSidebar ? 3 : 0, width: "100%" }}>
            {children}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
