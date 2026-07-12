"use client";
import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";

interface ClassSchedule {
  id: string;
  category: string;
  academicLevel: string | null;
  month: string;
  day: string;
  time: string;
  classroom: string;
  instructor: {
    id: string;
    user: {
      nombre: string | null;
      apellido: string | null;
      email: string | null;
    };
  };
  createdAt: string;
  updatedAt: string;
}

interface Instructor {
  id: string;
  user: {
    nombre: string | null;
    apellido: string | null;
    email: string | null;
  };
}

const CATEGORY_LABELS = {
  MINI_BELLYDANCE: "Mini Bellydance (4-11 años)",
  BELLYDANCE_ADOLESCENTES: "Bellydance Adolescentes (12-17 años)",
  BELLYDANCE_ADULTAS: "Bellydance Adultas (18+ años)",
};

const ACADEMIC_LEVEL_LABELS = {
  BASICO: "Básico",
  INTERMEDIO: "Intermedio",
  AVANZADO: "Avanzado",
};

const MONTH_LABELS = {
  ENERO: "Enero",
  FEBRERO: "Febrero",
  MARZO: "Marzo",
  ABRIL: "Abril",
  MAYO: "Mayo",
  JUNIO: "Junio",
  JULIO: "Julio",
  AGOSTO: "Agosto",
  SEPTIEMBRE: "Septiembre",
  OCTUBRE: "Octubre",
  NOVIEMBRE: "Noviembre",
  DICIEMBRE: "Diciembre",
};

const DAY_LABELS = {
  MONDAY: "Lunes",
  TUESDAY: "Martes",
  WEDNESDAY: "Miércoles",
  THURSDAY: "Jueves",
  FRIDAY: "Viernes",
  SATURDAY: "Sábado",
  SUNDAY: "Domingo",
};

export default function ScheduleManagement() {
  const [formData, setFormData] = useState({
    category: "",
    academicLevel: "",
    month: "",
    day: "",
    time: "",
    classroom: "",
    instructorId: "",
  });

  const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [editingSchedule, setEditingSchedule] = useState<ClassSchedule | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<ClassSchedule | null>(null);

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState<"success" | "error">("success");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSchedules();
    loadInstructors();
  }, []);

  const loadSchedules = async () => {
    try {
      const response = await fetch("/api/class-schedules");
      if (response.ok) {
        const data = await response.json();
        setSchedules(data.schedules || []);
      }
    } catch (error) {
      console.error("Error al cargar horarios:", error);
    }
  };

  const loadInstructors = async () => {
    try {
      const response = await fetch("/api/users?role=PROFESORA");
      if (response.ok) {
        const data = await response.json();
        setInstructors(data.users || []);
      }
    } catch (error) {
      console.error("Error al cargar profesoras:", error);
    }
  };

  const handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name as string]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!formData.category || !formData.academicLevel || !formData.month || !formData.day || !formData.time || !formData.classroom || !formData.instructorId) {
      setAlertMessage("Por favor complete todos los campos obligatorios.");
      setAlertSeverity("error");
      setShowAlert(true);
      return;
    }

    setLoading(true);
    try {
      const url = editingSchedule ? "/api/class-schedules" : "/api/class-schedules";
      const method = editingSchedule ? "PUT" : "POST";
      const body = editingSchedule ? { ...formData, id: editingSchedule.id } : formData;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setAlertMessage(editingSchedule ? "Horario actualizado exitosamente." : "Horario registrado exitosamente.");
        setAlertSeverity("success");
        setShowAlert(true);
        setFormData({
          category: "",
          academicLevel: "",
          month: "",
          day: "",
          time: "",
          classroom: "",
          instructorId: "",
        });
        setEditingSchedule(null);
        await loadSchedules();
      } else {
        const error = await response.json();
        setAlertMessage(error.error || "Error al guardar el horario.");
        setAlertSeverity("error");
        setShowAlert(true);
      }
    } catch (error) {
      setAlertMessage("Error al conectar con el servidor.");
      setAlertSeverity("error");
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (schedule: ClassSchedule) => {
    setEditingSchedule(schedule);
    setFormData({
      category: schedule.category,
      academicLevel: schedule.academicLevel || "",
      month: schedule.month,
      day: schedule.day,
      time: schedule.time,
      classroom: schedule.classroom,
      instructorId: schedule.instructor.id,
    });
  };

  const handleDeleteClick = (schedule: ClassSchedule) => {
    setScheduleToDelete(schedule);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!scheduleToDelete) return;

    try {
      const response = await fetch(`/api/class-schedules?id=${scheduleToDelete.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setAlertMessage("Horario eliminado exitosamente.");
        setAlertSeverity("success");
        setShowAlert(true);
        await loadSchedules();
      } else {
        const error = await response.json();
        setAlertMessage(error.error || "Error al eliminar el horario.");
        setAlertSeverity("error");
        setShowAlert(true);
      }
    } catch (error) {
      setAlertMessage("Error al conectar con el servidor.");
      setAlertSeverity("error");
      setShowAlert(true);
    } finally {
      setDeleteDialogOpen(false);
      setScheduleToDelete(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingSchedule(null);
    setFormData({
      category: "",
      academicLevel: "",
      month: "",
      day: "",
      time: "",
      classroom: "",
      instructorId: "",
    });
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        {editingSchedule ? "Editar Horario" : "Registrar Nuevo Horario"}
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 3, mb: 4 }}>
        <FormControl fullWidth>
          <InputLabel>Categoría de Alumnas *</InputLabel>
          <Select
            name="category"
            value={formData.category}
            onChange={handleSelectChange}
            label="Categoría de Alumnas *"
            required
          >
            <MenuItem value="">Seleccione una categoría</MenuItem>
            <MenuItem value="MINI_BELLYDANCE">Mini Bellydance (4-11 años)</MenuItem>
            <MenuItem value="BELLYDANCE_ADOLESCENTES">Bellydance Adolescentes (12-17 años)</MenuItem>
            <MenuItem value="BELLYDANCE_ADULTAS">Bellydance Adultas (18+ años)</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Nivel Académico *</InputLabel>
          <Select
            name="academicLevel"
            value={formData.academicLevel}
            onChange={handleSelectChange}
            label="Nivel Académico *"
            required
          >
            <MenuItem value="">Seleccione un nivel</MenuItem>
            <MenuItem value="BASICO">Básico</MenuItem>
            <MenuItem value="INTERMEDIO">Intermedio</MenuItem>
            <MenuItem value="AVANZADO">Avanzado</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Mes *</InputLabel>
          <Select
            name="month"
            value={formData.month}
            onChange={handleSelectChange}
            label="Mes *"
            required
          >
            <MenuItem value="">Seleccione un mes</MenuItem>
            <MenuItem value="ENERO">Enero</MenuItem>
            <MenuItem value="FEBRERO">Febrero</MenuItem>
            <MenuItem value="MARZO">Marzo</MenuItem>
            <MenuItem value="ABRIL">Abril</MenuItem>
            <MenuItem value="MAYO">Mayo</MenuItem>
            <MenuItem value="JUNIO">Junio</MenuItem>
            <MenuItem value="JULIO">Julio</MenuItem>
            <MenuItem value="AGOSTO">Agosto</MenuItem>
            <MenuItem value="SEPTIEMBRE">Septiembre</MenuItem>
            <MenuItem value="OCTUBRE">Octubre</MenuItem>
            <MenuItem value="NOVIEMBRE">Noviembre</MenuItem>
            <MenuItem value="DICIEMBRE">Diciembre</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Día *</InputLabel>
          <Select
            name="day"
            value={formData.day}
            onChange={handleSelectChange}
            label="Día *"
            required
          >
            <MenuItem value="">Seleccione un día</MenuItem>
            <MenuItem value="MONDAY">Lunes</MenuItem>
            <MenuItem value="TUESDAY">Martes</MenuItem>
            <MenuItem value="WEDNESDAY">Miércoles</MenuItem>
            <MenuItem value="THURSDAY">Jueves</MenuItem>
            <MenuItem value="FRIDAY">Viernes</MenuItem>
            <MenuItem value="SATURDAY">Sábado</MenuItem>
            <MenuItem value="SUNDAY">Domingo</MenuItem>
          </Select>
        </FormControl>

        <TextField
          name="time"
          label="Hora *"
          type="time"
          value={formData.time}
          onChange={handleTextFieldChange}
          fullWidth
          required
          InputLabelProps={{ shrink: true }}
          inputProps={{ step: 300 }}
        />

        <TextField
          name="classroom"
          label="Aula de Clases *"
          value={formData.classroom}
          onChange={handleTextFieldChange}
          fullWidth
          required
        />

        <FormControl fullWidth>
          <InputLabel>Profesora Asignada *</InputLabel>
          <Select
            name="instructorId"
            value={formData.instructorId}
            onChange={handleSelectChange}
            label="Profesora Asignada *"
            required
          >
            <MenuItem value="">Seleccione una profesora</MenuItem>
            {instructors.map((instructor) => (
              <MenuItem key={instructor.id} value={instructor.id}>
                {instructor.user.nombre} {instructor.user.apellido}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          <Button type="submit" variant="contained" sx={{ bgcolor: "#ec407a", "&:hover": { bgcolor: "#d81b60" } }} disabled={loading}>
            {loading ? "Guardando..." : editingSchedule ? "Actualizar Horario" : "Registrar Horario"}
          </Button>
          {editingSchedule && (
            <Button type="button" variant="outlined" onClick={handleCancelEdit}>
              Cancelar Edición
            </Button>
          )}
          <Button type="button" variant="outlined" onClick={handleCancelEdit}>
            Limpiar
          </Button>
        </Box>
      </Box>

      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        Horarios Registrados
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Categoría</TableCell>
              <TableCell>Nivel Académico</TableCell>
              <TableCell>Mes</TableCell>
              <TableCell>Día</TableCell>
              <TableCell>Hora</TableCell>
              <TableCell>Aula</TableCell>
              <TableCell>Profesora</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {schedules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No hay horarios registrados
                </TableCell>
              </TableRow>
            ) : (
              schedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell>{CATEGORY_LABELS[schedule.category as keyof typeof CATEGORY_LABELS] || schedule.category}</TableCell>
                  <TableCell>{schedule.academicLevel ? ACADEMIC_LEVEL_LABELS[schedule.academicLevel as keyof typeof ACADEMIC_LEVEL_LABELS] || schedule.academicLevel : "-"}</TableCell>
                  <TableCell>{MONTH_LABELS[schedule.month as keyof typeof MONTH_LABELS] || schedule.month}</TableCell>
                  <TableCell>{DAY_LABELS[schedule.day as keyof typeof DAY_LABELS] || schedule.day}</TableCell>
                  <TableCell>{schedule.time}</TableCell>
                  <TableCell>{schedule.classroom}</TableCell>
                  <TableCell>
                    {schedule.instructor.user.nombre} {schedule.instructor.user.apellido}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton onClick={() => handleEdit(schedule)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteClick(schedule)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Snackbar open={showAlert} autoHideDuration={6000} onClose={() => setShowAlert(false)}>
        <Alert onClose={() => setShowAlert(false)} severity={alertSeverity} sx={{ width: "100%" }}>
          {alertMessage}
        </Alert>
      </Snackbar>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          ¿Estás seguro de que deseas eliminar el horario de {scheduleToDelete?.instructor.user.nombre} {scheduleToDelete?.instructor.user.apellido}?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
