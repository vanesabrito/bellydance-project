import CredentialsProvider from "next-auth/providers/credentials";
import NextAuth from "next-auth";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;

export const authOptions: any = {
  secret: NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any) {
        if (!credentials) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user) return null;
        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;
        return { 
          id: user.id, 
          email: user.email, 
          role: user.role,
          nombre: user.nombre,
          apellido: user.apellido,
          cedula: user.cedula,
          fechaNacimiento: user.fechaNacimiento,
          edad: user.edad,
          direccion: user.direccion
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.nombre = user.nombre;
        token.apellido = user.apellido;
        token.cedula = user.cedula;
        token.fechaNacimiento = user.fechaNacimiento;
        token.edad = user.edad;
        token.direccion = user.direccion;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token) {
        session.user.role = token.role;
        session.user.id = token.id;
        session.user.nombre = token.nombre;
        session.user.apellido = token.apellido;
        session.user.cedula = token.cedula;
        session.user.fechaNacimiento = token.fechaNacimiento;
        session.user.edad = token.edad;
        session.user.direccion = token.direccion;
      }
      return session;
    },
  },
};

export default NextAuth(authOptions as any);
