-- CreateTable
CREATE TABLE "organizations" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integrations_instagram" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "igAccountId" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "accessTokenEncrypted" TEXT NOT NULL,
    "tokenExpiresAt" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "integrations_instagram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incoming_events" (
    "id" UUID NOT NULL,
    "orgId" UUID,
    "integrationId" UUID,
    "source" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "externalEventId" TEXT NOT NULL,
    "actorIgUserId" TEXT,
    "postId" TEXT,
    "threadId" TEXT,
    "text" TEXT,
    "raw" JSONB NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "incoming_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "integrations_instagram_orgId_idx" ON "integrations_instagram"("orgId");

-- CreateIndex
CREATE INDEX "integrations_instagram_igAccountId_idx" ON "integrations_instagram"("igAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "incoming_events_source_externalEventId_key" ON "incoming_events"("source", "externalEventId");

-- CreateIndex
CREATE INDEX "incoming_events_orgId_idx" ON "incoming_events"("orgId");

-- CreateIndex
CREATE INDEX "incoming_events_integrationId_idx" ON "incoming_events"("integrationId");

-- AddForeignKey
ALTER TABLE "integrations_instagram" ADD CONSTRAINT "integrations_instagram_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incoming_events" ADD CONSTRAINT "incoming_events_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incoming_events" ADD CONSTRAINT "incoming_events_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "integrations_instagram"("id") ON DELETE SET NULL ON UPDATE CASCADE;
