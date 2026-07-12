-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "Market"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
