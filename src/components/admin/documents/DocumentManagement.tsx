"use client";
import React, { useState } from "react";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import DocumentReception from "./DocumentReception";
import DocumentDelivery from "./DocumentDelivery";
import DocumentHistory from "./DocumentHistory";

function TabPanel({ children, value, index }: { children: React.ReactNode; value: number; index: number }) {
  return (
    <div role="tabpanel" hidden={value !== index} id={`tabpanel-${index}`}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function DocumentManagement() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tab label="Recepción de Documentos" />
        <Tab label="Entrega de Documentos" />
        <Tab label="Historial Documental" />
      </Tabs>
      <TabPanel value={tabValue} index={0}>
        <DocumentReception />
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <DocumentDelivery />
      </TabPanel>
      <TabPanel value={tabValue} index={2}>
        <DocumentHistory />
      </TabPanel>
    </Box>
  );
}
