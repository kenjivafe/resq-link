-- Create enums for incident lifecycle and severity
CREATE TYPE "IncidentStatus" AS ENUM ('pending', 'assigned', 'responding', 'resolved', 'escalated');
CREATE TYPE "IncidentSeverity" AS ENUM ('low', 'medium', 'high', 'critical');

-- Create Incident table
CREATE TABLE "Incident" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "type" TEXT NOT NULL,
    "description" TEXT,
    "latitude" DECIMAL(9, 6),
    "longitude" DECIMAL(9, 6),
    "address" TEXT,
    "status" "IncidentStatus" NOT NULL DEFAULT 'pending',
    "severity" "IncidentSeverity" NOT NULL DEFAULT 'medium',
    "reporterId" TEXT,
    "deviceFingerprint" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX "Incident_status_updatedAt_idx" ON "Incident" ("status", "updatedAt");
CREATE INDEX "Incident_latitude_longitude_idx" ON "Incident" ("latitude", "longitude");

-- Trigger to manage updatedAt column
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER incident_set_updated_at
BEFORE UPDATE ON "Incident"
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- Create RateLimitRecord table
CREATE TABLE "RateLimitRecord" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "deviceFingerprint" TEXT UNIQUE,
    "ipHash" TEXT NOT NULL,
    "windowStart" TIMESTAMPTZ NOT NULL,
    "requestCount" INTEGER NOT NULL,
    "captchaRequired" BOOLEAN NOT NULL DEFAULT FALSE,
    "lastAttemptAt" TIMESTAMPTZ NOT NULL
);

CREATE INDEX "RateLimitRecord_ipHash_idx" ON "RateLimitRecord" ("ipHash");
