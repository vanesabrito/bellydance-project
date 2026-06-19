"use client";
import React from "react";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  React.useEffect(() => {
    if (status === "authenticated") router.push("/dashboard");
  }, [status, router]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 4,
        background: "linear-gradient(180deg, #fce4ec 0%, #f8bbd0 45%, #ec407a 100%)",
      }}
    >
      <Paper sx={{ p: 6, borderRadius: 4, width: "100%", maxWidth: 560, backgroundColor: "rgba(255,255,255,0.92)" }} elevation={6}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 2,
            borderRadius: "50%",
            overflow: "hidden",
            width: 200,
            height: 200,
            bgcolor: "background.paper",
            p: 1,
            position: "relative",
          }}
        >
          <Image
            src="/logo-bellydance-project.png"
            alt="Bellydance Project"
            width={240}
            height={240}
            priority
            style={{
              objectFit: "cover",
              width: "100%",
              height: "100%",
            }}
          />
        </Box>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 700,
            mb: 2,
            textAlign: "center",
            whiteSpace: { xs: "normal", md: "nowrap" },
            fontSize: { xs: "1.8rem", sm: "2.2rem", md: "2.4rem" },
            fontFamily: '"Brush Script MT", "Lucida Handwriting", cursive',
            letterSpacing: 1,
            color: "#d81b60",
            textShadow: "1px 1px 2px rgba(0,0,0,0.15)",
          }}
        >
          Bellydance Project
        </Typography>
        <Typography
          variant="h6"
          sx={{
            color: "#880e4f",
            mb: 3,
            textAlign: "center",
            fontFamily: '"Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
            letterSpacing: 0.5,
          }}
        >
          Gestión de clases y inscripciones para la academia de baile
        </Typography>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {!session ? (
            <>
              <Button
                variant="contained"
                size="large"
                onClick={() => router.push("/register")}
                sx={{
                  textTransform: "none",
                  backgroundColor: "#ec407a",
                  color: "#fff",
                  '&:hover': {
                    backgroundColor: "#d81b60",
                  },
                }}
              >
                Registrar estudiante
              </Button>
              <Button
                variant="contained"
                size="large"
                onClick={() => router.push("/login")}
                sx={{
                  textTransform: "none",
                  backgroundColor: "#f48fb1",
                  color: "#fff",
                  '&:hover': {
                    backgroundColor: "#ec407a",
                  },
                }}
              >
                Iniciar sesión
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              size="large"
              onClick={() => router.push("/dashboard")}
            >
              Ir al dashboard
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
