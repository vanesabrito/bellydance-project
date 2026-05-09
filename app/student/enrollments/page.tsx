"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Chip from "@mui/material/Chip";
import { statusLabel, statusChipColor } from "@/utils/status";

interface Enrollment {
  id: string;
  status?: string;
  createdAt?: string;
  reviewNote?: string | null;
  reviewedAt?: string | null;
  className?: string | null;
}

export default function EnrollmentsPage() {
  const { data: session } = useSession();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/enrollments/my");
      if (!res.ok) return;
      const json = await res.json();
      if (json.ok) setEnrollments(json.enrollments);
    }
    load();
  }, []);

  if (!session) return <p>Debes iniciar sesión.</p>;

  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Paper sx={{ p: 4, borderRadius: 3 }} elevation={6}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 700 }}
        >
          Mis inscripciones
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Clase</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Nota</TableCell>
              <TableCell>Última revisión</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {enrollments.map((enrollment) => (
              <TableRow key={enrollment.id}>
                <TableCell>{enrollment.className ?? "—"}</TableCell>
                <TableCell>
                  <Chip
                    label={statusLabel(enrollment.status)}
                    color={statusChipColor(enrollment.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{enrollment.reviewNote || "—"}</TableCell>
                <TableCell>
                  {enrollment.reviewedAt
                    ? new Date(enrollment.reviewedAt).toLocaleString()
                    : "—"}
                </TableCell>
              </TableRow>
            ))}
            {enrollments.length === 0 && (
              <TableRow>
                <TableCell colSpan={4}>No tienes inscripciones aún.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
}
