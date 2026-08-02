-- CreateTable
CREATE TABLE "public"."translation_cache" (
    "id" TEXT NOT NULL,
    "source_text_hash" VARCHAR(64) NOT NULL,
    "source_text" TEXT NOT NULL,
    "target_lang" VARCHAR(5) NOT NULL,
    "translated_text" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "translation_cache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "translation_cache_target_lang_idx" ON "public"."translation_cache"("target_lang");

-- CreateIndex
CREATE UNIQUE INDEX "translation_cache_source_text_hash_target_lang_key" ON "public"."translation_cache"("source_text_hash", "target_lang");
