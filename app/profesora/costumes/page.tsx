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

interface Costume {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  imageUrl: string | null;
  accessories: string | null;
  estimatedCost: number | null;
  status: string;
  choreography: { id: string; name: string } | null;
  createdAt: string;
}

interface Choreography {
  id: string;
  name: string;
}

const STATUS_LABELS: Record<string, string> = {
  DESIGN: "En Diseño",
  APPROVED: "Aprobado",
  REJECTED: "Rechazado",
  IN_PRODUCTION: "En Producción",
  COMPLETED: "Completado",
};

export default function ProfesoraCostumesPage() {
  const { data: session } = useSession();
  const [costumes, setCostumes] = useState<Costume[]>([]);
  const [choreographies, setChoreographies] = useState<Choreography[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingCostume, setEditingCostume] = useState<Costume | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "",
    imageUrl: "",
    accessories: "",
    estimatedCost: "",
    choreographyId: "",
    status: "DESIGN",
  });

  useEffect(() => {
    if (session) {
      fetchCostumes();
      fetchChoreographies();
    }
  }, [session]);

  const fetchCostumes = async () => {
    try {
      const res = await fetch("/api/costumes");
      const json = await res.json();
      if (json.ok) {
        setCostumes(json.costumes);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchChoreographies = async () => {
    try {
      const res = await fetch("/api/choreographies");
      const json = await res.json();
      if (json.ok) {
        setChoreographies(json.choreographies);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpen = (costume?: Costume) => {
    if (costume) {
      setEditingCostume(costume);
      setFormData({
        name: costume.name,
        description: costume.description || "",
        color: costume.color || "",
        imageUrl: costume.imageUrl || "",
        accessories: costume.accessories || "",
        estimatedCost: costume.estimatedCost?.toString() || "",
        choreographyId: costume.choreography?.id || "",
        status: costume.status,
      });
    } else {
      setEditingCostume(null);
      setFormData({
        name: "",
        description: "",
        color: "",
        imageUrl: "",
        accessories: "",
        estimatedCost: "",
        choreographyId: "",
        status: "DESIGN",
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingCostume(null);
    setFormData({
      name: "",
      description: "",
      color: "",
      imageUrl: "",
      accessories: "",
      estimatedCost: "",
      choreographyId: "",
      status: "DESIGN",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingCostume
        ? `/api/costumes/${editingCostume.id}`
        : "/api/costumes";
      const method = editingCostume ? "PUT" : "POST";

      const payload = {
        ...formData,
        estimatedCost: formData.estimatedCost ? parseFloat(formData.estimatedCost) : null,
        choreographyId: formData.choreographyId || null,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.ok) {
        fetchCostumes();
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
      const res = await fetch(`/api/costumes/${itemToDelete}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.ok) {
        fetchCostumes();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
        setFormData((prev) => ({ ...prev, imageUrl: json.fileUrl }));
      } else {
        alert("Error al subir la imagen: " + json.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error al subir la imagen");
    } finally {
      setUploading(false);
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
            Vestuarios
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
            Agregar Vestuario
          </Button>
        </Box>

        <TableContainer sx={{ mt: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Vestuario</TableCell>
                <TableCell>Coreografía</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Color</TableCell>
                <TableCell>Accesorios</TableCell>
                <TableCell>Costo Estimado</TableCell>
                <TableCell>Imagen</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    Cargando...
                  </TableCell>
                </TableRow>
              ) : costumes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No hay vestuarios registrados
                  </TableCell>
                </TableRow>
              ) : (
                costumes.map((costume) => (
                  <TableRow key={costume.id}>
                    <TableCell>{costume.name}</TableCell>
                    <TableCell>{costume.choreography?.name || "-"}</TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          px: 2,
                          py: 1,
                          borderRadius: 1,
                          backgroundColor:
                            costume.status === "APPROVED"
                              ? "#e8f5e9"
                              : costume.status === "DESIGN"
                              ? "#fff3e0"
                              : costume.status === "IN_PRODUCTION"
                              ? "#e3f2fd"
                              : costume.status === "COMPLETED"
                              ? "#f3e5f5"
                              : "#ffebee",
                          color:
                            costume.status === "APPROVED"
                              ? "#2e7d32"
                              : costume.status === "DESIGN"
                              ? "#ef6c00"
                              : costume.status === "IN_PRODUCTION"
                              ? "#1565c0"
                              : costume.status === "COMPLETED"
                              ? "#7b1fa2"
                              : "#c62828",
                          fontWeight: 500,
                          display: "inline-block",
                        }}
                      >
                        {STATUS_LABELS[costume.status] || costume.status}
                      </Box>
                    </TableCell>
                    <TableCell>{costume.color || "-"}</TableCell>
                    <TableCell>{costume.accessories || "-"}</TableCell>
                    <TableCell>
                      {costume.estimatedCost
                        ? `$${costume.estimatedCost.toFixed(2)}`
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {costume.imageUrl ? (
                        <Box
                          component="img"
                          src={costume.imageUrl}
                          alt={costume.name}
                          sx={{ width: 60, height: 60, objectFit: "cover", borderRadius: 1 }}
                        />
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => handleOpen(costume)} color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(costume.id)} color="error">
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
          {editingCostume ? "Editar Vestuario" : "Agregar Vestuario"}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2, display: "grid", gap: 2 }}>
            <TextField
              label="Nombre del Vestuario"
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
            <FormControl fullWidth>
              <InputLabel>Coreografía</InputLabel>
              <Select
                value={formData.choreographyId}
                label="Coreografía"
                onChange={(e) => setFormData({ ...formData, choreographyId: e.target.value })}
              >
                <MenuItem value="">Sin coreografía</MenuItem>
                {choreographies.map((choreography) => (
                  <MenuItem key={choreography.id} value={choreography.id}>
                    {choreography.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              fullWidth
            />
            <TextField
              label="Accesorios"
              value={formData.accessories}
              onChange={(e) => setFormData({ ...formData, accessories: e.target.value })}
              fullWidth
              multiline
              rows={2}
            />
            <TextField
              label="Costo Estimado"
              type="number"
              value={formData.estimatedCost}
              onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
              fullWidth
              InputProps={{ startAdornment: "$" }}
            />
            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select
                value={formData.status}
                label="Estado"
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <MenuItem value="DESIGN">En Diseño</MenuItem>
                <MenuItem value="APPROVED">Aprobado</MenuItem>
                <MenuItem value="REJECTED">Rechazado</MenuItem>
                <MenuItem value="IN_PRODUCTION">En Producción</MenuItem>
                <MenuItem value="COMPLETED">Completado</MenuItem>
              </Select>
            </FormControl>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Imagen del Vestuario
              </Typography>
              <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUploadIcon />}
                  disabled={uploading}
                  sx={{ minWidth: 200 }}
                >
                  {uploading ? "Subiendo..." : "Subir Imagen"}
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleFileUpload}
                  />
                </Button>
                {formData.imageUrl && (
                  <Box
                    component="img"
                    src={formData.imageUrl}
                    alt="Vista previa"
                    sx={{ width: 80, height: 80, objectFit: "cover", borderRadius: 1 }}
                  />
                )}
              </Box>
              <TextField
                label="O URL de la Imagen"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                fullWidth
                sx={{ mt: 2 }}
                helperText="Sube una imagen o pega la URL"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingCostume ? "Actualizar" : "Agregar"}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Confirmar eliminación"
        message="¿Está seguro de que desea eliminar este vestuario?"
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
