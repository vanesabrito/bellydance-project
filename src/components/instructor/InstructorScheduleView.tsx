"use client";
import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import Alert from "@mui/material/Alert";

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
    nombre: string | null;
    apellido: string | null;
    email: string | null;
  };
  createdAt: string;
  updatedAt: string;
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

export default function InstructorScheduleView() {
  const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterDay, setFilterDay] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterAcademicLevel, setFilterAcademicLevel] = useState("");

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/class-schedules");
      if (response.ok) {
        const data = await response.json();
        setSchedules(data.schedules || []);
      } else {
        const error = await response.json();
        setError(error.error || "Error al cargar horarios");
      }
    } catch (error) {
      console.error("Error al cargar horarios:", error);
      setError("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    if (name === "day") setFilterDay(value);
    if (name === "month") setFilterMonth(value);
    if (name === "academicLevel") setFilterAcademicLevel(value);
  };

  const filteredSchedules = schedules.filter((schedule) => {
    if (filterDay && schedule.day !== filterDay) return false;
    if (filterMonth && schedule.month !== filterMonth) return false;
    if (filterAcademicLevel && schedule.academicLevel !== filterAcademicLevel) return false;
    return true;
  });

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        Mis Horarios Asignados
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: "flex", gap: 2, mb: 4, flexWrap: "wrap" }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filtrar por Día</InputLabel>
          <Select
            name="day"
            value={filterDay}
            onChange={handleFilterChange}
            label="Filtrar por Día"
          >
            <MenuItem value="">Todos los días</MenuItem>
            <MenuItem value="MONDAY">Lunes</MenuItem>
            <MenuItem value="TUESDAY">Martes</MenuItem>
            <MenuItem value="WEDNESDAY">Miércoles</MenuItem>
            <MenuItem value="THURSDAY">Jueves</MenuItem>
            <MenuItem value="FRIDAY">Viernes</MenuItem>
            <MenuItem value="SATURDAY">Sábado</MenuItem>
            <MenuItem value="SUNDAY">Domingo</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filtrar por Mes</InputLabel>
          <Select
            name="month"
            value={filterMonth}
            onChange={handleFilterChange}
            label="Filtrar por Mes"
          >
            <MenuItem value="">Todos los meses</MenuItem>
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

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filtrar por Nivel Académico</InputLabel>
          <Select
            name="academicLevel"
            value={filterAcademicLevel}
            onChange={handleFilterChange}
            label="Filtrar por Nivel Académico"
          >
            <MenuItem value="">Todos los niveles</MenuItem>
            <MenuItem value="BASICO">Básico</MenuItem>
            <MenuItem value="INTERMEDIO">Intermedio</MenuItem>
            <MenuItem value="AVANZADO">Avanzado</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Typography>Cargando horarios...</Typography>
      ) : (
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
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSchedules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No hay horarios asignados
                  </TableCell>
                </TableRow>
              ) : (
                filteredSchedules.map((schedule) => (
                  <TableRow key={schedule.id}>
                    <TableCell>{CATEGORY_LABELS[schedule.category as keyof typeof CATEGORY_LABELS] || schedule.category}</TableCell>
                    <TableCell>{schedule.academicLevel ? ACADEMIC_LEVEL_LABELS[schedule.academicLevel as keyof typeof ACADEMIC_LEVEL_LABELS] || schedule.academicLevel : "-"}</TableCell>
                    <TableCell>{MONTH_LABELS[schedule.month as keyof typeof MONTH_LABELS] || schedule.month}</TableCell>
                    <TableCell>{DAY_LABELS[schedule.day as keyof typeof DAY_LABELS] || schedule.day}</TableCell>
                    <TableCell>{schedule.time}</TableCell>
                    <TableCell>{schedule.classroom}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
