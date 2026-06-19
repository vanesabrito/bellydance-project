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

export default function DocumentReception() {
  const [formData, setFormData] = useState({
    studentId: "",
    documentType: "",
    description: "",
    observations: "",
    status: "RECIBIDO",
  });

  const [students, setStudents] = useState<any[]>([]);

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState<"success" | "error">("success");

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const response = await fetch("/api/users?role=ALUMNA");
      if (response.ok) {
        const data = await response.json();
        setStudents(data.users || []);
      }
    } catch (error) {
      console.error("Error al cargar alumnas:", error);
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
    if (!formData.studentId || !formData.documentType) {
      setAlertMessage("Por favor complete los campos obligatorios.");
      setAlertSeverity("error");
      setShowAlert(true);
      return;
    }

    if (formData.documentType === "OTRO" && !formData.description) {
      setAlertMessage("La descripción es obligatoria cuando se selecciona 'Otro documento'.");
      setAlertSeverity("error");
      setShowAlert(true);
      return;
    }

    try {
      const response = await fetch("/api/documents/receive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setAlertMessage("Documento recibido exitosamente.");
        setAlertSeverity("success");
        setShowAlert(true);
        setFormData({
          studentId: "",
          documentType: "",
          description: "",
          observations: "",
          status: "RECIBIDO",
        });
      } else {
        const error = await response.json();
        setAlertMessage(error.error || "Error al recibir el documento.");
        setAlertSeverity("error");
        setShowAlert(true);
      }
    } catch (error) {
      setAlertMessage("Error al conectar con el servidor.");
      setAlertSeverity("error");
      setShowAlert(true);
    }
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        Recepción de Documentos
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <FormControl fullWidth>
          <InputLabel>Alumna *</InputLabel>
          <Select
            name="studentId"
            value={formData.studentId}
            onChange={handleSelectChange}
            label="Alumna *"
            required
          >
            <MenuItem value="">Seleccione una alumna</MenuItem>
            {students.map((student) => (
              <MenuItem key={student.id} value={student.id}>
                {student.nombre} {student.apellido}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Tipo de Documento *</InputLabel>
          <Select
            name="documentType"
            value={formData.documentType}
            onChange={handleSelectChange}
            label="Tipo de Documento *"
            required
          >
            <MenuItem value="">Seleccione un tipo</MenuItem>
            <MenuItem value="PLANILLA_INSCRIPCION">Planilla de Inscripción</MenuItem>
            <MenuItem value="CEDULA_IDENTIDAD">Cédula de Identidad</MenuItem>
            <MenuItem value="FOTO_CARNET">Foto Tipo Carnet</MenuItem>
            <MenuItem value="OTRO">Otro Documento</MenuItem>
          </Select>
        </FormControl>

        {formData.documentType === "OTRO" && (
          <TextField
            name="description"
            label="Descripción del Documento *"
            value={formData.description}
            onChange={handleTextFieldChange}
            fullWidth
            required
            multiline
            rows={2}
          />
        )}

        <TextField
          name="observations"
          label="Observaciones"
          value={formData.observations}
          onChange={handleTextFieldChange}
          fullWidth
          multiline
          rows={3}
        />

        <FormControl fullWidth>
          <InputLabel>Estado del Documento</InputLabel>
          <Select
            name="status"
            value={formData.status}
            onChange={handleSelectChange}
            label="Estado del Documento"
          >
            <MenuItem value="RECIBIDO">Recibido</MenuItem>
            <MenuItem value="EN_REVISION">En Revisión</MenuItem>
            <MenuItem value="APROBADO">Aprobado</MenuItem>
            <MenuItem value="RECHAZADO">Rechazado</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          <Button type="submit" variant="contained" sx={{ bgcolor: "#ec407a", "&:hover": { bgcolor: "#d81b60" } }}>
            Registrar Documento
          </Button>
          <Button type="button" variant="outlined" onClick={() => setFormData({
            studentId: "",
            documentType: "",
            description: "",
            observations: "",
            status: "RECIBIDO",
          })}>
            Limpiar
          </Button>
        </Box>
      </Box>

      <Snackbar open={showAlert} autoHideDuration={6000} onClose={() => setShowAlert(false)}>
        <Alert onClose={() => setShowAlert(false)} severity={alertSeverity} sx={{ width: "100%" }}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
