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
import IconButton from "@mui/material/IconButton";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import PaymentReceiptView from "@/components/admin/payments/PaymentReceiptView";

interface Payment {
  id: string;
  student: {
    id: string;
    nombre: string | null;
    apellido: string | null;
    email: string;
  };
  paymentDate: string;
  amount: number;
  paymentType: string;
  referenceNumber?: string | null;
  bank?: string | null;
  receipt?: {
    id: string;
    receiptNumber: string;
    issueDate: string;
    payment: any;
  };
  createdAt: string;
}

interface Student {
  id: string;
  nombre: string | null;
  apellido: string | null;
  email: string;
}

export default function AdminPaymentsPage() {
  const { data: session } = useSession();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [open, setOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [formData, setFormData] = useState({
    id: "",
    studentId: "",
    paymentDate: new Date().toISOString().split('T')[0],
    amount: "",
    paymentType: "",
    referenceNumber: "",
    bank: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadPayments();
    loadStudents();
  }, []);

  async function loadPayments() {
    try {
      const res = await fetch("/api/payments");
      if (!res.ok) throw new Error("Error cargando pagos");
      const json = await res.json();
      if (json.ok) setPayments(json.payments);
    } catch (err: any) {
      setError(err?.message || "No se pudieron cargar los pagos");
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
    if (!formData.studentId || !formData.amount || !formData.paymentType) return setError("Alumna, monto y tipo de pago son requeridos");
    setLoading(true);
    setError(null);
    try {
      const isEditing = !!formData.id;
      const method = isEditing ? "PUT" : "POST";
      const res = await fetch("/api/payments", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (json.ok) {
        setSuccess(isEditing ? "Pago actualizado correctamente" : "Pago registrado correctamente");
        setOpen(false);
        setEditingPayment(null);
        setFormData({
          id: "",
          studentId: "",
          paymentDate: new Date().toISOString().split('T')[0],
          amount: "",
          paymentType: "",
          referenceNumber: "",
          bank: "",
        });
        loadPayments();
      } else {
        setError(json.error || "No se pudo registrar el pago");
      }
    } catch (err: any) {
      setError(err?.message || "Error de red");
    } finally {
      setLoading(false);
    }
  }

  const handleEdit = (payment: Payment) => {
    setEditingPayment(payment);
    setFormData({
      id: payment.id,
      studentId: payment.student.id,
      paymentDate: payment.paymentDate.split('T')[0],
      amount: payment.amount.toString(),
      paymentType: payment.paymentType,
      referenceNumber: payment.referenceNumber || "",
      bank: payment.bank || "",
    });
    setOpen(true);
  };

  const handleOpenDialog = () => {
    setEditingPayment(null);
    setFormData({
      id: "",
      studentId: "",
      paymentDate: new Date().toISOString().split('T')[0],
      amount: "",
      paymentType: "",
      referenceNumber: "",
      bank: "",
    });
    setOpen(true);
  };

  if (!session) return <p>Debes iniciar sesión.</p>;
  if ((session as any)?.user?.role !== "ADMIN") return <p>No tienes permiso para acceder a esta página.</p>;

  return (
    <Container maxWidth="lg" sx={{ mt: 8 }}>
      <Paper sx={{ p: 4, borderRadius: 3 }} elevation={6}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Control de Pagos
          </Typography>
          <Button variant="contained" onClick={handleOpenDialog}>
            Registrar Pago
          </Button>
        </Box>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Alumna</TableCell>
              <TableCell>Fecha de Pago</TableCell>
              <TableCell>Monto</TableCell>
              <TableCell>Tipo de Pago</TableCell>
              <TableCell>Referencia</TableCell>
              <TableCell>Banco</TableCell>
              <TableCell>Recibo</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>
                  {payment.student.nombre} {payment.student.apellido}
                  <br />
                  <small>{payment.student.email}</small>
                </TableCell>
                <TableCell>{new Date(payment.paymentDate).toLocaleDateString()}</TableCell>
                <TableCell>${payment.amount.toFixed(2)}</TableCell>
                <TableCell>
                  <Chip
                    label={payment.paymentType}
                    color="primary"
                    size="small"
                  />
                </TableCell>
                <TableCell>{payment.referenceNumber || "—"}</TableCell>
                <TableCell>{payment.bank || "—"}</TableCell>
                <TableCell>
                  {payment.receipt ? (
                    <IconButton
                      onClick={() => {
                        setSelectedReceipt(payment.receipt);
                        setReceiptOpen(true);
                      }}
                      color="primary"
                      title="Ver Recibo"
                    >
                      <VisibilityIcon />
                    </IconButton>
                  ) : (
                    <span style={{ color: "#999", fontSize: "0.875rem" }}>No disponible</span>
                  )}
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleEdit(payment)}
                    color="primary"
                    title="Editar Pago"
                  >
                    <EditIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {payments.length === 0 && (
              <TableRow>
                <TableCell colSpan={8}>No hay pagos registrados aún.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{editingPayment ? "Editar Pago" : "Registrar Pago"}</DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleSubmit} sx={{ display: "grid", gap: 2, mt: 2 }}>
              <TextField
                select
                label="Alumna"
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
                label="Fecha de Pago"
                type="date"
                value={formData.paymentDate}
                onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Monto"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                fullWidth
                required
                InputProps={{ startAdornment: "$" }}
              />
              <TextField
                select
                label="Tipo de Pago"
                value={formData.paymentType}
                onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}
                fullWidth
                required
              >
                <MenuItem value="EFECTIVO">Efectivo</MenuItem>
                <MenuItem value="PAGO_MOVIL">Pago Móvil</MenuItem>
                <MenuItem value="TRANSFERENCIA">Transferencia</MenuItem>
              </TextField>
              <TextField
                label="Número de Referencia"
                value={formData.referenceNumber}
                onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                fullWidth
              />
              <TextField
                label="Banco"
                value={formData.bank}
                onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} variant="contained" disabled={loading}>
              {loading ? (editingPayment ? "Actualizando..." : "Registrando...") : (editingPayment ? "Actualizar" : "Registrar")}
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

        <PaymentReceiptView
          open={receiptOpen}
          onClose={() => setReceiptOpen(false)}
          receipt={selectedReceipt}
        />
      </Paper>
    </Container>
  );
}
