/*
  Warnings:

  - You are about to drop the column `stripeCheckoutSessionId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `stripePaymentIntentId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `stripePriceId` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `stripeSubscriptionId` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `stripeEventId` on the `WebhookEvent` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[razorpayPaymentId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[razorpayPlanId]` on the table `Plan` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[razorpaySubscriptionId]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[razorpayEventId]` on the table `WebhookEvent` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Payment_stripeCheckoutSessionId_key";

-- DropIndex
DROP INDEX "Payment_stripePaymentIntentId_key";

-- DropIndex
DROP INDEX "Plan_stripePriceId_key";

-- DropIndex
DROP INDEX "Subscription_stripeSubscriptionId_key";

-- DropIndex
DROP INDEX "WebhookEvent_stripeEventId_key";

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "stripeCheckoutSessionId",
DROP COLUMN "stripePaymentIntentId",
ADD COLUMN     "razorpayPaymentId" TEXT;

-- AlterTable
ALTER TABLE "Plan" DROP COLUMN "stripePriceId",
ADD COLUMN     "razorpayPlanId" TEXT;

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "stripeSubscriptionId",
ADD COLUMN     "razorpaySubscriptionId" TEXT;

-- AlterTable
ALTER TABLE "WebhookEvent" DROP COLUMN "stripeEventId",
ADD COLUMN     "razorpayEventId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Payment_razorpayPaymentId_key" ON "Payment"("razorpayPaymentId");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_razorpayPlanId_key" ON "Plan"("razorpayPlanId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_razorpaySubscriptionId_key" ON "Subscription"("razorpaySubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "WebhookEvent_razorpayEventId_key" ON "WebhookEvent"("razorpayEventId");
