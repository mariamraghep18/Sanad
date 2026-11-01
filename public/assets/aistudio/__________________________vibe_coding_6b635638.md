# برومبتات بناء بَيْعة بالـ vibe coding

انسخ البرومبت الرئيسي أولًا في أداة توليد الكود، وارفق `bay3a_blueprint.md` لو الأداة تدعم الملفات. بعده نفّذ المراحل بالترتيب. البرومبتات بالإنجليزي، لكن واجهة التطبيق بالعربي RTL، وأداة البناء يُطلب منها شرح التسليم بالعربي.

هذه تعليمات تنفيذ، وليست كودًا تم تشغيله. لو الأداة لا تدعم Next.js أو Inngest في بيئتها، اطلب منها توضيح القيد أولًا؛ لا تدعها تبدل الستاك أو توهمك أن background jobs موجودة. اختبر وظيفة حقيقية في نهاية كل مرحلة، وخد checkpoint قبل المرحلة التالية.

## 1. البرومبت الرئيسي — Master prompt

```text
You are a senior product engineer building Bay3a / بَيْعة, an Arabic-first
merchant order-intake SaaS. Read the attached product blueprint if available.
Use Arabic for delivery explanations and all user-facing UI copy.

PRODUCT
A merchant pastes an order message, uploads ONE chat screenshot, or uploads
a short Arabic voice file. The system proposes a structured order with
field-level evidence, missing-data flags, and an editable review screen.
The merchant explicitly saves or approves it. Approved orders are tracked
through fulfillment. AI never approves, ships, pays, or sends messages.

TARGET MVP
One owner account per workspace, one workspace per account. The membership
schema must support later roles, but do not build staff invitations yet.
Default market configuration is Egypt, EGP, with country and timezone
explicitly confirmed by the user. Country is never guessed by the model.

SCOPE
Authentication, onboarding, order list, manual order entry, text/image/audio
intake, durable background extraction, evidence-based review, approval,
status updates, basic product catalog, customer list, print-friendly order
summary, protected CSV export, copyable confirmation text, usage quota,
source deletion and documented retention behavior.

EXCLUDE
WhatsApp Business integration, Instagram integration, payment processing,
shipping-provider integration, stock accounting, tax invoices, public
customer portals, native mobile apps, vector databases and autonomous agents.
A WhatsApp icon can label an imported screenshot, never claim live sync.
Opening WhatsApp or copying text must never be recorded as message_sent.

STACK
Next.js App Router + TypeScript; compatible pinned dependency versions;
Tailwind CSS; shadcn/ui configured for RTL; React Hook Form + Zod;
TanStack Query for interactive server state and bounded polling;
Supabase Auth + Postgres + private Storage; Inngest for background jobs;
Vitest for unit/integration tests and Playwright for E2E.
Use dnd-kit only after list-based status changes work.
Keep the lockfile. Use the official SDK contracts for installed versions.
Do not copy obsolete SDK request shapes from memory.

DESIGN
Root lang=ar and dir=rtl. IBM Plex Sans Arabic or a suitable bundled Arabic
font. Preserve LTR inside phone numbers, IDs and suitable English strings.
Background #F7F8FA, surface #FFFFFF, text #0F172A, muted #64748B,
border #E2E8F0, primary #6D5EF5, success #0F766E,
warning text #92400E on #FFFBEB, danger #B91C1C.
16px cards, 10px controls, 8px-based spacing. Test actual contrast.
Professional calm dashboard; no giant gradients or decorative AI robots.
Right desktop sidebar: الطلبات / العملاء / المنتجات / الإعدادات.
Mobile order list instead of forced horizontal Kanban. Review screen uses
order/source tabs on mobile and two panes on desktop. Keep review actions
visible without hiding errors. Minimum 44px touch targets, visible focus,
keyboard support, reduced-motion support and accessible form labels.

ROUTES
/ /login /onboarding /app/orders /app/orders/new
/app/reviews/[reviewId] /app/orders/[orderId]
/app/products /app/customers /app/settings

CORE RULES
1. AI output is a proposal, never trusted application state.
2. Missing values are null, never silently defaulted or invented.
3. Every proposed field needs source evidence and a review state.
4. Human-verification flags can only be written by application code after
   explicit user review; the model cannot emit them.
5. Multiple orders, unreadable content or conflicting facts block automatic
   progression and offer split/reupload/manual-entry guidance.
6. Product candidates must be real rows in the same workspace. AI cannot
   invent SKUs, product IDs or prices. A free-text item is allowed.
7. Keep original extraction immutable and persist merchant edits separately.
8. Confirmed orders require validated contact details, positive integer
   quantities, complete unit prices and a reviewed address for delivery.
   Pickup does not require a delivery address. Drafts can remain incomplete.
9. Store money as integer EGP minor units. Server calculates totals.
   Missing prices mean total=null, not zero. Never use floating-point money.
10. Store timestamps in UTC; display in the workspace timezone.
11. Phone country comes from explicit user settings or input, not language,
    model inference, or a guessed prefix. Preserve raw phone text.
12. Order summary is not a legal tax invoice. Print-to-PDF is acceptable.

DATA MODEL
workspaces, workspace_members, products, product_variants, customers,
sources, extraction_jobs, extractions, reviews, orders, order_items,
order_events, usage_ledger and idempotency_records.
Every sensitive row is workspace-scoped. Use composite foreign keys or
validated equivalent constraints to prevent cross-workspace relationships.
Snapshot confirmed product labels, prices and customer delivery details.
Catalog changes must not rewrite historical orders.

SECURITY IS NOT OPTIONAL
Enable RLS on all exposed sensitive tables and private Storage policies.
Use membership records, not editable user_metadata, for authorization.
Never expose an AI key or a Supabase secret/service-role key in browser code.
Backend privileged mutations must explicitly authorize user, workspace,
operation, and every referenced record.

Do not protect only Next.js routes while leaving the same writes possible
through the Supabase Data API. Browser access to operational tables should
be read-only where possible. Revoke direct authenticated/anon mutations on
jobs, extractions, reviews, orders, order_items, order_events, usage ledgers
and idempotency records. Perform sensitive writes through authorized server
services or narrowly scoped validated RPCs. Do not grant a broad public RPC
that bypasses approval, quota, ownership, version checks or state machines.
Apply equivalent restrictions to catalog/customer/workspace mutations.
If choosing a different grants/RPC strategy, document it and prove it with
adversarial direct-Data-API tests before proceeding.

Validate actual file signatures, decoded image limits and audio duration.
Allow only supported image/audio formats; never accept SVG/HTML/executables.
Do not fetch arbitrary external user URLs. Use private paths and short-lived
signed URLs after authorization. Avoid PII in analytics and error logs.
Use secure session handling and appropriate CSRF/origin protection for
cookie-authenticated state-changing endpoints.

BACKGROUND JOBS
An authenticated server endpoint creates a durable job with a quota
reservation and sends an Inngest event containing only jobId.
Use the official production signature verification for /api/inngest.
The worker reloads source/workspace from the database and validates job
eligibility before each phase. Do not trust workspace IDs in event payloads.
Have explicit enqueue_pending and retry-dispatch behavior when creating the
DB job succeeds but event delivery fails. Refreshing the page must recover
job state. Do not run AI work as fire-and-forget inside a request.
Use bounded retries for transient errors only, configured timeouts and safe
failure codes. Idempotency plus DB unique constraints prevent duplicate
local results and orders. Do not promise exactly-once external AI billing.
Recheck source tombstones before output commit to prevent deleted data from
being resurrected by an in-flight job.

AI ADAPTERS
Server-only extractOrder() and transcribeAudio() behind configurable
providers/models. Validate capability support against current official docs.
Text -> extract; image -> supported vision extraction; audio -> transcript
then the same extraction schema. Handle refusals and incomplete responses.
Use supported strict structured output + application validation.
Treat user content as untrusted data. No tools, database access, network
browsing, messaging or payment powers for the extraction model.
Never expose fabricated numeric confidence as accuracy.

MOCK MODE
Build an explicit deterministic mock provider for development and E2E.
Use synthetic data and a visible بيانات تجريبية label.
Real user extraction in production must fail clearly if required provider
configuration is absent; never silently return demo extraction results.
Demo UI must not imply that a real file was analyzed.

IMPLEMENTATION METHOD
Do NOT generate the entire product in one untested pass.
First output a concise architecture, folder structure, phase plan and any
blocking platform constraints. Then implement phase 1 only: usable RTL
intake -> deterministic demo review -> save draft flow with testable states.
After each stage report changed files, migrations, environment variables,
commands actually run, actual test outcomes and remaining limitations.
Never claim an unrun test passed. Avoid unrelated rewrites.
Do not deploy publicly or configure payments without a separate request.
```

## 2. المرحلة الأولى — واجهة وتجربة فعلية بالـ demo

```text
Implement phase 1 of Bay3a without live AI or real customer data.
Keep the existing architecture and the master prompt constraints.
Build reusable RTL controls and the layout with these screens:
landing/demo, order list, intake tabs, review and order detail.
Use a visible deterministic demo provider, not a fake production integration.

Synthetic demo message:
عايزة تيشيرت أسود مقاس M، قطعة واحدة، والشحن للمعادي.
Expected proposal: product تيشيرت, color أسود, size M, quantity 1,
address المعادي marked needs_review; name, phone and prices missing.
Show source evidence beside the fields. Missing phone must remain null.

The review must support editing, adding/removing item rows, saving an
incomplete draft, and showing why approval is blocked.
Use review states: من المصدر / محتاج مراجعة / ناقص / عدّله المستخدم.
Include loading, empty, no-results, invalid file, retryable failure,
expired-session and unsaved-changes states. Controls must have outcomes.
Do not show fake progress percentages or invented success notifications.
Mobile at 360px must have no accidental horizontal overflow.
Use one canonical mocked service layer so real APIs can replace it later.

Run typecheck and available component tests. Provide test outcomes and a
short manual script for intake -> edit -> save -> reopen.
Stop after phase 1; list what is not implemented yet.
```

## 3. المرحلة الثانية — Auth وقاعدة البيانات والعزل

```text
Implement Supabase Auth, owner-only workspace onboarding, migrations,
constraints, indexes, private source Storage and authorization services.
Use the existing UI; do not redesign it.

Create migrations for the canonical tables. Represent money as integer
minor units. Add row versions, UTC timestamps and composite workspace
relationships. Create a workspace and its owner membership atomically;
prevent duplicate workspaces from repeated onboarding submissions.

Enable RLS and explicit grants. Avoid recursive workspace-members policies.
If using SECURITY DEFINER helpers, place them in a non-exposed private
schema, pin search_path, qualify all names and restrict execution grants.
Keep admin clients in server-only modules.

Enforce the master prompt's direct-Data-API protection: the browser cannot
write order status, totals, workspace IDs, job state, AI output, quotas or
review approval directly. User-scoped reads must still be RLS protected.
Server mutations explicitly authorize and validate every operation.
Private Storage access must check membership and the expected path/bucket,
not merely whether the user is logged in. Verify upload completion server-side.

Write integration tests with owner A/workspace A and owner B/workspace B.
Try cross-workspace SELECT, INSERT, UPDATE, DELETE, relationship linking,
Storage download/upload, job access, export and direct REST/RPC writes.
Unauthenticated access and editable user_metadata must not grant membership.
Test expired sessions and concurrent onboarding.

Provide .env.example with placeholders only. Never print real keys.
Report migration commands and tests actually run; do not proceed to live AI
until tenant isolation tests pass.
```

## 4. المرحلة الثالثة — الطلب اليدوي والحسابات

```text
Implement the real manual-order vertical slice before AI integration.
Support draft save/reopen, validation, explicit confirmation, order details,
server-side pagination/search/filtering, status changes, timeline,
print-friendly summary and protected safe CSV export.

Approval requirements: confirmed customer name and phone; at least one item;
positive integer quantity; integer nonnegative unit price; fulfillment;
reviewed delivery address plus explicit shipping charge for delivery.
Shipping can be zero, but missing is not zero. Pickup needs no address.
Missing prices produce total=null. Reject discount above subtotal+shipping.
All calculations run on the server and use integer minor units.

State machine:
draft -> confirmed -> preparing -> shipped -> delivered for delivery;
preparing -> delivered for pickup;
unfinished eligible orders -> cancelled; delivered/cancelled terminal in MVP.
Validate transitions server-side and protect them from direct DB writes.

Approve inside one transaction. Use request idempotency and unique review
approval constraints. Two clicks must return one order, not two.
Same Idempotency-Key with a different payload must return conflict.
Use optimistic row versions for review edits and order changes.
Snapshot customer/item/price details so later catalog edits do not rewrite
existing orders. Never automatically merge customers solely by name.
Generate confirmation text from final validated order data as a template.
Copy/open links are not evidence of sending a message.

Test totals, null totals, discount bounds, approval guards, invalid status
jumps, pickup vs delivery, double submit, stale version, cross-tenant access,
CSV formula injection and print layout. Report actual results.
```

## 5. المرحلة الرابعة — AI للنص مع jobs حقيقية

```text
Implement text extraction only using the existing server-only AI adapter,
canonical extraction schema, authorized API routes and Inngest.
Verify the installed provider SDK's current structured-output request shape.
Do not hard-code an unverified model name or use browser-side provider calls.

Extraction schema requirements:
- schema_version
- input_assessment: single_order | multiple_orders | not_an_order | unreadable
- customer_name, phone, address, fulfillment, notes
- items: name, color, size, quantity, stated_unit_price
- warnings and missing_fields
Every fact is an object with value, evidence and review_state.
Allow null for absent values; forbid unknown keys; use the schema subset
supported by the provider. Keep human verification outside model output.
Reject unsupported IDs and semantically invalid quantities/prices.
Keep the exact original extraction and the merchant's editable review separate.

Implement a durable job record, quota reserve/consume/release and a unique
idempotency key. Inngest events contain jobId only. The worker loads and
validates the source and workspace, then processes bounded steps.
Handle create-job / event-send partial failure as enqueue_pending with an
authorized retry-dispatch action. Do not leave a forever-queued job.
Use the official signature verification and serverless runtime configuration.
Do not auto-retry invalid inputs, refusals or unsupported schema errors.

The UI polls authorized job state with backoff and stops on terminal states.
Page refresh resumes the same job and does not trigger a new AI call.
AI output must never directly create a confirmed order.
Proposed product matches come from this workspace's catalog only.
Use actual transcript/text evidence. Verify text quotes exist in the input.

Add deterministic tests for missing phone, missing quantity, conflicting
names, two orders, non-order input, refusal, incomplete output, prompt
injection, transient timeout, retry exhaustion, event delivery failure,
double events, quota race, deleted source and stale output commit.
Keep a provider mock for CI. Mark live-provider tests separately.
Report actual outcomes and remaining operational limits.
```

## 6. المرحلة الخامسة — الصور والفويس

```text
Extend the tested extraction pipeline to ONE image and ONE short audio file.
Keep the same canonical schema, review rules, job ownership and manual fallback.
Product limits: image <=8MB, audio <=15MB and <=120 seconds, text <=6000 chars.
Validate these against the real provider and host configuration; if a limit
is unsupported, surface the constraint instead of pretending it works.

Validate signatures, decoded image dimensions and audio duration server-side.
Reject SVG, HTML, executables, misleading MIME and oversized/decompression
inputs. Re-encode allowed images to remove unnecessary metadata and reduce
size safely. Store in a private workspace-scoped bucket.

Image: use a verified vision-capable server adapter. Show source preview and
extracted quotes; never imply precise bounding boxes unless actually measured.
Audio: transcribe first, then extract via the text adapter. Preserve transcript
for review. Do not manufacture time offsets, names or missing phone digits.
File upload is sufficient; do not add microphone recording permissions yet.

Track transcription and extraction separately in job steps and usage metadata.
Never pass private source text or signed URLs inside event payloads.
File selection alone must not send data to the provider; the user presses
استخرج مسودة after seeing the processing notice.

Test unreadable images, rotated screenshots, partial numbers, unclear Arabic
voice, provider errors, unsupported audio containers, and refresh during
transcription. Keep actual file parsing separate from mocked AI calls.
Show actionable errors and حفظ مسودة / أدخل الطلب يدويًا alternatives.
```

## 7. المرحلة السادسة — الكتالوج والعملاء وتجهيز الإطلاق

```text
Implement simple catalog CRUD with optional SKU, aliases, product variants,
reference prices and archiving. Candidate matching is deterministic scoped
search first; do not add embeddings unless actual evaluation justifies them.
A match is only a proposal. Price changes require visible merchant confirmation.
A free-text order item is allowed. Preserve historical snapshots.

Customer list must use only confirmed/merchant-entered customer data.
Do not create customers from every unreviewed extraction. Same phone within
a workspace offers a user-confirmed match; never merge across workspaces.

Add source deletion and documented retention preferences. Use tombstones and
cancel unfinished jobs before removing source data. Check again before result
commit. Delete corresponding transcript and extracted evidence when deleting
a source, while explaining separately retained final-order snapshots.
Do not promise time-exact physical cleanup until a managed cleanup process
is actually implemented and tested. Expired sources must not get new signed
URLs. Document backup and provider-retention limitations honestly.

Add request IDs, safe error tracking and latency/usage metrics without raw
customer messages, images, phone numbers or addresses in telemetry.
Protect CSV from spreadsheet formula injection. Add rate limits and quota
concurrency controls. Ensure API/DB/RPC routes cannot bypass business rules.

Run unit, integration, RLS and E2E tests available in this environment.
Test 360, 390, 768 and 1440px, keyboard navigation, focus traps, screen-reader
labels and reduced motion. Do not add fake reviews, active-user counts,
accuracy percentages, payments or revenue dashboards.
Deliver a deployment checklist, actual missing settings, test results,
known limitations and rollback instructions. Do not claim production-ready
unless the listed gates have actually passed.
```

## 8. برومبت إصلاح مشكلة بدون تدمير المشروع

```text
Fix the specific failing behavior below without rewriting unrelated features.

Observed behavior: [describe exactly what happened]
Expected behavior: [describe the desired result]
Reproduction steps: [list steps]
Error / stack trace: [paste sanitized logs without secrets or customer PII]
Relevant files: [paths if known]

First identify the likely root cause and the smallest safe change.
Preserve RTL, schema compatibility, authorization, idempotency and existing UX.
Do not bypass validation, disable RLS, add admin keys to the client or replace
real API results with mocks to make the error disappear.
Add a regression test, run relevant tests and report only commands actually
run and their real outcomes. Explain migrations or env changes if required.
```

## 9. برومبت فحص أمني قبل تجربة العملاء

```text
Review Bay3a's implemented code, not only its UI, for the following concrete
release gates. Fix confirmed issues with focused patches and regression tests.

Can owner A read/write workspace B records through Next.js, Supabase REST,
RPC, Storage, export, review URLs or job IDs?
Can a client mutate workspace_id, status, totals, quota, AI output or approval
without the validated server operation?
Can repeated submits/events create duplicate orders or consume quota twice?
Can missing phone/price/address be approved? Can AI mark fields human verified?
Can deleted sources be resurrected by an in-flight job?
Can an expired/revoked user get a new signed URL or privileged mutation?
Are provider/backend secrets present in client bundles or logs?
Are raw customer messages or phone numbers present in telemetry?
Can MIME spoofing, unsafe URL fetches, prompt injection, raw HTML or CSV
formula payloads create unauthorized effects?
Can the app silently show mocked AI output for real content in production?

For every finding provide file/line, exploit scenario, patch and test.
Differentiate tested findings from assumptions. Do not produce a generic
security checklist or declare compliance with a law without evidence.
```

## 10. تستخدم الملفات إزاي؟

ابدأ بالبرومبت الرئيسي، وخلي `bay3a_blueprint.md` مرجعًا ثابتًا. صورة `bay3a_ui_concept.png` مرجع بصري للألوان وترتيب العناصر، وليست قياسًا pixel-perfect أو واجهة شغالة. أسماء الحقول وقواعد الأمان والاعتماد في المواصفات أهم من تقليد الصورة حرفيًا.

لو الأداة نفذت شاشة حلوة لكن كل الأزرار بتعمل toast نجاح، ارجع لبرومبت المرحلة المطلوبة واطلب المسار الفعلي واختباراته. لا تعتبر وجود ملفات API دليلًا أن التكامل شغال، ولا ظهور «تم التحليل» دليلًا أن الملف اتحلل.

اشتغل بالترتيب: واجهة demo → عزل البيانات → طلب يدوي → AI نص → صور وفويس → اختبارات وتجربة محدودة. أي توسع قبل المسار ده غالبًا هيزود كمية كود أكتر من قيمة المنتج.
