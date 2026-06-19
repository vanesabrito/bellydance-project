"use client";
import React, { useCallback, useEffect, useState } from "react";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import { roleLabel } from "@/utils/roles";
import { useRefreshOnFocus } from "@/hooks/useRefreshOnFocus";

type AdminUser = {
  id: string;
  email: string;
  role: "ADMIN" | "DIRECTORA_ACADEMICA" | "PROFESORA" | "ALUMNA";
  createdAt: string;
};

export default function AdminUsersTable() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    id: "",
    nombre: "",
    apellido: "",
    cedula: "",
    email: "",
    fechaNacimiento: "",
    edad: "",
    direccion: "",
    password: "",
    role: "ALUMNA" as "ADMIN" | "DIRECTORA_ACADEMICA" | "PROFESORA" | "ALUMNA",
  });

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/users", { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`Error ${res.status}`);
      }
      const json = (await res.json()) as { ok?: boolean; users?: AdminUser[] };
      setUsers(json.users ?? []);
    } catch (err) {
      setError("No pudimos cargar los usuarios. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useRefreshOnFocus(loadUsers);

  const handleOpenDialog = () => {
    setOpenDialog(true);
    setEditingUser(null);
    setFormError(null);
    setSuccess(null);
    setFormData({
      id: "",
      nombre: "",
      apellido: "",
      cedula: "",
      email: "",
      fechaNacimiento: "",
      edad: "",
      direccion: "",
      password: "",
      role: "ALUMNA",
    });
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    setSuccess(null);

    try {
      const isEditing = !!formData.id;
      const method = isEditing ? "PUT" : "POST";
      const res = await fetch("/api/users", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          edad: formData.edad ? parseInt(formData.edad) : null,
        }),
      });

      const json = await res.json();

      if (json.ok) {
        setSuccess(isEditing ? "Usuario actualizado exitosamente" : "Usuario creado exitosamente");
        loadUsers();
        setTimeout(() => {
          handleCloseDialog();
          setSuccess(null);
        }, 1000);
      } else {
        setFormError(json.error || "Error al guardar usuario");
      }
    } catch (err) {
      setFormError("Error de red");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (user: AdminUser) => {
    setEditingUser(user);
    setFormError(null);
    setSuccess(null);
    setFormData({
      id: user.id,
      nombre: "",
      apellido: "",
      cedula: "",
      email: user.email,
      fechaNacimiento: "",
      edad: "",
      direccion: "",
      password: "",
      role: user.role,
    });
    setOpenDialog(true);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Paper sx={{ p: 4, borderRadius: 3 }} elevation={6}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
            gap: 2,
          }}
        >
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Usuarios
          </Typography>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            {isLoading && <CircularProgress size={20} />}
            <Button variant="contained" onClick={handleOpenDialog}>
              Registrar Usuario
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            action={
              <Button color="inherit" size="small" onClick={loadUsers}>
                Reintentar
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Fecha de alta</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id} hover>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={roleLabel(u.role)}
                    color={u.role === "ADMIN" ? "primary" : "default"}
                  />
                </TableCell>
                <TableCell>{new Date(u.createdAt).toLocaleString()}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleEdit(u)}
                    color="primary"
                    title="Editar Usuario"
                  >
                    <EditIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && !isLoading && (
              <TableRow>
                <TableCell colSpan={4}>No hay usuarios.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingUser ? "Editar Usuario" : "Registrar Nuevo Usuario"}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              label="Nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Apellido"
              value={formData.apellido}
              onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Cédula"
              value={formData.cedula}
              onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Fecha de Nacimiento"
              type="date"
              value={formData.fechaNacimiento}
              onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Edad"
              type="number"
              value={formData.edad}
              onChange={(e) => setFormData({ ...formData, edad: e.target.value })}
              fullWidth
              margin="normal"
              inputProps={{ min: 1, max: 100 }}
            />
            <TextField
              label="Dirección"
              value={formData.direccion}
              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
              fullWidth
              margin="normal"
              multiline
              rows={2}
            />
            <TextField
              label="Contraseña"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              fullWidth
              margin="normal"
              required={!editingUser}
              helperText={editingUser ? "Dejar en blanco para mantener la contraseña actual" : ""}
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Rol</InputLabel>
              <Select
                value={formData.role}
                label="Rol"
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
              >
                <MenuItem value="ADMIN">Administrador</MenuItem>
                <MenuItem value="DIRECTORA_ACADEMICA">Directora Académica</MenuItem>
                <MenuItem value="PROFESORA">Profesora</MenuItem>
                <MenuItem value="ALUMNA">Alumna</MenuItem>
              </Select>
            </FormControl>

            {formError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {formError}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mt: 2 }}>
                {success}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} variant="contained" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : (editingUser ? "Actualizar" : "Guardar")}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
