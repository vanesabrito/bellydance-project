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
import ScheduleIcon from "@mui/icons-material/Schedule";

export default function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const role = (session as any)?.user?.role ?? "GUEST";

  const getUserName = () => {
    const user = (session as any)?.user;
    if (!user) return "Mi Perfil";
    
    // Para administrador, mostrar solo "Administrador"
    if (role === "ADMIN") {
      return "Administrador";
    }
    
    const nombre = user.nombre;
    const apellido = user.apellido;
    
    if (nombre && apellido) {
      return `${nombre} ${apellido}`;
    } else if (nombre) {
      return nombre;
    } else {
      return "Mi Perfil";
    }
  };

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
              <ListItemText primary={getUserName()} />
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
                <ListItemText primary="Solicitar Inscripción" />
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
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                href="/student/registration-form"
                selected={isSelected("/student/registration-form")}
                disableRipple
                sx={itemSx}
              >
                <ListItemIcon>
                  <DescriptionIcon />
                </ListItemIcon>
                <ListItemText primary="Gestionar Planilla de Inscripción" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                href="/student/classes"
                selected={isSelected("/student/classes")}
                disableRipple
                sx={itemSx}
              >
                <ListItemIcon>
                  <SchoolIcon />
                </ListItemIcon>
                <ListItemText primary="Ver Clases" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                href="/student/choreographies"
                selected={isSelected("/student/choreographies")}
                disableRipple
                sx={itemSx}
              >
                <ListItemIcon>
                  <MusicNoteIcon />
                </ListItemIcon>
                <ListItemText primary="Ver Coreografías" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                href="/student/costumes"
                selected={isSelected("/student/costumes")}
                disableRipple
                sx={itemSx}
              >
                <ListItemIcon>
                  <CheckroomIcon />
                </ListItemIcon>
                <ListItemText primary="Ver Vestuarios" />
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
                href="/profesora/manage-classes"
                selected={isSelected("/profesora/manage-classes")}
                disableRipple
                sx={itemSx}
              >
                <ListItemIcon>
                  <SchoolIcon />
                </ListItemIcon>
                <ListItemText primary="Gestionar Contenido de Clases" />
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
                <ListItemText primary="Gestionar Coreografías" />
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
                <ListItemText primary="Gestionar Vestuarios" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                href="/instructor/schedules"
                selected={isSelected("/instructor/schedules")}
                disableRipple
                sx={itemSx}
              >
                <ListItemIcon>
                  <ScheduleIcon />
                </ListItemIcon>
                <ListItemText primary="Visualizar Horarios" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                href="/profesora/view-students"
                selected={isSelected("/profesora/view-students")}
                disableRipple
                sx={itemSx}
              >
                <ListItemIcon>
                  <SchoolIcon />
                </ListItemIcon>
                <ListItemText primary="Buscar Lista de Alumnas por Categorías" />
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
                <ListItemText primary="Gestionar Asistencias" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                href="/directora/schedules"
                selected={isSelected("/directora/schedules")}
                disableRipple
                sx={itemSx}
              >
                <ListItemIcon>
                  <ScheduleIcon />
                </ListItemIcon>
                <ListItemText primary="Visualizar Horarios" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                href="/directora/view-students"
                selected={isSelected("/directora/view-students")}
                disableRipple
                sx={itemSx}
              >
                <ListItemIcon>
                  <SchoolIcon />
                </ListItemIcon>
                <ListItemText primary="Buscar Lista de Alumnas por Categorías" />
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
                <ListItemText primary="Gestionar Usuarios" />
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
                href="/admin/enrolled-students"
                selected={isSelected("/admin/enrolled-students")}
                disableRipple
                sx={itemSx}
              >
                <ListItemIcon>
                  <SchoolIcon />
                </ListItemIcon>
                <ListItemText primary="Gestionar Lista de Alumnas por Categorias" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                href="/admin/schedules"
                selected={isSelected("/admin/schedules")}
                disableRipple
                sx={itemSx}
              >
                <ListItemIcon>
                  <ScheduleIcon />
                </ListItemIcon>
                <ListItemText primary="Gestionar Horarios" />
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
                <ListItemText primary="Gestionar Documentos" />
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
                <ListItemText primary="Gestionar Pagos" />
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
