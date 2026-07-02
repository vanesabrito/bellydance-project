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

interface Class {
  id: string;
  name: string;
  description: string | null;
  warmupExercises: string | null;
  danceRoutineDescription: string | null;
  danceTechniqueDescription: string | null;
  supportMaterial: string | null;
  instructor: {
    nombre: string | null;
    apellido: string | null;
  };
  schedules: {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    location: string | null;
  }[];
}

const DAY_LABELS: Record<string, string> = {
  MONDAY: "Lunes",
  TUESDAY: "Martes",
  WEDNESDAY: "Miércoles",
  THURSDAY: "Jueves",
  FRIDAY: "Viernes",
  SATURDAY: "Sábado",
  SUNDAY: "Domingo",
};

export default function StudentClassesView() {
  const { data: session } = useSession();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);

  useEffect(() => {
    if (session) {
      fetchClasses();
    }
  }, [session]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/classes");
      const json = await res.json();
      if (json.ok) {
        setClasses(json.classes);
      } else {
        setError(json.error || "Error al cargar las clases");
      }
    } catch (err) {
      setError("Error de red al cargar las clases");
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

  if (classes.length === 0) {
    return (
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Typography variant="h6" color="text.secondary">
          No tienes clases inscritas
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Debes tener una inscripción aprobada para ver tus clases
        </Typography>
      </Box>
    );
  }

  if (selectedClass) {
    return (
      <Box>
        <Button onClick={() => setSelectedClass(null)} sx={{ mb: 2 }}>
          ← Volver a mis clases
        </Button>
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
              {selectedClass.name}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
              Profesora: {selectedClass.instructor.nombre} {selectedClass.instructor.apellido}
            </Typography>
            
            {selectedClass.description && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Descripción
                </Typography>
                <Typography variant="body1">{selectedClass.description}</Typography>
              </Box>
            )}

            {selectedClass.warmupExercises && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Ejercicios de Precalentamiento
                </Typography>
                <Typography variant="body1" whiteSpace="pre-wrap">
                  {selectedClass.warmupExercises}
                </Typography>
              </Box>
            )}

            {selectedClass.danceRoutineDescription && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Rutina de Baile
                </Typography>
                <Typography variant="body1" whiteSpace="pre-wrap">
                  {selectedClass.danceRoutineDescription}
                </Typography>
              </Box>
            )}

            {selectedClass.danceTechniqueDescription && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Técnica de Baile
                </Typography>
                <Typography variant="body1" whiteSpace="pre-wrap">
                  {selectedClass.danceTechniqueDescription}
                </Typography>
              </Box>
            )}

            {selectedClass.schedules && selectedClass.schedules.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Horarios
                </Typography>
                {selectedClass.schedules.map((schedule, idx) => (
                  <Typography key={idx} variant="body1">
                    {DAY_LABELS[schedule.dayOfWeek] || schedule.dayOfWeek}: {schedule.startTime} - {schedule.endTime}
                    {schedule.location && ` (${schedule.location})`}
                  </Typography>
                ))}
              </Box>
            )}

            {selectedClass.supportMaterial && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Material de Apoyo
                </Typography>
                <Box component="ul" sx={{ pl: 2 }}>
                  {JSON.parse(selectedClass.supportMaterial).map((material: any, idx: number) => (
                    <Box component="li" key={idx}>
                      <a href={material.url} target="_blank" rel="noopener noreferrer">
                        {material.name}
                      </a>
                    </Box>
                  ))}
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
        Ver Clases
      </Typography>
      <Grid container spacing={3}>
        {classes.map((classItem) => (
          <Grid item xs={12} md={6} lg={4} key={classItem.id}>
            <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  {classItem.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Profesora: {classItem.instructor.nombre} {classItem.instructor.apellido}
                </Typography>
                {classItem.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {classItem.description.substring(0, 100)}...
                  </Typography>
                )}
                {classItem.schedules && classItem.schedules.length > 0 && (
                  <Typography variant="caption" color="text.secondary">
                    {classItem.schedules.length} horario(s)
                  </Typography>
                )}
              </CardContent>
              <CardActions>
                <Button
                  variant="contained"
                  onClick={() => setSelectedClass(classItem)}
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
