"use client";
import React from "react";
import Button from "@mui/material/Button";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useRouter } from "next/navigation";

type Props = {
  label?: string;
};

export default function BackButton({ label = "Inicio" }: Props) {
  const router = useRouter();
  return (
    <Button
      startIcon={<ArrowBackIcon />}
      variant="outlined"
      onClick={() => router.push("/")}
    >
      {label}
    </Button>
  );
}
