"use client";
import React from "react";
import Container from "@mui/material/Container";
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
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Paper sx={{ p: 6, borderRadius: 4 }} elevation={6}>
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <Image
            src="/Logo_UDO.svg"
            alt="Bellydance Project"
            width={160}
            height={70}
            priority
          />
        </Box>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 800,
            mb: 2,
            textAlign: "center",
            whiteSpace: { xs: "normal", md: "nowrap" },
            fontSize: { xs: "1.8rem", sm: "2.2rem", md: "2.4rem" },
          }}
        >
          Bellydance Project
        </Typography>
        <Typography
          variant="h6"
          sx={{ color: "text.secondary", mb: 3, textAlign: "center" }}
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
              >
                Registrar estudiante
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => router.push("/login")}
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
    </Container>
  );
}
