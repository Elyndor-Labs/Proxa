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

// PATCH /notifications/:id/read — mark as read
notificationsRouter.patch("/:id/read", async (req: Request, res: Response) => {
  try {
    const notification = await prisma.notification.update({
      where: { id: req.params.id },
      data: { read: true },
    });
    res.json(notification);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
