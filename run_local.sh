#!/usr/bin/env sh
set -eu
python3 -m venv .venv
. .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
export HUSH_TECH_SECRET_KEY="${HUSH_TECH_SECRET_KEY:-$(python -c 'import secrets; print(secrets.token_hex(32))')}"
python app.py
