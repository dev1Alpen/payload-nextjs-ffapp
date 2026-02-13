import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('en', 'de');
  CREATE TYPE "public"."enum_users_roles" AS ENUM('admin', 'site-admin');
  CREATE TYPE "public"."enum_posts_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__posts_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__posts_v_published_locale" AS ENUM('en', 'de');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_published_locale" AS ENUM('en', 'de');
  CREATE TYPE "public"."enum_tasks_icon" AS ENUM('rescue', 'extinguish', 'recover', 'protect');
  CREATE TYPE "public"."enum_contact_status" AS ENUM('new', 'in_progress', 'resolved');
  CREATE TYPE "public"."enum_history_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__history_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__history_v_published_locale" AS ENUM('en', 'de');
  CREATE TYPE "public"."enum_kommando_team_members_card_media_media_type" AS ENUM('none', 'image', 'video');
  CREATE TYPE "public"."enum_clerk_team_members_card_media_media_type" AS ENUM('none', 'image', 'video');
  CREATE TYPE "public"."enum_active_members_team_members_card_media_media_type" AS ENUM('none', 'image', 'video');
  CREATE TYPE "public"."enum_fire_brigade_youth_team_members_card_media_media_type" AS ENUM('none', 'image', 'video');
  CREATE TYPE "public"."enum_reserve_team_members_card_media_media_type" AS ENUM('none', 'image', 'video');
  CREATE TYPE "public"."enum_gallery_media_type" AS ENUM('image', 'video', 'audio');
  CREATE TYPE "public"."enum_impressum_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__impressum_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__impressum_v_published_locale" AS ENUM('en', 'de');
  CREATE TYPE "public"."enum_datenschutz_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__datenschutz_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__datenschutz_v_published_locale" AS ENUM('en', 'de');
  CREATE TYPE "public"."enum_alert_top_bar_color" AS ENUM('red', 'yellow', 'orange', 'purple', 'green');
  CREATE TYPE "public"."enum_map_settings_map_type" AS ENUM('google', 'osm');
  CREATE TYPE "public"."enum_map_settings_display_mode" AS ENUM('all', 'first', 'switchable');
  CREATE TABLE "users_roles" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_users_roles",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"active" boolean DEFAULT true,
  	"icon" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "categories_locales" (
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"category_id" integer,
  	"featured_image_id" integer,
  	"published_date" timestamp(3) with time zone,
  	"author_id" integer,
  	"show_author" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_posts_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "posts_locales" (
  	"title" varchar,
  	"slug" varchar,
  	"content" jsonb,
  	"meta_meta_title" varchar,
  	"meta_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "posts_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "_posts_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_category_id" integer,
  	"version_featured_image_id" integer,
  	"version_published_date" timestamp(3) with time zone,
  	"version_author_id" integer,
  	"version_show_author" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__posts_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__posts_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_posts_v_locales" (
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_content" jsonb,
  	"version_meta_meta_title" varchar,
  	"version_meta_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_posts_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"is_top_item" boolean DEFAULT false,
  	"menu_parent_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "pages_locales" (
  	"menu_label" varchar,
  	"title" varchar,
  	"description" varchar,
  	"slug" varchar,
  	"content" jsonb,
  	"meta_meta_title" varchar,
  	"meta_meta_description" varchar,
  	"meta_meta_keywords" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_is_top_item" boolean DEFAULT false,
  	"version_menu_parent_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__pages_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_pages_v_locales" (
  	"version_menu_label" varchar,
  	"version_title" varchar,
  	"version_description" varchar,
  	"version_slug" varchar,
  	"version_content" jsonb,
  	"version_meta_meta_title" varchar,
  	"version_meta_meta_description" varchar,
  	"version_meta_meta_keywords" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "tasks" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon_image_id" integer,
  	"icon" "enum_tasks_icon",
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "tasks_locales" (
  	"title" varchar NOT NULL,
  	"description" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "contact" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"phone" varchar,
  	"subject" varchar NOT NULL,
  	"message" varchar NOT NULL,
  	"status" "enum_contact_status" DEFAULT 'new',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "sponsors" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"logo_id" integer NOT NULL,
  	"website" varchar,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "sponsors_locales" (
  	"name" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "magazine_slides" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"show_author" boolean DEFAULT false,
  	"image_id" integer NOT NULL,
  	"post_id" integer NOT NULL,
  	"order" numeric DEFAULT 0,
  	"published_date" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "magazine_slides_locales" (
  	"title" varchar NOT NULL,
  	"author" varchar,
  	"excerpt" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "history_timeline_events" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"year" varchar,
  	"image_id" integer,
  	"video_url" varchar
  );
  
  CREATE TABLE "history_timeline_events_locales" (
  	"header" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "history" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_history_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "history_locales" (
  	"hero_title" varchar,
  	"hero_subtitle" varchar,
  	"hero_paragraph1" varchar,
  	"hero_paragraph2" varchar,
  	"hero_paragraph3" varchar,
  	"meta_meta_title" varchar,
  	"meta_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_history_v_version_timeline_events" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"year" varchar,
  	"image_id" integer,
  	"video_url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_history_v_version_timeline_events_locales" (
  	"header" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_history_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_hero_image_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__history_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__history_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_history_v_locales" (
  	"version_hero_title" varchar,
  	"version_hero_subtitle" varchar,
  	"version_hero_paragraph1" varchar,
  	"version_hero_paragraph2" varchar,
  	"version_hero_paragraph3" varchar,
  	"version_meta_meta_title" varchar,
  	"version_meta_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "kommando_team_members" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"rank" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"image_id" integer NOT NULL,
  	"audio_id" integer,
  	"card_media_media_type" "enum_kommando_team_members_card_media_media_type" DEFAULT 'none',
  	"card_media_image_id" integer,
  	"card_media_video_url" varchar,
  	"order" numeric DEFAULT 0
  );
  
  CREATE TABLE "kommando_team_members_locales" (
  	"position" varchar NOT NULL,
  	"bio" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "kommando" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "kommando_locales" (
  	"title" varchar NOT NULL,
  	"intro" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "clerk_team_members" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"rank" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"image_id" integer NOT NULL,
  	"audio_id" integer,
  	"card_media_media_type" "enum_clerk_team_members_card_media_media_type" DEFAULT 'none',
  	"card_media_image_id" integer,
  	"card_media_video_url" varchar,
  	"order" numeric DEFAULT 0
  );
  
  CREATE TABLE "clerk_team_members_locales" (
  	"position" varchar NOT NULL,
  	"bio" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "clerk" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "clerk_locales" (
  	"title" varchar NOT NULL,
  	"intro" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "active_members_team_members" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"rank" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"image_id" integer NOT NULL,
  	"audio_id" integer,
  	"card_media_media_type" "enum_active_members_team_members_card_media_media_type" DEFAULT 'none',
  	"card_media_image_id" integer,
  	"card_media_video_url" varchar,
  	"order" numeric DEFAULT 0
  );
  
  CREATE TABLE "active_members_team_members_locales" (
  	"position" varchar NOT NULL,
  	"bio" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "active_members" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "active_members_locales" (
  	"title" varchar NOT NULL,
  	"intro" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "fire_brigade_youth_team_members" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"rank" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"image_id" integer NOT NULL,
  	"audio_id" integer,
  	"card_media_media_type" "enum_fire_brigade_youth_team_members_card_media_media_type" DEFAULT 'none',
  	"card_media_image_id" integer,
  	"card_media_video_url" varchar,
  	"order" numeric DEFAULT 0
  );
  
  CREATE TABLE "fire_brigade_youth_team_members_locales" (
  	"position" varchar NOT NULL,
  	"bio" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "fire_brigade_youth" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "fire_brigade_youth_locales" (
  	"title" varchar NOT NULL,
  	"intro" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "reserve_team_members" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"rank" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"image_id" integer NOT NULL,
  	"audio_id" integer,
  	"card_media_media_type" "enum_reserve_team_members_card_media_media_type" DEFAULT 'none',
  	"card_media_image_id" integer,
  	"card_media_video_url" varchar,
  	"order" numeric DEFAULT 0
  );
  
  CREATE TABLE "reserve_team_members_locales" (
  	"position" varchar NOT NULL,
  	"bio" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "reserve" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "reserve_locales" (
  	"title" varchar NOT NULL,
  	"intro" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "gallery" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_type" "enum_gallery_media_type" DEFAULT 'image' NOT NULL,
  	"media_id" integer NOT NULL,
  	"order" numeric DEFAULT 0,
  	"featured" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "gallery_locales" (
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "impressum" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_impressum_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "impressum_locales" (
  	"title" varchar,
  	"description" varchar,
  	"content" jsonb,
  	"meta_meta_title" varchar,
  	"meta_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_impressum_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__impressum_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__impressum_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_impressum_v_locales" (
  	"version_title" varchar,
  	"version_description" varchar,
  	"version_content" jsonb,
  	"version_meta_meta_title" varchar,
  	"version_meta_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "datenschutz" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_datenschutz_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "datenschutz_locales" (
  	"title" varchar,
  	"description" varchar,
  	"content" jsonb,
  	"meta_meta_title" varchar,
  	"meta_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_datenschutz_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__datenschutz_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__datenschutz_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_datenschutz_v_locales" (
  	"version_title" varchar,
  	"version_description" varchar,
  	"version_content" jsonb,
  	"version_meta_meta_title" varchar,
  	"version_meta_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"categories_id" integer,
  	"posts_id" integer,
  	"pages_id" integer,
  	"tasks_id" integer,
  	"contact_id" integer,
  	"sponsors_id" integer,
  	"magazine_slides_id" integer,
  	"history_id" integer,
  	"kommando_id" integer,
  	"clerk_id" integer,
  	"active_members_id" integer,
  	"fire_brigade_youth_id" integer,
  	"reserve_id" integer,
  	"gallery_id" integer,
  	"impressum_id" integer,
  	"datenschutz_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "contact_info" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "contact_info_locales" (
  	"address" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "cookie_banner" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"version" numeric DEFAULT 1,
  	"show_analytics" boolean DEFAULT true,
  	"show_marketing" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "cookie_banner_locales" (
  	"title" varchar,
  	"description" varchar,
  	"button_text" varchar,
  	"reject_button_text" varchar,
  	"save_button_text" varchar,
  	"essential_label" varchar,
  	"essential_description" varchar,
  	"analytics_label" varchar,
  	"analytics_description" varchar,
  	"marketing_label" varchar,
  	"marketing_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "alert_top_bar" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"active" boolean DEFAULT false,
  	"color" "enum_alert_top_bar_color" DEFAULT 'red',
  	"post_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "alert_top_bar_locales" (
  	"title" varchar,
  	"description" varchar,
  	"read_more_text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "sidebar_widgets" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"facebook_enabled" boolean DEFAULT true,
  	"facebook_page_url" varchar,
  	"instagram_enabled" boolean DEFAULT true,
  	"instagram_username" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "map_settings_map_locations" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"google_maps_embed_url" varchar,
  	"latitude" numeric,
  	"longitude" numeric
  );
  
  CREATE TABLE "map_settings_map_locations_locales" (
  	"title" varchar NOT NULL,
  	"address" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "map_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"map_type" "enum_map_settings_map_type" DEFAULT 'google' NOT NULL,
  	"display_mode" "enum_map_settings_display_mode" DEFAULT 'first',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "map_settings_locales" (
  	"map_title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"logo_id" integer,
  	"favicon_id" integer,
  	"admin_logo_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "site_settings_locales" (
  	"site_name" varchar NOT NULL,
  	"site_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "users_roles" ADD CONSTRAINT "users_roles_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categories_locales" ADD CONSTRAINT "categories_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_locales" ADD CONSTRAINT "posts_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_parent_id_posts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_category_id_categories_id_fk" FOREIGN KEY ("version_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_featured_image_id_media_id_fk" FOREIGN KEY ("version_featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_author_id_users_id_fk" FOREIGN KEY ("version_author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_locales" ADD CONSTRAINT "_posts_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_menu_parent_id_pages_id_fk" FOREIGN KEY ("menu_parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_locales" ADD CONSTRAINT "pages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_menu_parent_id_pages_id_fk" FOREIGN KEY ("version_menu_parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_locales" ADD CONSTRAINT "_pages_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tasks" ADD CONSTRAINT "tasks_icon_image_id_media_id_fk" FOREIGN KEY ("icon_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "tasks_locales" ADD CONSTRAINT "tasks_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sponsors" ADD CONSTRAINT "sponsors_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sponsors_locales" ADD CONSTRAINT "sponsors_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sponsors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "magazine_slides" ADD CONSTRAINT "magazine_slides_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "magazine_slides" ADD CONSTRAINT "magazine_slides_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "magazine_slides_locales" ADD CONSTRAINT "magazine_slides_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."magazine_slides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "history_timeline_events" ADD CONSTRAINT "history_timeline_events_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "history_timeline_events" ADD CONSTRAINT "history_timeline_events_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."history"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "history_timeline_events_locales" ADD CONSTRAINT "history_timeline_events_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."history_timeline_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "history" ADD CONSTRAINT "history_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "history_locales" ADD CONSTRAINT "history_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."history"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_history_v_version_timeline_events" ADD CONSTRAINT "_history_v_version_timeline_events_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_history_v_version_timeline_events" ADD CONSTRAINT "_history_v_version_timeline_events_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_history_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_history_v_version_timeline_events_locales" ADD CONSTRAINT "_history_v_version_timeline_events_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_history_v_version_timeline_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_history_v" ADD CONSTRAINT "_history_v_parent_id_history_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."history"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_history_v" ADD CONSTRAINT "_history_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_history_v_locales" ADD CONSTRAINT "_history_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_history_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "kommando_team_members" ADD CONSTRAINT "kommando_team_members_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "kommando_team_members" ADD CONSTRAINT "kommando_team_members_audio_id_media_id_fk" FOREIGN KEY ("audio_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "kommando_team_members" ADD CONSTRAINT "kommando_team_members_card_media_image_id_media_id_fk" FOREIGN KEY ("card_media_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "kommando_team_members" ADD CONSTRAINT "kommando_team_members_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."kommando"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "kommando_team_members_locales" ADD CONSTRAINT "kommando_team_members_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."kommando_team_members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "kommando_locales" ADD CONSTRAINT "kommando_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."kommando"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "clerk_team_members" ADD CONSTRAINT "clerk_team_members_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "clerk_team_members" ADD CONSTRAINT "clerk_team_members_audio_id_media_id_fk" FOREIGN KEY ("audio_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "clerk_team_members" ADD CONSTRAINT "clerk_team_members_card_media_image_id_media_id_fk" FOREIGN KEY ("card_media_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "clerk_team_members" ADD CONSTRAINT "clerk_team_members_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."clerk"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "clerk_team_members_locales" ADD CONSTRAINT "clerk_team_members_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."clerk_team_members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "clerk_locales" ADD CONSTRAINT "clerk_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."clerk"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "active_members_team_members" ADD CONSTRAINT "active_members_team_members_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "active_members_team_members" ADD CONSTRAINT "active_members_team_members_audio_id_media_id_fk" FOREIGN KEY ("audio_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "active_members_team_members" ADD CONSTRAINT "active_members_team_members_card_media_image_id_media_id_fk" FOREIGN KEY ("card_media_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "active_members_team_members" ADD CONSTRAINT "active_members_team_members_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."active_members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "active_members_team_members_locales" ADD CONSTRAINT "active_members_team_members_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."active_members_team_members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "active_members_locales" ADD CONSTRAINT "active_members_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."active_members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "fire_brigade_youth_team_members" ADD CONSTRAINT "fire_brigade_youth_team_members_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "fire_brigade_youth_team_members" ADD CONSTRAINT "fire_brigade_youth_team_members_audio_id_media_id_fk" FOREIGN KEY ("audio_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "fire_brigade_youth_team_members" ADD CONSTRAINT "fire_brigade_youth_team_members_card_media_image_id_media_id_fk" FOREIGN KEY ("card_media_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "fire_brigade_youth_team_members" ADD CONSTRAINT "fire_brigade_youth_team_members_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."fire_brigade_youth"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "fire_brigade_youth_team_members_locales" ADD CONSTRAINT "fire_brigade_youth_team_members_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."fire_brigade_youth_team_members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "fire_brigade_youth_locales" ADD CONSTRAINT "fire_brigade_youth_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."fire_brigade_youth"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reserve_team_members" ADD CONSTRAINT "reserve_team_members_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "reserve_team_members" ADD CONSTRAINT "reserve_team_members_audio_id_media_id_fk" FOREIGN KEY ("audio_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "reserve_team_members" ADD CONSTRAINT "reserve_team_members_card_media_image_id_media_id_fk" FOREIGN KEY ("card_media_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "reserve_team_members" ADD CONSTRAINT "reserve_team_members_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."reserve"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reserve_team_members_locales" ADD CONSTRAINT "reserve_team_members_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."reserve_team_members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reserve_locales" ADD CONSTRAINT "reserve_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."reserve"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gallery" ADD CONSTRAINT "gallery_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gallery_locales" ADD CONSTRAINT "gallery_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "impressum_locales" ADD CONSTRAINT "impressum_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."impressum"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_impressum_v" ADD CONSTRAINT "_impressum_v_parent_id_impressum_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."impressum"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_impressum_v_locales" ADD CONSTRAINT "_impressum_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_impressum_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "datenschutz_locales" ADD CONSTRAINT "datenschutz_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."datenschutz"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_datenschutz_v" ADD CONSTRAINT "_datenschutz_v_parent_id_datenschutz_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."datenschutz"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_datenschutz_v_locales" ADD CONSTRAINT "_datenschutz_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_datenschutz_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tasks_fk" FOREIGN KEY ("tasks_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_contact_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contact"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_sponsors_fk" FOREIGN KEY ("sponsors_id") REFERENCES "public"."sponsors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_magazine_slides_fk" FOREIGN KEY ("magazine_slides_id") REFERENCES "public"."magazine_slides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_history_fk" FOREIGN KEY ("history_id") REFERENCES "public"."history"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_kommando_fk" FOREIGN KEY ("kommando_id") REFERENCES "public"."kommando"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_clerk_fk" FOREIGN KEY ("clerk_id") REFERENCES "public"."clerk"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_active_members_fk" FOREIGN KEY ("active_members_id") REFERENCES "public"."active_members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_fire_brigade_youth_fk" FOREIGN KEY ("fire_brigade_youth_id") REFERENCES "public"."fire_brigade_youth"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_reserve_fk" FOREIGN KEY ("reserve_id") REFERENCES "public"."reserve"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_gallery_fk" FOREIGN KEY ("gallery_id") REFERENCES "public"."gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_impressum_fk" FOREIGN KEY ("impressum_id") REFERENCES "public"."impressum"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_datenschutz_fk" FOREIGN KEY ("datenschutz_id") REFERENCES "public"."datenschutz"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_info_locales" ADD CONSTRAINT "contact_info_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_info"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cookie_banner_locales" ADD CONSTRAINT "cookie_banner_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cookie_banner"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "alert_top_bar" ADD CONSTRAINT "alert_top_bar_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "alert_top_bar_locales" ADD CONSTRAINT "alert_top_bar_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."alert_top_bar"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "map_settings_map_locations" ADD CONSTRAINT "map_settings_map_locations_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."map_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "map_settings_map_locations_locales" ADD CONSTRAINT "map_settings_map_locations_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."map_settings_map_locations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "map_settings_locales" ADD CONSTRAINT "map_settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."map_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_favicon_id_media_id_fk" FOREIGN KEY ("favicon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_admin_logo_id_media_id_fk" FOREIGN KEY ("admin_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_locales" ADD CONSTRAINT "site_settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_roles_order_idx" ON "users_roles" USING btree ("order");
  CREATE INDEX "users_roles_parent_idx" ON "users_roles" USING btree ("parent_id");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "categories_updated_at_idx" ON "categories" USING btree ("updated_at");
  CREATE INDEX "categories_created_at_idx" ON "categories" USING btree ("created_at");
  CREATE UNIQUE INDEX "categories_slug_idx" ON "categories_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "categories_locales_locale_parent_id_unique" ON "categories_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "posts_category_idx" ON "posts" USING btree ("category_id");
  CREATE INDEX "posts_featured_image_idx" ON "posts" USING btree ("featured_image_id");
  CREATE INDEX "posts_author_idx" ON "posts" USING btree ("author_id");
  CREATE INDEX "posts_updated_at_idx" ON "posts" USING btree ("updated_at");
  CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at");
  CREATE INDEX "posts__status_idx" ON "posts" USING btree ("_status");
  CREATE UNIQUE INDEX "posts_slug_idx" ON "posts_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "posts_locales_locale_parent_id_unique" ON "posts_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "posts_rels_order_idx" ON "posts_rels" USING btree ("order");
  CREATE INDEX "posts_rels_parent_idx" ON "posts_rels" USING btree ("parent_id");
  CREATE INDEX "posts_rels_path_idx" ON "posts_rels" USING btree ("path");
  CREATE INDEX "posts_rels_media_id_idx" ON "posts_rels" USING btree ("media_id");
  CREATE INDEX "_posts_v_parent_idx" ON "_posts_v" USING btree ("parent_id");
  CREATE INDEX "_posts_v_version_version_category_idx" ON "_posts_v" USING btree ("version_category_id");
  CREATE INDEX "_posts_v_version_version_featured_image_idx" ON "_posts_v" USING btree ("version_featured_image_id");
  CREATE INDEX "_posts_v_version_version_author_idx" ON "_posts_v" USING btree ("version_author_id");
  CREATE INDEX "_posts_v_version_version_updated_at_idx" ON "_posts_v" USING btree ("version_updated_at");
  CREATE INDEX "_posts_v_version_version_created_at_idx" ON "_posts_v" USING btree ("version_created_at");
  CREATE INDEX "_posts_v_version_version__status_idx" ON "_posts_v" USING btree ("version__status");
  CREATE INDEX "_posts_v_created_at_idx" ON "_posts_v" USING btree ("created_at");
  CREATE INDEX "_posts_v_updated_at_idx" ON "_posts_v" USING btree ("updated_at");
  CREATE INDEX "_posts_v_snapshot_idx" ON "_posts_v" USING btree ("snapshot");
  CREATE INDEX "_posts_v_published_locale_idx" ON "_posts_v" USING btree ("published_locale");
  CREATE INDEX "_posts_v_latest_idx" ON "_posts_v" USING btree ("latest");
  CREATE INDEX "_posts_v_version_version_slug_idx" ON "_posts_v_locales" USING btree ("version_slug","_locale");
  CREATE UNIQUE INDEX "_posts_v_locales_locale_parent_id_unique" ON "_posts_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_posts_v_rels_order_idx" ON "_posts_v_rels" USING btree ("order");
  CREATE INDEX "_posts_v_rels_parent_idx" ON "_posts_v_rels" USING btree ("parent_id");
  CREATE INDEX "_posts_v_rels_path_idx" ON "_posts_v_rels" USING btree ("path");
  CREATE INDEX "_posts_v_rels_media_id_idx" ON "_posts_v_rels" USING btree ("media_id");
  CREATE INDEX "pages_menu_parent_idx" ON "pages" USING btree ("menu_parent_id");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "pages_locales_locale_parent_id_unique" ON "pages_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_version_menu_parent_idx" ON "_pages_v" USING btree ("version_menu_parent_id");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_snapshot_idx" ON "_pages_v" USING btree ("snapshot");
  CREATE INDEX "_pages_v_published_locale_idx" ON "_pages_v" USING btree ("published_locale");
  CREATE INDEX "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v_locales" USING btree ("version_slug","_locale");
  CREATE UNIQUE INDEX "_pages_v_locales_locale_parent_id_unique" ON "_pages_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "tasks_icon_image_idx" ON "tasks" USING btree ("icon_image_id");
  CREATE INDEX "tasks_updated_at_idx" ON "tasks" USING btree ("updated_at");
  CREATE INDEX "tasks_created_at_idx" ON "tasks" USING btree ("created_at");
  CREATE UNIQUE INDEX "tasks_locales_locale_parent_id_unique" ON "tasks_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "contact_updated_at_idx" ON "contact" USING btree ("updated_at");
  CREATE INDEX "contact_created_at_idx" ON "contact" USING btree ("created_at");
  CREATE INDEX "sponsors_logo_idx" ON "sponsors" USING btree ("logo_id");
  CREATE INDEX "sponsors_updated_at_idx" ON "sponsors" USING btree ("updated_at");
  CREATE INDEX "sponsors_created_at_idx" ON "sponsors" USING btree ("created_at");
  CREATE UNIQUE INDEX "sponsors_locales_locale_parent_id_unique" ON "sponsors_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "magazine_slides_image_idx" ON "magazine_slides" USING btree ("image_id");
  CREATE INDEX "magazine_slides_post_idx" ON "magazine_slides" USING btree ("post_id");
  CREATE INDEX "magazine_slides_updated_at_idx" ON "magazine_slides" USING btree ("updated_at");
  CREATE INDEX "magazine_slides_created_at_idx" ON "magazine_slides" USING btree ("created_at");
  CREATE UNIQUE INDEX "magazine_slides_locales_locale_parent_id_unique" ON "magazine_slides_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "history_timeline_events_order_idx" ON "history_timeline_events" USING btree ("_order");
  CREATE INDEX "history_timeline_events_parent_id_idx" ON "history_timeline_events" USING btree ("_parent_id");
  CREATE INDEX "history_timeline_events_image_idx" ON "history_timeline_events" USING btree ("image_id");
  CREATE UNIQUE INDEX "history_timeline_events_locales_locale_parent_id_unique" ON "history_timeline_events_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "history_hero_image_idx" ON "history" USING btree ("hero_image_id");
  CREATE INDEX "history_updated_at_idx" ON "history" USING btree ("updated_at");
  CREATE INDEX "history_created_at_idx" ON "history" USING btree ("created_at");
  CREATE INDEX "history__status_idx" ON "history" USING btree ("_status");
  CREATE UNIQUE INDEX "history_locales_locale_parent_id_unique" ON "history_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_history_v_version_timeline_events_order_idx" ON "_history_v_version_timeline_events" USING btree ("_order");
  CREATE INDEX "_history_v_version_timeline_events_parent_id_idx" ON "_history_v_version_timeline_events" USING btree ("_parent_id");
  CREATE INDEX "_history_v_version_timeline_events_image_idx" ON "_history_v_version_timeline_events" USING btree ("image_id");
  CREATE UNIQUE INDEX "_history_v_version_timeline_events_locales_locale_parent_id_" ON "_history_v_version_timeline_events_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_history_v_parent_idx" ON "_history_v" USING btree ("parent_id");
  CREATE INDEX "_history_v_version_version_hero_image_idx" ON "_history_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_history_v_version_version_updated_at_idx" ON "_history_v" USING btree ("version_updated_at");
  CREATE INDEX "_history_v_version_version_created_at_idx" ON "_history_v" USING btree ("version_created_at");
  CREATE INDEX "_history_v_version_version__status_idx" ON "_history_v" USING btree ("version__status");
  CREATE INDEX "_history_v_created_at_idx" ON "_history_v" USING btree ("created_at");
  CREATE INDEX "_history_v_updated_at_idx" ON "_history_v" USING btree ("updated_at");
  CREATE INDEX "_history_v_snapshot_idx" ON "_history_v" USING btree ("snapshot");
  CREATE INDEX "_history_v_published_locale_idx" ON "_history_v" USING btree ("published_locale");
  CREATE INDEX "_history_v_latest_idx" ON "_history_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_history_v_locales_locale_parent_id_unique" ON "_history_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "kommando_team_members_order_idx" ON "kommando_team_members" USING btree ("_order");
  CREATE INDEX "kommando_team_members_parent_id_idx" ON "kommando_team_members" USING btree ("_parent_id");
  CREATE INDEX "kommando_team_members_image_idx" ON "kommando_team_members" USING btree ("image_id");
  CREATE INDEX "kommando_team_members_audio_idx" ON "kommando_team_members" USING btree ("audio_id");
  CREATE INDEX "kommando_team_members_card_media_card_media_image_idx" ON "kommando_team_members" USING btree ("card_media_image_id");
  CREATE UNIQUE INDEX "kommando_team_members_locales_locale_parent_id_unique" ON "kommando_team_members_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "kommando_updated_at_idx" ON "kommando" USING btree ("updated_at");
  CREATE INDEX "kommando_created_at_idx" ON "kommando" USING btree ("created_at");
  CREATE UNIQUE INDEX "kommando_locales_locale_parent_id_unique" ON "kommando_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "clerk_team_members_order_idx" ON "clerk_team_members" USING btree ("_order");
  CREATE INDEX "clerk_team_members_parent_id_idx" ON "clerk_team_members" USING btree ("_parent_id");
  CREATE INDEX "clerk_team_members_image_idx" ON "clerk_team_members" USING btree ("image_id");
  CREATE INDEX "clerk_team_members_audio_idx" ON "clerk_team_members" USING btree ("audio_id");
  CREATE INDEX "clerk_team_members_card_media_card_media_image_idx" ON "clerk_team_members" USING btree ("card_media_image_id");
  CREATE UNIQUE INDEX "clerk_team_members_locales_locale_parent_id_unique" ON "clerk_team_members_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "clerk_updated_at_idx" ON "clerk" USING btree ("updated_at");
  CREATE INDEX "clerk_created_at_idx" ON "clerk" USING btree ("created_at");
  CREATE UNIQUE INDEX "clerk_locales_locale_parent_id_unique" ON "clerk_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "active_members_team_members_order_idx" ON "active_members_team_members" USING btree ("_order");
  CREATE INDEX "active_members_team_members_parent_id_idx" ON "active_members_team_members" USING btree ("_parent_id");
  CREATE INDEX "active_members_team_members_image_idx" ON "active_members_team_members" USING btree ("image_id");
  CREATE INDEX "active_members_team_members_audio_idx" ON "active_members_team_members" USING btree ("audio_id");
  CREATE INDEX "active_members_team_members_card_media_card_media_image_idx" ON "active_members_team_members" USING btree ("card_media_image_id");
  CREATE UNIQUE INDEX "active_members_team_members_locales_locale_parent_id_unique" ON "active_members_team_members_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "active_members_updated_at_idx" ON "active_members" USING btree ("updated_at");
  CREATE INDEX "active_members_created_at_idx" ON "active_members" USING btree ("created_at");
  CREATE UNIQUE INDEX "active_members_locales_locale_parent_id_unique" ON "active_members_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "fire_brigade_youth_team_members_order_idx" ON "fire_brigade_youth_team_members" USING btree ("_order");
  CREATE INDEX "fire_brigade_youth_team_members_parent_id_idx" ON "fire_brigade_youth_team_members" USING btree ("_parent_id");
  CREATE INDEX "fire_brigade_youth_team_members_image_idx" ON "fire_brigade_youth_team_members" USING btree ("image_id");
  CREATE INDEX "fire_brigade_youth_team_members_audio_idx" ON "fire_brigade_youth_team_members" USING btree ("audio_id");
  CREATE INDEX "fire_brigade_youth_team_members_card_media_card_media_im_idx" ON "fire_brigade_youth_team_members" USING btree ("card_media_image_id");
  CREATE UNIQUE INDEX "fire_brigade_youth_team_members_locales_locale_parent_id_uni" ON "fire_brigade_youth_team_members_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "fire_brigade_youth_updated_at_idx" ON "fire_brigade_youth" USING btree ("updated_at");
  CREATE INDEX "fire_brigade_youth_created_at_idx" ON "fire_brigade_youth" USING btree ("created_at");
  CREATE UNIQUE INDEX "fire_brigade_youth_locales_locale_parent_id_unique" ON "fire_brigade_youth_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "reserve_team_members_order_idx" ON "reserve_team_members" USING btree ("_order");
  CREATE INDEX "reserve_team_members_parent_id_idx" ON "reserve_team_members" USING btree ("_parent_id");
  CREATE INDEX "reserve_team_members_image_idx" ON "reserve_team_members" USING btree ("image_id");
  CREATE INDEX "reserve_team_members_audio_idx" ON "reserve_team_members" USING btree ("audio_id");
  CREATE INDEX "reserve_team_members_card_media_card_media_image_idx" ON "reserve_team_members" USING btree ("card_media_image_id");
  CREATE UNIQUE INDEX "reserve_team_members_locales_locale_parent_id_unique" ON "reserve_team_members_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "reserve_updated_at_idx" ON "reserve" USING btree ("updated_at");
  CREATE INDEX "reserve_created_at_idx" ON "reserve" USING btree ("created_at");
  CREATE UNIQUE INDEX "reserve_locales_locale_parent_id_unique" ON "reserve_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "gallery_media_idx" ON "gallery" USING btree ("media_id");
  CREATE INDEX "gallery_updated_at_idx" ON "gallery" USING btree ("updated_at");
  CREATE INDEX "gallery_created_at_idx" ON "gallery" USING btree ("created_at");
  CREATE UNIQUE INDEX "gallery_locales_locale_parent_id_unique" ON "gallery_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "impressum_updated_at_idx" ON "impressum" USING btree ("updated_at");
  CREATE INDEX "impressum_created_at_idx" ON "impressum" USING btree ("created_at");
  CREATE INDEX "impressum__status_idx" ON "impressum" USING btree ("_status");
  CREATE UNIQUE INDEX "impressum_locales_locale_parent_id_unique" ON "impressum_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_impressum_v_parent_idx" ON "_impressum_v" USING btree ("parent_id");
  CREATE INDEX "_impressum_v_version_version_updated_at_idx" ON "_impressum_v" USING btree ("version_updated_at");
  CREATE INDEX "_impressum_v_version_version_created_at_idx" ON "_impressum_v" USING btree ("version_created_at");
  CREATE INDEX "_impressum_v_version_version__status_idx" ON "_impressum_v" USING btree ("version__status");
  CREATE INDEX "_impressum_v_created_at_idx" ON "_impressum_v" USING btree ("created_at");
  CREATE INDEX "_impressum_v_updated_at_idx" ON "_impressum_v" USING btree ("updated_at");
  CREATE INDEX "_impressum_v_snapshot_idx" ON "_impressum_v" USING btree ("snapshot");
  CREATE INDEX "_impressum_v_published_locale_idx" ON "_impressum_v" USING btree ("published_locale");
  CREATE INDEX "_impressum_v_latest_idx" ON "_impressum_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_impressum_v_locales_locale_parent_id_unique" ON "_impressum_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "datenschutz_updated_at_idx" ON "datenschutz" USING btree ("updated_at");
  CREATE INDEX "datenschutz_created_at_idx" ON "datenschutz" USING btree ("created_at");
  CREATE INDEX "datenschutz__status_idx" ON "datenschutz" USING btree ("_status");
  CREATE UNIQUE INDEX "datenschutz_locales_locale_parent_id_unique" ON "datenschutz_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_datenschutz_v_parent_idx" ON "_datenschutz_v" USING btree ("parent_id");
  CREATE INDEX "_datenschutz_v_version_version_updated_at_idx" ON "_datenschutz_v" USING btree ("version_updated_at");
  CREATE INDEX "_datenschutz_v_version_version_created_at_idx" ON "_datenschutz_v" USING btree ("version_created_at");
  CREATE INDEX "_datenschutz_v_version_version__status_idx" ON "_datenschutz_v" USING btree ("version__status");
  CREATE INDEX "_datenschutz_v_created_at_idx" ON "_datenschutz_v" USING btree ("created_at");
  CREATE INDEX "_datenschutz_v_updated_at_idx" ON "_datenschutz_v" USING btree ("updated_at");
  CREATE INDEX "_datenschutz_v_snapshot_idx" ON "_datenschutz_v" USING btree ("snapshot");
  CREATE INDEX "_datenschutz_v_published_locale_idx" ON "_datenschutz_v" USING btree ("published_locale");
  CREATE INDEX "_datenschutz_v_latest_idx" ON "_datenschutz_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_datenschutz_v_locales_locale_parent_id_unique" ON "_datenschutz_v_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("categories_id");
  CREATE INDEX "payload_locked_documents_rels_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("posts_id");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_tasks_id_idx" ON "payload_locked_documents_rels" USING btree ("tasks_id");
  CREATE INDEX "payload_locked_documents_rels_contact_id_idx" ON "payload_locked_documents_rels" USING btree ("contact_id");
  CREATE INDEX "payload_locked_documents_rels_sponsors_id_idx" ON "payload_locked_documents_rels" USING btree ("sponsors_id");
  CREATE INDEX "payload_locked_documents_rels_magazine_slides_id_idx" ON "payload_locked_documents_rels" USING btree ("magazine_slides_id");
  CREATE INDEX "payload_locked_documents_rels_history_id_idx" ON "payload_locked_documents_rels" USING btree ("history_id");
  CREATE INDEX "payload_locked_documents_rels_kommando_id_idx" ON "payload_locked_documents_rels" USING btree ("kommando_id");
  CREATE INDEX "payload_locked_documents_rels_clerk_id_idx" ON "payload_locked_documents_rels" USING btree ("clerk_id");
  CREATE INDEX "payload_locked_documents_rels_active_members_id_idx" ON "payload_locked_documents_rels" USING btree ("active_members_id");
  CREATE INDEX "payload_locked_documents_rels_fire_brigade_youth_id_idx" ON "payload_locked_documents_rels" USING btree ("fire_brigade_youth_id");
  CREATE INDEX "payload_locked_documents_rels_reserve_id_idx" ON "payload_locked_documents_rels" USING btree ("reserve_id");
  CREATE INDEX "payload_locked_documents_rels_gallery_id_idx" ON "payload_locked_documents_rels" USING btree ("gallery_id");
  CREATE INDEX "payload_locked_documents_rels_impressum_id_idx" ON "payload_locked_documents_rels" USING btree ("impressum_id");
  CREATE INDEX "payload_locked_documents_rels_datenschutz_id_idx" ON "payload_locked_documents_rels" USING btree ("datenschutz_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE UNIQUE INDEX "contact_info_locales_locale_parent_id_unique" ON "contact_info_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "cookie_banner_locales_locale_parent_id_unique" ON "cookie_banner_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "alert_top_bar_post_idx" ON "alert_top_bar" USING btree ("post_id");
  CREATE UNIQUE INDEX "alert_top_bar_locales_locale_parent_id_unique" ON "alert_top_bar_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "map_settings_map_locations_order_idx" ON "map_settings_map_locations" USING btree ("_order");
  CREATE INDEX "map_settings_map_locations_parent_id_idx" ON "map_settings_map_locations" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "map_settings_map_locations_locales_locale_parent_id_unique" ON "map_settings_map_locations_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "map_settings_locales_locale_parent_id_unique" ON "map_settings_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "site_settings_logo_idx" ON "site_settings" USING btree ("logo_id");
  CREATE INDEX "site_settings_favicon_idx" ON "site_settings" USING btree ("favicon_id");
  CREATE INDEX "site_settings_admin_logo_idx" ON "site_settings" USING btree ("admin_logo_id");
  CREATE UNIQUE INDEX "site_settings_locales_locale_parent_id_unique" ON "site_settings_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_roles" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "categories" CASCADE;
  DROP TABLE "categories_locales" CASCADE;
  DROP TABLE "posts" CASCADE;
  DROP TABLE "posts_locales" CASCADE;
  DROP TABLE "posts_rels" CASCADE;
  DROP TABLE "_posts_v" CASCADE;
  DROP TABLE "_posts_v_locales" CASCADE;
  DROP TABLE "_posts_v_rels" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "pages_locales" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "_pages_v_locales" CASCADE;
  DROP TABLE "tasks" CASCADE;
  DROP TABLE "tasks_locales" CASCADE;
  DROP TABLE "contact" CASCADE;
  DROP TABLE "sponsors" CASCADE;
  DROP TABLE "sponsors_locales" CASCADE;
  DROP TABLE "magazine_slides" CASCADE;
  DROP TABLE "magazine_slides_locales" CASCADE;
  DROP TABLE "history_timeline_events" CASCADE;
  DROP TABLE "history_timeline_events_locales" CASCADE;
  DROP TABLE "history" CASCADE;
  DROP TABLE "history_locales" CASCADE;
  DROP TABLE "_history_v_version_timeline_events" CASCADE;
  DROP TABLE "_history_v_version_timeline_events_locales" CASCADE;
  DROP TABLE "_history_v" CASCADE;
  DROP TABLE "_history_v_locales" CASCADE;
  DROP TABLE "kommando_team_members" CASCADE;
  DROP TABLE "kommando_team_members_locales" CASCADE;
  DROP TABLE "kommando" CASCADE;
  DROP TABLE "kommando_locales" CASCADE;
  DROP TABLE "clerk_team_members" CASCADE;
  DROP TABLE "clerk_team_members_locales" CASCADE;
  DROP TABLE "clerk" CASCADE;
  DROP TABLE "clerk_locales" CASCADE;
  DROP TABLE "active_members_team_members" CASCADE;
  DROP TABLE "active_members_team_members_locales" CASCADE;
  DROP TABLE "active_members" CASCADE;
  DROP TABLE "active_members_locales" CASCADE;
  DROP TABLE "fire_brigade_youth_team_members" CASCADE;
  DROP TABLE "fire_brigade_youth_team_members_locales" CASCADE;
  DROP TABLE "fire_brigade_youth" CASCADE;
  DROP TABLE "fire_brigade_youth_locales" CASCADE;
  DROP TABLE "reserve_team_members" CASCADE;
  DROP TABLE "reserve_team_members_locales" CASCADE;
  DROP TABLE "reserve" CASCADE;
  DROP TABLE "reserve_locales" CASCADE;
  DROP TABLE "gallery" CASCADE;
  DROP TABLE "gallery_locales" CASCADE;
  DROP TABLE "impressum" CASCADE;
  DROP TABLE "impressum_locales" CASCADE;
  DROP TABLE "_impressum_v" CASCADE;
  DROP TABLE "_impressum_v_locales" CASCADE;
  DROP TABLE "datenschutz" CASCADE;
  DROP TABLE "datenschutz_locales" CASCADE;
  DROP TABLE "_datenschutz_v" CASCADE;
  DROP TABLE "_datenschutz_v_locales" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "contact_info" CASCADE;
  DROP TABLE "contact_info_locales" CASCADE;
  DROP TABLE "cookie_banner" CASCADE;
  DROP TABLE "cookie_banner_locales" CASCADE;
  DROP TABLE "alert_top_bar" CASCADE;
  DROP TABLE "alert_top_bar_locales" CASCADE;
  DROP TABLE "sidebar_widgets" CASCADE;
  DROP TABLE "map_settings_map_locations" CASCADE;
  DROP TABLE "map_settings_map_locations_locales" CASCADE;
  DROP TABLE "map_settings" CASCADE;
  DROP TABLE "map_settings_locales" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "site_settings_locales" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_users_roles";
  DROP TYPE "public"."enum_posts_status";
  DROP TYPE "public"."enum__posts_v_version_status";
  DROP TYPE "public"."enum__posts_v_published_locale";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum__pages_v_version_status";
  DROP TYPE "public"."enum__pages_v_published_locale";
  DROP TYPE "public"."enum_tasks_icon";
  DROP TYPE "public"."enum_contact_status";
  DROP TYPE "public"."enum_history_status";
  DROP TYPE "public"."enum__history_v_version_status";
  DROP TYPE "public"."enum__history_v_published_locale";
  DROP TYPE "public"."enum_kommando_team_members_card_media_media_type";
  DROP TYPE "public"."enum_clerk_team_members_card_media_media_type";
  DROP TYPE "public"."enum_active_members_team_members_card_media_media_type";
  DROP TYPE "public"."enum_fire_brigade_youth_team_members_card_media_media_type";
  DROP TYPE "public"."enum_reserve_team_members_card_media_media_type";
  DROP TYPE "public"."enum_gallery_media_type";
  DROP TYPE "public"."enum_impressum_status";
  DROP TYPE "public"."enum__impressum_v_version_status";
  DROP TYPE "public"."enum__impressum_v_published_locale";
  DROP TYPE "public"."enum_datenschutz_status";
  DROP TYPE "public"."enum__datenschutz_v_version_status";
  DROP TYPE "public"."enum__datenschutz_v_published_locale";
  DROP TYPE "public"."enum_alert_top_bar_color";
  DROP TYPE "public"."enum_map_settings_map_type";
  DROP TYPE "public"."enum_map_settings_display_mode";`)
}
