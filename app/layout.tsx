import "./globals.css";
import React from "react";
import Layout from "@/components/organisms/Layout";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SessionProviderClient from "@/providers/SessionProviderClient";

export const metadata = {
  title: "Bellydance Project Academy",
  description: "Gestión de inscripciones y clases para Bellydance Project",
  icons: {
    icon: "/Logo_UDO.svg",
    shortcut: "/Logo_UDO.svg",
    apple: "/Logo_UDO.svg",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions as any);
  return (
    <html lang="es">
      <body>
        <SessionProviderClient session={session}>
          <Layout>{children}</Layout>
        </SessionProviderClient>
      </body>
    </html>
  );
}
