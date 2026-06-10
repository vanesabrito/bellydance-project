"use client";
import React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Image from "next/image";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LockIcon from "@mui/icons-material/Lock";
import EditIcon from "@mui/icons-material/Edit";
import PersonIcon from "@mui/icons-material/Person";
import BadgeIcon from "@mui/icons-material/Badge";
import EmailIcon from "@mui/icons-material/Email";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

export default function AccountPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const user = (session as any)?.user;

  const fullName = `${user?.nombre || ""} ${user?.apellido || ""}`.trim() || user?.email || "Usuario";
  const userEmail = user?.email || "";
  const userCI = user?.cedula || "No especificado";
  const userRole = user?.role || "ALUMNA";
  const userCreatedAt = user?.createdAt ? new Date(user.createdAt).toLocaleDateString("es-ES") : "No disponible";
  const userPhoto = user?.fotoPerfil || "/logo-bellydance-project.png";

  const roleLabels: { [key: string]: string } = {
    ADMIN: "Administrador",
    DIRECTORA_ACADEMICA: "Directora Académica",
    PROFESORA: "Profesora",
    ALUMNA: "Alumna",
  };

  const handleChangePassword = () => {
    router.push("/account/change-password");
  };

  const handleUpdateProfile = () => {
    router.push("/account/profile");
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Encabezado Superior */}
      <Card
        sx={{
          mb: 4,
          borderRadius: 3,
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            p: 3,
            bgcolor: "#ec407a",
            color: "white",
          }}
        >
          <Image
            src="/logo-bellydance-project.png"
            alt="Bellydance Project"
            width={60}
            height={60}
            style={{ borderRadius: "8px" }}
          />
          <Box sx={{ ml: 3, flex: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
              {fullName}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              {userEmail}
            </Typography>
          </Box>
          <Avatar
            src={userPhoto}
            alt={fullName}
            sx={{ width: 80, height: 80, border: "4px solid rgba(255,255,255,0.3)" }}
          >
            {!userPhoto && <AccountCircleIcon sx={{ fontSize: 60 }} />}
          </Avatar>
        </Box>
      </Card>

      <Grid container spacing={3}>
        {/* Tarjeta de Información de Perfil */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              height: "100%",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <PersonIcon sx={{ fontSize: 28, color: "#ec407a", mr: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Información de Perfil
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Aquí puedes ver un resumen de los datos básicos de tu cuenta.
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <PersonIcon sx={{ fontSize: 20, color: "text.secondary", mr: 2, minWidth: 24 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                      Nombre
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {fullName}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <BadgeIcon sx={{ fontSize: 20, color: "text.secondary", mr: 2, minWidth: 24 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                      CI
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {userCI}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <EmailIcon sx={{ fontSize: 20, color: "text.secondary", mr: 2, minWidth: 24 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                      Correo
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {userEmail}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <AccountCircleIcon sx={{ fontSize: 20, color: "text.secondary", mr: 2, minWidth: 24 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                      Tipo de usuario
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {roleLabels[userRole] || userRole}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <CalendarTodayIcon sx={{ fontSize: 20, color: "text.secondary", mr: 2, minWidth: 24 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                      Usuario desde
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {userCreatedAt}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Tarjeta de Configuración */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              height: "100%",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <LockIcon sx={{ fontSize: 28, color: "#ec407a", mr: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Configuración
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Gestiona la configuración de tu cuenta y seguridad.
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Card
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    "&:hover": {
                      borderColor: "primary.main",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                    },
                  }}
                  onClick={handleChangePassword}
                >
                  <Box
                    sx={{ p: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <LockIcon sx={{ fontSize: 24, color: "#ec407a", mr: 2 }} />
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          Cambiar contraseña
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Actualiza tu contraseña de acceso
                        </Typography>
                      </Box>
                    </Box>
                    <ArrowForwardIcon sx={{ color: "#ec407a" }} />
                  </Box>
                </Card>

                <Card
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    "&:hover": {
                      borderColor: "primary.main",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                    },
                  }}
                  onClick={handleUpdateProfile}
                >
                  <Box
                    sx={{ p: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <EditIcon sx={{ fontSize: 24, color: "#ec407a", mr: 2 }} />
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          Actualizar datos
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Modifica tu información personal
                        </Typography>
                      </Box>
                    </Box>
                    <ArrowForwardIcon sx={{ color: "#ec407a" }} />
                  </Box>
                </Card>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
