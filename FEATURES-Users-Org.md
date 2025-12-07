## User & Organization Management — Feature Specification (MVP → Scale)

### 1) Scope (from requirements)
- Comprehensive account, identity, and institution management for researchers, universities, schools, companies, and government entities.
- Verified registration, SSO, MFA, RBAC, delegated administration, and full auditability.
- Bilingual (AR/EN), accessibility (WCAG 2.1 AA), PDPL/NDMO/NCA-aligned security and privacy.

### 1-أ) النطاق (بالعربية)
- إدارة شاملة للحسابات والهوية والمؤسسات للباحثين والجامعات والمدارس والشركات والجهات الحكومية.
- تسجيل موثّق، دخول موحّد SSO، مصادقة متعددة العوامل MFA، صلاحيات أدوار RBAC، إدارة تفويضية، وتتبع تدقيقي كامل.
- واجهة ثنائية اللغة (العربية/الإنجليزية) وإتاحة وفق WCAG 2.1 AA، مع أمن وخصوصية متوافقة مع PDPL/NDMO/NCA.

---

### 2) Capabilities (Minimum to implement)
1. Multi-Type Onboarding
   - Role-specific signup: Researcher, Reviewer, Institution Admin, Company User, Government User, Student/Teacher.
   - Institution-aware flows (join existing, create-and-verify new).
2. National & International Verification
   - Saudi users: Nafath OAuth/OIDC (account verification + attributes).
   - International users: Passport/domain email verification; optional DUNS/edu email.
3. SSO (federation)
   - Integration via OIDC/SAML using Keycloak (IdP broker) to institutional IdPs and eduGAIN.
   - Central session management with refresh token rotation.
4. MFA
   - TOTP (authenticator app) baseline; SMS/email OTP as fallback; FIDO2/WebAuthn for admins.
   - Device binding (signed device fingerprint + risk score).
5. RBAC
   - Roles: ADMIN, INSTITUTION_ADMIN, RESEARCHER, REVIEWER, COMPANY_USER, STUDENT.
   - Resource-scoped permissions via policy engine (OPA) and app-level guards.
6. Institutional Management
   - Create institution profile, verify legal/academic identity.
   - Manage members (invite, approve, revoke), org structure (departments/units), and affiliated projects.
7. Profile & Credential Management
   - Verified profile with expertise, credentials, affiliations, ORCID.
   - Upload artifacts (certs, IDs) with object-lock and access tags.
8. Digital Reputation Index (v1)
   - Inputs: contributions (projects, proposals, reviews), papers, patents, funding, partner feedback.
   - Transparent weighting; per-user and per-institution scores.
9. Delegated Administration
   - Institution Admins can grant/revoke roles within their institution; SoD controls (separation of duties).
10. Audit & Activity Logging
   - Auth events, role changes, member lifecycle, policy decisions; immutable append-only stream → SIEM.
11. Compliance & Data Security
   - PDPL/NDMO/NCA; ISO/IEC 27001 & 27701; NIST SP 800-53; SOC 2 alignment.
   - Encryption in transit (TLS 1.3) and at rest (KMS envelope); least privilege; RLS in DB.
12. Federated International Access
   - eduGAIN + institution IdPs via Keycloak broker; scoped claims; attribute mapping.
13. Localization & Accessibility
   - AR/EN; RTL; WCAG 2.1 AA components and forms; typography tuned for Arabic.
14. Adaptive Authentication
   - Risk engine (geo, device, velocity, time-of-day) → step-up MFA when anomalous.
15. API Integration
   - Contract-first APIs; institution directory sync; national registries (e.g., Nafath); webhook events.

### 2-أ) القدرات (الحد الأدنى للتنفيذ)
1. استقبال متعدّد الأنواع
   - تسجيل حسب الدور: باحث، مراجع، مدير مؤسسة، مستخدم شركة، مستخدم حكومي، طالب/معلم.
   - مسارات واعية بالمؤسسة (الانضمام لمؤسسة قائمة أو إنشاء مؤسسة جديدة والتحقق منها).
2. التحقق الوطني والدولي
   - للمستخدمين داخل المملكة: تكامل مع «نفاذ» (OAuth/OIDC) للتحقق والسمات.
   - للمستخدمين الدوليين: تحقق عبر جواز السفر/نطاق البريد المؤسسي؛ خيار DUNS/edu.
3. الدخول الموحّد SSO
   - عبر OIDC/SAML باستخدام Keycloak (وسيط) لجهات النفاذ والمؤسسات وeduGAIN.
   - إدارة الجلسات مركزياً وتدوير رموز التحديث.
4. المصادقة المتعددة MFA
   - TOTP كأساس؛ رسائل نصية/بريد احتياطي؛ FIDO2/WebAuthn للحسابات الحساسة.
   - ربط الجهاز (بصمة جهاز موقّعة + درجة مخاطر).
5. صلاحيات الأدوار RBAC
   - أدوار: ADMIN، INSTITUTION_ADMIN، RESEARCHER، REVIEWER، COMPANY_USER، STUDENT.
   - أذونات مرتبطة بالموارد عبر OPA وحراس التطبيق.
6. إدارة المؤسسات
   - إنشاء ملف مؤسسة والتحقق من الصفة الأكاديمية/القانونية.
   - إدارة الأعضاء (دعوة/اعتماد/إلغاء)، البُنى (أقسام/وحدات)، والمشاريع التابعة.
7. الملفات والاعتمادات
   - ملف موثّق بخبرات واعتمادات وروابط ORCID.
   - رفع مستندات (شهادات/هوية) مع قفل للكائنات وسياسات وصول.
8. مؤشر السمعة الرقمي (نسخة أولى)
   - مدخلات: المساهمات، الأوراق، البراءات، التمويل، تقييمات الشركاء.
   - أوزان شفافة؛ درجات للمستخدم والمؤسسة.
9. الإدارة التفويضية
   - تمكين مديري المؤسسات من منح/إلغاء الأدوار داخل مؤسساتهم؛ ضوابط فصل الواجبات.
10. السجل والتدقيق
   - أحداث الدخول، تغييرات الأدوار، دورة حياة الأعضاء، قرارات السياسات؛ تيار غير قابل للتلاعب إلى SIEM.
11. الامتثال والأمن
   - PDPL/NDMO/NCA؛ ISO/IEC 27001 & 27701؛ NIST 800-53؛ توافق SOC 2.
   - تشفير أثناء النقل (TLS 1.3) وفي السكون (KMS)؛ أقل الصلاحيات؛ عزل صفّي RLS.
12. النفاذ الدولي الموحّد
   - eduGAIN + مزودو هوية المؤسسات عبر Keycloak؛ تعيين السمات والادعاءات.
13. التعريب والإتاحة
   - عربية/إنجليزية؛ اتجاه RTL؛ عناصر ونماذج متوافقة WCAG؛ ضبط خط عربي.
14. المصادقة التكيفية
   - محرّك مخاطر (الموقع/الجهاز/السرعة/الوقت) → ترقية MFA عند الاشتباه.
15. تكامل واجهات البرمجة
   - واجهات «عقد أولاً»؛ مزامنة دليل المؤسسات؛ السجلات الوطنية (مثل نفاذ)؛ Webhooks.

---

### 3) Core Flows
- Registration (email/IdP) → role & institution selection → verification (Nafath/passport) → MFA setup → profile completion.
- Join institution via invite or domain proof; institution creation with evidence (docs, domain DNS, eduGAIN metadata).
- Admin console: manage members, roles, departments; view audits; enforce policies and SoD.
- Login: SSO/OIDC → risk assessment → optional MFA → issue session (short-lived) + refresh (rotated).

### 3-أ) التدفقات الأساسية
- التسجيل (بريد/مزود هوية) → اختيار الدور والمؤسسة → التحقق (نفاذ/جواز) → إعداد MFA → استكمال الملف.
- الانضمام للمؤسسة عبر دعوة أو إثبات نطاق؛ إنشاء مؤسسة مع مستندات داعمة (DNS/eduGAIN).
- لوحة الإدارة: إدارة الأعضاء والأدوار والأقسام؛ استعراض السجلات؛ فرض السياسات وفصل الواجبات.
- الدخول: SSO/OIDC → تقييم المخاطر → MFA عند الحاجة → جلسة قصيرة مع تدوير رموز التحديث.

---

### 4) Data Model (high-level, extends existing Prisma)
- User(id, email, passwordHash?, fullName, role, institutionId?, mfaEnabled, reputationScore, locale, timeZone, riskFlags, createdAt)
- Institution(id, name, type[UNIVERSITY|COMPANY|SCHOOL|RESEARCH_CENTER|GOV], admins[], departments[], verified, createdAt)
- Department(id, institutionId, name, parentDepartmentId?)
- Membership(id, userId, institutionId, role, status, createdAt)
- Credential(id, userId, type[ORCID|CERT|ID_DOC], status, s3Key, createdAt)
- DeviceBinding(id, userId, deviceHash, lastSeenAt, riskLevel)
- AuditEvent(id, actorUserId?, action, targetType, targetId?, metadata(json), ip, ua, createdAt)
- PolicyDecision(id, request, decision, reason, actorUserId?, createdAt)

### 4-أ) نموذج البيانات (مختصر)
- المستخدم، المؤسسة، القسم، العضوية، الاعتماد، ربط الجهاز، حدث التدقيق، قرار السياسة — كما أعلاه.

---

### 5) Integrations
- Identity & SSO: Keycloak (broker to Nafath, institutional IdPs, eduGAIN), OIDC/SAML; MFA (TOTP/FIDO2/SMS).
- Verification: Nafath (KSA), domain email/DNS, ORCID linkage; optional passport OCR (on-prem if required).
- SIEM/SOAR: Elastic or Splunk; Wazuh/OSSEC agents; audit stream via Kafka/OpenSearch.
- Storage: MinIO (S3) with KMS; object-lock; antivirus scan; PII tagging.

### 5-أ) التكاملات
- الهوية وSSO: Keycloak (وسيط لنفاذ ومزودي هوية المؤسسات وeduGAIN)، OIDC/SAML؛ MFA (TOTP/FIDO2/SMS).
- التحقق: نفاذ، بريد/نطاق، ORCID؛ خيار OCR للجواز داخلياً.
- المراقبة والاستجابة: Elastic/Splunk مع Wazuh؛ تدفق تدقيق عبر Kafka/OpenSearch.
- التخزين: MinIO (S3) مع KMS وقفل الكائنات وفحص فيروسات ووسوم PII.

---

### 6) Security, Privacy & Compliance
- Zero Trust: mTLS internal, JWT audience checks, OPA policy enforcement; continuous authz.
- PDPL/NDMO: data classification tags; residency enforced; cross-border guardrails and approvals.
- ISO 27001/27701: controls coverage mapping; records of processing; privacy impact checks.
- NIST 800-53: access control, audit, IR; 800-63 for digital identity; 800-207 Zero Trust patterns.
- SOC 2: logging, change management, vendor risk; monitored via compliance dashboards.

### 6-أ) الأمن والخصوصية والامتثال
- «انعدام الثقة»: mTLS داخلي، تحقق جمهور JWT، فرض سياسات OPA؛ تفويض مستمر.
- PDPL/NDMO: تصنيف البيانات، الإقامة، ضوابط العبور الدولي.
- ISO 27001/27701: خرائط الضوابط، سجلات المعالجة، تقييمات الأثر.
- NIST 800-53/63/207: تحكم وصول وتدقيق وهوية رقمية وأنماط Zero Trust.
- SOC 2: سجلات وتغيير وإدارة مخاطر مورّدين مع لوحات امتثال.

---

### 7) APIs (contract-first outline, REST)
- POST /auth/register, POST /auth/login, POST /auth/mfa/verify, POST /auth/device/bind
- GET /me, GET /sessions, DELETE /sessions/:id
- GET/POST /institutions, GET /institutions/:id, POST /institutions/:id/verify
- POST /institutions/:id/invite, PATCH /members/:id (role/status)
- GET/POST /credentials, PATCH /credentials/:id (status)
- GET /audits?actor=&action=&target=, GET /policy-decisions

### 7-أ) واجهات برمجة التطبيقات (مختصر)
- مسارات المصادقة، الجلسات، المؤسسات والتحقق، الدعوات والأعضاء، الاعتمادات، التدقيق وقرارات السياسات — كما أعلاه.

---

### 8) UI (AR/EN, WCAG 2.1 AA)
- Auth & Onboarding: role-aware wizard; Nafath/IdP buttons; MFA enrollment; device trust prompt.
- Admin Console: institution overview, members table, role assignment, departments tree, audit viewer.
- Profile: expertise tags, ORCID connect, credentials upload, reputation breakdown.
- Policies: guardrails summary, SoD conflicts, risk-based MFA prompts.

### 8-أ) الواجهة (ثنائية اللغة وإتاحة)
- معالج تسجيل حسب الدور، أزرار نفاذ/مزود هوية، تفعيل MFA، تذكير الثقة بالجهاز.
- لوحة إدارة: نظرة عامة وجداول أعضاء وتعيين أدوار وشجرة أقسام وعارض تدقيق.
- ملف شخصي: مهارات وORCID ورفع اعتمادات ومؤشر سمعة.
- السياسات: ملخص ضوابط، تضاربات فصل واجبات، تنبيهات MFA حسب المخاطر.

---

### 9) Reputation (v1 – transparent and explainable)
- Inputs: projects participated, proposals submitted/reviewed, papers/patents linked, partner feedback.
- Outputs: user score, institution score; percentile and trend; explainability breakdown (weights).

### 9-أ) السمعة (نسخة أولى)
- مدخلات: مشاركات بالمشاريع والمقترحات والأوراق/البراءات وتقييمات الشركاء.
- مخرجات: درجة مستخدم ومؤسسة مع نسب وترند وتفكيك أوزان شفاف.

---

### 10) Non‑Functional & Ops
- Performance: P95 auth < 300ms; admin list ops < 800ms; pagination for >100k members.
- Availability: HA for IdP (Keycloak cluster); DB PITR; object-lock for artifacts; DR RTO ≤ 4h, RPO ≤ 1h.
- Observability: structured logs, traces (OTel), metrics; audit immutability; alert runbooks.

### 10-أ) لا وظيفية وتشغيل
- الأداء: مصادقة P95 أقل من 300ms؛ عمليات إدارة أقل من 800ms؛ ترقيم للبيانات الكبيرة.
- التوافر: عنقود Keycloak عالي التوفر؛ استرجاع نقطي للقاعدة؛ قفل كائنات؛ خطط تعافي RTO≤4h/RPO≤1h.
- الرصد: سجلات وهيكلة وتتبع OTel ومقاييس؛ تدقيق غير قابل للتلاعب؛ إجراءات تنبيه.

---

### 11) Roadmap (MVP → Scale)
- MVP (6–9 mo): registration/SSO, MFA (TOTP/SMS), RBAC, institutions/members, profile+credentials, audit, basic reputation, AR/EN, WCAG, Nafath adapter stub, SIEM stream.
- Scale: FIDO2/WebAuthn for admins/high-risk; eduGAIN federation live; adaptive auth risk models; delegated admin SoD rules; policy UI; reputation v2 with fairness; privacy dashboards.

### 11-أ) خارطة الطريق
- الحد الأدنى (6–9 أشهر): تسجيل/SSO، MFA (TOTP/SMS)، RBAC، المؤسسات/الأعضاء، ملف+اعتمادات، تدقيق، سمعة أولية، عربية/إنجليزية، WCAG، موائم نفاذ مبدئي، تدفق SIEM.
- التوسع: FIDO2/WebAuthn للحسابات الحساسة؛ eduGAIN حي؛ نماذج مخاطر تكيفية؛ ضوابط فصل واجبات؛ واجهة سياسات؛ سمعة 2.0 بعدالة؛ لوحات خصوصية.

