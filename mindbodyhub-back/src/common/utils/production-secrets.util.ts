const WEAK_JWT_SECRETS = new Set([
  '',
  'secret',
  'changeme',
  'change-me',
  'jwt-secret',
  'access-secret',
]);

const WEAK_DB_PASSWORDS = new Set(['', 'devpassword', 'password', 'postgres']);

const WEAK_MINIO_KEYS = new Set(['', 'minioadmin', 'admin', 'password']);

/**
 * Refuse to start in production with missing/weak secrets or dev defaults.
 * Call once from bootstrap before listen().
 */
export function assertProductionSecrets(env: NodeJS.ProcessEnv = process.env): void {
  if (env.NODE_ENV !== 'production') {
    return;
  }

  const errors: string[] = [];

  const jwt = (env.JWT_ACCESS_SECRET ?? '').trim();
  if (!jwt || WEAK_JWT_SECRETS.has(jwt.toLowerCase()) || jwt.length < 32) {
    errors.push(
      'JWT_ACCESS_SECRET must be set to a strong secret (min 32 chars) in production',
    );
  }

  const dbPassword = (env.DB_PASSWORD ?? '').trim();
  if (!dbPassword || WEAK_DB_PASSWORDS.has(dbPassword.toLowerCase())) {
    errors.push('DB_PASSWORD must be set to a non-default value in production');
  }

  const minioAccess = (env.MINIO_ACCESS_KEY ?? '').trim();
  const minioSecret = (env.MINIO_SECRET_KEY ?? '').trim();
  if (
    !minioAccess ||
    !minioSecret ||
    WEAK_MINIO_KEYS.has(minioAccess.toLowerCase()) ||
    WEAK_MINIO_KEYS.has(minioSecret.toLowerCase())
  ) {
    errors.push(
      'MINIO_ACCESS_KEY / MINIO_SECRET_KEY must be set to non-default values in production',
    );
  }

  if (errors.length > 0) {
    throw new Error(
      `Refusing to start in production:\n- ${errors.join('\n- ')}`,
    );
  }
}
