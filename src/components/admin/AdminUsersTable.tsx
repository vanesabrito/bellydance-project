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
import { roleLabel } from "@/utils/roles";
import { useRefreshOnFocus } from "@/hooks/useRefreshOnFocus";

type AdminUser = {
  id: string;
  email: string;
  role: "ADMIN" | "COORDINATOR" | "INSTRUCTOR" | "STUDENT";
  createdAt: string;
};

export default function AdminUsersTable() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          {isLoading && <CircularProgress size={20} />}
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
              </TableRow>
            ))}
            {users.length === 0 && !isLoading && (
              <TableRow>
                <TableCell colSpan={3}>No hay usuarios.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
}
