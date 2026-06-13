# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 0.1.x   | ✅ Yes    |

## Reporting Vulnerabilities

If you discover a security vulnerability, please **DO NOT** open a public issue.

Instead, email security@carbontwin.ai with:
1. Description of the vulnerability
2. Steps to reproduce
3. Potential impact
4. Suggested fix (if any)

We will respond within 48 hours and work with you to fix the issue.

---

## Security Measures

### Authentication
- Google Sign-In via Firebase Authentication
- Session managed via Firebase Auth state
- Route protection via Next.js middleware

### Database Security (Firestore Rules)
- Per-user data isolation — users can only access their own data
- Immutable reports — weekly reports cannot be modified after creation
- Deny-all fallback — any unmatched access is denied

### API Security
- **Zod validation** on all API route inputs
- **Input sanitization** — HTML characters stripped from user text
- **Rate limiting** via Cloud Run's built-in request limits
- Server-side only secrets (Gemini API key, Firebase Admin credentials)

### Transport Security
- HTTPS enforced via HSTS header
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- Strict `Referrer-Policy`
- Restrictive `Permissions-Policy`

### Content Security Policy
The application uses a strict CSP (set in middleware) that:
- Allows scripts only from trusted Google domains
- Prevents inline scripts where possible
- Blocks all frame embedding (`frame-src: none`)

### Secrets Management
- Production secrets stored in **Google Secret Manager**
- Secrets mounted as environment variables in Cloud Run
- Never committed to version control (enforced via `.gitignore`)

### Docker Security
- Multi-stage build (build artifacts only in final image)
- Non-root user (`nextjs`, UID 1001)
- Read-only filesystem where possible
- No unnecessary packages in production image

### Dependency Security
- **Dependabot** for automated dependency updates
- **CodeQL** for static security analysis
- Regular `npm audit` checks in CI

---

## Environment Variables

| Variable | Scope | Notes |
|----------|-------|-------|
| `GEMINI_API_KEY` | Server only | Never expose to client |
| `NEXT_PUBLIC_FIREBASE_*` | Client + Server | Firebase public config |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Client | Restrict to your domain in GCP Console |

---

## Known Limitations

- The `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is exposed to the client. Restrict it in the Google Cloud Console to your production domain.
- Firebase public config is intentional and safe — security is enforced by Firestore Rules, not config secrecy.
