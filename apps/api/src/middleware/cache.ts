import { Request, Response, NextFunction } from "express";

interface CacheEntry {
  data: unknown;
  expiresAt: number;
}

const store = new Map<string, CacheEntry>();

export function cache(ttlMs = 10_000) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const key = req.originalUrl;
    const entry = store.get(key);

    if (entry && Date.now() < entry.expiresAt) {
      res.json(entry.data);
      return;
    }

    const originalJson = res.json.bind(res);
    res.json = (data: unknown) => {
      store.set(key, { data, expiresAt: Date.now() + ttlMs });
      return originalJson(data);
    };

    next();
  };
}
