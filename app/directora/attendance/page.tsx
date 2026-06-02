"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Chip from "@mui/material/Chip";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

interface Attendance {
  id: string;
  student: {
    id: string;
    nombre: string | null;
    apellido: string | null;
    email: string;
  };
  class: {
    id: string;
    name: string;
  };
  date: string;
  present: boolean;
  note?: string | null;
  createdAt: string;
}

interface DanceClass {
  id: string;
  name: string;
}

interface Student {
  id: string;
  nombre: string | null;
  apellido: string | null;
  email: string;
}

export default function DirectoraAttendancePage() {
  const { data: session } = useSession();
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [classes, setClasses] = useState<DanceClass[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    studentId: "",
    classId: "",
    date: new Date().toISOString().split('T')[0],
    present: true,
    note: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadAttendances();
    loadClasses();
    loadStudents();
  }, []);

  async function loadAttendances() {
    try {
      const res = await fetch("/api/attendance");
      if (!res.ok) throw new Error("Error cargando asistencias");
      const json = await res.json();
      if (json.ok) setAttendances(json.attendances);
    } catch (err: any) {
      setError(err?.message || "No se pudieron cargar las asistencias");
    }
  }

  async function loadClasses() {
    try {
      const res = await fetch("/api/classes");
      if (!res.ok) throw new Error("Error cargando clases");
      const json = await res.json();
      if (json.ok) setClasses(json.classes ?? []);
    } catch (err: any) {
      console.error("Error loading classes:", err);
    }
  }

  async function loadStudents() {
    try {
      const res = await fetch("/api/users?role=ALUMNA");
      if (!res.ok) throw new Error("Error cargando alumnas");
      const json = await res.json();
      if (json.ok) setStudents(json.users ?? []);
    } catch (err: any) {
      console.error("Error loading students:", err);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.studentId || !formData.classId || !formData.date) return setError("Estudiante, clase y fecha son requeridos");
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (json.ok) {
        setSuccess("Asistencia registrada correctamente");
        setOpen(false);
        setFormData({
          studentId: "",
          classId: "",
          date: new Date().toISOString().split('T')[0],
          present: true,
          note: "",
        });
        loadAttendances();
      } else {
        setError(json.error || "No se pudo registrar la asistencia");
      }
    } catch (err: any) {
      setError(err?.message || "Error de red");
    } finally {
      setLoading(false);
    }
  }

  if (!session) return <p>Debes iniciar sesión.</p>;

  return (
    <Container maxWidth="lg" sx={{ mt: 8 }}>
      <Paper sx={{ p: 4, borderRadius: 3 }} elevation={6}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Control de Asistencias
          </Typography>
          <Button variant="contained" onClick={() => setOpen(true)}>
            Registrar Asistencia
          </Button>
        </Box>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Estudiante</TableCell>
              <TableCell>Clase</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Nota</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {attendances.map((attendance) => (
              <TableRow key={attendance.id}>
                <TableCell>
                  {attendance.student.nombre} {attendance.student.apellido}
                  <br />
                  <small>{attendance.student.email}</small>
                </TableCell>
                <TableCell>{attendance.class.name}</TableCell>
                <TableCell>{new Date(attendance.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Chip
                    label={attendance.present ? "Presente" : "Ausente"}
                    color={attendance.present ? "success" : "error"}
                    size="small"
                  />
                </TableCell>
                <TableCell>{attendance.note || "—"}</TableCell>
              </TableRow>
            ))}
            {attendances.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>No hay registros de asistencia aún.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Registrar Asistencia</DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleSubmit} sx={{ display: "grid", gap: 2, mt: 2 }}>
              <TextField
                select
                label="Estudiante"
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                fullWidth
                required
              >
                {students.map((student) => (
                  <MenuItem key={student.id} value={student.id}>
                    {student.nombre} {student.apellido} - {student.email}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Clase"
                value={formData.classId}
                onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                fullWidth
                required
              >
                {classes.map((cls) => (
                  <MenuItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Fecha"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                select
                label="Estado"
                value={formData.present.toString()}
                onChange={(e) => setFormData({ ...formData, present: e.target.value === "true" })}
                fullWidth
              >
                <MenuItem value="true">Presente</MenuItem>
                <MenuItem value="false">Ausente</MenuItem>
              </TextField>
              <TextField
                label="Nota (opcional)"
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                fullWidth
                multiline
                rows={2}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} variant="contained" disabled={loading}>
              {loading ? "Registrando..." : "Registrar"}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
          <Alert severity="error" onClose={() => setError(null)} sx={{ width: "100%" }}>
            {error}
          </Alert>
        </Snackbar>

        <Snackbar open={!!success} autoHideDuration={4000} onClose={() => setSuccess(null)}>
          <Alert severity="success" onClose={() => setSuccess(null)} sx={{ width: "100%" }}>
            {success}
          </Alert>
        </Snackbar>
      </Paper>
    </Container>
  );
}
