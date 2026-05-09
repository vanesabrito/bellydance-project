import pkg from "pg";
const { Pool } = pkg;

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/student_docs";

export const pool = new Pool({ connectionString });

export async function query(text: string, params?: any[]) {
  const res = await pool.query(text, params);
  return res;
}
