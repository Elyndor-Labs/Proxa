-- Preflight: remove orphaned Notification rows before adding FK constraint
DELETE FROM "Notification"
WHERE "marketId" IS NOT NULL
  AND "marketId" NOT IN (SELECT "id" FROM "Market");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "Market"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
