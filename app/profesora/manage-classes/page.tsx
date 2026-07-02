"use client";
import React, { useState, useEffect } from "react";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Grid from "@mui/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useSession } from "next-auth/react";

interface Class {
  id: string;
  name: string;
  description: string | null;
  warmupExercises: string | null;
  danceRoutineDescription: string | null;
  danceTechniqueDescription: string | null;
  schedules: any[];
}

export default function ProfesoraManageClassesPage() {
  const { data: session } = useSession();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<Class | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    warmupExercises: "",
    danceRoutineDescription: "",
    danceTechniqueDescription: "",
  });

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

  const handleNewClass = () => {
    setEditingClass(null);
    setFormData({
      name: "",
      description: "",
      warmupExercises: "",
      danceRoutineDescription: "",
      danceTechniqueDescription: "",
    });
    setShowForm(true);
    setSuccess(null);
    setError(null);
  };

  const handleEditClass = (classItem: Class) => {
    setEditingClass(classItem);
    setFormData({
      name: classItem.name,
      description: classItem.description || "",
      warmupExercises: classItem.warmupExercises || "",
      danceRoutineDescription: classItem.danceRoutineDescription || "",
      danceTechniqueDescription: classItem.danceTechniqueDescription || "",
    });
    setShowForm(true);
    setSuccess(null);
    setError(null);
  };

  const handleDeleteClick = (classItem: Class) => {
    setClassToDelete(classItem);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!classToDelete) return;

    try {
      const res = await fetch(`/api/classes/${classToDelete.id}`, {
        method: "DELETE",
      });

      const json = await res.json();
      if (json.ok) {
        setSuccess("Clase eliminada correctamente");
        setClasses(classes.filter(c => c.id !== classToDelete.id));
      } else {
        setError(json.error || "Error al eliminar la clase");
      }
    } catch (err) {
      setError("Error de red al eliminar la clase");
    } finally {
      setDeleteDialogOpen(false);
      setClassToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setClassToDelete(null);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const url = editingClass ? "/api/classes" : "/api/classes";
      const method = editingClass ? "PUT" : "POST";
      const body = editingClass
        ? {
            classId: editingClass.id,
            name: formData.name,
            description: formData.description,
            warmupExercises: formData.warmupExercises,
            danceRoutineDescription: formData.danceRoutineDescription,
            danceTechniqueDescription: formData.danceTechniqueDescription,
          }
        : {
            name: formData.name,
            description: formData.description,
            warmupExercises: formData.warmupExercises,
            danceRoutineDescription: formData.danceRoutineDescription,
            danceTechniqueDescription: formData.danceTechniqueDescription,
          };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (json.ok) {
        setSuccess(editingClass ? "Clase actualizada correctamente" : "Clase creada correctamente");
        setShowForm(false);
        fetchClasses();
      } else {
        setError(json.error || "Error al guardar la clase");
      }
    } catch (err) {
      setError("Error de red al guardar la clase");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingClass(null);
    setFormData({
      name: "",
      description: "",
      warmupExercises: "",
      danceRoutineDescription: "",
      danceTechniqueDescription: "",
    });
  };

  if (!session || (session as any)?.user?.role !== "PROFESORA") {
    return null;
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 8 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          Gestionar Contenido de Clases
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleNewClass}
          sx={{ backgroundColor: "#ec407a", "&:hover": { backgroundColor: "#d81b60" } }}
        >
          Nueva Clase
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : showForm ? (
        <Paper sx={{ p: 4, borderRadius: 3 }} elevation={6}>
          <Typography variant="h6" sx={{ mb: 4, fontWeight: 600 }}>
            {editingClass ? "Editar Clase" : "Nueva Clase"}
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <TextField
              label="Título de la clase"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
              error={!formData.name}
              helperText={!formData.name ? "Este campo es obligatorio" : ""}
            />
            <TextField
              label="Descripción de la clase"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={6}
              placeholder="Describe el contenido general de la clase, objetivos y estructura de la sesión..."
              required
              error={!formData.description}
              helperText={!formData.description ? "Este campo es obligatorio" : ""}
            />
            <TextField
              label="Ejercicios de precalentamiento"
              value={formData.warmupExercises}
              onChange={(e) => setFormData({ ...formData, warmupExercises: e.target.value })}
              fullWidth
              multiline
              rows={6}
              placeholder="Describe los ejercicios de calentamiento, estiramientos y preparación física para la clase..."
              required
              error={!formData.warmupExercises}
              helperText={!formData.warmupExercises ? "Este campo es obligatorio" : ""}
            />
            <TextField
              label="Descripción de la rutina de baile"
              value={formData.danceRoutineDescription}
              onChange={(e) => setFormData({ ...formData, danceRoutineDescription: e.target.value })}
              fullWidth
              multiline
              rows={6}
              placeholder="Describe la rutina de baile coreografiada, secuencia de movimientos y estructura de la danza..."
              required
              error={!formData.danceRoutineDescription}
              helperText={!formData.danceRoutineDescription ? "Este campo es obligatorio" : ""}
            />
            <TextField
              label="Descripción de la técnica de baile"
              value={formData.danceTechniqueDescription}
              onChange={(e) => setFormData({ ...formData, danceTechniqueDescription: e.target.value })}
              fullWidth
              multiline
              rows={6}
              placeholder="Describe las técnicas específicas de danza árabe trabajadas, detalles de ejecución y correcciones..."
              required
              error={!formData.danceTechniqueDescription}
              helperText={!formData.danceTechniqueDescription ? "Este campo es obligatorio" : ""}
            />
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
              <Button
                variant="outlined"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={saving || !formData.name || !formData.description || !formData.warmupExercises || !formData.danceRoutineDescription || !formData.danceTechniqueDescription}
                sx={{ backgroundColor: "#ec407a", "&:hover": { backgroundColor: "#d81b60" } }}
              >
                {saving ? "Guardando..." : editingClass ? "Actualizar" : "Crear"}
              </Button>
            </Box>
          </Box>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {classes.length === 0 ? (
            <Grid item xs={12}>
              <Paper sx={{ p: 6, borderRadius: 3, textAlign: "center" }} elevation={3}>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                  No tienes clases creadas
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                  Crea tu primera clase para comenzar a gestionar tus sesiones de danza
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleNewClass}
                  sx={{ backgroundColor: "#ec407a", "&:hover": { backgroundColor: "#d81b60" } }}
                >
                  Crear Primera Clase
                </Button>
              </Paper>
            </Grid>
          ) : (
            classes.map((classItem) => (
              <Grid item xs={12} md={6} lg={4} key={classItem.id}>
                <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }} elevation={3}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      {classItem.name}
                    </Typography>
                    {classItem.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {classItem.description}
                      </Typography>
                    )}
                    {classItem.schedules && classItem.schedules.length > 0 && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
                        {classItem.schedules.length} horario(s)
                      </Typography>
                    )}
                  </CardContent>
                  <CardActions sx={{ justifyContent: "flex-end", p: 2 }}>
                    <IconButton
                      onClick={() => handleEditClass(classItem)}
                      sx={{ color: "#ec407a" }}
                      title="Editar"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteClick(classItem)}
                      sx={{ color: "#d32f2f" }}
                      title="Eliminar"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          ¿Estás segura de eliminar esta clase?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Esta acción no se puede deshacer. La clase "{classToDelete?.name}" será eliminada permanentemente.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={saving}>
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            autoFocus
            disabled={saving}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
