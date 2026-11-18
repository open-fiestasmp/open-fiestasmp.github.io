#!/usr/bin/env python3
"""
Deploy script for FiestaSMP website to Neocities.
Uploads all static web assets, HTML pages, news archives, and feeds.
"""

import os
import sys
import time
import hashlib
import requests

API_KEY = os.environ.get("NEOCITIES_API_KEY", "").strip()
API_URL = "https://neocities.org/api/upload"
HASH_URL = "https://neocities.org/api/upload_hash"
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

    headers = {"Authorization": f"Bearer {API_KEY}"}
    files = collect_files()
    hashes = {}
    for rel_path, full_path in files:
        with open(full_path, "rb") as fh:
            hashes[rel_path] = hashlib.sha1(fh.read()).hexdigest()

    try:
        hash_resp = requests.post(HASH_URL, headers=headers, data=hashes, timeout=60)
        hash_resp.raise_for_status()
        hash_json = hash_resp.json()
    except (requests.RequestException, ValueError) as exc:
        print(f"Could not compare deployed files: {exc}", file=sys.stderr)
        return False

    if hash_json.get("result") != "success" or not isinstance(hash_json.get("files"), dict):
        print(f"Neocities hash check failed: {hash_json}", file=sys.stderr)
        return False

    remote_hashes = hash_json["files"]
    files = [(path, full_path) for path, full_path in files if not remote_hashes.get(path, False)]
    total = len(files)
    if total == 0:
        print("Neocities is already up to date.")
        return True

    print(f"Deploying {total} changed files to Neocities (batch size: {batch_size})...")

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
