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
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import ConfirmDialog from "@/components/molecules/ConfirmDialog";

interface Event {
  id: string;
  name: string;
  description?: string | null;
  eventDate: string;
  location?: string | null;
  createdAt: string;
}

export default function DirectoraEventsPage() {
  const { data: session } = useSession();
  const [events, setEvents] = useState<Event[]>([]);
  const [open, setOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    eventDate: "",
    location: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      const res = await fetch("/api/events");
      if (!res.ok) throw new Error("Error cargando eventos");
      const json = await res.json();
      if (json.ok) setEvents(json.events);
    } catch (err: any) {
      setError(err?.message || "No se pudieron cargar los eventos");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name || !formData.eventDate) return setError("Nombre y fecha son requeridos");
    setLoading(true);
    setError(null);
    try {
      const isEditing = !!editingEvent;
      const url = isEditing ? `/api/events/${editingEvent.id}` : "/api/events";
      const method = isEditing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (json.ok) {
        setSuccess(isEditing ? "Evento actualizado correctamente" : "Evento creado correctamente");
        setOpen(false);
        setEditingEvent(null);
        setFormData({ name: "", description: "", eventDate: "", location: "" });
        loadEvents();
      } else {
        setError(json.error || "No se pudo guardar el evento");
      }
    } catch (err: any) {
      setError(err?.message || "Error de red");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  }

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      const res = await fetch(`/api/events/${itemToDelete}`, { method: "DELETE" });
      if (res.ok) {
        setSuccess("Evento eliminado correctamente");
        loadEvents();
      } else {
        setError("No se pudo eliminar el evento");
      }
    } catch (err: any) {
      setError(err?.message || "Error de red");
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  }

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      name: event.name,
      description: event.description || "",
      eventDate: event.eventDate,
      location: event.location || "",
    });
    setOpen(true);
  };

  const handleOpenDialog = () => {
    setEditingEvent(null);
    setFormData({ name: "", description: "", eventDate: "", location: "" });
    setOpen(true);
  };

  if (!session) return <p>Debes iniciar sesión.</p>;

  return (
    <Container maxWidth="lg" sx={{ mt: 8 }}>
      <Paper sx={{ p: 4, borderRadius: 3 }} elevation={6}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Gestionar Eventos
          </Typography>
          <Button variant="contained" onClick={handleOpenDialog}>
            Crear Evento
          </Button>
        </Box>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Ubicación</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.id}>
                <TableCell>{event.name}</TableCell>
                <TableCell>{event.description || "—"}</TableCell>
                <TableCell>{new Date(event.eventDate).toLocaleDateString()}</TableCell>
                <TableCell>{event.location || "—"}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(event)} color="primary" title="Editar">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(event.id)} color="error" title="Eliminar">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {events.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>No hay eventos creados aún.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{editingEvent ? "Editar Evento" : "Crear Nuevo Evento"}</DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleSubmit} sx={{ display: "grid", gap: 2, mt: 2 }}>
              <TextField
                label="Nombre del evento"
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
                label="Fecha del evento"
                type="datetime-local"
                value={formData.eventDate}
                onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Ubicación"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} variant="contained" disabled={loading}>
              {loading ? (editingEvent ? "Actualizando..." : "Creando...") : (editingEvent ? "Actualizar" : "Crear")}
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

        <ConfirmDialog
          open={deleteDialogOpen}
          title="Confirmar eliminación"
          message="¿Está seguro de que desea eliminar este evento?"
          confirmText="Eliminar"
          cancelText="Cancelar"
          onConfirm={confirmDelete}
          onCancel={() => {
            setDeleteDialogOpen(false);
            setItemToDelete(null);
          }}
        />
      </Paper>
    </Container>
  );
}
