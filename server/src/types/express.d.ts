// Augment Express Request with user
declare namespace Express {
  export interface Request {
    user?: { id: number };
  }
}
