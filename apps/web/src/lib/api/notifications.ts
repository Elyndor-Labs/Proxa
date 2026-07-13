import { apiJson, apiParse } from "@/lib/api/client";
import { notificationListSchema, notificationSchema } from "@/lib/api/schemas";
import type { Notification } from "@/lib/api/types";

/** GET /notifications/:wallet */
export async function fetchNotifications(wallet: string): Promise<Notification[]> {
  const data = await apiParse(`/notifications/${wallet}`, notificationListSchema);
  return data.data;
}

/** PATCH /notifications/:id/read */
export async function markNotificationRead(id: string, wallet: string): Promise<Notification> {
  const json = await apiJson(`/notifications/${id}/read`, {
    method: "PATCH",
    body: JSON.stringify({ wallet }),
  });
  return notificationSchema.parse(json);
}
