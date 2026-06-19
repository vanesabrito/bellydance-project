"use client";
import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Image from "next/image";

interface PaymentReceiptViewProps {
  open: boolean;
  onClose: () => void;
  receipt: {
    receiptNumber: string;
    issueDate: string;
    payment: {
      paymentDate: string;
      amount: number;
      paymentType: string;
      bank: string | null;
      referenceNumber: string | null;
      student: {
        nombre: string;
        apellido: string;
      };
    };
  };
}

export default function PaymentReceiptView({ open, onClose, receipt }: PaymentReceiptViewProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-VE");
  };

  const formatAmount = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const getPaymentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      EFECTIVO: "Efectivo",
      PAGO_MOVIL: "Pago Móvil",
      TRANSFERENCIA: "Transferencia",
    };
    return labels[type] || type;
  };

  const handlePrint = () => {
    window.print();
  };

  if (!receipt || !receipt.payment || !receipt.payment.student) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: "#ec407a", color: "white", textAlign: "center" }}>
          Recibo de Pago
        </DialogTitle>
        <DialogContent>
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="body1">No se pudo cargar la información del recibo.</Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: "center" }}>
          <Button onClick={onClose} variant="outlined">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: "#ec407a", color: "white", textAlign: "center" }}>
        Recibo de Pago
      </DialogTitle>
      <DialogContent>
        <Paper sx={{ p: 4, mt: 2, bgcolor: "#fafafa" }}>
          {/* Header del Recibo */}
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#ec407a", mb: 1 }}>
              BELLYDANCE PROJECT
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              RECIBO DE PAGO
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              N° Recibo: {receipt.receiptNumber}
            </Typography>
          </Box>

          {/* Datos de la Alumna */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Alumna:
            </Typography>
            <Typography variant="body1">
              {receipt.payment.student.nombre} {receipt.payment.student.apellido}
            </Typography>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Datos del Pago */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 2 }}>
              Datos del Pago:
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2">Fecha de Pago:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {formatDate(receipt.payment.paymentDate)}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2">Monto:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {formatAmount(receipt.payment.amount)}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2">Tipo de Pago:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {getPaymentTypeLabel(receipt.payment.paymentType)}
                </Typography>
              </Box>
              {receipt.payment.bank && (
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2">Banco:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {receipt.payment.bank}
                  </Typography>
                </Box>
              )}
              {receipt.payment.referenceNumber && (
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2">Referencia:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {receipt.payment.referenceNumber}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Estado y Fecha de Emisión */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Typography variant="body2">Estado:</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "#4caf50" }}>
                PAGADO
              </Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body2">Fecha de Emisión:</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {formatDate(receipt.issueDate)}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Pie de página */}
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2" sx={{ fontStyle: "italic", mb: 2 }}>
              Gracias por su pago
            </Typography>
            <Typography variant="caption" sx={{ color: "#666" }}>
              Bellydance Project - Academia de Danza
            </Typography>
          </Box>
        </Paper>
      </DialogContent>
      <DialogActions sx={{ p: 2, justifyContent: "center" }}>
        <Button onClick={handlePrint} variant="contained" sx={{ bgcolor: "#ec407a", "&:hover": { bgcolor: "#d81b60" } }}>
          Imprimir
        </Button>
        <Button onClick={onClose} variant="outlined">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
