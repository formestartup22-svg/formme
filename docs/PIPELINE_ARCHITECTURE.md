# Pipeline Architecture Documentation

This document explains where the production pipeline code lives for both **Designer** and **Manufacturer** workflows.

---

## Table of Contents
1. [Overview](#overview)
2. [Designer Pipeline](#designer-pipeline)
3. [Manufacturer Pipeline](#manufacturer-pipeline)
4. [Shared Components](#shared-components)
5. [Context & State Management](#context--state-management)
6. [Routing Structure](#routing-structure)
7. [Stage Flow Diagrams](#stage-flow-diagrams)

---

## Overview

The platform has two separate but interconnected pipelines:
- **Designer Pipeline**: Where designers create designs, generate tech packs, match with factories, and track production
- **Manufacturer Pipeline**: Where manufacturers receive orders, submit production details, and communicate with designers

Both pipelines share data through the `orders` table and communicate via the `messages` table.

---

## Designer Pipeline

### Entry Points

| File | Route | Purpose |
|------|-------|---------|
| `src/pages/DesignerDashboard.tsx` | `/designer` | Designer's main dashboard showing all designs |
| `src/pages/Workflow.tsx` | `/workflow` | Main production pipeline page |
| `src/pages/NewDesign.tsx` | `/new-design` | Start a new design (upload or create) |

### Main Pipeline Container

**File**: `src/pages/Workflow.tsx`

This is the main orchestrator for the designer pipeline. It:
- Wraps everything in `WorkflowProvider` context
- Renders `WorkflowStepper` for navigation
- Conditionally renders stage components based on `currentStage`

### Designer Stage Components

All located in `src/components/workflow/`:

| Stage | Component File | Database Fields Used |
|-------|---------------|---------------------|
| **Tech Pack** | `TechPackStage.tsx` | `designs`, `design_specs`, `techpacks` |
| **Factory Match** | `FactoryMatchStage.tsx` | `manufacturers`, `manufacturer_matches` |
| **Send Tech Pack** | (part of FactoryMatch) | `manufacturer_matches.status` |
| **Waiting for Approval** | `ManufacturerSelectionStage.tsx` | `manufacturer_matches`, `orders` |
| **Review Production** | `ProductionStage.tsx` | `orders.production_*` fields |
| **Make Payment** | `PaymentStage.tsx` | `orders.price` |
| **Sample Development** | `SampleStage.tsx` | `orders.sample_*` fields |
| **Quality Check** | `QualityStage.tsx` | `orders.qc_*` fields |
| **Shipping** | `ShippingStage.tsx` | `orders.shipping_*` fields |

### Designer Stage Sequence

```
1. tech-pack       → TechPackStage.tsx
2. factory-match   → FactoryMatchStage.tsx
3. send-techpack   → (handled in FactoryMatchStage)
4. manufacturer-selection → ManufacturerSelectionStage.tsx
5. production      → ProductionStage.tsx
6. payment         → PaymentStage.tsx
7. sample          → SampleStage.tsx
8. quality         → QualityStage.tsx
9. shipping        → ShippingStage.tsx
```

### Designer Stepper Component

**File**: `src/components/workflow/WorkflowStepper.tsx`

Controls the visual stepper UI showing:
- Current stage indicator
- Completed stages (checkmarks)
- Locked stages (cannot access yet)
- Click navigation between accessible stages

---

## Manufacturer Pipeline

### Entry Points

| File | Route | Purpose |
|------|-------|---------|
| `src/pages/ManufacturerDashboard.tsx` | `/manufacturer` | Manufacturer's main dashboard |
| `src/pages/ManufacturerOrderWorkspace.tsx` | `/manufacturer/order/:id` | Individual order workspace |

### Main Pipeline Container

**File**: `src/pages/ManufacturerOrderWorkspace.tsx`

This is the manufacturer's equivalent of `Workflow.tsx`. It:
- Fetches order details by ID from URL params
- Renders `ManufacturerStepper` for navigation
- Renders stage-specific content based on `currentStage`
- Includes `FloatingMessagesWidget` for designer communication

### Manufacturer Stage Components

Located in `src/pages/ManufacturerOrderWorkspace.tsx` (inline stages) and `src/components/workflow/`:

| Stage | Location | Purpose |
|-------|----------|---------|
| **Tech Pack Review** | Inline in workspace | View designer's tech pack |
| **Production Approval** | Inline in workspace | Upload fabric specs, GSM, timeline |
| **Sample Development** | Inline in workspace | Upload sample photos, notes |
| **Quality Check** | Inline in workspace | Upload QC photos by size, notes |
| **Shipping** | Inline in workspace | Enter tracking info, dispatch |

### Manufacturer Stepper Component

**File**: `src/components/workflow/ManufacturerStepper.tsx`

Similar to `WorkflowStepper.tsx` but with manufacturer-specific stages:
- Tech Pack (view only)
- Production Approval
- Sample Development
- Quality Check
- Shipping

---

## Shared Components

### Messaging Components

| File | Used By | Purpose |
|------|---------|---------|
| `src/components/workflow/FactoryMessaging.tsx` | Designer | Chat with selected manufacturer |
| `src/components/workflow/FloatingMessagesWidget.tsx` | Both | Floating chat widget |
| `src/components/manufacturer/ManufacturerMessaging.tsx` | Manufacturer | Chat with designers |

### Navigation Components

| File | Purpose |
|------|---------|
| `src/components/workflow/StageHeader.tsx` | Header with back button for stages |
| `src/components/workflow/StageNavigation.tsx` | Next/Previous stage buttons |

---

## Context & State Management

### Workflow Context

**File**: `src/context/WorkflowContext.tsx`

Provides global workflow state:

```typescript
interface WorkflowContextType {
  workflowData: WorkflowData;        // All workflow form data
  updateWorkflowData: Function;       // Update workflow data
  currentStage: string;               // Current active stage
  setCurrentStage: Function;          // Navigate to stage
  completedStages: string[];          // List of completed stages
  markStageComplete: Function;        // Mark stage done
  getProgress: Function;              // Calculate progress %
  isStageAccessible: Function;        // Check if stage is unlocked
}
```

### WorkflowData Interface

```typescript
interface WorkflowData {
  // Tech Pack
  designName: string;
  category: string;
  description: string;
  measurements: Record<string, string>;
  fabricSpecs: Array<{type, fiberPercentage, gsm}>;
  constructionNotes: string;
  designSketch: File | null;
  
  // Factory Match
  selectedManufacturer: Manufacturer | null;
  matchScore: number;
  
  // Production
  productionTimeline: {...};
  
  // Sample
  sampleStatus: string;
  samplePhotos: string[];
  
  // QC
  qcResult: string;
  qcPhotos: {...};
  
  // Shipping
  trackingNumber: string;
  shippingStatus: string;
  
  // Communication
  communicationLog: Message[];
}
```

---

## Routing Structure

### Designer Routes

```typescript
// In src/App.tsx or router config
/designer              → DesignerDashboard.tsx
/workflow              → Workflow.tsx (with ?design=ID&stage=STAGE)
/new-design            → NewDesign.tsx
/studio                → StudioSelection.tsx
/design-studio         → DesignStudio.tsx
/professional-studio   → ProfessionalStudio.tsx
```

### Manufacturer Routes

```typescript
/manufacturer              → ManufacturerDashboard.tsx
/manufacturer/order/:id    → ManufacturerOrderWorkspace.tsx
```

### URL Parameters

Designer workflow uses query params:
- `?design=UUID` - Which design to work on
- `?stage=stage-name` - Which stage to display

Manufacturer workspace uses route params:
- `/manufacturer/order/:id` - Order ID in URL path

---

## Stage Flow Diagrams

### Designer Flow

```
┌─────────────────┐
│   Dashboard     │ (/designer)
└────────┬────────┘
         │ Click design
         ▼
┌─────────────────┐
│   Tech Pack     │ Upload SVG, fill specs
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Factory Match  │ View matching manufacturers
└────────┬────────┘
         │ Send to manufacturers
         ▼
┌─────────────────┐
│   Waiting for   │ View responses, chat
│    Approval     │ Finalize contract
└────────┬────────┘
         │ Manufacturer accepts
         ▼
┌─────────────────┐
│    Review       │ Wait for manufacturer
│   Production    │ Approve/reject params
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Make Payment   │ Stripe checkout
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Sample       │ Review samples
│  Development    │ Approve/reject
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Quality Check  │ Review QC photos
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Shipping     │ Track shipment
└─────────────────┘
```

### Manufacturer Flow

```
┌─────────────────┐
│   Dashboard     │ (/manufacturer)
└────────┬────────┘
         │ Click order
         ▼
┌─────────────────┐
│   Tech Pack     │ Review designer specs
│    Review       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Production    │ Upload fabric specs
│    Approval     │ Set timeline
└────────┬────────┘ → Wait for designer approval
         │
         ▼
┌─────────────────┐
│    Sample       │ Upload sample photos
│  Development    │
└────────┬────────┘ → Wait for designer approval
         │
         ▼
┌─────────────────┐
│  Quality Check  │ Upload QC photos by size
└────────┬────────┘ → Wait for designer approval
         │
         ▼
┌─────────────────┐
│    Shipping     │ Enter tracking info
│                 │ Mark dispatched
└─────────────────┘
```

---

## Data Flow Between Pipelines

```
DESIGNER                          DATABASE                      MANUFACTURER
────────                          ────────                      ────────────

Creates design ───────────────► designs table
                                     │
Generates tech pack ──────────► techpacks table
                                     │
Sends to manufacturers ───────► manufacturer_matches ◄──────── Views matches
                                     │
                                     │
                              ┌──────┴──────┐
                              │   orders    │
                              │   table     │
                              └──────┬──────┘
                                     │
Reviews production params ◄───┤              ├───► Uploads production specs
                               │              │
Approves production ──────────┤              │
                               │              │
Reviews samples ◄─────────────┤              ├───► Uploads sample photos
                               │              │
Approves samples ─────────────┤              │
                               │              │
Reviews QC ◄──────────────────┤              ├───► Uploads QC photos
                               │              │
Approves QC ──────────────────┤              │
                               │              │
Tracks shipping ◄─────────────┤              ├───► Updates shipping status
                               │              │
                              └──────────────┘
                                     │
                              messages table ◄───── Real-time messaging
```

---

## Key Database Fields for Pipeline Stages

### Orders Table Stage-Related Fields

```sql
-- Production Approval Stage
production_params_approved    BOOLEAN   -- Designer approved?
production_params_submitted_at TIMESTAMP
production_start_date         DATE
production_completion_date    DATE
production_timeline_data      JSONB
fabric_type                   TEXT
gsm                          TEXT
shrinkage                    TEXT
color_fastness               TEXT

-- Sample Development Stage  
sample_approved              BOOLEAN   -- Designer approved?
sample_submitted_at          TIMESTAMP

-- Quality Check Stage
qc_approved                  BOOLEAN   -- Designer approved?
qc_submitted_at              TIMESTAMP
qc_result                    TEXT
qc_notes                     TEXT
qc_photos_s                  TEXT      -- Size S photos
qc_photos_m                  TEXT      -- Size M photos
qc_photos_l                  TEXT      -- Size L photos
qc_photos_xl                 TEXT      -- Size XL photos

-- Status tracking
status                       order_status ENUM
```

---

## File Summary

| Purpose | Designer Files | Manufacturer Files |
|---------|---------------|-------------------|
| **Dashboard** | `pages/DesignerDashboard.tsx` | `pages/ManufacturerDashboard.tsx` |
| **Pipeline Container** | `pages/Workflow.tsx` | `pages/ManufacturerOrderWorkspace.tsx` |
| **Stepper** | `components/workflow/WorkflowStepper.tsx` | `components/workflow/ManufacturerStepper.tsx` |
| **Stage Components** | `components/workflow/*Stage.tsx` | Inline in workspace |
| **Context** | `context/WorkflowContext.tsx` | N/A (local state) |
| **Messaging** | `components/workflow/FactoryMessaging.tsx` | `components/manufacturer/ManufacturerMessaging.tsx` |

---

## Migration Notes

If moving to your own Supabase:

1. **No code changes needed** for pipeline logic - it uses the Supabase client
2. **Update environment variables** in `.env`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
3. **Migrate edge functions** from `supabase/functions/`
4. **Run database migrations** to create tables with same schema
5. **Set up storage bucket** `design-files` with same RLS policies
