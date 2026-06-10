"use client";
import React, { useState, useEffect } from "react";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import BackButton from "@/components/atoms/BackButton";
import Link from "next/link";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useSearchParams, useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<"weak" | "medium" | "strong" | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Enlace de recuperación inválido");
    }
  }, [token]);

  const checkPasswordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;

    if (strength <= 2) return "weak";
    if (strength <= 3) return "medium";
    return "strong";
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordStrength(checkPasswordStrength(value));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!token) {
      setError("Enlace de recuperación inválido");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword }),
      });
      const json = await res.json();
      
      if (json.ok) {
        setSuccess("Contraseña actualizada exitosamente. Redirigiendo al login...");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setError(json.error || "No se pudo actualizar la contraseña");
      }
    } catch (err: any) {
      setError(err?.message || "Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  const getStrengthColor = () => {
    switch (passwordStrength) {
      case "weak": return "#f44336";
      case "medium": return "#ff9800";
      case "strong": return "#4caf50";
      default: return "#e0e0e0";
    }
  };

  const getStrengthText = () => {
    switch (passwordStrength) {
      case "weak": return "Débil";
      case "medium": return "Media";
      case "strong": return "Fuerte";
      default: return "";
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <BackButton />
      <Paper sx={{ p: 4, borderRadius: 3, mt: 2 }} elevation={6}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ textAlign: "center", fontWeight: 700 }}
        >
          Restablecer Contraseña
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: "center", mb: 3 }}
        >
          Ingresa tu nueva contraseña
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ mt: 2, display: "grid", gap: 2 }}
        >
          <TextField
            label="Nueva contraseña"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={handlePasswordChange}
            fullWidth
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    onClick={() => setShowPassword((s) => !s)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {password && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  flex: 1,
                  height: 4,
                  backgroundColor: getStrengthColor(),
                  borderRadius: 2,
                }}
              />
              <Typography variant="caption" sx={{ color: getStrengthColor() }}>
                {getStrengthText()}
              </Typography>
            </Box>
          )}
          <TextField
            label="Confirmar contraseña"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            fullWidth
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    onClick={() => setShowConfirmPassword((s) => !s)}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas y números
            </Typography>
          </Box>
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading || !token}
            sx={{
              textTransform: "none",
              borderRadius: 3,
              boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
              backgroundColor: "#ec407a",
              color: "#fff",
              '&:hover': {
                backgroundColor: "#d81b60",
              },
            }}
          >
            {loading ? "Actualizando..." : "Actualizar contraseña"}
          </Button>
        </Box>
        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Link href="/login" style={{ textDecoration: "none", color: "#ec407a" }}>
            Volver a iniciar sesión
          </Link>
        </Box>
      </Paper>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert
          severity="error"
          onClose={() => setError(null)}
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
      >
        <Alert
          severity="success"
          onClose={() => setSuccess(null)}
          sx={{ width: "100%" }}
        >
          {success}
        </Alert>
      </Snackbar>
    </Container>
  );
}
