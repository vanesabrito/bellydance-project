"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import DownloadIcon from "@mui/icons-material/Download";
import PrintIcon from "@mui/icons-material/Print";
import jsPDF from "jspdf";
import Image from "next/image";

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

      // Logo (simulado con texto ya que no podemos cargar imagen directamente en PDF)
      doc.setFontSize(10);
      doc.text("Bellydance Project", 14, 15);
      doc.setFontSize(8);
      doc.text("Academia de Baile", 14, 20);

      // Título
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("Planilla de Inscripción", 105, 30, { align: "center" });
      doc.setFont("helvetica", "normal");

      let currentY = 45;

      // Datos de la Alumna
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Datos de la Alumna:", 14, currentY);
      doc.setFont("helvetica", "normal");
      currentY += 10;

      doc.setFontSize(10);
      doc.text(`Nombres y Apellidos: ${user.nombre || ""} ${user.apellido || ""}`, 14, currentY);
      currentY += 8;
      doc.text(`CI: ${user.cedula || ""}`, 14, currentY);
      currentY += 8;
      doc.text(`Fecha de nacimiento: ${user.fechaNacimiento ? new Date(user.fechaNacimiento).toLocaleDateString() : ""}`, 14, currentY);
      currentY += 8;
      doc.text(`Edad: ${user.edad || ""}`, 14, currentY);
      currentY += 8;
      doc.text(`Dirección: ${user.direccion || ""}`, 14, currentY);
      currentY += 15;

      // Datos del representante
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Datos del representante (en caso de ser menor de edad la alumna):", 14, currentY);
      doc.setFont("helvetica", "normal");
      currentY += 10;

      doc.setFontSize(10);
      doc.text("Nombres y Apellidos del Representante: ________________________________", 14, currentY);
      currentY += 8;
      doc.text("CI: ________________________________", 14, currentY);
      currentY += 8;
      doc.text("Teléfono: ________________________________", 14, currentY);
      currentY += 15;

      // Observaciones
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Observaciones:", 14, currentY);
      doc.setFont("helvetica", "normal");
      currentY += 10;
      doc.setFontSize(10);
      doc.text("_______________________________________________________________________________", 14, currentY);
      currentY += 8;
      doc.text("_______________________________________________________________________________", 14, currentY);
      currentY += 15;

      // Compromiso de Inscripción
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Compromiso de Inscripción (Representante o alumna mayor de 18 años)", 14, currentY);
      doc.setFont("helvetica", "normal");
      currentY += 10;

      doc.setFontSize(9);
      const rules = [
        "- Los pagos de las mensualidades deben ser realizados los primeros 5 días de cada mes.",
        "- La mensualidad pagada de un mes no puede ser transferida a otro, aunque la alumna no haya asistido al mes pagado.",
        "- Con previo justificativo de la inasistencia (constancia médica o causa mayor) se puede exonerar el pago si la inasistencia es de 1 a 2 meses. Tiene los primeros 10 días del mes para notificar.",
        "- Después de 1 mes de inasistencia sin pago de mensualidad y sin aviso justificado, se debe pagar inscripción nuevamente.",
        "- La academia trabaja todo el año. Solo se dan unas semanas en los festivos decembrinos.",
        "- Se debe pagar las mensualidades de agosto y diciembre.",
        "- Por cada año vencido se paga la inscripción anual (Reinscripción).",
        "- Puntualidad en la hora de entrada; preferiblemente llegar 5 min antes de la hora de clase.",
        "- El uniforme es: leggins negro, franela con logo (se adquiere en la academia) y para los eventos batola con logo y nombre de cada alumna (se adquiere en la academia).",
        "- No se permiten representantes ni acompañantes dentro del salón de clases.",
        "- No estacionar, ni esperar a las alumnas en la acera frente de la casa donde funciona la academia.",
        "- Si sólo van a dejar o buscar a la alumna, deben realizarlo en el sentido de la flecha, tratando de no obstaculizar el tráfico.",
      ];

      rules.forEach((rule) => {
        doc.text(rule, 14, currentY);
        currentY += 6;
      });

      currentY += 10;

      // Firma y fecha
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Firma del representante o alumna de 18 años:", 14, currentY);
      doc.setFont("helvetica", "normal");
      currentY += 10;
      doc.text("_______________________________________________________________________________", 14, currentY);
      currentY += 15;

      doc.setFont("helvetica", "bold");
      doc.text("Fecha de inscripción:", 14, currentY);
      doc.setFont("helvetica", "normal");
      currentY += 10;
      doc.text(`______________________________ (${new Date().toLocaleDateString()})`, 14, currentY);

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

        {/* Logo y Título */}
        <Box sx={{ display: "flex", alignItems: "flex-start", mb: 4 }}>
          <Box sx={{ mr: 3 }}>
            <Image 
              src="/logo-bellydance-project.png" 
              alt="Logo Bellydance Project" 
              width={80} 
              height={80}
            />
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              Planilla de Inscripción
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Bellydance Project - Academia de Baile
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Datos de la Alumna */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Datos de la Alumna:
          </Typography>
          <Box sx={{ display: "grid", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography sx={{ minWidth: 200, fontWeight: 500 }}>
                Nombres y Apellidos:
              </Typography>
              <Typography sx={{ borderBottom: "1px solid #ccc", flexGrow: 1, px: 1 }}>
                {user.nombre || ""} {user.apellido || ""}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography sx={{ minWidth: 200, fontWeight: 500 }}>
                CI:
              </Typography>
              <Typography sx={{ borderBottom: "1px solid #ccc", flexGrow: 1, px: 1 }}>
                {user.cedula || ""}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography sx={{ minWidth: 200, fontWeight: 500 }}>
                Fecha de nacimiento:
              </Typography>
              <Typography sx={{ borderBottom: "1px solid #ccc", flexGrow: 1, px: 1 }}>
                {user.fechaNacimiento ? new Date(user.fechaNacimiento).toLocaleDateString() : ""}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography sx={{ minWidth: 200, fontWeight: 500 }}>
                Edad:
              </Typography>
              <Typography sx={{ borderBottom: "1px solid #ccc", flexGrow: 1, px: 1 }}>
                {user.edad || ""}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography sx={{ minWidth: 200, fontWeight: 500 }}>
                Dirección:
              </Typography>
              <Typography sx={{ borderBottom: "1px solid #ccc", flexGrow: 1, px: 1 }}>
                {user.direccion || ""}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Datos del representante */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Datos del representante (en caso de ser menor de edad la alumna):
          </Typography>
          <Box sx={{ display: "grid", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography sx={{ minWidth: 250, fontWeight: 500 }}>
                Nombres y Apellidos del Representante:
              </Typography>
              <Typography sx={{ borderBottom: "1px solid #ccc", flexGrow: 1, px: 1 }}>
                ________________________________
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography sx={{ minWidth: 250, fontWeight: 500 }}>
                CI:
              </Typography>
              <Typography sx={{ borderBottom: "1px solid #ccc", flexGrow: 1, px: 1 }}>
                ________________________________
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography sx={{ minWidth: 250, fontWeight: 500 }}>
                Teléfono:
              </Typography>
              <Typography sx={{ borderBottom: "1px solid #ccc", flexGrow: 1, px: 1 }}>
                ________________________________
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Observaciones */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Observaciones:
          </Typography>
          <Box sx={{ borderBottom: "1px solid #ccc", minHeight: 40, mb: 1 }} />
          <Box sx={{ borderBottom: "1px solid #ccc", minHeight: 40 }} />
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Compromiso de Inscripción */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Compromiso de Inscripción (Representante o alumna mayor de 18 años)
          </Typography>
          <Box sx={{ display: "grid", gap: 1, fontSize: "0.875rem" }}>
            <Typography>- Los pagos de las mensualidades deben ser realizados los primeros 5 días de cada mes.</Typography>
            <Typography>- La mensualidad pagada de un mes no puede ser transferida a otro, aunque la alumna no haya asistido al mes pagado.</Typography>
            <Typography sx={{ fontWeight: 500 }}>- Con previo justificativo de la inasistencia (constancia médica o causa mayor) se puede exonerar el pago si la inasistencia es de 1 a 2 meses. Tiene los primeros 10 días del mes para notificar.</Typography>
            <Typography>- Después de 1 mes de inasistencia sin pago de mensualidad y sin aviso justificado, se debe pagar inscripción nuevamente.</Typography>
            <Typography>- La academia trabaja todo el año. Solo se dan unas semanas en los festivos decembrinos.</Typography>
            <Typography>- Se debe pagar las mensualidades de agosto y diciembre.</Typography>
            <Typography>- Por cada año vencido se paga la inscripción anual (Reinscripción).</Typography>
            <Typography>- Puntualidad en la hora de entrada; preferiblemente llegar 5 min antes de la hora de clase.</Typography>
            <Typography>- El uniforme es: leggins negro, franela con logo (se adquiere en la academia) y para los eventos batola con logo y nombre de cada alumna (se adquiere en la academia).</Typography>
            <Typography>- No se permiten representantes ni acompañantes dentro del salón de clases.</Typography>
            <Typography>- No estacionar, ni esperar a las alumnas en la acera frente de la casa donde funciona la academia.</Typography>
            <Typography>- Si sólo van a dejar o buscar a la alumna, deben realizarlo en el sentido de la flecha, tratando de no obstaculizar el tráfico.</Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Firma y fecha */}
        <Box sx={{ mt: 6 }}>
          <Typography sx={{ fontWeight: 700, mb: 2 }}>
            Firma del representante o alumna de 18 años:
          </Typography>
          <Box sx={{ borderBottom: "1px solid #ccc", minHeight: 40, mb: 4 }} />
          
          <Typography sx={{ fontWeight: 700, mb: 2 }}>
            Fecha de inscripción:
          </Typography>
          <Typography sx={{ borderBottom: "1px solid #ccc", display: "inline-block", minWidth: 200, px: 1 }}>
            {new Date().toLocaleDateString()}
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
