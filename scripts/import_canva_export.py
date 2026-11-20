#!/usr/bin/env python3
"""Import a reviewed official Canva export without cropping its artwork.

The source may be a PNG or a ZIP of selected PNG pages. Usage:
  python scripts/import_canva_export.py SOURCE DESIGN_ID PREFIX PAGE[,PAGE...]
Only the explicit page selection is accepted. Source paths are not recorded in
the public manifest. Original pixels are kept in lossless WebP files; smaller
card derivatives are stored separately.
"""
from pathlib import Path
from PIL import Image
import hashlib
import io
import json
import re
import sys
import zipfile

ROOT = Path(__file__).resolve().parents[1]


def sha(data):
    return hashlib.sha256(data).hexdigest()


def import_export(source, design_id, prefix, pages):
    if not re.fullmatch(r"[A-Za-z0-9_-]+", design_id):
        raise ValueError("Invalid design identifier")
    if not re.fullmatch(r"[a-z0-9-]+", prefix):
        raise ValueError("Invalid filename prefix")
    if len(set(pages)) != len(pages) or any(p < 1 for p in pages):
        raise ValueError("Invalid selection")
    selected = {}
    if zipfile.is_zipfile(source):
        with zipfile.ZipFile(source) as archive:
            for name in archive.namelist():
                match = re.fullmatch(r"(\d+)\.png", name)
                if not match:
                    raise ValueError(f"Unexpected export member: {name}")
                selected[int(match[1])] = archive.read(name)
    else:
        if len(pages) != 1:
            raise ValueError("Single file requires one page")
        selected[pages[0]] = Path(source).read_bytes()
    if set(selected) != set(pages):
        raise ValueError(f"Export pages differ: {sorted(selected)} != {pages}")
    manifest_path = ROOT / "docs/qa/2026-11-20-curation/imported-assets.json"
    manifest = json.loads(manifest_path.read_text()) if manifest_path.exists() else []
    entries = []
    for page in pages:
        raw = selected[page]
        picture = Image.open(io.BytesIO(raw))
        if picture.format != "PNG":
            raise ValueError("Expected official PNG export")
        picture.load()
        width, height = picture.size
        if width < 600 or height < 600:
            raise ValueError(f"Insufficient export size: {width}x{height}")
        path = f"assets/projects/{prefix}-p{page:02d}.webp"
        target = ROOT / path
        target.parent.mkdir(parents=True, exist_ok=True)
        picture.save(target, "WEBP", lossless=True, method=6)
        thumb = picture.copy()
        thumb.thumbnail((1100, 1100), Image.Resampling.LANCZOS)
        thumb_path = f"assets/projects/thumbs/{prefix}-p{page:02d}.webp"
        (ROOT / thumb_path).parent.mkdir(parents=True, exist_ok=True)
        thumb.save(ROOT / thumb_path, "WEBP", quality=90, method=6)
        entry = {"path": path, "width": width, "height": height,
                 "bytes": target.stat().st_size, "sha256": sha(target.read_bytes()),
                 "quality": "canva-export", "designId": design_id, "page": page,
                 "sourceUrl": f"https://www.canva.com/design/{design_id}/view",
                 "exportedAt": "2026-11-20",
                 "export": {"format": "PNG", "width": width, "height": height,
                            "sha256": sha(raw), "conversion": "lossless-webp",
                            "resized": False, "cropped": False},
                 "variants": [{"path": thumb_path, "width": thumb.width,
                               "height": thumb.height, "bytes": (ROOT / thumb_path).stat().st_size,
                               "sha256": sha((ROOT / thumb_path).read_bytes()),
                               "quality": "web-thumbnail", "format": "WebP",
                               "generation": {"tool": "Pillow", "maxLongEdge": 1100,
                                              "quality": 90, "crop": False, "upscaled": False}}]}
        entries.append(entry)
    paths = {entry["path"] for entry in entries}
    manifest = [entry for entry in manifest if entry["path"] not in paths] + entries
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({"design": design_id, "pages": pages,
                      "files": len(entries), "bytes": sum(e["bytes"] for e in entries)}))


if __name__ == "__main__":
    import_export(sys.argv[1], sys.argv[2], sys.argv[3], [int(p) for p in sys.argv[4].split(",")])
