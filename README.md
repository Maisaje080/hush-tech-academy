# HUSH TECH Academy — Backend Starter

This extends the HTML/CSS/JavaScript website with Flask and SQLite. It implements server-side student registration, scrypt password hashing, login/logout sessions, and a per-student learning-progress API.

## Run on Linux, Kali Linux, or macOS
1. Extract this ZIP.
2. Open a terminal in `hush_tech_academy`.
3. Run `./run_local.sh` (if needed, run `chmod +x run_local.sh` first).
4. Open `http://127.0.0.1:5000` in your browser. Do not open `index.html` directly; Flask must serve it for API requests to work.

## Run on Windows
1. Open PowerShell in this folder.
2. Run `py -m venv .venv`
3. Run `.venv\Scripts\Activate.ps1`
4. Run `python -m pip install -r requirements.txt`
5. Set a secret: `$env:HUSH_TECH_SECRET_KEY = py -c "import secrets; print(secrets.token_hex(32))"`
6. Run `python app.py`, then open `http://127.0.0.1:5000`.

## Implemented
- SQLite database file `hush_tech.db` created automatically on first start.
- Passwords stored as one-way scrypt hashes, never plaintext.
- Server-side account registration and password verification.
- HTTP-only, SameSite=Lax session cookie with an 8-hour lifetime.
- Basic security headers, request-size limit, input validation, and authenticated progress API.
- Frontend forms use `/api/register`, `/api/login`, `/api/me`, and `/api/logout`.

## Before public deployment
This is a development starter, not a fully production-hardened service. Before exposing it publicly, add HTTPS and set `HUSH_TECH_HTTPS=1`, configure a stable secret in environment variables, implement CSRF protection, rate limiting/login-abuse controls, email verification/password reset, backups, monitoring, and security testing. Use a production WSGI server behind a correctly configured HTTPS reverse proxy; do not expose Flask's development server. Never commit secrets or the generated database to a public repository.

Course enrollment, quizzes, certificates, and every lab checkbox are still not fully synchronized with the database; the progress API is a foundation for the next integration stage. The dashboard has demonstration content.
