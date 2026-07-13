import { Request, Response, NextFunction } from "express";

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const expected = process.env.ADMIN_API_KEY;
  if (!expected) {
    res.status(503).json({ error: "Admin API is not configured" });
    return;
  }

  const provided = req.header("x-admin-key");
  if (provided !== expected) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  next();
}
