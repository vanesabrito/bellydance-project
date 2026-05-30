"use client";
import React from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import Image from "next/image";
import DashboardIcon from "@mui/icons-material/Dashboard";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import MoveToInboxIcon from "@mui/icons-material/MoveToInbox";
import PeopleIcon from "@mui/icons-material/People";
import AssessmentIcon from "@mui/icons-material/Assessment";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import SchoolIcon from "@mui/icons-material/School";
import EventIcon from "@mui/icons-material/Event";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import CheckroomIcon from "@mui/icons-material/Checkroom";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import DescriptionIcon from "@mui/icons-material/Description";

export default function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const role = (session as any)?.user?.role ?? "GUEST";

  const isSelected = (href: string) => {
    if (!pathname) return false;
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  const itemSx = {
    "&.Mui-selected": {
      bgcolor: "primary.main",
      color: "primary.contrastText",
      "& .MuiListItemIcon-root": { color: "inherit" },
    },
    "&.Mui-selected:hover": {
      bgcolor: "primary.dark",
    },
    borderRadius: 1,
  } as const;

  return (
    <Box sx={{ p: 2 }}>
      <Box
        sx={{
          mb: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Image
          src="/logo-bellydance-project.png"
          alt="Logo Bellydance Project"
          width={200}
          height={200}
          priority
          style={{ objectFit: "contain", width: "200px", height: "200px" }}
        />
      </Box>
      <List>
        {/* Dashboard - visible when session exists */}
        {session && (
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              href="/dashboard"
              selected={isSelected("/dashboard")}
              disableRipple
              sx={itemSx}
            >
              <ListItemIcon>
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItemButton>
          </ListItem>
        )}

        {/* Alumna links */}
        {role === "ALUMNA" && (
          <>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                href="/student/enroll"
                selected={isSelected("/student/enroll")}
                disableRipple
                sx={itemSx}
              >
                <ListItemIcon>
                  <UploadFileIcon />
                </ListItemIcon>
                <ListItemText primary="Inscribirse" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                href="/student/enrollments"
                selected={isSelected("/student/enrollments")}
                disableRipple
                sx={itemSx}
              >
                <ListItemIcon>
                  <MoveToInboxIcon />
                </ListItemIcon>
                <ListItemText primary="Mis inscripciones" />
              </ListItemButton>
            </ListItem>
          </>
        )}

        {/* Profesora links */}
        {role === "PROFESORA" && (
          <>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                href="/profesora/classes"
                selected={isSelected("/profesora/classes")}
                disableRipple
                sx={itemSx}
              >
                <ListItemIcon>
                  <SchoolIcon />
                </ListItemIcon>
                <ListItemText primary="Mis Clases" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                href="/profesora/choreographies"
                selected={isSelected("/profesora/choreographies")}
                disableRipple
                sx={itemSx}
              >
                <ListItemIcon>
                  <MusicNoteIcon />
                </ListItemIcon>
                <ListItemText primary="Coreografías" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                href="/profesora/costumes"
                selected={isSelected("/profesora/costumes")}
                disableRipple
                sx={itemSx}
              >
                <ListItemIcon>
                  <CheckroomIcon />
                </ListItemIcon>
                <ListItemText primary="Vestuarios" />
              </ListItemButton>
            </ListItem>
          </>
        )}

        {/* Directora Académica links */}
        {role === "DIRECTORA_ACADEMICA" && (
          <>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                href="/directora/events"
                selected={isSelected("/directora/events")}
                disableRipple
                sx={itemSx}
              >
                <ListItemIcon>
                  <EventIcon />
                </ListItemIcon>
                <ListItemText primary="Gestionar Eventos" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                href="/directora/attendance"
                selected={isSelected("/directora/attendance")}
                disableRipple
                sx={itemSx}
              >
                <ListItemIcon>
                  <FactCheckIcon />
                </ListItemIcon>
                <ListItemText primary="Control de Asistencias" />
              </ListItemButton>
            </ListItem>
          </>
        )}

        {/* Admin links */}
        {role === "ADMIN" && (
          <>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                href="/admin/users"
                selected={isSelected("/admin/users")}
                disableRipple
                sx={itemSx}
              >
                <ListItemIcon>
                  <PeopleIcon />
                </ListItemIcon>
                <ListItemText primary="Registrar Usuarios" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                href="/admin/enrollments"
                selected={isSelected("/admin/enrollments")}
                disableRipple
                sx={itemSx}
              >
                <ListItemIcon>
                  <FactCheckIcon />
                </ListItemIcon>
                <ListItemText primary="Gestionar Inscripciones" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                href="/admin/documents"
                selected={isSelected("/admin/documents")}
                disableRipple
                sx={itemSx}
              >
                <ListItemIcon>
                  <DescriptionIcon />
                </ListItemIcon>
                <ListItemText primary="Documentos" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                href="/admin/payments"
                selected={isSelected("/admin/payments")}
                disableRipple
                sx={itemSx}
              >
                <ListItemIcon>
                  <AttachMoneyIcon />
                </ListItemIcon>
                <ListItemText primary="Control de Pagos" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                href="/admin/reports"
                selected={isSelected("/admin/reports")}
                disableRipple
                sx={itemSx}
              >
                <ListItemIcon>
                  <AssessmentIcon />
                </ListItemIcon>
                <ListItemText primary="Reportes" />
              </ListItemButton>
            </ListItem>
          </>
        )}

        <Divider sx={{ my: 1 }} />

        {session ? (
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => signOut({ callbackUrl: "/" })}
              sx={{ borderRadius: 1 }}
            >
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Cerrar sesión" />
            </ListItemButton>
          </ListItem>
        ) : (
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              href="/login"
              selected={isSelected("/login")}
              disableRipple
              sx={itemSx}
            >
              <ListItemIcon>
                <LoginIcon />
              </ListItemIcon>
              <ListItemText primary="Iniciar sesión" />
            </ListItemButton>
          </ListItem>
        )}
      </List>
    </Box>
  );
}
