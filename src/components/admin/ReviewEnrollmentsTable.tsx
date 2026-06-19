"use client";
import React, { useCallback, useEffect, useState } from "react";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import { statusLabel, statusChipColor } from "@/utils/status";
import { useRefreshOnFocus } from "@/hooks/useRefreshOnFocus";

type Enrollment = {
  id: string;
  className: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewNote?: string | null;
  createdAt: string;
  student?: { email?: string | null; id?: string } | null;
  reviewedAt?: string | null;
};

type Payment = {
  id: string;
  studentId: string;
  amount: number;
  paymentType: string;
  paymentDate: string;
};

type ReviewEnrollmentsTableProps = {
  initialEnrollments?: Enrollment[];
};

export default function ReviewEnrollmentsTable({
  initialEnrollments = [],
}: ReviewEnrollmentsTableProps) {
  const [enrollments, setEnrollments] = useState<Enrollment[]>(initialEnrollments);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [statusFilter, setStatusFilter] = useState<"ALL" | Enrollment["status"]>(
    "ALL"
  );
  const [emailQuery, setEmailQuery] = useState("");
  const [fromDate, setFromDate] = useState(""); // yyyy-MM-dd
  const [toDate, setToDate] = useState(""); // yyyy-MM-dd
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingEnrollment, setPendingEnrollment] = useState<Enrollment | null>(null);
  const isPendingOnly = statusFilter === "PENDING";

  const loadEnrollments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/enrollments/all", { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`Error ${res.status}`);
      }
      const json = (await res.json()) as { ok?: boolean; enrollments?: Enrollment[] };
      setEnrollments(json.enrollments ?? []);
      setNotes({});
    } catch (err) {
      setError("No pudimos cargar las inscripciones. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadPayments = useCallback(async () => {
    try {
      const res = await fetch("/api/payments", { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`Error ${res.status}`);
      }
      const json = (await res.json()) as { ok?: boolean; payments?: Payment[] };
      setPayments(json.payments ?? []);
    } catch (err) {
      console.error("Error loading payments:", err);
    }
  }, []);

  useEffect(() => {
    loadEnrollments();
    loadPayments();
  }, [loadEnrollments, loadPayments]);

  useRefreshOnFocus(loadEnrollments);

  const getPaymentStatus = (enrollment: Enrollment): "PAGADO" | "PENDIENTE" => {
    if (!enrollment.student?.id) return "PENDIENTE";
    const hasPayment = payments.some(p => p.studentId === enrollment.student!.id);
    return hasPayment ? "PAGADO" : "PENDIENTE";
  };

  const getPaymentStatusColor = (status: "PAGADO" | "PENDIENTE") => {
    return status === "PAGADO" ? "success" : "error";
  };

  const handleAction = async (id: string, status: Enrollment["status"]) => {
    const enrollment = enrollments.find(e => e.id === id);
    if (!enrollment) return;

    // Check payment status before approving
    if (status === "APPROVED") {
      const paymentStatus = getPaymentStatus(enrollment);
      if (paymentStatus === "PENDIENTE") {
        setPendingEnrollment(enrollment);
        setConfirmDialogOpen(true);
        return;
      }
    }

    const reviewNote = notes[id];
    setError(null);
    try {
      const res = await fetch(`/api/enrollments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, reviewNote }),
      });
      if (!res.ok) {
        throw new Error(`Error ${res.status}`);
      }
      const json = await res.json();
      if (json.ok) {
        setEnrollments((prev) =>
          prev.map((d) => (d.id === id ? { ...d, status, reviewNote } : d))
        );
        setNotes((prev) => {
          const { [id]: _removed, ...rest } = prev;
          return rest;
        });
        await loadEnrollments();
      }
    } catch (err) {
      setError("No pudimos actualizar la inscripción. Intenta nuevamente.");
    }
  };

  const handleConfirmApproval = async () => {
    if (!pendingEnrollment) return;
    
    const reviewNote = notes[pendingEnrollment.id];
    setError(null);
    try {
      const res = await fetch(`/api/enrollments/${pendingEnrollment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "APPROVED", reviewNote }),
      });
      if (!res.ok) {
        throw new Error(`Error ${res.status}`);
      }
      const json = await res.json();
      if (json.ok) {
        setEnrollments((prev) =>
          prev.map((d) => (d.id === pendingEnrollment.id ? { ...d, status: "APPROVED", reviewNote } : d))
        );
        setNotes((prev) => {
          const { [pendingEnrollment.id]: _removed, ...rest } = prev;
          return rest;
        });
        await loadEnrollments();
      }
    } catch (err) {
      setError("No pudimos actualizar la inscripción. Intenta nuevamente.");
    } finally {
      setConfirmDialogOpen(false);
      setPendingEnrollment(null);
    }
  };

  const handleClearFilters = () => {
    setEmailQuery("");
    setFromDate("");
    setToDate("");
    setStatusFilter("ALL");
  };

  const handlePendingToggle = (checked: boolean) => {
    setStatusFilter(checked ? "PENDING" : "ALL");
  };

  const visibleEnrollments = enrollments.filter((d) => {
    const matchStatus =
      statusFilter === "ALL" ? true : d.status === statusFilter;
    const matchEmail =
      emailQuery.trim().length === 0
        ? true
        : (d.student?.email || "")
            .toLowerCase()
            .includes(emailQuery.toLowerCase());
    const created = new Date(d.createdAt);
    const matchFrom = fromDate
      ? created >= new Date(fromDate + "T00:00:00")
      : true;
    const matchTo = toDate ? created <= new Date(toDate + "T23:59:59") : true;
    return matchStatus && matchEmail && matchFrom && matchTo;
  });

  return (
    <Container maxWidth="lg" sx={{ mt: 8 }}>
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
            Revisar inscripciones
          </Typography>
          {isLoading && <CircularProgress size={20} />}
        </Box>
        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            action={
              <Button color="inherit" size="small" onClick={loadEnrollments}>
                Reintentar
              </Button>
            }
          >
            {error}
          </Alert>
        )}
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          sx={{ mb: 2 }}
        >
          <TextField
            label="Buscar por alumno"
            size="small"
            value={emailQuery}
            onChange={(e) => setEmailQuery(e.target.value)}
          />
          <TextField
            label="Desde"
            size="small"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Hasta"
            size="small"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Estado"
            size="small"
            select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            SelectProps={{ native: true }}
          >
            <option value="ALL">Todos</option>
            <option value="PENDING">Pendiente</option>
            <option value="APPROVED">Aprobada</option>
            <option value="REJECTED">Rechazado</option>
          </TextField>
          <Button variant="text" onClick={handleClearFilters}>
            Limpiar
          </Button>
          <FormControlLabel
            control={
              <Checkbox
                checked={isPendingOnly}
                onChange={(e) => handlePendingToggle(e.target.checked)}
              />
            }
            label="Solo pendientes"
          />
        </Stack>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Clase</TableCell>
              <TableCell>Alumno</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Estado de Pago</TableCell>
              <TableCell>Nota</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleEnrollments.map((d) => (
              <TableRow key={d.id} hover>
                <TableCell>{d.className}</TableCell>
                <TableCell>{d.student?.email}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={statusLabel(d.status)}
                    color={statusChipColor(d.status)}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={getPaymentStatus(d)}
                    color={getPaymentStatusColor(getPaymentStatus(d))}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    value={notes[d.id] ?? d.reviewNote ?? ""}
                    onChange={(e) =>
                      setNotes((n) => ({ ...n, [d.id]: e.target.value }))
                    }
                    placeholder="Observaciones"
                  />
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      size="small"
                      disabled={d.status === "APPROVED"}
                      onClick={() => handleAction(d.id, "APPROVED")}
                    >
                      Aprobar
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      disabled={d.status === "REJECTED"}
                      onClick={() => handleAction(d.id, "REJECTED")}
                    >
                      Rechazar
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {enrollments.length === 0 && !isLoading && (
              <TableRow>
                <TableCell colSpan={6}>
                  No hay inscripciones para revisar.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
      
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Advertencia: Pago Pendiente</DialogTitle>
        <DialogContent>
          <DialogContentText>
            La alumna {pendingEnrollment?.student?.email} no tiene ningún pago registrado en el sistema.
            ¿Estás seguro de que deseas aprobar esta inscripción?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleConfirmApproval} variant="contained" color="primary">
            Confirmar Aprobación
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
