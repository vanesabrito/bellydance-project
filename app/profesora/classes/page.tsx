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
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import IconButton from "@mui/material/IconButton";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useSession } from "next-auth/react";
import Checkbox from "@mui/material/Checkbox";

interface Class {
  id: string;
  name: string;
  description: string | null;
  instructorId: string;
  supportMaterial: string | null;
  enrollments: {
    student: {
      id: string;
      nombre: string | null;
      apellido: string | null;
      email: string | null;
    };
  }[];
  schedules: {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    location: string | null;
  }[];
}

interface Attendance {
  id: string;
  studentId: string;
  classId: string;
  date: string;
  present: boolean;
  note: string | null;
  observations: string | null;
  student: {
    nombre: string | null;
    apellido: string | null;
  };
}

interface Evaluation {
  id: string;
  studentId: string;
  classId: string;
  date: string;
  score: number | null;
  comments: string | null;
  progress: string | null;
  student: {
    nombre: string | null;
    apellido: string | null;
  };
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ProfesoraClassesPage() {
  const { data: session } = useSession();
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [uploading, setUploading] = useState(false);
  
  // Attendance state
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false);
  const [attendanceData, setAttendanceData] = useState<Record<string, { present: boolean; observations: string }>>({});
  
  // Evaluations state
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [evaluationDialogOpen, setEvaluationDialogOpen] = useState(false);
  const [evaluationData, setEvaluationData] = useState({
    studentId: "",
    date: new Date().toISOString().split('T')[0],
    score: "",
    comments: "",
    progress: "",
  });

  useEffect(() => {
    if (session) {
      fetchClasses();
    }
  }, [session]);

  const fetchClasses = async () => {
    try {
      const res = await fetch("/api/classes");
      const json = await res.json();
      if (json.ok) {
        setClasses(json.classes);
        if (json.classes.length > 0) {
          setSelectedClass(json.classes[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendances = async () => {
    if (!selectedClass) return;
    try {
      const res = await fetch(`/api/attendance?classId=${selectedClass.id}`);
      const json = await res.json();
      if (json.ok) {
        setAttendances(json.attendances);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEvaluations = async () => {
    if (!selectedClass) return;
    try {
      const res = await fetch(`/api/evaluations?classId=${selectedClass.id}`);
      const json = await res.json();
      if (json.ok) {
        setEvaluations(json.evaluations);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleClassChange = (classItem: Class) => {
    setSelectedClass(classItem);
    setTabValue(0);
    setAttendances([]);
    setEvaluations([]);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    if (newValue === 1 && selectedClass) {
      fetchAttendances();
    } else if (newValue === 2 && selectedClass) {
      fetchEvaluations();
    }
  };

  const handleMaterialUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedClass) return;

    setUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      const json = await res.json();
      if (json.ok) {
        const currentMaterial = selectedClass.supportMaterial ? JSON.parse(selectedClass.supportMaterial) : [];
        currentMaterial.push({ url: json.fileUrl, name: file.name, type: file.type });
        
        await fetch("/api/classes", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            classId: selectedClass.id,
            supportMaterial: currentMaterial,
          }),
        });

        fetchClasses();
      } else {
        alert("Error al subir el archivo: " + json.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error al subir el archivo");
    } finally {
      setUploading(false);
    }
  };

  const handleAttendanceDialogOpen = () => {
    if (!selectedClass) return;
    const initialData: Record<string, { present: boolean; observations: string }> = {};
    selectedClass.enrollments.forEach((enrollment) => {
      initialData[enrollment.student.id] = { present: false, observations: "" };
    });
    setAttendanceData(initialData);
    setAttendanceDialogOpen(true);
  };

  const handleAttendanceSubmit = async () => {
    if (!selectedClass) return;

    try {
      for (const [studentId, data] of Object.entries(attendanceData)) {
        await fetch("/api/attendance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId,
            classId: selectedClass.id,
            date: attendanceDate,
            present: data.present,
            observations: data.observations,
          }),
        });
      }
      fetchAttendances();
      setAttendanceDialogOpen(false);
    } catch (err) {
      console.error(err);
      alert("Error al registrar asistencia");
    }
  };

  const handleEvaluationSubmit = async () => {
    if (!selectedClass) return;

    try {
      await fetch("/api/evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...evaluationData,
          classId: selectedClass.id,
          score: evaluationData.score ? parseFloat(evaluationData.score) : null,
        }),
      });
      fetchEvaluations();
      setEvaluationDialogOpen(false);
      setEvaluationData({
        studentId: "",
        date: new Date().toISOString().split('T')[0],
        score: "",
        comments: "",
        progress: "",
      });
    } catch (err) {
      console.error(err);
      alert("Error al registrar evaluación");
    }
  };

  if (!session || session.user?.role !== "PROFESORA") {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 8 }}>
      <Paper sx={{ p: 4, borderRadius: 3 }} elevation={6}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 2 }}>
          Mis Clases
        </Typography>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Selecciona una clase:
          </Typography>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            {classes.map((classItem) => (
              <Button
                key={classItem.id}
                variant={selectedClass?.id === classItem.id ? "contained" : "outlined"}
                onClick={() => handleClassChange(classItem)}
                sx={{
                  backgroundColor: selectedClass?.id === classItem.id ? "#ec407a" : undefined,
                  "&:hover": { backgroundColor: selectedClass?.id === classItem.id ? "#d81b60" : undefined },
                }}
              >
                {classItem.name}
              </Button>
            ))}
          </Box>
        </Box>

        {selectedClass && (
          <>
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {selectedClass.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedClass.description}
              </Typography>
              <Box sx={{ mt: 2 }}>
                {selectedClass.schedules.map((schedule, idx) => (
                  <Typography key={idx} variant="body2">
                    {schedule.dayOfWeek}: {schedule.startTime} - {schedule.endTime}
                    {schedule.location && ` (${schedule.location})`}
                  </Typography>
                ))}
              </Box>
            </Box>

            <Box sx={{ mt: 4 }}>
              <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab label="Alumnas" />
                <Tab label="Asistencia" />
                <Tab label="Evaluaciones" />
                <Tab label="Material de Apoyo" />
              </Tabs>

              <TabPanel value={tabValue} index={0}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Alumnas Inscritas ({selectedClass.enrollments.length})
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Nombre</TableCell>
                        <TableCell>Email</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedClass.enrollments.map((enrollment) => (
                        <TableRow key={enrollment.student.id}>
                          <TableCell>
                            {enrollment.student.nombre} {enrollment.student.apellido}
                          </TableCell>
                          <TableCell>{enrollment.student.email}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Typography variant="h6">
                    Historial de Asistencia
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={handleAttendanceDialogOpen}
                    sx={{ backgroundColor: "#ec407a", "&:hover": { backgroundColor: "#d81b60" } }}
                  >
                    Registrar Asistencia
                  </Button>
                </Box>
                <TextField
                  label="Fecha"
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  sx={{ mb: 2 }}
                  InputLabelProps={{ shrink: true }}
                />
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Fecha</TableCell>
                        <TableCell>Alumna</TableCell>
                        <TableCell>Presente</TableCell>
                        <TableCell>Observaciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {attendances.map((attendance) => (
                        <TableRow key={attendance.id}>
                          <TableCell>{new Date(attendance.date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {attendance.student.nombre} {attendance.student.apellido}
                          </TableCell>
                          <TableCell>{attendance.present ? "Sí" : "No"}</TableCell>
                          <TableCell>{attendance.observations || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </TabPanel>

              <TabPanel value={tabValue} index={2}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Typography variant="h6">
                    Evaluaciones y Avances
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => setEvaluationDialogOpen(true)}
                    sx={{ backgroundColor: "#ec407a", "&:hover": { backgroundColor: "#d81b60" } }}
                  >
                    Registrar Evaluación
                  </Button>
                </Box>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Fecha</TableCell>
                        <TableCell>Alumna</TableCell>
                        <TableCell>Puntaje</TableCell>
                        <TableCell>Comentarios</TableCell>
                        <TableCell>Progreso</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {evaluations.map((evaluation) => (
                        <TableRow key={evaluation.id}>
                          <TableCell>{new Date(evaluation.date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {evaluation.student.nombre} {evaluation.student.apellido}
                          </TableCell>
                          <TableCell>{evaluation.score || "-"}</TableCell>
                          <TableCell>{evaluation.comments || "-"}</TableCell>
                          <TableCell>{evaluation.progress || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </TabPanel>

              <TabPanel value={tabValue} index={3}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Material de Apoyo
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUploadIcon />}
                  disabled={uploading}
                  sx={{ mb: 2 }}
                >
                  {uploading ? "Subiendo..." : "Subir Archivo"}
                  <input
                    type="file"
                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                    hidden
                    onChange={handleMaterialUpload}
                  />
                </Button>
                <Box>
                  {selectedClass.supportMaterial && (
                    <Box component="ul" sx={{ pl: 2 }}>
                      {JSON.parse(selectedClass.supportMaterial).map((material: any, idx: number) => (
                        <Box component="li" key={idx}>
                          <a href={material.url} target="_blank" rel="noopener noreferrer">
                            {material.name}
                          </a>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              </TabPanel>
            </Box>
          </>
        )}
      </Paper>

      <Dialog open={attendanceDialogOpen} onClose={() => setAttendanceDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Registrar Asistencia</DialogTitle>
        <DialogContent>
          <TextField
            label="Fecha"
            type="date"
            value={attendanceDate}
            onChange={(e) => setAttendanceDate(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            InputLabelProps={{ shrink: true }}
          />
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Alumna</TableCell>
                  <TableCell>Presente</TableCell>
                  <TableCell>Observaciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedClass?.enrollments.map((enrollment) => (
                  <TableRow key={enrollment.student.id}>
                    <TableCell>
                      {enrollment.student.nombre} {enrollment.student.apellido}
                    </TableCell>
                    <TableCell>
                      <Checkbox
                        checked={attendanceData[enrollment.student.id]?.present || false}
                        onChange={(e) =>
                          setAttendanceData({
                            ...attendanceData,
                            [enrollment.student.id]: {
                              ...attendanceData[enrollment.student.id],
                              present: e.target.checked,
                            },
                          })
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        value={attendanceData[enrollment.student.id]?.observations || ""}
                        onChange={(e) =>
                          setAttendanceData({
                            ...attendanceData,
                            [enrollment.student.id]: {
                              ...attendanceData[enrollment.student.id],
                              observations: e.target.value,
                            },
                          })
                        }
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAttendanceDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleAttendanceSubmit} variant="contained">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={evaluationDialogOpen} onClose={() => setEvaluationDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Registrar Evaluación</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "grid", gap: 2, mt: 2 }}>
            <TextField
              select
              label="Alumna"
              value={evaluationData.studentId}
              onChange={(e) => setEvaluationData({ ...evaluationData, studentId: e.target.value })}
              fullWidth
              SelectProps={{ native: true }}
            >
              <option value="">Seleccionar alumna</option>
              {selectedClass?.enrollments.map((enrollment) => (
                <option key={enrollment.student.id} value={enrollment.student.id}>
                  {enrollment.student.nombre} {enrollment.student.apellido}
                </option>
              ))}
            </TextField>
            <TextField
              label="Fecha"
              type="date"
              value={evaluationData.date}
              onChange={(e) => setEvaluationData({ ...evaluationData, date: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Puntaje (0-10)"
              type="number"
              value={evaluationData.score}
              onChange={(e) => setEvaluationData({ ...evaluationData, score: e.target.value })}
              fullWidth
              inputProps={{ min: 0, max: 10, step: 0.1 }}
            />
            <TextField
              label="Comentarios"
              value={evaluationData.comments}
              onChange={(e) => setEvaluationData({ ...evaluationData, comments: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
            <TextField
              label="Progreso"
              value={evaluationData.progress}
              onChange={(e) => setEvaluationData({ ...evaluationData, progress: e.target.value })}
              fullWidth
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEvaluationDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleEvaluationSubmit} variant="contained">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
