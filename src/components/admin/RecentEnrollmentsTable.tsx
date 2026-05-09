"use client";
import React, { useMemo, useState } from "react";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { statusLabel, statusChipColor } from "@/utils/status";

type Enrollment = {
  id: string;
  className: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string | Date;
  student?: { email: string | null } | null;
};

export default function RecentEnrollmentsTable({ docs }: { docs: Enrollment[] }) {
  const [onlyPending, setOnlyPending] = useState(false);
  const visible = useMemo(() => {
    return onlyPending ? docs.filter((d) => d.status === "PENDING") : docs;
  }, [docs, onlyPending]);

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={onlyPending}
              onChange={(e) => setOnlyPending(e.target.checked)}
            />
          }
          label="Solo pendientes"
        />
      </Box>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Clase</TableCell>
            <TableCell>Alumno</TableCell>
            <TableCell>Estado</TableCell>
            <TableCell>Fecha</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {visible.map((d) => (
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
              <TableCell>{new Date(d.createdAt).toLocaleString()}</TableCell>
            </TableRow>
          ))}
          {visible.length === 0 && (
            <TableRow>
              <TableCell colSpan={4}>No hay inscripciones.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Box>
  );
}
