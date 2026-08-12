-- AlterTable
ALTER TABLE "public"."Habit" ADD COLUMN     "cue" TEXT,
ADD COLUMN     "cueTime" TEXT,
ADD COLUMN     "intrinsic" BOOLEAN NOT NULL DEFAULT false;
