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
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import { useSession } from "next-auth/react";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ConfirmDialog from "@/components/molecules/ConfirmDialog";

interface Choreography {
  id: string;
  name: string;
  description: string | null;
  level: string | null;
  music: string | null;
  videoUrl: string | null;
  duration: number | null;
  status: string;
  participants: {
    student: {
      id: string;
      nombre: string | null;
      apellido: string | null;
    };
  }[];
  createdAt: string;
}

interface Student {
  id: string;
  nombre: string | null;
  apellido: string | null;
  email: string | null;
}

const STATUS_LABELS: Record<string, string> = {
  PRACTICE: "En Práctica",
  DEVELOPMENT: "En Desarrollo",
  READY_FOR_PRESENTATION: "Lista para Presentación",
};

export default function ProfesoraChoreographiesPage() {
  const { data: session } = useSession();
  const [choreographies, setChoreographies] = useState<Choreography[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingMusic, setUploadingMusic] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingChoreography, setEditingChoreography] = useState<Choreography | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    level: "",
    music: "",
    videoUrl: "",
    duration: "",
    status: "PRACTICE",
    participantIds: [] as string[],
  });

  useEffect(() => {
    if (session) {
      fetchChoreographies();
      fetchStudents();
    }
  }, [session]);

  const fetchChoreographies = async () => {
    try {
      const res = await fetch("/api/choreographies");
      const json = await res.json();
      if (json.ok) {
        setChoreographies(json.choreographies);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch("/api/users?role=ALUMNA");
      const json = await res.json();
      if (json.ok) {
        setStudents(json.users);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpen = (choreography?: Choreography) => {
    if (choreography) {
      setEditingChoreography(choreography);
      setFormData({
        name: choreography.name,
        description: choreography.description || "",
        level: choreography.level || "",
        music: choreography.music || "",
        videoUrl: choreography.videoUrl || "",
        duration: choreography.duration?.toString() || "",
        status: choreography.status,
        participantIds: choreography.participants.map((p) => p.student.id),
      });
    } else {
      setEditingChoreography(null);
      setFormData({
        name: "",
        description: "",
        level: "",
        music: "",
        videoUrl: "",
        duration: "",
        status: "PRACTICE",
        participantIds: [],
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingChoreography(null);
    setFormData({
      name: "",
      description: "",
      level: "",
      music: "",
      videoUrl: "",
      duration: "",
      status: "PRACTICE",
      participantIds: [],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingChoreography
        ? `/api/choreographies/${editingChoreography.id}`
        : "/api/choreographies";
      const method = editingChoreography ? "PUT" : "POST";

      const payload = {
        ...formData,
        duration: formData.duration ? parseInt(formData.duration) : null,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.ok) {
        fetchChoreographies();
        handleClose();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      const res = await fetch(`/api/choreographies/${itemToDelete}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.ok) {
        fetchChoreographies();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingVideo(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      const json = await res.json();
      if (json.ok) {
        setFormData((prev) => ({ ...prev, videoUrl: json.fileUrl }));
      } else {
        alert("Error al subir el video: " + json.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error al subir el video");
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleMusicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingMusic(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      const json = await res.json();
      if (json.ok) {
        setFormData((prev) => ({ ...prev, music: json.fileUrl }));
      } else {
        alert("Error al subir el audio: " + json.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error al subir el audio");
    } finally {
      setUploadingMusic(false);
    }
  };

  if (!session || (session as any)?.user?.role !== "PROFESORA") {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 8 }}>
      <Paper sx={{ p: 4, borderRadius: 3 }} elevation={6}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Coreografías
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
            sx={{
              backgroundColor: "#ec407a",
              "&:hover": { backgroundColor: "#d81b60" },
            }}
          >
            Agregar Coreografía
          </Button>
        </Box>

        <TableContainer sx={{ mt: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Nivel</TableCell>
                <TableCell>Música</TableCell>
                <TableCell>Duración</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Participantes</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Cargando...
                  </TableCell>
                </TableRow>
              ) : choreographies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No hay coreografías registradas
                  </TableCell>
                </TableRow>
              ) : (
                choreographies.map((choreography) => (
                  <TableRow key={choreography.id}>
                    <TableCell>{choreography.name}</TableCell>
                    <TableCell>{choreography.level || "-"}</TableCell>
                    <TableCell>{choreography.music || "-"}</TableCell>
                    <TableCell>
                      {choreography.duration ? `${choreography.duration} min` : "-"}
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          px: 2,
                          py: 1,
                          borderRadius: 1,
                          backgroundColor:
                            choreography.status === "READY_FOR_PRESENTATION"
                              ? "#e8f5e9"
                              : choreography.status === "DEVELOPMENT"
                              ? "#fff3e0"
                              : "#e3f2fd",
                          color:
                            choreography.status === "READY_FOR_PRESENTATION"
                              ? "#2e7d32"
                              : choreography.status === "DEVELOPMENT"
                              ? "#ef6c00"
                              : "#1565c0",
                          fontWeight: 500,
                          display: "inline-block",
                        }}
                      >
                        {STATUS_LABELS[choreography.status] || choreography.status}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {choreography.participants.length > 0
                        ? choreography.participants
                            .map((p) => `${p.student.nombre} ${p.student.apellido}`)
                            .join(", ")
                        : "-"}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => handleOpen(choreography)} color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(choreography.id)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingChoreography ? "Editar Coreografía" : "Agregar Coreografía"}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2, display: "grid", gap: 2 }}>
            <TextField
              label="Nombre de la Coreografía"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Descripción"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
            <TextField
              label="Nivel"
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value })}
              fullWidth
            />
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Música de la Coreografía
              </Typography>
              <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUploadIcon />}
                  disabled={uploadingMusic}
                  sx={{ minWidth: 200 }}
                >
                  {uploadingMusic ? "Subiendo..." : "Subir Audio"}
                  <input
                    type="file"
                    accept="audio/*"
                    hidden
                    onChange={handleMusicUpload}
                  />
                </Button>
                {formData.music && (
                  <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
                    Archivo subido
                  </Typography>
                )}
              </Box>
              <TextField
                label="O URL del Audio"
                value={formData.music}
                onChange={(e) => setFormData({ ...formData, music: e.target.value })}
                fullWidth
                sx={{ mt: 2 }}
                helperText="Sube un archivo de audio o pega la URL"
              />
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Video de Referencia
              </Typography>
              <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUploadIcon />}
                  disabled={uploadingVideo}
                  sx={{ minWidth: 200 }}
                >
                  {uploadingVideo ? "Subiendo..." : "Subir Video"}
                  <input
                    type="file"
                    accept="video/*"
                    hidden
                    onChange={handleVideoUpload}
                  />
                </Button>
                {formData.videoUrl && (
                  <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
                    Archivo subido
                  </Typography>
                )}
              </Box>
              <TextField
                label="O URL del Video"
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                fullWidth
                sx={{ mt: 2 }}
                helperText="Sube un archivo de video o pega la URL de YouTube u otro servicio"
              />
            </Box>
            <TextField
              label="Duración (minutos)"
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select
                value={formData.status}
                label="Estado"
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <MenuItem value="PRACTICE">En Práctica</MenuItem>
                <MenuItem value="DEVELOPMENT">En Desarrollo</MenuItem>
                <MenuItem value="READY_FOR_PRESENTATION">Lista para Presentación</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Alumnas Participantes</InputLabel>
              <Select
                multiple
                value={formData.participantIds}
                label="Alumnas Participantes"
                onChange={(e) => setFormData({ ...formData, participantIds: e.target.value as string[] })}
                renderValue={(selected) => {
                  const selectedStudents = students.filter((s) => selected.includes(s.id));
                  return selectedStudents.map((s) => `${s.nombre || ""} ${s.apellido || ""}`.trim() || s.email || "Sin nombre").join(", ");
                }}
              >
                {students.map((student) => (
                  <MenuItem key={student.id} value={student.id}>
                    {`${student.nombre || ""} ${student.apellido || ""}`.trim() || student.email || "Sin nombre"}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingChoreography ? "Actualizar" : "Agregar"}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Confirmar eliminación"
        message="¿Está seguro de que desea eliminar esta coreografía?"
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setItemToDelete(null);
        }}
      />
    </Container>
  );
}
