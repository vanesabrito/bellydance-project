"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import DownloadIcon from "@mui/icons-material/Download";
import PrintIcon from "@mui/icons-material/Print";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function StudentRegistrationFormPage() {
  const { data: session } = useSession();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) {
      setError("Debes iniciar sesión para ver tu planilla de inscripción");
    }
  }, [session]);

  function handleDownloadPDF() {
    if (!session?.user) return;

    try {
      const doc = new jsPDF();
      const user = session.user as any;

      // Título
      doc.setFontSize(20);
      doc.text("PLANILLA DE INSCRIPCIÓN", 105, 20, { align: "center" });
      
      doc.setFontSize(12);
      doc.text("Bellydance Project - Academia de Baile", 105, 30, { align: "center" });
      
      doc.setFontSize(10);
      doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 105, 40, { align: "center" });

      // Datos del estudiante
      const studentData = [
        ["Nombre", user.nombre || ""],
        ["Apellido", user.apellido || ""],
        ["Cédula", user.cedula || ""],
        ["Email", user.email || ""],
        ["Fecha de Nacimiento", user.fechaNacimiento ? new Date(user.fechaNacimiento).toLocaleDateString() : ""],
        ["Edad", user.edad?.toString() || ""],
        ["Dirección", user.direccion || ""],
      ];

      autoTable(doc, {
        startY: 50,
        head: [["Campo", "Valor"]],
        body: studentData,
        theme: "grid",
        headStyles: { fillColor: [66, 33, 99] },
      });

      // Información adicional
      const finalY = (doc as any).lastAutoTable?.finalY || 100;
      doc.setFontSize(10);
      doc.text("Información de Contacto:", 14, finalY + 20);
      doc.text(`Teléfono: ________________________________`, 14, finalY + 30);
      doc.text(`Emergencia: ______________________________`, 14, finalY + 40);

      doc.setFontSize(8);
      doc.text("Por favor complete esta planilla y preséntela en la academia.", 105, finalY + 60, { align: "center" });

      doc.save(`planilla-inscripcion-${user.nombre || "estudiante"}-${user.apellido || ""}.pdf`);
    } catch (error) {
      console.error("Error al generar PDF:", error);
      alert("Error al generar el PDF. Por favor intenta nuevamente.");
    }
  }

  function handlePrint() {
    window.print();
  }

  if (!session) {
    return (
      <Container maxWidth="md" sx={{ mt: 8 }}>
        <Paper sx={{ p: 4, borderRadius: 3 }} elevation={6}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 2 }}>
            Planilla de Inscripción
          </Typography>
          <Typography variant="body1" color="error">
            {error || "Debes iniciar sesión para ver tu planilla de inscripción"}
          </Typography>
        </Paper>
      </Container>
    );
  }

  const user = session.user as any;

  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Paper sx={{ p: 4, borderRadius: 3 }} elevation={6}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Planilla de Inscripción
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
            >
              Imprimir
            </Button>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadPDF}
            >
              Descargar PDF
            </Button>
          </Box>
        </Box>

        <Box sx={{ mb: 4, p: 3, bgcolor: "#f5f5f5", borderRadius: 2 }}>
          <Typography variant="h5" align="center" sx={{ fontWeight: 700, mb: 1 }}>
            PLANILLA DE INSCRIPCIÓN
          </Typography>
          <Typography variant="subtitle1" align="center" sx={{ mb: 2 }}>
            Bellydance Project - Academia de Baile
          </Typography>
          <Typography variant="body2" align="center">
            Fecha: {new Date().toLocaleDateString()}
          </Typography>
        </Box>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Campo</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Valor</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>{user.nombre || "—"}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Apellido</TableCell>
              <TableCell>{user.apellido || "—"}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Cédula</TableCell>
              <TableCell>{user.cedula || "—"}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>{user.email || "—"}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fecha de Nacimiento</TableCell>
              <TableCell>{user.fechaNacimiento ? new Date(user.fechaNacimiento).toLocaleDateString() : "—"}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Edad</TableCell>
              <TableCell>{user.edad || "—"}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Dirección</TableCell>
              <TableCell>{user.direccion || "—"}</TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <Box sx={{ mt: 4, p: 3, bgcolor: "#f5f5f5", borderRadius: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Información de Contacto
          </Typography>
          <Box sx={{ display: "grid", gap: 2 }}>
            <Typography variant="body2">
              Teléfono: ________________________________
            </Typography>
            <Typography variant="body2">
              Emergencia: ______________________________
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ mt: 2, fontStyle: "italic" }}>
            Por favor complete esta planilla y preséntela en la academia.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
