export class KakeiboError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.code = code;
    this.details = details;
    this.name = 'KakeiboError';
  }
}

export const handleDatabaseError = (error) => {
  if (error.code === '23505') { // Unique violation
    throw new KakeiboError('Duplicate entry found', 'DUPLICATE_ENTRY', error);
  }
  if (error.code === '23503') { // Foreign key violation
    throw new KakeiboError('Referenced record not found', 'FOREIGN_KEY_ERROR', error);
  }
  throw new KakeiboError('Database error occurred', 'DATABASE_ERROR', error);
}; 