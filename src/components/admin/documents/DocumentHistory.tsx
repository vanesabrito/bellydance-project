"use client";
import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import PrintIcon from "@mui/icons-material/Print";

interface Document {
  id: string;
  studentName: string;
  type: string;
  receivedDate: string;
  deliveryDate: string | null;
  status: string;
  registeredBy: string;
  fileUrl: string | null;
}

export default function DocumentHistory() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    studentId: "",
    documentType: "",
    status: "",
    dateFrom: "",
    dateTo: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDocuments();
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

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/documents/history");
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error("Error al cargar documentos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name as string]: value }));
  };

  const applyFilters = () => {
    // Implementar lógica de filtros
    console.log("Aplicar filtros:", filters);
  };

  const clearFilters = () => {
    setFilters({
      studentId: "",
      documentType: "",
      status: "",
      dateFrom: "",
      dateTo: "",
    });
  };

  const handleViewDocument = (documentId: string) => {
    const doc = documents.find(d => d.id === documentId);
    if (doc && doc.fileUrl) {
      window.open(doc.fileUrl, '_blank');
    } else {
      alert('Este documento no tiene archivo asociado para visualizar.');
    }
  };

  const handleDownloadDocument = (documentId: string) => {
    const doc = documents.find(d => d.id === documentId);
    if (doc && doc.fileUrl) {
      const link = window.document.createElement('a') as HTMLAnchorElement;
      link.href = doc.fileUrl;
      link.download = `${doc.type}_${doc.studentName}.pdf`;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
    } else {
      alert('Este documento no tiene archivo asociado para descargar.');
    }
  };

  const handlePrintDocument = (documentId: string) => {
    const doc = documents.find(d => d.id === documentId);
    if (doc && doc.fileUrl) {
      window.open(doc.fileUrl, '_blank');
      setTimeout(() => {
        window.print();
      }, 500);
    } else {
      alert('Este documento no tiene archivo asociado para imprimir.');
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      PLANILLA_INSCRIPCION: "Planilla de Inscripción",
      CEDULA_IDENTIDAD: "Cédula de Identidad",
      FOTO_CARNET: "Foto Tipo Carnet",
      CONSTANCIA_INSCRIPCION: "Constancia de Inscripción",
      RECIBO_PAGO: "Recibo de Pago",
      CERTIFICADO: "Certificado",
      OTRO: "Otro Documento",
    };
    return labels[type] || type;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      RECIBIDO: "Recibido",
      EN_REVISION: "En Revisión",
      APROBADO: "Aprobado",
      RECHAZADO: "Rechazado",
      ENTREGADO: "Entregado",
    };
    return labels[status] || status;
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        Historial Documental
      </Typography>

      <Box sx={{ mb: 4, p: 3, bgcolor: "background.paper", borderRadius: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
          Búsqueda y Filtros
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Alumna</InputLabel>
              <Select
                name="studentId"
                value={filters.studentId}
                onChange={handleSelectChange}
                label="Alumna"
              >
                <MenuItem value="">Todas</MenuItem>
                {students.map((student) => (
                  <MenuItem key={student.id} value={student.id}>
                    {student.nombre} {student.apellido}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Tipo de Documento</InputLabel>
              <Select
                name="documentType"
                value={filters.documentType}
                onChange={handleSelectChange}
                label="Tipo de Documento"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="PLANILLA_INSCRIPCION">Planilla de Inscripción</MenuItem>
                <MenuItem value="CEDULA_IDENTIDAD">Cédula de Identidad</MenuItem>
                <MenuItem value="FOTO_CARNET">Foto Tipo Carnet</MenuItem>
                <MenuItem value="CONSTANCIA_INSCRIPCION">Constancia de Inscripción</MenuItem>
                <MenuItem value="RECIBO_PAGO">Recibo de Pago</MenuItem>
                <MenuItem value="CERTIFICADO">Certificado</MenuItem>
                <MenuItem value="OTRO">Otro Documento</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Estado</InputLabel>
              <Select
                name="status"
                value={filters.status}
                onChange={handleSelectChange}
                label="Estado"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="RECIBIDO">Recibido</MenuItem>
                <MenuItem value="EN_REVISION">En Revisión</MenuItem>
                <MenuItem value="APROBADO">Aprobado</MenuItem>
                <MenuItem value="RECHAZADO">Rechazado</MenuItem>
                <MenuItem value="ENTREGADO">Entregado</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <TextField
              name="dateFrom"
              label="Fecha Desde"
              type="date"
              value={filters.dateFrom}
              onChange={handleTextFieldChange}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 150 }}
            />
            <TextField
              name="dateTo"
              label="Fecha Hasta"
              type="date"
              value={filters.dateTo}
              onChange={handleTextFieldChange}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 150 }}
            />
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            <Button variant="contained" onClick={applyFilters} sx={{ bgcolor: "#ec407a", "&:hover": { bgcolor: "#d81b60" } }}>
              Aplicar Filtros
            </Button>
            <Button variant="outlined" onClick={clearFilters}>
              Limpiar Filtros
            </Button>
          </Box>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Alumna</TableCell>
              <TableCell>Tipo de Documento</TableCell>
              <TableCell>Fecha Recepción</TableCell>
              <TableCell>Fecha Entrega</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Registrado Por</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Cargando documentos...
                </TableCell>
              </TableRow>
            ) : documents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No hay documentos registrados
                </TableCell>
              </TableRow>
            ) : (
              documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>{doc.studentName}</TableCell>
                  <TableCell>{getDocumentTypeLabel(doc.type)}</TableCell>
                  <TableCell>{new Date(doc.receivedDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {doc.deliveryDate ? new Date(doc.deliveryDate).toLocaleDateString() : "-"}
                  </TableCell>
                  <TableCell>{getStatusLabel(doc.status)}</TableCell>
                  <TableCell>{doc.registeredBy}</TableCell>
                  <TableCell align="center">
                    <IconButton onClick={() => handleViewDocument(doc.id)} color="primary">
                      <VisibilityIcon />
                    </IconButton>
                    {doc.fileUrl && (
                      <IconButton onClick={() => handleDownloadDocument(doc.id)} color="primary">
                        <DownloadIcon />
                      </IconButton>
                    )}
                    <IconButton onClick={() => handlePrintDocument(doc.id)} color="primary">
                      <PrintIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
