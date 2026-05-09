"use client";
import React, { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import BackButton from "@/components/atoms/BackButton";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // Redirect to dashboard automatically when authenticated
  React.useEffect(() => {
    if (status === "authenticated") router.push("/dashboard");
  }, [status, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });
      // signIn returns an object when redirect:false
      if ((res as any)?.error) {
        const code = (res as any).error as string | undefined;
        const message = (() => {
          switch (code) {
            case "CredentialsSignin":
              return "Email o contraseña incorrectos";
            case "AccessDenied":
              return "Acceso denegado";
            case "Configuration":
              return "Error de configuración del servidor de autenticación";
            case "OAuthSignin":
            case "OAuthCallback":
            case "OAuthCreateAccount":
              return "Error con el proveedor de autenticación";
            default:
              return "No se pudo iniciar sesión";
          }
        })();
        setError(message);
      } else {
        // successful login
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err?.message || "Error de conexión");
    } finally {
      setLoading(false);
    }
  }

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
          Iniciar sesión
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ mt: 2, display: "grid", gap: 2 }}
        >
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="Contraseña"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={
                      showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                    onClick={() => setShowPassword((s) => !s)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            sx={{
              textTransform: "none",
              borderRadius: 3,
              boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
            }}
          >
            {loading ? "Entrando..." : "Entrar"}
          </Button>
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
    </Container>
  );
}
