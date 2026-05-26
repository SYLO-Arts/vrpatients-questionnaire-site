#!/usr/bin/env python
"""
Refresh persona one-pager PDFs from a draft folder in the parent repo.

Usage:
    python scripts/refresh-persona-pdfs.py [SRC_DIR]

If SRC_DIR is omitted, defaults to the highest-numbered *_Drafts/ folder
under brand/personas/working/ in the parent repo.

What it does:
    1. Locates the source .docx for each of the 6 personas via a substring
       match on filenames (e.g. "TechHatTasha" matches the tasha file).
    2. Converts each .docx -> .pdf via docx2pdf (drives MS Word in the
       background; requires Word installed on Windows or macOS).
    3. Generates a fresh 8-char random suffix per file, saves to
       docs/persona-<slug>-<suffix>.pdf.
    4. Deletes all old persona-*.pdf files from docs/.
    5. Patches the 6 href="docs/persona-<slug>-..." values in index.html
       to point to the new filenames.

After running: review `git status`, commit, push. Netlify auto-deploys.

Requires: pip install docx2pdf
"""
import os
import re
import sys
import glob
import secrets
import string
from pathlib import Path

try:
    from docx2pdf import convert
except ImportError:
    print("Missing dependency. Run: pip install docx2pdf", file=sys.stderr)
    sys.exit(1)

# Persona slug -> substring that uniquely identifies its .docx file.
# If the source filename convention ever changes, update these substrings.
PERSONA_MATCHERS = {
    "tasha": "TechHatTasha",
    "dale":  "DirectorDale",
    "paula": "PassRatePaula",
    "carla": "CarePlanCarla",
    "riley": "RecertClockRiley",
    "greg":  "GhostingGreg",
}

REPO_ROOT = Path(__file__).resolve().parent.parent  # Questionnaire_Site/
DOCS_DIR = REPO_ROOT / "docs"
INDEX_HTML = REPO_ROOT / "index.html"

# Default search root: brand/personas/working/ in the parent repo.
PARENT_WORKING = REPO_ROOT.parent  # brand/personas/working/


def find_latest_drafts_folder() -> Path:
    """Find the highest-numbered *_Drafts/ folder under PARENT_WORKING."""
    candidates = []
    for entry in PARENT_WORKING.iterdir():
        if not entry.is_dir():
            continue
        m = re.match(r"^(\d+)_Drafts$", entry.name)
        if m:
            candidates.append((int(m.group(1)), entry))
    if not candidates:
        print(f"No *_Drafts/ folders found under {PARENT_WORKING}", file=sys.stderr)
        sys.exit(1)
    candidates.sort(key=lambda t: t[0], reverse=True)
    return candidates[0][1]


def find_source_docx(src_dir: Path, matcher: str) -> Path:
    """Find the .docx in src_dir whose filename contains matcher."""
    hits = [p for p in src_dir.glob("*.docx") if matcher in p.name]
    if not hits:
        print(f"No .docx in {src_dir} matched substring {matcher!r}", file=sys.stderr)
        sys.exit(1)
    if len(hits) > 1:
        print(f"Multiple matches for {matcher!r} in {src_dir}: {[p.name for p in hits]}", file=sys.stderr)
        sys.exit(1)
    return hits[0]


def random_suffix(n: int = 8) -> str:
    alphabet = string.ascii_letters + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(n))


def patch_index_html(slug_to_filename: dict[str, str]) -> None:
    """Rewrite the href="docs/persona-<slug>-..." values in index.html."""
    html = INDEX_HTML.read_text(encoding="utf-8")
    original = html
    for slug, fname in slug_to_filename.items():
        pattern = rf'href="docs/persona-{re.escape(slug)}-[A-Za-z0-9]+\.pdf"'
        replacement = f'href="docs/{fname}"'
        new_html, count = re.subn(pattern, replacement, html)
        if count == 0:
            print(f"  WARN: no href match found for slug={slug} in index.html", file=sys.stderr)
        elif count > 1:
            print(f"  WARN: multiple ({count}) href matches for slug={slug} — all updated", file=sys.stderr)
        html = new_html
    if html == original:
        print("  WARN: index.html unchanged (no hrefs matched)", file=sys.stderr)
    else:
        INDEX_HTML.write_text(html, encoding="utf-8")


def main() -> None:
    if len(sys.argv) > 1:
        src_dir = Path(sys.argv[1]).resolve()
    else:
        src_dir = find_latest_drafts_folder()
    print(f"Source folder: {src_dir}")

    # Verify all 6 sources exist before deleting anything.
    sources = {slug: find_source_docx(src_dir, matcher)
               for slug, matcher in PERSONA_MATCHERS.items()}
    print(f"Found all {len(sources)} persona sources.\n")

    # Wipe old PDFs.
    DOCS_DIR.mkdir(exist_ok=True)
    old = sorted(DOCS_DIR.glob("persona-*.pdf"))
    if old:
        print("--- Deleting old PDFs ---")
        for p in old:
            print(f"  removing {p.name}")
            p.unlink()
        print()

    # Convert all 6.
    slug_to_filename: dict[str, str] = {}
    results = []
    for slug, src in sources.items():
        suffix = random_suffix()
        dst_name = f"persona-{slug}-{suffix}.pdf"
        dst = DOCS_DIR / dst_name
        print(f"Converting {slug:6s} <- {src.name}")
        convert(str(src), str(dst))
        slug_to_filename[slug] = dst_name
        results.append((slug, dst_name, dst.stat().st_size))

    # Patch index.html hrefs.
    print("\n--- Patching index.html hrefs ---")
    patch_index_html(slug_to_filename)
    print("  index.html updated")

    # Summary.
    print("\n--- RESULTS ---")
    total = 0
    for slug, name, size in results:
        print(f"  {slug:6s}  {name}  ({size / 1024:.0f} KB)")
        total += size
    print(f"\n  TOTAL: {total / 1024 / 1024:.1f} MB")
    print("\nNext: review `git status`, then commit + push.")


if __name__ == "__main__":
    main()
