/**
 * Single source of truth for database connection URL.
 * Use DATABASE_URL if set (non-empty); otherwise build from DB_* (all required).
 * Reused by Prisma CLI (prisma.config.ts) and runtime (PrismaService).
 */
export function getDatabaseUrl(env: Record<string, string | undefined>): string {
  const databaseUrl = env.DATABASE_URL?.trim();
  if (databaseUrl) {
    return databaseUrl;
  }

  const host = env.DB_HOST;
  const port = env.DB_PORT ?? '5432';
  const username = env.DB_USERNAME;
  const password = env.DB_PASSWORD;
  const dbName = env.DB_NAME;

  const missing: string[] = [];
  if (host === undefined || host === '') missing.push('DB_HOST');
  if (port === undefined || port === '') missing.push('DB_PORT');
  if (username === undefined || username === '') missing.push('DB_USERNAME');
  if (password === undefined) missing.push('DB_PASSWORD');
  if (dbName === undefined || dbName === '') missing.push('DB_NAME');

  if (missing.length > 0) {
    throw new Error(
      `Database config: set DATABASE_URL or all of DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME. Missing: ${missing.join(', ')}.`,
    );
  }
  
  const encodedPassword = encodeURIComponent(password!);
  const encodedUsername = encodeURIComponent(username!);
  return `postgresql://${encodedUsername}:${encodedPassword}@${host}:${port}/${dbName}`;
}
