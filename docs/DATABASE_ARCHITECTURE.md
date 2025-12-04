# Formme Database Architecture Documentation

## Overview

Formme uses Supabase (PostgreSQL) as its backend database. This document provides comprehensive documentation of all database tables, their relationships, storage buckets, edge functions, and what would need to be changed for migration.

---

## Database Tables

### 1. `user_roles`
**Purpose:** Stores user role assignments (designer or manufacturer). Roles are mutually exclusive.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| user_id | uuid | No | - | References auth.users(id) |
| role | app_role (enum) | No | - | Either 'designer' or 'manufacturer' |
| created_at | timestamptz | Yes | now() | Creation timestamp |

**RLS Policies:**
- Users can view their own roles
- Users can insert their own role
- Service role can insert any role

---

### 2. `profiles`
**Purpose:** Stores extended user profile information for both designers and manufacturers.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| user_id | uuid | No | - | References auth.users(id) |
| full_name | text | Yes | - | User's full name |
| company_name | text | Yes | - | Company/brand name |
| location | text | Yes | - | Geographic location |
| phone | text | Yes | - | Phone number |
| avatar_url | text | Yes | - | Profile image URL |
| capabilities | jsonb | Yes | '[]' | Manufacturing capabilities (for manufacturers) |
| categories | jsonb | Yes | '[]' | Product categories |
| moq | integer | Yes | - | Minimum order quantity |
| lead_time | integer | Yes | - | Lead time in days |
| rating | double precision | Yes | - | User rating |
| created_at | timestamptz | Yes | now() | Creation timestamp |
| updated_at | timestamptz | Yes | now() | Last update timestamp |

**RLS Policies:**
- Users can view their own profile
- Users can update their own profile
- Users can insert their own profile

---

### 3. `manufacturers`
**Purpose:** Stores manufacturer business profiles and capabilities.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| user_id | uuid | Yes | - | References auth.users(id) |
| name | text | No | - | Manufacturer/factory name |
| description | text | Yes | - | Business description |
| location | text | Yes | - | City/region |
| country | text | Yes | - | Country |
| categories | text[] | Yes | - | Garment types they produce |
| specialties | text[] | Yes | - | Manufacturing processes |
| certifications | text[] | Yes | - | Industry certifications |
| min_order_quantity | integer | Yes | - | Minimum order quantity |
| max_capacity | integer | Yes | - | Maximum production capacity |
| lead_time_days | integer | Yes | - | Production lead time |
| price_range | text | Yes | - | Price tier (low/medium/high) |
| rating | double precision | Yes | - | Average rating |
| sustainability_score | integer | Yes | - | Sustainability rating 1-10 |
| is_active | boolean | Yes | true | Whether manufacturer is active |
| created_at | timestamptz | Yes | now() | Creation timestamp |
| updated_at | timestamptz | Yes | now() | Last update timestamp |

**RLS Policies:**
- Everyone can view active manufacturers
- Manufacturers can update their own profile
- Users can insert their own manufacturer profile

---

### 4. `designs`
**Purpose:** Stores designer's garment designs.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| user_id | uuid | No | - | Designer's user ID |
| name | text | No | - | Design name |
| description | text | Yes | - | Design description |
| category | text | Yes | - | Garment category |
| status | text | Yes | 'draft' | Design status |
| design_file_url | text | Yes | - | Uploaded design file URL |
| thumbnail_url | text | Yes | - | Design thumbnail |
| tech_pack_url | text | Yes | - | Generated tech pack URL |
| created_at | timestamptz | Yes | now() | Creation timestamp |
| updated_at | timestamptz | Yes | now() | Last update timestamp |

**RLS Policies:**
- Designers can view their own designs
- Designers can create designs
- Designers can update their own designs
- Designers can delete their own designs
- Manufacturers can view designs for their orders

---

### 5. `design_specs`
**Purpose:** Stores detailed design specifications for tech pack generation.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| design_id | uuid | No | - | FK to designs |
| measurements | jsonb | Yes | - | Size measurements |
| fabric_type | text | Yes | - | Primary fabric |
| gsm | integer | Yes | - | Fabric weight |
| print_type | text | Yes | - | Print/decoration type |
| construction_notes | text | Yes | - | Assembly notes |
| artwork_url | text | Yes | - | Artwork file URL |
| drawing_image_url | text | Yes | - | Design sketch URL |
| drawing_vector_data | jsonb | Yes | - | SVG vector data |
| attachments | jsonb | Yes | '[]' | Additional files |
| created_at | timestamptz | Yes | now() | Creation timestamp |
| updated_at | timestamptz | Yes | now() | Last update timestamp |

**RLS Policies:**
- Designers can view their own design specs
- Designers can insert their own design specs
- Designers can update their own design specs

---

### 6. `techpacks`
**Purpose:** Stores generated or uploaded tech pack documents.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| design_id | uuid | No | - | FK to designs |
| pdf_url | text | Yes | - | Tech pack PDF URL |
| pdf_file_id | text | Yes | - | Storage file ID |
| version | integer | No | 1 | Version number |
| generated_by | text | Yes | - | 'ai' or 'user-upload' |
| created_at | timestamptz | Yes | now() | Creation timestamp |

**RLS Policies:**
- Designers can view their own techpacks
- Designers can create techpacks for their designs
- Manufacturers can view techpacks for accepted matches

---

### 7. `manufacturer_matches`
**Purpose:** Stores designer-manufacturer matching requests and status.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| design_id | uuid | No | - | FK to designs |
| manufacturer_id | uuid | No | - | FK to manufacturers |
| score | double precision | Yes | - | Matching score (0-100) |
| status | text | Yes | 'pending' | pending/accepted/rejected |
| created_at | timestamptz | Yes | now() | Creation timestamp |

**RLS Policies:**
- Designers can view matches for their designs
- Designers can create matches for their designs
- Designers can update matches for their designs
- Manufacturers can view their matches
- Manufacturers can update their match status

---

### 8. `orders`
**Purpose:** Main order tracking table for production workflow.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| design_id | uuid | No | - | FK to designs |
| designer_id | uuid | No | - | Designer's user ID |
| manufacturer_id | uuid | Yes | - | FK to manufacturers |
| techpack_id | uuid | Yes | - | FK to techpacks |
| status | order_status (enum) | Yes | 'draft' | Current workflow stage |
| quantity | integer | Yes | - | Order quantity |
| price | numeric | Yes | - | Agreed price |
| budget_min | numeric | Yes | - | Minimum budget |
| budget_max | numeric | Yes | - | Maximum budget |
| lead_time_days | integer | Yes | - | Expected lead time |
| preferred_location | text | Yes | - | Preferred region |
| shipping_address | text | Yes | - | Delivery address |
| notes | text | Yes | - | Order notes |
| tech_pack_data | jsonb | Yes | - | Tech pack JSON data |
| fabric_type | text | Yes | - | Production fabric |
| gsm | text | Yes | - | Fabric GSM |
| shrinkage | text | Yes | - | Shrinkage specs |
| color_fastness | text | Yes | - | Color fastness rating |
| sustainability_priority | text | Yes | - | Sustainability level |
| production_start_date | date | Yes | - | Production start |
| production_completion_date | date | Yes | - | Expected completion |
| production_timeline_data | jsonb | Yes | '{}' | Timeline details |
| production_params_approved | boolean | Yes | - | Designer approved params |
| production_params_submitted_at | timestamptz | Yes | - | When params submitted |
| sample_approved | boolean | Yes | - | Sample approval status |
| sample_submitted_at | timestamptz | Yes | - | Sample submission time |
| lab_dip_photos | text[] | Yes | '[]' | Lab dip photo URLs |
| qc_approved | boolean | Yes | - | QC approval status |
| qc_submitted_at | timestamptz | Yes | - | QC submission time |
| qc_result | text | Yes | - | QC result summary |
| qc_notes | text | Yes | - | QC notes |
| qc_photos_s | text | Yes | - | QC photos size S |
| qc_photos_m | text | Yes | - | QC photos size M |
| qc_photos_l | text | Yes | - | QC photos size L |
| qc_photos_xl | text | Yes | - | QC photos size XL |
| created_at | timestamptz | Yes | now() | Creation timestamp |
| updated_at | timestamptz | Yes | now() | Last update timestamp |

**Order Status Enum Values:**
- draft
- tech_pack_pending
- sent_to_manufacturer
- manufacturer_review
- production_approval
- sample_development
- quality_check
- shipping
- delivered
- cancelled

**RLS Policies:**
- Designers can view their own orders
- Designers can create orders
- Designers can update their own orders
- Manufacturers can view orders assigned to them
- Manufacturers can update assigned orders

---

### 9. `messages`
**Purpose:** Stores chat messages between designers and manufacturers.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| order_id | uuid | No | - | FK to orders |
| chat_id | uuid | Yes | - | FK to chats |
| sender_id | uuid | No | - | Sender's user ID |
| content | text | No | - | Message content |
| attachments | text[] | Yes | - | Attachment URLs |
| is_read | boolean | Yes | false | Read status |
| read_at | timestamptz | Yes | - | When read |
| created_at | timestamptz | Yes | now() | Creation timestamp |

**RLS Policies:**
- Users can view messages for their orders
- Users can send messages for their orders

---

### 10. `chats`
**Purpose:** Groups messages into chat threads per design-manufacturer pair.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| design_id | uuid | No | - | FK to designs |
| manufacturer_id | uuid | No | - | FK to manufacturers |
| created_at | timestamptz | Yes | now() | Creation timestamp |

**RLS Policies:**
- Designers can view chats for their designs
- Designers can create chats for their designs
- Manufacturers can view their chats

---

### 11. `attachments`
**Purpose:** Stores file attachments linked to designs, messages, or techpacks.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| design_id | uuid | Yes | - | FK to designs |
| message_id | uuid | Yes | - | FK to messages |
| techpack_id | uuid | Yes | - | FK to techpacks |
| file_id | text | No | - | Storage file ID |
| file_url | text | No | - | Public file URL |
| type | text | Yes | - | File type |
| created_at | timestamptz | Yes | now() | Creation timestamp |

**RLS Policies:**
- Users can view attachments for their designs
- Users can create attachments

---

### 12. `production_updates`
**Purpose:** Tracks production status updates from manufacturers.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| order_id | uuid | No | - | FK to orders |
| status | text | No | - | Update status |
| message | text | Yes | - | Update message |
| created_at | timestamptz | Yes | now() | Creation timestamp |

**RLS Policies:**
- Designers can view updates for their orders
- Manufacturers can create updates for their orders
- Manufacturers can view updates for their orders

---

### 13. `notification_preferences`
**Purpose:** Stores user notification settings.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| user_id | uuid | No | - | References auth.users(id) |
| channels | notification_channel[] | Yes | ['email', 'in_app'] | Notification channels |
| order_updates | boolean | Yes | true | Order update notifications |
| manufacturer_responses | boolean | Yes | true | Manufacturer response notifications |
| sample_approvals | boolean | Yes | true | Sample approval notifications |
| shipping_updates | boolean | Yes | true | Shipping update notifications |
| created_at | timestamptz | Yes | now() | Creation timestamp |
| updated_at | timestamptz | Yes | now() | Last update timestamp |

**RLS Policies:**
- Users can view their own notification preferences
- Users can update their own notification preferences
- Users can insert their own notification preferences

---

## Database Enums

### `app_role`
```sql
CREATE TYPE public.app_role AS ENUM ('designer', 'manufacturer');
```

### `order_status`
```sql
CREATE TYPE public.order_status AS ENUM (
  'draft',
  'tech_pack_pending',
  'sent_to_manufacturer',
  'manufacturer_review',
  'production_approval',
  'sample_development',
  'quality_check',
  'shipping',
  'delivered',
  'cancelled'
);
```

### `notification_channel`
```sql
CREATE TYPE public.notification_channel AS ENUM ('email', 'sms', 'in_app');
```

---

## Database Functions

### `has_role(_user_id uuid, _role app_role)`
Checks if a user has a specific role. Used in RLS policies.

```sql
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;
```

### `handle_new_user()`
Automatically creates profile and notification preferences for new users.

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;
```

### `update_updated_at_column()`
Automatically updates `updated_at` timestamp on row updates.

```sql
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
```

---

## Storage Buckets

### `design-files`
**Purpose:** Stores uploaded design files, SVGs, images, and tech pack PDFs.

| Property | Value |
|----------|-------|
| Bucket Name | design-files |
| Public | Yes |

**RLS Policies:**
- Users can upload their own files (folder structure: `{user_id}/`)
- Users can view their own files
- Users can update their own files
- Users can delete their own files

---

## Edge Functions

### `generate-techpack`
**Purpose:** Generates AI-powered tech packs from design specifications.

**Location:** `supabase/functions/generate-techpack/index.ts`

**JWT Required:** No (public endpoint)

**Secrets Used:**
- GEMINI_API_KEY (for AI processing)
- LOVABLE_API_KEY (for Lovable AI gateway)

### `start-techpack-agents`
**Purpose:** Orchestrates multi-agent tech pack generation.

**Location:** `supabase/functions/start-techpack-agents/index.ts`

**JWT Required:** No (public endpoint)

**Secrets Used:**
- GEMINI_API_KEY
- LOVABLE_API_KEY

---

## Secrets Configuration

| Secret Name | Purpose | Where Used |
|-------------|---------|------------|
| GEMINI_API_KEY | Google Gemini AI API | Tech pack generation |
| STRIPE_SECRET_KEY | Stripe payment processing | Payment stage |
| LOVABLE_API_KEY | Lovable AI gateway | Tech pack agents |
| SUPABASE_URL | Supabase project URL | Edge functions |
| SUPABASE_ANON_KEY | Supabase anonymous key | Edge functions |
| SUPABASE_SERVICE_ROLE_KEY | Supabase admin access | Edge functions |
| SUPABASE_PUBLISHABLE_KEY | Public Supabase key | Client-side |
| SUPABASE_DB_URL | Database connection string | Edge functions |

---

## Migration Checklist

### If Moving to Your Own Supabase Instance:

#### 1. Environment Variables to Update

**In `.env` file:**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-id
```

**In Supabase Dashboard (Edge Function Secrets):**
- SUPABASE_URL
- SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- SUPABASE_DB_URL
- GEMINI_API_KEY
- STRIPE_SECRET_KEY
- LOVABLE_API_KEY

#### 2. Database Setup Steps

1. **Create Enums:**
   ```sql
   CREATE TYPE public.app_role AS ENUM ('designer', 'manufacturer');
   CREATE TYPE public.order_status AS ENUM (...);
   CREATE TYPE public.notification_channel AS ENUM ('email', 'sms', 'in_app');
   ```

2. **Create Tables:** Run all CREATE TABLE statements in order of dependencies

3. **Create Functions:** Run all function definitions

4. **Create Triggers:**
   ```sql
   CREATE TRIGGER on_auth_user_created
     AFTER INSERT ON auth.users
     FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
   ```

5. **Enable RLS:** `ALTER TABLE <table_name> ENABLE ROW LEVEL SECURITY;`

6. **Create RLS Policies:** Apply all policies from this document

#### 3. Storage Setup

1. Create `design-files` bucket
2. Set bucket to public
3. Apply storage RLS policies

#### 4. Edge Functions

1. Copy `supabase/functions/` directory
2. Update `supabase/config.toml` with your project_id
3. Deploy functions: `supabase functions deploy`

#### 5. Code Changes Required

**File: `src/integrations/supabase/client.ts`**
- This file is auto-generated; update via Supabase CLI or manually set:
```typescript
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'your-anon-key';
```

**File: `supabase/config.toml`**
```toml
project_id = "your-project-id"
```

#### 6. Auth Configuration

Enable in Supabase Dashboard:
- Email/Password authentication
- Google OAuth (if using)
- Auto-confirm email signups (for development)

---

## Entity Relationship Diagram

```
auth.users
    ├── user_roles (1:1)
    ├── profiles (1:1)
    ├── manufacturers (1:1, for manufacturer role)
    ├── designs (1:many, for designer role)
    └── notification_preferences (1:1)

designs
    ├── design_specs (1:1)
    ├── techpacks (1:many)
    ├── manufacturer_matches (1:many)
    ├── chats (1:many)
    ├── orders (1:many)
    └── attachments (1:many)

manufacturers
    ├── manufacturer_matches (1:many)
    ├── chats (1:many)
    └── orders (1:many)

orders
    ├── messages (1:many)
    └── production_updates (1:many)

chats
    └── messages (1:many)
```

---

## Current Project Configuration

- **Project ID:** rypykphmagvbdpedvuyn
- **Region:** Lovable Cloud (managed)
- **Database:** PostgreSQL 15+
- **Storage:** Supabase Storage

---

*Documentation generated for Formme Platform - Last updated: December 2024*
