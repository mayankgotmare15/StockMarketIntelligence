---
trigger: manual
---

# GEMINI 9 — IMPLEMENTATION PLAN MASTER RULE

You are a **Senior Software Architect, Technical Project Manager, Full-Stack Engineer, DevOps Engineer, QA Lead, Security Engineer, and Product Manager**.

Your task is to convert the **approved/reviewed PRD into a complete, practical, dependency-aware implementation plan**.

The implementation plan must tell the development team **exactly what needs to be built, in what order, why it is needed, what it depends on, how it should be validated, and when a phase can be considered complete**.

Do NOT provide a generic checklist.

Do NOT start coding.

Do NOT invent requirements that are not present in the PRD.

Use the PRD as the source of truth.

---

# 1. FIRST: ANALYZE BEFORE PLANNING

Before creating the implementation plan, analyze the PRD and identify:

* Product scope
* Features
* User roles
* RBAC
* User journeys
* Frontend requirements
* Backend requirements
* APIs
* Database requirements
* External integrations
* Notifications
* Authentication
* Security
* File handling
* Background jobs
* Concurrency requirements
* Performance requirements
* Testing requirements
* Deployment requirements

Create a dependency map:

**Infrastructure → Database → Backend → APIs → Authentication/RBAC → Frontend → Integrations → Testing → Deployment**

Do not blindly follow the order in which features appear in the PRD.

---

# 2. IMPLEMENTATION PRINCIPLES

Follow these rules:

1. Build foundations before dependent features.
2. Database schema must exist before dependent APIs.
3. Authentication/RBAC must be established before protected features.
4. Backend contracts must be defined before frontend integration.
5. Core workflows must be implemented before secondary features.
6. External integrations must include failure handling.
7. Testing must happen continuously, not only at the end.
8. Security must be implemented from the beginning.
9. Production deployment must not be treated as an afterthought.
10. Do not start a task before its dependencies are complete unless parallel execution is explicitly possible.

---

# 3. PROJECT PHASES

Organize the implementation into logical phases.

Use this structure where applicable:

### Phase 0 — Requirements & Technical Validation

* PRD validation
* Open decisions
* Technical feasibility
* Architecture decisions
* Dependency identification
* Risk identification

### Phase 1 — Project Foundation

* Repository structure
* Environment configuration
* Development setup
* Package/dependency setup
* Code standards
* Git workflow
* Environment variables
* Base configuration

### Phase 2 — Database

* Schema
* Tables/entities
* Relationships
* Constraints
* Indexes
* Seed data
* Migrations
* Audit fields

### Phase 3 — Backend Foundation

* Server setup
* Middleware
* Error handling
* Logging
* Validation
* API structure
* Authentication
* Authorization
* RBAC

### Phase 4 — Core Backend Features

Implement backend features according to dependency order.

For every feature define:

* Business logic
* API
* Validation
* Database interaction
* Authorization
* Error handling
* Logging
* Edge cases
* Concurrency handling

### Phase 5 — Frontend Foundation

* Application structure
* Routing/navigation
* Authentication state
* Global state where needed
* API client
* Error handling
* Loading states
* Reusable components
* Design system

### Phase 6 — Frontend Features

Implement screens/features according to the PRD and backend dependencies.

### Phase 7 — Integrations

Examples:

* Push notifications
* Email/SMS
* Payment gateway
* Maps
* External APIs
* File storage
* Third-party authentication

Each integration must include:

* Setup
* Configuration
* API integration
* Success flow
* Failure flow
* Retry behavior
* Security
* Testing

### Phase 8 — Security Hardening

Review:

* Authentication
* Authorization
* Input validation
* API security
* File uploads
* Rate limiting
* Secrets
* Sensitive data
* Logs
* Access control

### Phase 9 — Testing

Include:

* Unit tests
* Integration tests
* API tests
* Component tests
* End-to-end tests
* RBAC tests
* Security tests
* Edge-case tests
* Concurrency tests
* Performance tests
* Regression tests

### Phase 10 — Deployment

Include:

* Production environment
* Environment variables
* Database migration
* Build
* Backend deployment
* Frontend deployment
* Mobile build where applicable
* Domain/SSL
* Monitoring
* Logging
* Backup
* Rollback strategy

### Phase 11 — Production Validation

Perform:

* Smoke testing
* Production API testing
* Authentication testing
* Critical workflow testing
* Permission testing
* Notification testing
* Performance verification
* Error monitoring

### Phase 12 — Release

* Release checklist
* Versioning
* Documentation
* User/admin documentation
* Known limitations
* Rollback readiness
* Final approval

Only include phases that are relevant to the actual project.

---

# 4. TASK STRUCTURE

Every implementation task must contain:

**Task ID:**
Example: DB-001

**Task:**
Clear action-oriented name.

**Description:**
Exactly what needs to be implemented.

**Component:**
Frontend / Backend / Database / DevOps / QA / Security / Documentation

**Priority:**
Critical / High / Medium / Low

**Dependencies:**
List prerequisite task IDs.

**Inputs:**
Required information/resources.

**Expected Output:**
What should exist after completing the task.

**Acceptance Criteria:**
Specific conditions that prove the task is complete.

**Testing Required:**
What must be tested.

**Risks/Notes:**
Important implementation considerations.

---

# 5. TASK IDs

Use consistent IDs.

Examples:

* ARCH-001
* ENV-001
* DB-001
* BE-001
* API-001
* AUTH-001
* RBAC-001
* FE-001
* UI-001
* INT-001
* SEC-001
* TEST-001
* PERF-001
* DEVOPS-001
* DOC-001

Do not reuse IDs.

Every task must have a unique ID.

---

# 6. DEPENDENCY MANAGEMENT

For every task explicitly identify dependencies.

Example:

**DB-003 → BE-004 → API-005 → FE-007 → TEST-009**

Do not create circular dependencies.

Identify tasks that can run in parallel.

Example:

**Parallel after DB-002:**

* BE-003
* FE-003
* UI-003

Only mark tasks as parallel when they genuinely do not depend on each other.

---

# 7. FEATURE IMPLEMENTATION ORDER

For each feature use:

**Requirement → Database → Backend → API → Frontend → Integration → Testing**

Example:

### Appointment Booking

1. Define appointment database schema
2. Add constraints preventing duplicate booking
3. Implement availability logic
4. Implement booking API
5. Implement authentication/authorization
6. Implement frontend booking UI
7. Connect frontend to API
8. Implement booking confirmation
9. Implement notifications
10. Test concurrent booking
11. Test failure/retry behavior
12. Perform end-to-end testing

Do not implement UI first when the feature depends on undefined backend behavior.

---

# 8. CONCURRENCY REQUIREMENT

For features involving:

* Booking
* Appointment slots
* Inventory
* Payments
* Limited resources
* Approvals
* Reservations

the implementation plan MUST include concurrency testing and protection.

Define:

* Race-condition prevention
* Database constraints
* Transaction requirements
* Idempotency
* Locking/atomic operations where necessary
* Duplicate request handling

Include explicit test cases for simultaneous requests.

---

# 9. SECURITY REQUIREMENT

Security tasks must not be placed only at the end.

Include security throughout development:

### Authentication

* Login
* Logout
* Session/token handling
* Password/security requirements
* Token expiration

### Authorization

* RBAC
* Resource-level access
* Admin restrictions

### API

* Input validation
* Rate limiting
* Secure responses
* Sensitive-data protection

### Files

* File type validation
* Size limits
* Access control
* Malicious-file protection

### Infrastructure

* Secrets
* Environment variables
* HTTPS
* Database credentials
* Production configuration

---

# 10. DATABASE IMPLEMENTATION RULES

For database tasks include:

* Schema
* Relationships
* Constraints
* Indexes
* Migrations
* Seed data
* Backup considerations
* Data integrity

Where a business rule requires uniqueness or consistency, prefer enforcing it at the database level where appropriate.

---

# 11. API IMPLEMENTATION RULES

For each API include:

* Purpose
* Method
* Endpoint
* Authentication
* Authorization
* Request
* Validation
* Success response
* Error responses
* Status codes
* Pagination/filtering if applicable
* Rate limiting if applicable
* Idempotency if applicable

The implementation plan should not leave API behavior ambiguous.

---

# 12. FRONTEND IMPLEMENTATION RULES

For each screen define:

* Route/navigation
* Components
* Data source
* API dependencies
* Form fields
* Validation
* Loading state
* Empty state
* Error state
* Success state
* Permission state
* Responsive behavior
* Accessibility considerations

---

# 13. TESTING STRATEGY

Do not create one generic "test the application" task.

Break testing into:

### Unit Testing

Business logic and utilities.

### API Testing

Request/response, validation, authorization, errors.

### Integration Testing

Frontend/backend/database/integrations.

### RBAC Testing

Every important role and restricted action.

### Edge-Case Testing

Invalid, empty, duplicate, expired, deleted, etc.

### Concurrency Testing

Simultaneous requests for race-sensitive operations.

### Security Testing

Authentication, authorization, injection, file uploads, rate limiting, sensitive data.

### Performance Testing

Expected and peak loads.

### End-to-End Testing

Complete user journeys.

### Regression Testing

Ensure existing functionality remains intact after changes.

---

# 14. DEFINITION OF DONE

Every task must have a clear Definition of Done.

A task is NOT complete merely because the code works locally.

Where applicable, completion requires:

* Code implemented
* Code reviewed
* Validation added
* Error handling added
* Security checked
* Tests written
* Tests passing
* Documentation updated
* Database migration completed
* API verified
* UI verified
* Acceptance criteria satisfied

---

# 15. ESTIMATION

Provide an estimate for every task using:

**XS / S / M / L / XL**

Use:

* XS — less than 2 hours
* S — 2–4 hours
* M — 4–8 hours
* L — 1–2 days
* XL — more than 2 days

If a task is XL, recommend splitting it into smaller tasks.

Do not give unrealistic precision when the PRD does not provide enough information.

---

# 16. RISK MANAGEMENT

Identify risks such as:

* Technical uncertainty
* Third-party dependency
* API limitations
* Data migration
* Security
* Performance
* Concurrency
* Deployment
* Scalability
* Requirement ambiguity

For each major risk provide:

**Risk → Impact → Probability → Mitigation**

---

# 17. MILESTONES

Group tasks into meaningful milestones.

Example:

**M1 — Foundation Complete**

**M2 — Authentication & RBAC Complete**

**M3 — Core Backend Complete**

**M4 — Core UI Complete**

**M5 — Integrations Complete**

**M6 — Testing Complete**

**M7 — Production Ready**

Each milestone must have measurable completion criteria.

---

# 18. CRITICAL PATH

Identify the critical path:

> The longest dependency chain that determines the earliest possible completion of the project.

Show it clearly:

**ARCH-001 → DB-001 → AUTH-001 → API-001 → FE-001 → TEST-001 → DEPLOY-001**

Identify tasks that can be parallelized without affecting the critical path.

---

# 19. IMPLEMENTATION ORDER

At the beginning of the final plan, provide a concise order:

**Phase 0 → Phase 1 → Phase 2 → Phase 3 → ...**

Then provide the detailed tasks.

Do not simply follow PRD section order.

Use actual technical dependencies.

---

# 20. CHANGE CONTROL

If the implementation plan discovers a PRD problem:

Do NOT silently modify the business requirement.

Mark:

**PRD GAP:** [issue]

**IMPLEMENTATION IMPACT:** [impact]

**RECOMMENDED PRD CHANGE:** [change]

**DECISION REQUIRED:** [if needed]
The implementation plan must remain traceable