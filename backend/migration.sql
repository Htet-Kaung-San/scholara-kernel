-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('STUDENT', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "user_status" AS ENUM ('ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "education_level" AS ENUM ('HIGH_SCHOOL', 'BACHELORS', 'MASTERS', 'PHD');

-- CreateEnum
CREATE TYPE "scholarship_status" AS ENUM ('OPEN', 'CLOSED', 'UPCOMING', 'DRAFT');

-- CreateEnum
CREATE TYPE "scholarship_type" AS ENUM ('GOVERNMENT', 'UNIVERSITY', 'PRIVATE', 'NGO');

-- CreateEnum
CREATE TYPE "application_status" AS ENUM ('DRAFT', 'PENDING_DOCUMENTS', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "document_type" AS ENUM ('TRANSCRIPT', 'RECOMMENDATION', 'ESSAY', 'CERTIFICATE', 'ID_DOCUMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "notification_type" AS ENUM ('SUCCESS', 'INFO', 'WARNING', 'ALERT');

-- CreateEnum
CREATE TYPE "notification_category" AS ENUM ('SCHOLARSHIP', 'APPLICATION', 'REMINDER', 'ACHIEVEMENT', 'SYSTEM');

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL,
    "auth_id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "role" "user_role" NOT NULL DEFAULT 'STUDENT',
    "status" "user_status" NOT NULL DEFAULT 'ACTIVE',
    "nationality" TEXT,
    "residing_country" TEXT,
    "date_of_birth" DATE,
    "current_institution" TEXT,
    "education_level" "education_level",
    "interests" TEXT[],
    "onboarding_completed" BOOLEAN NOT NULL DEFAULT false,
    "personal_statement" TEXT,
    "study_plan" TEXT,
    "achievements" TEXT[],
    "highlights" TEXT[],
    "organizations" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scholarships" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image_url" TEXT,
    "status" "scholarship_status" NOT NULL DEFAULT 'UPCOMING',
    "level" TEXT NOT NULL,
    "duration" TEXT,
    "deadline" TIMESTAMP(3),
    "value" TEXT NOT NULL,
    "field_of_study" TEXT NOT NULL,
    "type" "scholarship_type" NOT NULL DEFAULT 'GOVERNMENT',
    "eligibility" JSONB,
    "benefits" JSONB,
    "requirements" JSONB,
    "timeline" JSONB,
    "created_by_id" UUID,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scholarships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "scholarship_id" UUID NOT NULL,
    "status" "application_status" NOT NULL DEFAULT 'DRAFT',
    "essays" JSONB,
    "score" INTEGER,
    "admin_notes" TEXT,
    "submitted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "application_id" UUID,
    "name" TEXT NOT NULL,
    "type" "document_type" NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_size" INTEGER,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" "notification_type" NOT NULL,
    "category" "notification_category" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_auth_id_key" ON "profiles"("auth_id");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_email_key" ON "profiles"("email");

-- CreateIndex
CREATE INDEX "scholarships_status_idx" ON "scholarships"("status");

-- CreateIndex
CREATE INDEX "scholarships_country_idx" ON "scholarships"("country");

-- CreateIndex
CREATE INDEX "scholarships_deadline_idx" ON "scholarships"("deadline");

-- CreateIndex
CREATE INDEX "applications_status_idx" ON "applications"("status");

-- CreateIndex
CREATE UNIQUE INDEX "applications_user_id_scholarship_id_key" ON "applications"("user_id", "scholarship_id");

-- CreateIndex
CREATE INDEX "documents_user_id_idx" ON "documents"("user_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_idx" ON "notifications"("user_id", "is_read");

-- CreateIndex
CREATE INDEX "notifications_created_at_idx" ON "notifications"("created_at");

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_scholarship_id_fkey" FOREIGN KEY ("scholarship_id") REFERENCES "scholarships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

