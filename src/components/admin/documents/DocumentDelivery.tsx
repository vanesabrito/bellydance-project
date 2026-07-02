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
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import IconButton from "@mui/material/IconButton";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import PrintIcon from "@mui/icons-material/Print";
import PaymentReceiptView from "@/components/admin/payments/PaymentReceiptView";

interface PaymentReceipt {
  id: string;
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
}

export default function DocumentDelivery() {
  const [formData, setFormData] = useState({
    studentId: "",
    documentType: "",
    description: "",
    deliveryDate: "",
  });

  const [students, setStudents] = useState<any[]>([]);

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState<"success" | "error">("success");
  const [showPaymentReceipts, setShowPaymentReceipts] = useState(false);
  const [paymentReceipts, setPaymentReceipts] = useState<PaymentReceipt[]>([]);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentReceipt | null>(null);

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

  useEffect(() => {
    if (showPaymentReceipts) {
      loadPaymentReceipts();
    }
  }, [showPaymentReceipts]);

  const loadPaymentReceipts = async () => {
    try {
      const response = await fetch("/api/payments");
      if (response.ok) {
        const data = await response.json();
        const receipts = data.payments
          .filter((payment: any) => payment.receipt)
          .map((payment: any) => ({
            ...payment.receipt,
            payment: payment,
          }));
        setPaymentReceipts(receipts);
      }
    } catch (error) {
      console.error("Error al cargar recibos:", error);
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
      const response = await fetch("/api/documents/deliver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setAlertMessage("Documento entregado exitosamente.");
        setAlertSeverity("success");
        setShowAlert(true);
        setFormData({
          studentId: "",
          documentType: "",
          description: "",
          deliveryDate: "",
        });
      } else {
        const error = await response.json();
        setAlertMessage(error.error || "Error al entregar el documento.");
        setAlertSeverity("error");
        setShowAlert(true);
      }
    } catch (error) {
      setAlertMessage("Error al conectar con el servidor.");
      setAlertSeverity("error");
      setShowAlert(true);
    }
  };

  const handleViewReceipt = (receipt: PaymentReceipt) => {
    setSelectedReceipt(receipt);
    setReceiptOpen(true);
  };

  const handleDownloadReceipt = (receipt: PaymentReceipt) => {
    // Implementar descarga de recibo
    console.log("Descargar recibo:", receipt.receiptNumber);
  };

  const handlePrintReceipt = (receipt: PaymentReceipt) => {
    // Implementar impresión de recibo
    console.log("Imprimir recibo:", receipt.receiptNumber);
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        Entrega de Documentos
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Button
          variant="outlined"
          onClick={() => setShowPaymentReceipts(!showPaymentReceipts)}
          sx={{ mb: 2 }}
        >
          {showPaymentReceipts ? "Ocultar Recibos de Pago" : "Ver Recibos de Pago"}
        </Button>

        {showPaymentReceipts && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Recibos de Pago (Integración con Control de Pagos)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Los recibos de pago se obtienen automáticamente del módulo Control de Pagos.
            </Typography>
            
            {paymentReceipts.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No hay recibos de pago registrados.
              </Typography>
            ) : (
              paymentReceipts.map((receipt) => (
                <Card key={receipt.id}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Recibo de Pago - {receipt.payment.student.nombre} {receipt.payment.student.apellido}
                    </Typography>
                    <Typography variant="body2">N° Recibo: {receipt.receiptNumber}</Typography>
                    <Typography variant="body2">Monto: ${receipt.payment.amount.toFixed(2)}</Typography>
                    <Typography variant="body2">Fecha: {new Date(receipt.payment.paymentDate).toLocaleDateString()}</Typography>
                    <Typography variant="body2">Banco: {receipt.payment.bank || "N/A"}</Typography>
                    <Typography variant="body2">Tipo: {receipt.payment.paymentType}</Typography>
                  </CardContent>
                  <CardActions>
                    <IconButton onClick={() => handleViewReceipt(receipt)} color="primary">
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDownloadReceipt(receipt)} color="primary">
                      <DownloadIcon />
                    </IconButton>
                    <IconButton onClick={() => handlePrintReceipt(receipt)} color="primary">
                      <PrintIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              ))
            )}
          </Box>
        )}
      </Box>

      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
        Registrar Entrega de Documento
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
            <MenuItem value="CONSTANCIA_INSCRIPCION">Constancia de Inscripción</MenuItem>
            <MenuItem value="RECIBO_PAGO">Recibo de Pago</MenuItem>
            <MenuItem value="CERTIFICADO">Certificado</MenuItem>
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
          name="deliveryDate"
          label="Fecha de Entrega"
          type="date"
          value={formData.deliveryDate}
          onChange={handleTextFieldChange}
          fullWidth
          InputLabelProps={{ shrink: true }}
        />

        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          <Button type="submit" variant="contained" sx={{ bgcolor: "#ec407a", "&:hover": { bgcolor: "#d81b60" } }}>
            Registrar Entrega
          </Button>
          <Button type="button" variant="outlined" onClick={() => setFormData({
            studentId: "",
            documentType: "",
            description: "",
            deliveryDate: "",
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

      <PaymentReceiptView
        open={receiptOpen}
        onClose={() => setReceiptOpen(false)}
        receipt={selectedReceipt || {
          receiptNumber: "",
          issueDate: "",
          payment: {
            paymentDate: "",
            amount: 0,
            paymentType: "",
            bank: null,
            referenceNumber: null,
            student: {
              nombre: "",
              apellido: "",
            },
          },
        }}
      />
    </Box>
  );
}
