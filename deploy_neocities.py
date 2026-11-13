#!/usr/bin/env python3
"""
Deploy script for FiestaSMP website to Neocities.
Uploads all static web assets, HTML pages, news archives, and feeds.
"""

import os
import sys
import time
import requests

API_KEY = os.environ.get("NEOCITIES_API_KEY", "").strip()
API_URL = "https://neocities.org/api/upload"
REPO_DIR = os.path.dirname(os.path.abspath(__file__))

DEPLOYABLE_EXTENSIONS = (
    ".html", ".xml", ".txt", ".webp", ".png", ".jpg", ".jpeg",
    ".gif", ".svg", ".ico", ".js", ".css", ".json", ".webmanifest"
)
EXCLUDED_DIRS = {".git", ".github", "content", "layouts", "archetypes", "__pycache__"}
EXCLUDED_FILES = {".gitignore", ".hugo_build.lock", "hugo.toml", "README.md", "LICENSE"}

def collect_files():
    files_to_deploy = []
    for root, dirs, files in os.walk(REPO_DIR):
        dirs[:] = [d for d in dirs if d not in EXCLUDED_DIRS]
        for f in files:
            if f in EXCLUDED_FILES or f.endswith((".py", ".pyc", ".bak", ".tmp")):
                continue
            if any(f.endswith(ext) for ext in DEPLOYABLE_EXTENSIONS):
                full_path = os.path.join(root, f)
                rel_path = os.path.relpath(full_path, REPO_DIR)
                files_to_deploy.append((rel_path, full_path))
    files_to_deploy.sort(key=lambda x: x[0])
    return files_to_deploy

def deploy(batch_size=10):
    if not API_KEY:
        print("NEOCITIES_API_KEY is required.", file=sys.stderr)
        return False

    files = collect_files()
    total = len(files)
    print(f"Deploying {total} files to Neocities (batch size: {batch_size})...")

    headers = {"Authorization": f"Bearer {API_KEY}"}
    uploaded = 0

    for i in range(0, total, batch_size):
        batch = files[i:i + batch_size]
        file_handles = []
        files_payload = {}

        try:
            for rel_path, full_path in batch:
                fh = open(full_path, "rb")
                file_handles.append(fh)
                files_payload[rel_path] = (os.path.basename(rel_path), fh)

            resp = requests.post(API_URL, headers=headers, files=files_payload, timeout=60)
            if resp.status_code != 200:
                print(f"Failed uploading batch {i // batch_size + 1}: {resp.status_code} {resp.text}")
                return False

            res_json = resp.json()
            if res_json.get("result") != "success":
                print(f"Neocities API error: {res_json}")
                return False

            uploaded += len(batch)
            print(f"Uploaded {uploaded}/{total} files.")
        finally:
            for fh in file_handles:
                fh.close()

    print(f"Successfully deployed all {total} files to Neocities!")
    return True

if __name__ == "__main__":
    success = deploy()
    sys.exit(0 if success else 1)
