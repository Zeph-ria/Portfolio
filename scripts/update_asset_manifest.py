#!/usr/bin/env python3
"""Record the displayed artwork and only its reviewed public source links.

Run after build_portfolio.py. Local import receipts provide export provenance;
they are not published because a full source deck can contain private pages.
The resulting main manifest is sufficient for a fresh checkout and validation.
"""
from copy import deepcopy
from hashlib import sha256
from html.parser import HTMLParser
import json
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]


class Artwork(HTMLParser):
    def __init__(self):
        super().__init__()
        self.paths = set()

    def handle_starttag(self, tag, attrs):
        data = dict(attrs)
        if tag == 'img' and data.get('src', '').startswith('assets/'):
            self.paths.add(data.get('data-full-src', data['src']))


def main():
    content = json.loads((ROOT / 'content/projects.json').read_text())
    slides = [slide for project in content['projects'] for slide in project['slides']]
    slides += [calendar['slide'] for calendar in content['calendars']]
    allowed_sources = {slide['path']: slide['source'] for slide in slides if slide.get('source')}
    records = {}
    for path in ('assets-manifest.json', 'docs/qa/2026-11-20-curation/imported-assets.json'):
        if not (ROOT / path).exists():
            continue
        data = json.loads((ROOT / path).read_text())
        for image in data if isinstance(data, list) else data['images']:
            records[image['path']] = image
    for capture in json.loads((ROOT / 'assets/sites/manifest.json').read_text())['images']:
        records[capture['path']] = {
            'path': capture['path'], 'width': capture['width'], 'height': capture['height'],
            'quality': 'live-website-screenshot', 'capturedAt': '2026-11-20'
        }
        allowed_sources[capture['path']] = capture['source_url']
    artwork = Artwork()
    artwork.feed((ROOT / 'index.html').read_text())
    output = []
    for path in sorted(artwork.paths):
        if path not in records:
            raise ValueError('Missing export provenance: ' + path)
        record = deepcopy(records[path])
        # The selected file is public. Its full Canva source may not be.
        record.pop('sourceUrl', None)
        record.pop('designId', None)
        if path in allowed_sources:
            record['sourceUrl'] = allowed_sources[path]
        for image in [record, *record.get('variants', [])]:
            image_path = ROOT / image['path']
            with Image.open(image_path) as decoded:
                if decoded.size != (image['width'], image['height']):
                    raise ValueError('Dimension mismatch: ' + image['path'])
            data = image_path.read_bytes()
            image['bytes'] = len(data)
            image['sha256'] = sha256(data).hexdigest()
        output.append(record)
    manifest = {
        'auditedAt': '2026-11-20',
        'measurement': 'Native image dimensions and SHA-256 measured from the installed artwork files.',
        'notes': [
            'Only artwork displayed in the portfolio is included in this inventory.',
            'Source links are limited to reviewed documents; selected pages remain locally accessible when the complete source contains private material.',
            'Full-resolution Canva exports retain the original composition. Card thumbnails are separate derivatives.',
            'Website images are actual browser captures of the public pages, with no submitted form data.'
        ],
        'images': output
    }
    (ROOT / 'assets-manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
    print(f'Recorded {len(output)} displayed originals and {sum(len(row.get("variants", [])) for row in output)} card variants.')


if __name__ == '__main__':
    main()
