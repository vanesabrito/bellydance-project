"use client";
import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import Link from "next/link";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import Image from "next/image";

export default function ProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const user = (session as any)?.user;

  const [nombre, setNombre] = useState(user?.nombre || "");
  const [apellido, setApellido] = useState(user?.apellido || "");
  const [email, setEmail] = useState(user?.email || "");
  const [telefono, setTelefono] = useState(user?.direccion || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const userPhoto = user?.fotoPerfil || "/logo-bellydance-project.png";
  const fullName = `${user?.nombre || ""} ${user?.apellido || ""}`.trim() || user?.email || "Usuario";

  const validateForm = (): string | null => {
    if (!nombre.trim()) {
      return "El nombre es obligatorio.";
    }

    if (!apellido.trim()) {
      return "El apellido es obligatorio.";
    }

    if (!email.trim()) {
      return "El correo electrónico es obligatorio.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "El correo electrónico no es válido.";
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/user/update-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre,
          apellido,
          email,
          telefono,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al actualizar los datos.");
        return;
      }

      setSuccess(true);

      // Redirigir a la página de cuenta después de 2 segundos
      setTimeout(() => {
        router.push("/account");
      }, 2000);
    } catch (err) {
      setError("Error de conexión. Por favor, intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/account");
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Link href="/account" style={{ textDecoration: "none" }}>
          <IconButton sx={{ mb: 2 }}>
            <ArrowBackIcon />
          </IconButton>
        </Link>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Actualizar Datos
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Modifica tu información personal
        </Typography>
      </Box>

      <Card
        sx={{
          borderRadius: 3,
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {error && (
            <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Los datos de tu perfil han sido actualizados exitosamente.
            </Alert>
          )}

          {/* Foto de Perfil */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 4, pb: 4, borderBottom: "1px solid", borderColor: "divider" }}>
            <Avatar
              src={userPhoto}
              alt={fullName}
              sx={{ width: 100, height: 100, mr: 3, border: "3px solid #ec407a" }}
              imgProps={{
                style: { objectFit: 'cover' }
              }}
            >
              {!userPhoto && <AccountCircleIcon sx={{ fontSize: 60 }} />}
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Foto de perfil
              </Typography>
              <Button
                variant="outlined"
                startIcon={<CameraAltIcon />}
                sx={{
                  borderColor: "#ec407a",
                  color: "#ec407a",
                  "&:hover": {
                    borderColor: "#d81b60",
                    backgroundColor: "rgba(236, 64, 122, 0.04)",
                  },
                }}
              >
                Cambiar foto
              </Button>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                Formatos aceptados: JPG, PNG. Máximo 2MB.
              </Typography>
            </Box>
          </Box>

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 3 }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  fullWidth
                  required
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <PersonIcon sx={{ mr: 1, color: "#ec407a" }} />
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Apellido"
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  fullWidth
                  required
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <PersonIcon sx={{ mr: 1, color: "#ec407a" }} />
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Correo electrónico"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                  required
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <EmailIcon sx={{ mr: 1, color: "#ec407a" }} />
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Teléfono"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  fullWidth
                  disabled={loading}
                  helperText="Opcional"
                  InputProps={{
                    startAdornment: (
                      <PhoneIcon sx={{ mr: 1, color: "#ec407a" }} />
                    ),
                  }}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
              <Button
                variant="outlined"
                onClick={handleCancel}
                disabled={loading}
                sx={{
                  borderColor: "#ec407a",
                  color: "#ec407a",
                  "&:hover": {
                    borderColor: "#d81b60",
                    backgroundColor: "rgba(236, 64, 122, 0.04)",
                  },
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{
                  backgroundColor: "#ec407a",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "#d81b60",
                  },
                }}
              >
                {loading ? "Guardando..." : "Guardar cambios"}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
