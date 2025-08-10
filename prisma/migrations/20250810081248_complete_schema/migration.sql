/*
  Warnings:

  - You are about to drop the column `lastTriggered` on the `Alert` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Alert` table. All the data in the column will be lost.
  - Added the required column `message` to the `Alert` table without a default value. This is not possible if the table is not empty.
  - Added the required column `provider` to the `Alert` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Alert` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `Alert` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('COST_THRESHOLD_WARNING', 'COST_THRESHOLD_CRITICAL', 'COST_THRESHOLD_EXCEEDED', 'DAILY_COST_SPIKE', 'UNUSUAL_SPENDING_PATTERN', 'API_RATE_LIMIT_WARNING', 'API_RATE_LIMIT_EXCEEDED', 'USAGE_QUOTA_WARNING', 'USAGE_QUOTA_EXCEEDED', 'MODEL_DEPRECATION', 'API_KEY_EXPIRING', 'API_KEY_EXPIRED', 'PROVIDER_OUTAGE', 'INTEGRATION_FAILURE', 'PAYMENT_FAILED', 'SUBSCRIPTION_EXPIRING', 'NEW_TEAM_MEMBER', 'MEMBER_EXCEEDED_LIMIT', 'SUSPICIOUS_ACTIVITY', 'WEEKLY_COST_REPORT', 'MONTHLY_COST_REPORT', 'OPTIMIZATION_RECOMMENDATIONS');

-- CreateEnum
CREATE TYPE "public"."ChannelType" AS ENUM ('EMAIL', 'SMS', 'SLACK', 'TEAMS', 'WEBHOOK', 'IN_APP', 'PUSH', 'PAGERDUTY');

-- CreateEnum
CREATE TYPE "public"."NotificationStatus" AS ENUM ('PENDING', 'QUEUED', 'SENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "public"."NotificationPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "public"."BudgetPeriod" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY');

-- AlterTable
ALTER TABLE "public"."Alert" DROP COLUMN "lastTriggered",
DROP COLUMN "name",
ADD COLUMN     "message" TEXT NOT NULL,
ADD COLUMN     "metadata" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "provider" TEXT NOT NULL,
ADD COLUMN     "triggeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" TEXT NOT NULL,
ALTER COLUMN "threshold" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "emailVerified" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "public"."Usage" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "inputTokens" INTEGER NOT NULL DEFAULT 0,
    "outputTokens" INTEGER NOT NULL DEFAULT 0,
    "totalTokens" INTEGER NOT NULL DEFAULT 0,
    "cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "requestId" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "userId" TEXT NOT NULL,

    CONSTRAINT "Usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "public"."NotificationRule" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "public"."NotificationType" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "conditions" JSONB NOT NULL,
    "threshold" DOUBLE PRECISION,
    "comparisonOp" TEXT,
    "timeWindow" INTEGER,
    "schedule" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "cooldownMinutes" INTEGER NOT NULL DEFAULT 60,
    "maxPerDay" INTEGER NOT NULL DEFAULT 10,
    "lastTriggeredAt" TIMESTAMP(3),
    "triggerCount" INTEGER NOT NULL DEFAULT 0,
    "priority" "public"."NotificationPriority" NOT NULL DEFAULT 'MEDIUM',
    "tags" TEXT[],
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."NotificationChannel" (
    "id" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "type" "public"."ChannelType" NOT NULL,
    "destination" TEXT NOT NULL,
    "config" JSONB,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "includeDetails" BOOLEAN NOT NULL DEFAULT true,
    "format" TEXT NOT NULL DEFAULT 'html',

    CONSTRAINT "NotificationChannel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" TEXT NOT NULL,
    "ruleId" TEXT,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "type" "public"."NotificationType" NOT NULL,
    "priority" "public"."NotificationPriority" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "status" "public"."NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "channels" JSONB NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastAttemptAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "readAt" TIMESTAMP(3),
    "acknowledgedAt" TIMESTAMP(3),
    "error" TEXT,
    "errorDetails" JSONB,
    "groupId" TEXT,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."NotificationPreferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
    "smsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "pushEnabled" BOOLEAN NOT NULL DEFAULT true,
    "inAppEnabled" BOOLEAN NOT NULL DEFAULT true,
    "slackEnabled" BOOLEAN NOT NULL DEFAULT false,
    "teamsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "quietHoursEnabled" BOOLEAN NOT NULL DEFAULT false,
    "quietHoursStart" TEXT,
    "quietHoursEnd" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "weekendQuiet" BOOLEAN NOT NULL DEFAULT false,
    "batchEmails" BOOLEAN NOT NULL DEFAULT false,
    "batchFrequency" TEXT NOT NULL DEFAULT 'daily',
    "nextBatchAt" TIMESTAMP(3),
    "emailDigest" BOOLEAN NOT NULL DEFAULT true,
    "slackDM" BOOLEAN NOT NULL DEFAULT false,
    "preferredChannel" "public"."ChannelType" NOT NULL DEFAULT 'EMAIL',
    "costAlerts" BOOLEAN NOT NULL DEFAULT true,
    "usageAlerts" BOOLEAN NOT NULL DEFAULT true,
    "systemAlerts" BOOLEAN NOT NULL DEFAULT true,
    "teamAlerts" BOOLEAN NOT NULL DEFAULT true,
    "reports" BOOLEAN NOT NULL DEFAULT true,
    "recommendations" BOOLEAN NOT NULL DEFAULT true,
    "autoEscalate" BOOLEAN NOT NULL DEFAULT false,
    "escalateAfterMinutes" INTEGER NOT NULL DEFAULT 30,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."NotificationTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "public"."NotificationType" NOT NULL,
    "channel" "public"."ChannelType" NOT NULL,
    "subject" TEXT,
    "bodyTemplate" TEXT NOT NULL,
    "bodyHtml" TEXT,
    "variables" JSONB NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "brand" JSONB,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."NotificationLog" (
    "id" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "channel" "public"."ChannelType" NOT NULL,
    "status" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "attemptNumber" INTEGER NOT NULL,
    "requestData" JSONB,
    "responseData" JSONB,
    "error" TEXT,
    "latencyMs" INTEGER,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Budget" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "spent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "period" "public"."BudgetPeriod" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "alertThreshold" DOUBLE PRECISION NOT NULL DEFAULT 0.8,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Budget_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Usage_userId_timestamp_idx" ON "public"."Usage"("userId", "timestamp");

-- CreateIndex
CREATE INDEX "Usage_provider_timestamp_idx" ON "public"."Usage"("provider", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "public"."Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "public"."VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "public"."VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "NotificationRule_userId_enabled_idx" ON "public"."NotificationRule"("userId", "enabled");

-- CreateIndex
CREATE INDEX "NotificationRule_organizationId_type_idx" ON "public"."NotificationRule"("organizationId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationChannel_ruleId_type_destination_key" ON "public"."NotificationChannel"("ruleId", "type", "destination");

-- CreateIndex
CREATE INDEX "Notification_userId_status_createdAt_idx" ON "public"."Notification"("userId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_organizationId_type_createdAt_idx" ON "public"."Notification"("organizationId", "type", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_groupId_idx" ON "public"."Notification"("groupId");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPreferences_userId_key" ON "public"."NotificationPreferences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationTemplate_name_key" ON "public"."NotificationTemplate"("name");

-- CreateIndex
CREATE INDEX "NotificationTemplate_type_channel_idx" ON "public"."NotificationTemplate"("type", "channel");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationTemplate_type_channel_locale_isDefault_key" ON "public"."NotificationTemplate"("type", "channel", "locale", "isDefault");

-- CreateIndex
CREATE INDEX "NotificationLog_notificationId_idx" ON "public"."NotificationLog"("notificationId");

-- CreateIndex
CREATE INDEX "NotificationLog_timestamp_idx" ON "public"."NotificationLog"("timestamp");

-- CreateIndex
CREATE INDEX "Budget_organizationId_isActive_idx" ON "public"."Budget"("organizationId", "isActive");

-- AddForeignKey
ALTER TABLE "public"."Usage" ADD CONSTRAINT "Usage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NotificationRule" ADD CONSTRAINT "NotificationRule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NotificationRule" ADD CONSTRAINT "NotificationRule_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NotificationChannel" ADD CONSTRAINT "NotificationChannel_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "public"."NotificationRule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "public"."NotificationRule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NotificationPreferences" ADD CONSTRAINT "NotificationPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Budget" ADD CONSTRAINT "Budget_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
