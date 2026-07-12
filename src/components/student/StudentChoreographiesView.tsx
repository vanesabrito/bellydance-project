"use client";
import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import { useSession } from "next-auth/react";

interface Choreography {
  id: string;
  name: string;
  description: string | null;
  level: string | null;
  music: string | null;
  videoUrl: string | null;
  duration: number | null;
  status: string;
  instructor: {
    user: {
      nombre: string | null;
      apellido: string | null;
    };
  };
  participants: {
    student: {
      user: {
        id: string;
        nombre: string | null;
        apellido: string | null;
      };
    };
  }[];
  createdAt: string;
}

const STATUS_LABELS: Record<string, string> = {
  PRACTICE: "En Práctica",
  DEVELOPMENT: "En Desarrollo",
  READY_FOR_PRESENTATION: "Lista para Presentación",
};

export default function StudentChoreographiesView() {
  const { data: session } = useSession();
  const [choreographies, setChoreographies] = useState<Choreography[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChoreography, setSelectedChoreography] = useState<Choreography | null>(null);

  useEffect(() => {
    if (session) {
      fetchChoreographies();
    }
  }, [session]);

  const fetchChoreographies = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/choreographies");
      const json = await res.json();
      if (json.ok) {
        setChoreographies(json.choreographies);
      } else {
        setError(json.error || "Error al cargar las coreografías");
      }
    } catch (err) {
      setError("Error de red al cargar las coreografías");
    } finally {
      setLoading(false);
    }
  };

  if (!session || (session as any)?.user?.role !== "ALUMNA") {
    return null;
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (choreographies.length === 0) {
    return (
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Typography variant="h6" color="text.secondary">
          No tienes coreografías asignadas
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Tu profesora te asignará coreografías cuando sea necesario
        </Typography>
      </Box>
    );
  }

  if (selectedChoreography) {
    return (
      <Box>
        <Button onClick={() => setSelectedChoreography(null)} sx={{ mb: 2 }}>
          ← Volver a mis coreografías
        </Button>
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
              {selectedChoreography.name}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
              Profesora: {selectedChoreography.instructor.user.nombre} {selectedChoreography.instructor.user.apellido}
            </Typography>
            
            {selectedChoreography.description && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Descripción
                </Typography>
                <Typography variant="body1">{selectedChoreography.description}</Typography>
              </Box>
            )}

            {selectedChoreography.level && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Nivel
                </Typography>
                <Typography variant="body1">{selectedChoreography.level}</Typography>
              </Box>
            )}

            {selectedChoreography.music && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Música
                </Typography>
                <audio controls style={{ width: "100%" }}>
                  <source src={selectedChoreography.music} type="audio/mpga" />
                  Tu navegador no soporta audio
                </audio>
              </Box>
            )}

            {selectedChoreography.videoUrl && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Video de Referencia
                </Typography>
                <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                  <Box
                    component="video"
                    controls
                    sx={{ width: "100%", maxHeight: 400, borderRadius: 1, flex: 1 }}
                  >
                    <source src={selectedChoreography.videoUrl} />
                    Tu navegador no soporta video
                  </Box>
                  <Button
                    variant="outlined"
                    href={selectedChoreography.videoUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ minWidth: 150 }}
                  >
                    Descargar Video
                  </Button>
                </Box>
              </Box>
            )}

            {selectedChoreography.duration && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Duración
                </Typography>
                <Typography variant="body1">{selectedChoreography.duration} minutos</Typography>
              </Box>
            )}

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Estado
              </Typography>
              <Box
                sx={{
                  px: 2,
                  py: 1,
                  borderRadius: 1,
                  backgroundColor:
                    selectedChoreography.status === "READY_FOR_PRESENTATION"
                      ? "#e8f5e9"
                      : selectedChoreography.status === "DEVELOPMENT"
                      ? "#fff3e0"
                      : "#e3f2fd",
                  color:
                    selectedChoreography.status === "READY_FOR_PRESENTATION"
                      ? "#2e7d32"
                      : selectedChoreography.status === "DEVELOPMENT"
                      ? "#ef6c00"
                      : "#1565c0",
                  fontWeight: 500,
                  display: "inline-block",
                }}
              >
                {STATUS_LABELS[selectedChoreography.status] || selectedChoreography.status}
              </Box>
            </Box>

            {selectedChoreography.participants && selectedChoreography.participants.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Participantes
                </Typography>
                <Typography variant="body1">
                  {selectedChoreography.participants
                    .map((p) => `${p.student.user.nombre} ${p.student.user.apellido}`)
                    .join(", ")}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
        Ver Coreografías
      </Typography>
      <Grid container spacing={3}>
        {choreographies.map((choreography) => (
          <Grid item xs={12} md={6} lg={4} key={choreography.id}>
            <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  {choreography.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Profesora: {choreography.instructor.user.nombre} {choreography.instructor.user.apellido}
                </Typography>
                {choreography.level && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Nivel: {choreography.level}
                  </Typography>
                )}
                <Box
                  sx={{
                    px: 2,
                    py: 1,
                    borderRadius: 1,
                    backgroundColor:
                      choreography.status === "READY_FOR_PRESENTATION"
                        ? "#e8f5e9"
                        : choreography.status === "DEVELOPMENT"
                        ? "#fff3e0"
                        : "#e3f2fd",
                    color:
                      choreography.status === "READY_FOR_PRESENTATION"
                        ? "#2e7d32"
                        : choreography.status === "DEVELOPMENT"
                        ? "#ef6c00"
                        : "#1565c0",
                    fontWeight: 500,
                    display: "inline-block",
                    mb: 2,
                  }}
                >
                  {STATUS_LABELS[choreography.status] || choreography.status}
                </Box>
                {choreography.duration && (
                  <Typography variant="caption" color="text.secondary">
                    {choreography.duration} min
                  </Typography>
                )}
              </CardContent>
              <CardActions>
                <Button
                  variant="contained"
                  onClick={() => setSelectedChoreography(choreography)}
                  sx={{ backgroundColor: "#ec407a", "&:hover": { backgroundColor: "#d81b60" } }}
                >
                  Ver Detalles
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
