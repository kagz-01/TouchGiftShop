import os
import time
import httpx
from supabase import create_client
from dotenv import load_dotenv

load_dotenv(".env.local")
url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

sb = create_client(url, key)

BUCKET      = "products"
LIST_LIMIT  = 100   # files per list page
BATCH_SIZE  = 20    # files per delete call
MAX_RETRIES = 4     # retries on timeout/error
SLEEP_OK    = 0.3   # seconds between successful batches
SLEEP_RETRY = 2.0   # seconds before a retry


def list_page(prefix, offset):
    """Fetch one page of file names with retry."""
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            res = sb.storage.from_(BUCKET).list(
                prefix,
                {"limit": LIST_LIMIT, "offset": offset,
                 "sortBy": {"column": "name", "order": "asc"}},
            )
            return [
                (f"{prefix}/{f['name']}" if prefix else f["name"])
                for f in (res or [])
                if f.get("name") and f["name"] != ".emptyFolderPlaceholder"
            ]
        except Exception as e:
            wait = SLEEP_RETRY * attempt
            print(f"  WARNING list() attempt {attempt} failed: {type(e).__name__} - retrying in {wait}s")
            time.sleep(wait)
    print("  ERROR list() gave up after max retries.")
    return []


def delete_batch(paths):
    """Delete a batch of file paths with retry."""
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            sb.storage.from_(BUCKET).remove(paths)
            return True
        except Exception as e:
            wait = SLEEP_RETRY * attempt
            print(f"  WARNING remove() attempt {attempt} failed: {type(e).__name__} - retrying in {wait}s")
            time.sleep(wait)
    print(f"  ERROR failed to delete batch starting with {paths[:2]} - skipping")
    return False


def purge_all():
    """Delete all files in the bucket root. Returns count deleted."""
    total = 0
    while True:
        # Always fetch from offset 0 - deleted files shrink the window
        page = list_page("", 0)
        if not page:
            break

        for i in range(0, len(page), BATCH_SIZE):
            batch = page[i:i + BATCH_SIZE]
            ok = delete_batch(batch)
            if ok:
                total += len(batch)
                print(f"  Deleted {len(batch)} files (total: {total})")
            time.sleep(SLEEP_OK)

        if len(page) < LIST_LIMIT:
            break  # last page - after deletion it'll be empty

    return total


def main():
    print(f"\nPurging bucket: '{BUCKET}' ...\n")
    start = time.time()
    count = purge_all()
    elapsed = time.time() - start
    print(f"\nDone - {count} files deleted in {elapsed:.1f}s")


if __name__ == "__main__":
    main()
