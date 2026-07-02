"use client";
import React, { useState, useEffect } from "react";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { useSession } from "next-auth/react";

interface Enrollment {
  id: string;
  status: string;
  academicLevel: string | null;
  ageCategory: string | null;
  student: {
    id: string;
    nombre: string | null;
    apellido: string | null;
    edad: number | null;
    email: string | null;
  };
  class: {
    id: string;
    name: string;
  };
}

interface Statistics {
  total: number;
  byAgeCategory: {
    MINI_BELLYDANCE: number;
    BELLYDANCE_ADOLESCENTES: number;
    BELLYDANCE_ADULTAS: number;
  };
  byAcademicLevel: {
    BASICO: number;
    INTERMEDIO: number;
    AVANZADO: number;
  };
  byCategoryAndLevel: {
    MINI_BELLYDANCE: {
      BASICO: number;
      INTERMEDIO: number;
      AVANZADO: number;
    };
    BELLYDANCE_ADOLESCENTES: {
      BASICO: number;
      INTERMEDIO: number;
      AVANZADO: number;
    };
    BELLYDANCE_ADULTAS: {
      BASICO: number;
      INTERMEDIO: number;
      AVANZADO: number;
    };
  };
  enrollments: Enrollment[];
}

export default function AcademicClassificationPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterAgeCategory, setFilterAgeCategory] = useState<string>("");
  const [filterAcademicLevel, setFilterAcademicLevel] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
  const [newAcademicLevel, setNewAcademicLevel] = useState<string>("");

  useEffect(() => {
    if (session) {
      fetchStatistics();
    }
  }, [session, filterAgeCategory, filterAcademicLevel]);

  const fetchStatistics = async () => {
    try {
      const params = new URLSearchParams();
      if (filterAgeCategory) params.append("ageCategory", filterAgeCategory);
      if (filterAcademicLevel) params.append("academicLevel", filterAcademicLevel);

      const res = await fetch(`/api/enrollments/statistics?${params.toString()}`);
      const json = await res.json();
      if (json.ok) {
        setStats(json.stats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLevel = async () => {
    if (!selectedEnrollment || !newAcademicLevel) return;

    try {
      const res = await fetch("/api/enrollments/update-level", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enrollmentId: selectedEnrollment.id,
          academicLevel: newAcademicLevel,
        }),
      });

      const json = await res.json();
      if (json.ok) {
        setUpdateDialogOpen(false);
        setSelectedEnrollment(null);
        setNewAcademicLevel("");
        fetchStatistics();
      } else {
        alert("Error al actualizar nivel académico: " + json.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error al actualizar nivel académico");
    }
  };

  const getAgeCategoryLabel = (category: string | null) => {
    switch (category) {
      case "MINI_BELLYDANCE":
        return "Mini Bellydance (4-11 años)";
      case "BELLYDANCE_ADOLESCENTES":
        return "Bellydance Adolescentes (12-17 años)";
      case "BELLYDANCE_ADULTAS":
        return "Bellydance Adultas (18+ años)";
      default:
        return "No clasificado";
    }
  };

  const getAcademicLevelLabel = (level: string | null) => {
    switch (level) {
      case "BASICO":
        return "Básico";
      case "INTERMEDIO":
        return "Intermedio";
      case "AVANZADO":
        return "Avanzado";
      default:
        return "No asignado";
    }
  };

  const getAcademicLevelColor = (level: string | null) => {
    switch (level) {
      case "BASICO":
        return "#4caf50";
      case "INTERMEDIO":
        return "#ff9800";
      case "AVANZADO":
        return "#f44336";
      default:
        return "#9e9e9e";
    }
  };

  const filteredEnrollments = stats?.enrollments.filter((enrollment) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      enrollment.student.nombre?.toLowerCase().includes(searchLower) ||
      enrollment.student.apellido?.toLowerCase().includes(searchLower) ||
      enrollment.student.email?.toLowerCase().includes(searchLower)
    );
  }) || [];

  if (!session || ((session as any)?.user?.role !== "ADMIN" && (session as any)?.user?.role !== "DIRECTORA_ACADEMICA")) {
    return null;
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 8 }}>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 4 }}>
        Clasificación Académica
      </Typography>

      {/* Statistics Cards */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Total de Alumnas Inscritas
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: "#ec407a" }}>
                  {stats.total}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Mini Bellydance
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: "#2196f3" }}>
                  {stats.byAgeCategory.MINI_BELLYDANCE}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Bellydance Adolescentes
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: "#9c27b0" }}>
                  {stats.byAgeCategory.BELLYDANCE_ADOLESCENTES}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Bellydance Adultas
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: "#ff5722" }}>
                  {stats.byAgeCategory.BELLYDANCE_ADULTAS}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Nivel Básico
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: "#4caf50" }}>
                  {stats.byAcademicLevel.BASICO}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Nivel Intermedio
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: "#ff9800" }}>
                  {stats.byAcademicLevel.INTERMEDIO}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Nivel Avanzado
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: "#f44336" }}>
                  {stats.byAcademicLevel.AVANZADO}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Detailed Statistics by Category and Level */}
      {stats && (
        <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }} elevation={6}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Distribución por Categoría y Nivel
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Mini Bellydance
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Chip label={`Básico: ${stats.byCategoryAndLevel.MINI_BELLYDANCE.BASICO}`} sx={{ backgroundColor: "#4caf50", color: "white" }} />
                <Chip label={`Intermedio: ${stats.byCategoryAndLevel.MINI_BELLYDANCE.INTERMEDIO}`} sx={{ backgroundColor: "#ff9800", color: "white" }} />
                <Chip label={`Avanzado: ${stats.byCategoryAndLevel.MINI_BELLYDANCE.AVANZADO}`} sx={{ backgroundColor: "#f44336", color: "white" }} />
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Bellydance Adolescentes
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Chip label={`Básico: ${stats.byCategoryAndLevel.BELLYDANCE_ADOLESCENTES.BASICO}`} sx={{ backgroundColor: "#4caf50", color: "white" }} />
                <Chip label={`Intermedio: ${stats.byCategoryAndLevel.BELLYDANCE_ADOLESCENTES.INTERMEDIO}`} sx={{ backgroundColor: "#ff9800", color: "white" }} />
                <Chip label={`Avanzado: ${stats.byCategoryAndLevel.BELLYDANCE_ADOLESCENTES.AVANZADO}`} sx={{ backgroundColor: "#f44336", color: "white" }} />
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Bellydance Adultas
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Chip label={`Básico: ${stats.byCategoryAndLevel.BELLYDANCE_ADULTAS.BASICO}`} sx={{ backgroundColor: "#4caf50", color: "white" }} />
                <Chip label={`Intermedio: ${stats.byCategoryAndLevel.BELLYDANCE_ADULTAS.INTERMEDIO}`} sx={{ backgroundColor: "#ff9800", color: "white" }} />
                <Chip label={`Avanzado: ${stats.byCategoryAndLevel.BELLYDANCE_ADULTAS.AVANZADO}`} sx={{ backgroundColor: "#f44336", color: "white" }} />
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }} elevation={6}>
        <Typography variant="h6" sx={{ mb: 3 }}>
          Filtros
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Categoría de Edad</InputLabel>
              <Select
                value={filterAgeCategory}
                label="Categoría de Edad"
                onChange={(e) => setFilterAgeCategory(e.target.value)}
              >
                <MenuItem value="">Todas</MenuItem>
                <MenuItem value="MINI_BELLYDANCE">Mini Bellydance</MenuItem>
                <MenuItem value="BELLYDANCE_ADOLESCENTES">Bellydance Adolescentes</MenuItem>
                <MenuItem value="BELLYDANCE_ADULTAS">Bellydance Adultas</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Nivel Académico</InputLabel>
              <Select
                value={filterAcademicLevel}
                label="Nivel Académico"
                onChange={(e) => setFilterAcademicLevel(e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="BASICO">Básico</MenuItem>
                <MenuItem value="INTERMEDIO">Intermedio</MenuItem>
                <MenuItem value="AVANZADO">Avanzado</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Buscar por nombre o email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              fullWidth
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Enrollments Table */}
      <Paper sx={{ p: 3, borderRadius: 3 }} elevation={6}>
        <Typography variant="h6" sx={{ mb: 3 }}>
          Alumnas Inscritas ({filteredEnrollments.length})
        </Typography>
        {loading ? (
          <Typography>Cargando...</Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Edad</TableCell>
                  <TableCell>Clase</TableCell>
                  <TableCell>Categoría de Edad</TableCell>
                  <TableCell>Nivel Académico</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEnrollments.map((enrollment) => (
                  <TableRow key={enrollment.id}>
                    <TableCell>
                      {enrollment.student.nombre} {enrollment.student.apellido}
                    </TableCell>
                    <TableCell>{enrollment.student.email}</TableCell>
                    <TableCell>{enrollment.student.edad || "-"}</TableCell>
                    <TableCell>{enrollment.class.name}</TableCell>
                    <TableCell>
                      <Chip
                        label={getAgeCategoryLabel(enrollment.ageCategory)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getAcademicLevelLabel(enrollment.academicLevel)}
                        size="small"
                        sx={{ backgroundColor: getAcademicLevelColor(enrollment.academicLevel), color: "white" }}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          setSelectedEnrollment(enrollment);
                          setNewAcademicLevel(enrollment.academicLevel || "BASICO");
                          setUpdateDialogOpen(true);
                        }}
                      >
                        Actualizar Nivel
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Update Level Dialog */}
      <Dialog open={updateDialogOpen} onClose={() => setUpdateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Actualizar Nivel Académico</DialogTitle>
        <DialogContent>
          {selectedEnrollment && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Alumna: {selectedEnrollment.student.nombre} {selectedEnrollment.student.apellido}
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Nuevo Nivel Académico</InputLabel>
                <Select
                  value={newAcademicLevel}
                  label="Nuevo Nivel Académico"
                  onChange={(e) => setNewAcademicLevel(e.target.value)}
                >
                  <MenuItem value="BASICO">Básico</MenuItem>
                  <MenuItem value="INTERMEDIO">Intermedio</MenuItem>
                  <MenuItem value="AVANZADO">Avanzado</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpdateDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleUpdateLevel} variant="contained">
            Actualizar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
