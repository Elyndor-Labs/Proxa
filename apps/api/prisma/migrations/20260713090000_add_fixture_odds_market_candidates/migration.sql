-- Extend fixture metadata so API data can be tied back to external sports providers.
ALTER TABLE "Fixture"
ADD COLUMN "externalSource" TEXT NOT NULL DEFAULT 'txodds',
ADD COLUMN "externalId" TEXT,
ADD COLUMN "sport" TEXT NOT NULL DEFAULT 'football',
ADD COLUMN "country" TEXT,
ADD COLUMN "status" TEXT NOT NULL DEFAULT 'scheduled',
ADD COLUMN "lastSyncedAt" TIMESTAMP(3);

-- Keep on-chain markets linkable to provider-side market metadata.
ALTER TABLE "Market"
ADD COLUMN "title" TEXT,
ADD COLUMN "marketType" TEXT NOT NULL DEFAULT 'stat_bucket',
ADD COLUMN "externalMarketId" TEXT,
ADD COLUMN "onChainAddress" TEXT;

CREATE UNIQUE INDEX "Fixture_externalId_key" ON "Fixture"("externalId");
CREATE INDEX "Market_fixtureId_idx" ON "Market"("fixtureId");
CREATE INDEX "Market_status_idx" ON "Market"("status");

CREATE TABLE "MarketCandidate" (
  "id" TEXT NOT NULL,
  "fixtureId" INTEGER NOT NULL,
  "source" TEXT NOT NULL DEFAULT 'txodds',
  "sourceMarketId" TEXT,
  "statKey" INTEGER,
  "statLabel" TEXT NOT NULL,
  "marketType" TEXT NOT NULL DEFAULT 'stat_bucket',
  "title" TEXT NOT NULL,
  "numBuckets" INTEGER NOT NULL DEFAULT 2,
  "status" TEXT NOT NULL DEFAULT 'candidate',
  "startsAt" TIMESTAMP(3),
  "onChainMarketId" INTEGER,
  "raw" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "MarketCandidate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OddsSnapshot" (
  "id" TEXT NOT NULL,
  "fixtureId" INTEGER NOT NULL,
  "provider" TEXT NOT NULL DEFAULT 'txodds',
  "marketKey" TEXT NOT NULL,
  "marketName" TEXT NOT NULL,
  "selection" TEXT NOT NULL,
  "priceDecimal" DOUBLE PRECISION,
  "impliedProbability" DOUBLE PRECISION,
  "raw" JSONB,
  "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "OddsSnapshot_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "MarketCandidate_fixtureId_status_idx" ON "MarketCandidate"("fixtureId", "status");
CREATE INDEX "MarketCandidate_source_sourceMarketId_idx" ON "MarketCandidate"("source", "sourceMarketId");
CREATE INDEX "OddsSnapshot_fixtureId_marketKey_idx" ON "OddsSnapshot"("fixtureId", "marketKey");
CREATE INDEX "OddsSnapshot_provider_capturedAt_idx" ON "OddsSnapshot"("provider", "capturedAt");

ALTER TABLE "MarketCandidate"
ADD CONSTRAINT "MarketCandidate_fixtureId_fkey"
FOREIGN KEY ("fixtureId") REFERENCES "Fixture"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "MarketCandidate"
ADD CONSTRAINT "MarketCandidate_onChainMarketId_fkey"
FOREIGN KEY ("onChainMarketId") REFERENCES "Market"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "OddsSnapshot"
ADD CONSTRAINT "OddsSnapshot_fixtureId_fkey"
FOREIGN KEY ("fixtureId") REFERENCES "Fixture"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
