import { prisma } from "../db";
import { Router, Request, Response } from "express";

export const notificationsRouter: Router = Router();

// GET /notifications/:wallet — all notifications for a wallet
notificationsRouter.get("/:wallet", async (req: Request, res: Response) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { wallet: req.params.wallet },
      orderBy: { createdAt: "desc" },
    });
    res.json({ data: notifications });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /notifications/:id/read — mark as read (ownership check)
notificationsRouter.patch("/:id/read", async (req: Request, res: Response) => {
  try {
    const { wallet } = req.body;

    if (!wallet) {
      res.status(400).json({ error: "wallet is required in request body" });
      return;
    }

    // verify ownership before updating
    const existing = await prisma.notification.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      res.status(404).json({ error: "Notification not found" });
      return;
    }

    if (existing.wallet !== wallet) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const notification = await prisma.notification.update({
      where: { id: req.params.id },
      data: { read: true },
    });
    res.json(notification);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
