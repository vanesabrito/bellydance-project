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
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
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

interface GroupedStudents {
  MINI_BELLYDANCE: {
    BASICO: Enrollment[];
    INTERMEDIO: Enrollment[];
    AVANZADO: Enrollment[];
  };
  BELLYDANCE_ADOLESCENTES: {
    BASICO: Enrollment[];
    INTERMEDIO: Enrollment[];
    AVANZADO: Enrollment[];
  };
  BELLYDANCE_ADULTAS: {
    BASICO: Enrollment[];
    INTERMEDIO: Enrollment[];
    AVANZADO: Enrollment[];
  };
}

interface Counts {
  total: number;
  byCategory: {
    MINI_BELLYDANCE: number;
    BELLYDANCE_ADOLESCENTES: number;
    BELLYDANCE_ADULTAS: number;
  };
  byLevel: {
    BASICO: number;
    INTERMEDIO: number;
    AVANZADO: number;
  };
  byGroup: {
    MINI_BELLYDANCE_BASICO: number;
    MINI_BELLYDANCE_INTERMEDIO: number;
    MINI_BELLYDANCE_AVANZADO: number;
    BELLYDANCE_ADOLESCENTES_BASICO: number;
    BELLYDANCE_ADOLESCENTES_INTERMEDIO: number;
    BELLYDANCE_ADOLESCENTES_AVANZADO: number;
    BELLYDANCE_ADULTAS_BASICO: number;
    BELLYDANCE_ADULTAS_INTERMEDIO: number;
    BELLYDANCE_ADULTAS_AVANZADO: number;
  };
}

const CATEGORY_LABELS = {
  MINI_BELLYDANCE: "Mini Bellydance (4-11 años)",
  BELLYDANCE_ADOLESCENTES: "Bellydance Adolescentes (12-17 años)",
  BELLYDANCE_ADULTAS: "Bellydance Adultas (18+ años)",
};

const LEVEL_LABELS = {
  BASICO: "Básico",
  INTERMEDIO: "Intermedio",
  AVANZADO: "Avanzado",
};

const LEVEL_COLORS = {
  BASICO: "#4caf50",
  INTERMEDIO: "#ff9800",
  AVANZADO: "#f44336",
};

export default function EnrolledStudentsPage() {
  const { data: session } = useSession();
  const [groupedStudents, setGroupedStudents] = useState<GroupedStudents | null>(null);
  const [counts, setCounts] = useState<Counts | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterAgeCategory, setFilterAgeCategory] = useState<string>("");
  const [filterAcademicLevel, setFilterAcademicLevel] = useState<string>("");
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
  const [newAcademicLevel, setNewAcademicLevel] = useState<string>("");

  useEffect(() => {
    if (session) {
      fetchStudents();
    }
  }, [session, searchTerm, filterAgeCategory, filterAcademicLevel]);

  const fetchStudents = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (filterAgeCategory) params.append("ageCategory", filterAgeCategory);
      if (filterAcademicLevel) params.append("academicLevel", filterAcademicLevel);

      console.log("Fetching students with params:", params.toString());
      const res = await fetch(`/api/enrolled-students?${params.toString()}`);
      const json = await res.json();
      console.log("Response:", json);
      if (json.ok) {
        setGroupedStudents(json.students);
        setCounts(json.counts);
      } else {
        console.error("API error:", json.error);
      }
    } catch (err) {
      console.error("Fetch error:", err);
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
        fetchStudents();
      } else {
        alert("Error al actualizar nivel académico: " + json.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error al actualizar nivel académico");
    }
  };

  const getCategoryLabel = (category: string) => {
    return CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS] || category;
  };

  const getLevelLabel = (level: string | null) => {
    return LEVEL_LABELS[level as keyof typeof LEVEL_LABELS] || "No asignado";
  };

  const getLevelColor = (level: string | null) => {
    return LEVEL_COLORS[level as keyof typeof LEVEL_COLORS] || "#9e9e9e";
  };

  const renderStudentTable = (students: Enrollment[]) => {
    if (students.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
          No hay alumnas en esta categoría
        </Typography>
      );
    }

    return (
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Edad</TableCell>
              <TableCell>Clase</TableCell>
              <TableCell>Nivel</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((enrollment) => (
              <TableRow key={enrollment.id}>
                <TableCell>
                  {enrollment.student.nombre} {enrollment.student.apellido}
                </TableCell>
                <TableCell>{enrollment.student.email}</TableCell>
                <TableCell>{enrollment.student.edad || "-"}</TableCell>
                <TableCell>{enrollment.class.name}</TableCell>
                <TableCell>
                  <Chip
                    label={getLevelLabel(enrollment.academicLevel)}
                    size="small"
                    sx={{ backgroundColor: getLevelColor(enrollment.academicLevel), color: "white" }}
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
                    Reubicar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  if (!session || ((session as any)?.user?.role !== "ADMIN" && (session as any)?.user?.role !== "DIRECTORA_ACADEMICA")) {
    return null;
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 8 }}>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 4 }}>
        Lista de Alumnas Inscritas
      </Typography>

      {/* Statistics Cards */}
      {counts && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Total de Alumnas
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: "#ec407a" }}>
                  {counts.total}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Mini Bellydance
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: "#2196f3" }}>
                  {counts.byCategory.MINI_BELLYDANCE}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Bellydance Adolescentes
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: "#9c27b0" }}>
                  {counts.byCategory.BELLYDANCE_ADOLESCENTES}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Bellydance Adultas
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: "#ff5722" }}>
                  {counts.byCategory.BELLYDANCE_ADULTAS}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }} elevation={6}>
        <Typography variant="h6" sx={{ mb: 3 }}>
          Filtros
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              label="Buscar por nombre o email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={4}>
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
          <Grid item xs={12} md={4}>
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
        </Grid>
      </Paper>

      {/* Groups */}
      {groupedStudents && (
        <Grid container spacing={3}>
          {/* Mini Bellydance */}
          <Grid item xs={12}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: "#2196f3" }}>
              Mini Bellydance (4-11 años)
            </Typography>
            <Grid container spacing={2}>
              {["BASICO", "INTERMEDIO", "AVANZADO"].map((level) => (
                <Grid item xs={12} md={4} key={level}>
                  <Paper sx={{ borderRadius: 3 }} elevation={3}>
                    <Box sx={{ p: 2, backgroundColor: LEVEL_COLORS[level as keyof typeof LEVEL_COLORS], color: "white", borderRadius: "12px 12px 0 0" }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {LEVEL_LABELS[level as keyof typeof LEVEL_LABELS]}
                      </Typography>
                      <Typography variant="caption">
                        {counts?.byGroup[`MINI_BELLYDANCE_${level}` as keyof typeof counts.byGroup] || 0} alumnas
                      </Typography>
                    </Box>
                    <Box sx={{ p: 2 }}>
                      {renderStudentTable(groupedStudents.MINI_BELLYDANCE[level as keyof typeof groupedStudents.MINI_BELLYDANCE])}
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Bellydance Adolescentes */}
          <Grid item xs={12}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: "#9c27b0" }}>
              Bellydance Adolescentes (12-17 años)
            </Typography>
            <Grid container spacing={2}>
              {["BASICO", "INTERMEDIO", "AVANZADO"].map((level) => (
                <Grid item xs={12} md={4} key={level}>
                  <Paper sx={{ borderRadius: 3 }} elevation={3}>
                    <Box sx={{ p: 2, backgroundColor: LEVEL_COLORS[level as keyof typeof LEVEL_COLORS], color: "white", borderRadius: "12px 12px 0 0" }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {LEVEL_LABELS[level as keyof typeof LEVEL_LABELS]}
                      </Typography>
                      <Typography variant="caption">
                        {counts?.byGroup[`BELLYDANCE_ADOLESCENTES_${level}` as keyof typeof counts.byGroup] || 0} alumnas
                      </Typography>
                    </Box>
                    <Box sx={{ p: 2 }}>
                      {renderStudentTable(groupedStudents.BELLYDANCE_ADOLESCENTES[level as keyof typeof groupedStudents.BELLYDANCE_ADOLESCENTES])}
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Bellydance Adultas */}
          <Grid item xs={12}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: "#ff5722" }}>
              Bellydance Adultas (18+ años)
            </Typography>
            <Grid container spacing={2}>
              {["BASICO", "INTERMEDIO", "AVANZADO"].map((level) => (
                <Grid item xs={12} md={4} key={level}>
                  <Paper sx={{ borderRadius: 3 }} elevation={3}>
                    <Box sx={{ p: 2, backgroundColor: LEVEL_COLORS[level as keyof typeof LEVEL_COLORS], color: "white", borderRadius: "12px 12px 0 0" }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {LEVEL_LABELS[level as keyof typeof LEVEL_LABELS]}
                      </Typography>
                      <Typography variant="caption">
                        {counts?.byGroup[`BELLYDANCE_ADULTAS_${level}` as keyof typeof counts.byGroup] || 0} alumnas
                      </Typography>
                    </Box>
                    <Box sx={{ p: 2 }}>
                      {renderStudentTable(groupedStudents.BELLYDANCE_ADULTAS[level as keyof typeof groupedStudents.BELLYDANCE_ADULTAS])}
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      )}

      {/* Update Level Dialog */}
      <Dialog open={updateDialogOpen} onClose={() => setUpdateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reubicar Alumna a Otro Nivel</DialogTitle>
        <DialogContent>
          {selectedEnrollment && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Alumna: {selectedEnrollment.student.nombre} {selectedEnrollment.student.apellido}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Nivel actual: {getLevelLabel(selectedEnrollment.academicLevel)}
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
            Reubicar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
