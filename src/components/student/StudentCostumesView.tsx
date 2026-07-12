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

interface Costume {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  imageUrl: string | null;
  accessories: string | null;
  estimatedCost: number | null;
  status: string;
  choreography: { id: string; name: string } | null;
  instructor: {
    user: {
      nombre: string | null;
      apellido: string | null;
    };
  };
  createdAt: string;
}

const STATUS_LABELS: Record<string, string> = {
  DESIGN: "En Diseño",
  APPROVED: "Aprobado",
  REJECTED: "Rechazado",
  IN_PRODUCTION: "En Producción",
  COMPLETED: "Completado",
};

export default function StudentCostumesView() {
  const { data: session } = useSession();
  const [costumes, setCostumes] = useState<Costume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCostume, setSelectedCostume] = useState<Costume | null>(null);

  useEffect(() => {
    if (session) {
      fetchCostumes();
    }
  }, [session]);

  const fetchCostumes = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/costumes");
      const json = await res.json();
      if (json.ok) {
        setCostumes(json.costumes);
      } else {
        setError(json.error || "Error al cargar los vestuarios");
      }
    } catch (err) {
      setError("Error de red al cargar los vestuarios");
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

  if (costumes.length === 0) {
    return (
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Typography variant="h6" color="text.secondary">
          No hay vestuarios disponibles
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Tu profesora agregará vestuarios cuando sea necesario
        </Typography>
      </Box>
    );
  }

  if (selectedCostume) {
    return (
      <Box>
        <Button onClick={() => setSelectedCostume(null)} sx={{ mb: 2 }}>
          ← Volver a vestuarios
        </Button>
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
              {selectedCostume.name}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
              Profesora: {selectedCostume.instructor.user.nombre} {selectedCostume.instructor.user.apellido}
            </Typography>
            
            {selectedCostume.description && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Descripción
                </Typography>
                <Typography variant="body1">{selectedCostume.description}</Typography>
              </Box>
            )}

            {selectedCostume.choreography && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Coreografía
                </Typography>
                <Typography variant="body1">{selectedCostume.choreography.name}</Typography>
              </Box>
            )}

            {selectedCostume.color && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Color
                </Typography>
                <Typography variant="body1">{selectedCostume.color}</Typography>
              </Box>
            )}

            {selectedCostume.accessories && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Accesorios
                </Typography>
                <Typography variant="body1" whiteSpace="pre-wrap">
                  {selectedCostume.accessories}
                </Typography>
              </Box>
            )}

            {selectedCostume.estimatedCost && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Costo Estimado
                </Typography>
                <Typography variant="body1">${selectedCostume.estimatedCost.toFixed(2)}</Typography>
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
                    selectedCostume.status === "APPROVED"
                      ? "#e8f5e9"
                      : selectedCostume.status === "DESIGN"
                      ? "#fff3e0"
                      : selectedCostume.status === "IN_PRODUCTION"
                      ? "#e3f2fd"
                      : selectedCostume.status === "COMPLETED"
                      ? "#f3e5f5"
                      : "#ffebee",
                  color:
                    selectedCostume.status === "APPROVED"
                      ? "#2e7d32"
                      : selectedCostume.status === "DESIGN"
                      ? "#ef6c00"
                      : selectedCostume.status === "IN_PRODUCTION"
                      ? "#1565c0"
                      : selectedCostume.status === "COMPLETED"
                      ? "#7b1fa2"
                      : "#c62828",
                  fontWeight: 500,
                  display: "inline-block",
                }}
              >
                {STATUS_LABELS[selectedCostume.status] || selectedCostume.status}
              </Box>
            </Box>

            {selectedCostume.imageUrl && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Imagen del Vestuario
                </Typography>
                <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                  <Box
                    component="img"
                    src={selectedCostume.imageUrl}
                    alt={selectedCostume.name}
                    sx={{ maxWidth: "100%", borderRadius: 1, maxHeight: 400, flex: 1 }}
                  />
                  <Button
                    variant="outlined"
                    href={selectedCostume.imageUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ minWidth: 150 }}
                  >
                    Descargar Imagen
                  </Button>
                </Box>
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
        Ver Vestuarios
      </Typography>
      <Grid container spacing={3}>
        {costumes.map((costume) => (
          <Grid item xs={12} md={6} lg={4} key={costume.id}>
            <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  {costume.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Profesora: {costume.instructor.user.nombre} {costume.instructor.user.apellido}
                </Typography>
                {costume.choreography && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Coreografía: {costume.choreography.name}
                  </Typography>
                )}
                {costume.color && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Color: {costume.color}
                  </Typography>
                )}
                <Box
                  sx={{
                    px: 2,
                    py: 1,
                    borderRadius: 1,
                    backgroundColor:
                      costume.status === "APPROVED"
                        ? "#e8f5e9"
                        : costume.status === "DESIGN"
                        ? "#fff3e0"
                        : costume.status === "IN_PRODUCTION"
                        ? "#e3f2fd"
                        : costume.status === "COMPLETED"
                        ? "#f3e5f5"
                        : "#ffebee",
                    color:
                      costume.status === "APPROVED"
                        ? "#2e7d32"
                        : costume.status === "DESIGN"
                        ? "#ef6c00"
                        : costume.status === "IN_PRODUCTION"
                        ? "#1565c0"
                        : costume.status === "COMPLETED"
                        ? "#7b1fa2"
                        : "#c62828",
                    fontWeight: 500,
                    display: "inline-block",
                    mb: 2,
                  }}
                >
                  {STATUS_LABELS[costume.status] || costume.status}
                </Box>
                {costume.estimatedCost && (
                  <Typography variant="caption" color="text.secondary">
                    ${costume.estimatedCost.toFixed(2)}
                  </Typography>
                )}
              </CardContent>
              <CardActions>
                <Button
                  variant="contained"
                  onClick={() => setSelectedCostume(costume)}
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
