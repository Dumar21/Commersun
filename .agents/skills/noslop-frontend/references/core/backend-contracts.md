## 15. Backend Contract & Security Alignment

Frontend does not operate in isolation. When consuming backend APIs or implementing security-sensitive UI:

### 15.1 Contract Ownership

| Responsibility | Owner |
|---------------|-------|
| Response envelope shape (`success`, `data`, `error`, `meta`) | the backend contract defines, the test plan verifies |
| Consumer-side fixture alignment | **Frontend** — keep mocks in sync with `fixtures/contracts/` |
| Contract test triggers | Frontend payload changes → update contract tests BEFORE merging (see the test plan) |
| Error display mapping | Frontend maps `error.code` to user-facing messages; never parse `error.message` for logic |

**When a frontend change touches API consumption:**
1. Check if the response shape assumption still holds
2. If changed, update or add a contract test first (see the test plan)
3. Align frontend mocks/fixtures with backend golden examples

### 15.2 Security Responsibilities

| Control | Policy Owner | Implementation Owner |
|---------|-------------|---------------------|
| CSP directives | the security review | Frontend (no inline scripts, no `eval`, no surprise 3rd-party scripts) |
| CORS | the security review | Backend middleware (the backend contract) |
| XSS prevention | the security review | Frontend (avoid `dangerouslySetInnerHTML`; if needed, sanitize with DOMPurify + CSP defense) |
| Token storage | the security review | Frontend (`httpOnly` cookies preferred over `localStorage`) |
| Auth state display | the security review | Frontend (loading → check → redirect or render; never flash protected content) |

### 15.3 Testing Integration

- Playwright smoke tests validate rendered flows AFTER backend API + contract tests pass
- Frontend unit tests mock API responses using the **same envelope shape** defined in the backend contract
- When backend error codes change, frontend error-mapping tests must be updated
