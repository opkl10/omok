-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "theme" TEXT,
ADD COLUMN     "themeType" TEXT DEFAULT 'color',
ADD COLUMN     "uniqueIdentifier" TEXT;

-- Update existing posts with unique identifiers
UPDATE "Post" SET "uniqueIdentifier" = gen_random_uuid() WHERE "uniqueIdentifier" IS NULL;

-- Make uniqueIdentifier required and unique
ALTER TABLE "Post" ALTER COLUMN "uniqueIdentifier" SET NOT NULL,
ADD CONSTRAINT "Post_uniqueIdentifier_key" UNIQUE ("uniqueIdentifier");
