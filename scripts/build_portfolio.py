#!/usr/bin/env python3
"""Render the reviewed, multilingual portfolio selection into index.html.

Artwork paths and public copy live in content/projects.json. This script reads
the export manifest for the installed image dimensions, so it can be rerun after
Canva exports without changing the selection or the surrounding design.

Run `python scripts/build_portfolio.py --strict` before release. Without --strict,
not-yet-imported files keep their declared Canva dimensions for local assembly.
No placeholder is substituted for missing artwork.
"""
import argparse
import hashlib
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LANGUAGES = ('fr', 'en', 'es')

def text(fr, en, es):
    return dict(zip(LANGUAGES, (fr, en, es)))

def attr(value):
    return html.escape(str(value), quote=True)

def i18n(copy, attribute=''):
    assert all(copy.get(language) for language in LANGUAGES), copy
    prefix = f'data-{attribute}-' if attribute else 'data-'
    return ' '.join(f'{prefix}{language}="{attr(copy[language])}"' for language in LANGUAGES)

def element(tag, copy, attributes='', rich=False):
    body = copy['fr'] if rich else html.escape(copy['fr'])
    return f'<{tag} {i18n(copy)}{(" " + attributes) if attributes else ""}>{body}</{tag}>'

def read_manifest():
    records = {}
    for relative in ('assets-manifest.json', 'docs/qa/2026-11-20-curation/imported-assets.json'):
        path = ROOT / relative
        if not path.exists():
            continue
        content = json.loads(path.read_text())
        for image in content if isinstance(content, list) else content.get('images', []):
            records[image['path']] = image
            for variant in image.get('variants', []):
                records[variant['path']] = variant
    return records

def image_dimensions(slide, manifest):
    full = manifest.get(slide['path'], slide)
    thumb_path = slide.get('thumb', slide['path'])
    if thumb_path in manifest:
        thumb = manifest[thumb_path]
    elif thumb_path == slide['path']:
        thumb = full
    else:
        scale = min(1, 1100 / max(full['width'], full['height']))
        thumb = {'width': round(full['width'] * scale), 'height': round(full['height'] * scale)}
    return full['width'], full['height'], thumb['width'], thumb['height']

def render_slide(slide, name, manifest, calendar=False, number=0, gallery=False):
    width, height, thumb_width, thumb_height = image_dimensions(slide, manifest)
    path, thumb = slide['path'], slide.get('thumb', slide['path'])
    alt = slide.get('alt') or {language: f'{name} : {slide["title"][language]}' for language in LANGUAGES}
    fit = ' data-preview-fit="cover"' if calendar else ''
    quality = 'live-website-screenshot' if path.startswith('assets/sites/') else 'canva-export'
    label = element('span', text('Agrandir', 'Enlarge', 'Ampliar'), 'class="preview-affordance" aria-hidden="true"')
    caption_class = 'gallery-caption' if gallery else '' if calendar else 'sr-only'
    brand = f'<span class="gallery-brand">{html.escape(name)}</span>' if gallery else ''
    title_attrs = 'data-slide-title class="sr-only"' if gallery else 'data-slide-title'
    title = {language: f'{name} : {slide["title"][language]}' for language in LANGUAGES} if gallery else slide['title']
    caption = element('span',slide['caption'],'data-slide-caption class="sr-only"') if slide.get('caption') else ''
    return f'''<li data-slide{(' class="gallery-item"' if gallery else '')}>
                  <figure>
                    <a data-preview href="{attr(path)}"{fit}>
                      <img src="{attr(thumb)}" width="{thumb_width}" height="{thumb_height}" loading="lazy" decoding="async" alt="{attr(alt['fr'])}" {i18n(alt, 'alt')} data-full-src="{attr(path)}" data-full-width="{width}" data-full-height="{height}" data-asset-quality="{quality}">
                      {label}
                    </a>
                    <figcaption class="{caption_class}">{brand}{element('span',title,title_attrs)}{caption}</figcaption>
                  </figure>
                </li>'''

def render_carousel(slides, name, manifest, extra_class='', calendar=False):
    frames = '\n                '.join(render_slide(slide,name,manifest,calendar,index) for index,slide in enumerate(slides))
    return f'''<div class="project-slideshow {extra_class}" data-slideshow data-slideshow-title="{attr(name)}">
              <ol class="slide-track">
                {frames}
              </ol>
              <div class="slide-controls">
                <button type="button" data-slide-prev aria-label="Page précédente"><span aria-hidden="true">←</span></button>
                <span data-slide-count>1 / {len(slides)}</span>
                <button type="button" data-slide-next aria-label="Page suivante"><span aria-hidden="true">→</span></button>
              </div>
            </div>'''

def render_project(project, index, manifest):
    heading = element('h3',project['nameI18n']) if project.get('nameI18n') else f'<h3>{html.escape(project["name"])}</h3>'
    process = '''<details class="utex-process">
              <summary data-fr="Découvrir la conception du projet" data-en="Explore the project development" data-es="Descubrir la concepción del proyecto">Découvrir la conception du projet</summary>
              <div class="utex-steps">
                <div class="utex-step"><strong data-fr="01. Architecture du projet" data-en="01. Programme architecture" data-es="01. Arquitectura del proyecto">01. Architecture du projet</strong><p data-fr="Définition de la vision et des objectifs de la proposition ESG." data-en="Defining the vision and objectives of the proposed ESG programme." data-es="Definición de la visión y los objetivos de la propuesta ESG.">Définition de la vision et des objectifs de la proposition ESG.</p></div>
                <div class="utex-step"><strong data-fr="02. Identité du programme" data-en="02. Programme identity" data-es="02. Identidad del programa">02. Identité du programme</strong><p data-fr="Création du nom, de la signature et du langage visuel." data-en="Creating the name, signature and visual language." data-es="Creación del nombre, la firma y el lenguaje visual.">Création du nom, de la signature et du langage visuel.</p></div>
                <div class="utex-step"><strong data-fr="03. Activation envisagée" data-en="03. Proposed activation" data-es="03. Activación propuesta">03. Activation envisagée</strong><p data-fr="Conception de pistes de sensibilisation et de participation, sans dévoiler les documents internes." data-en="Outlining awareness and participation initiatives without disclosing internal documents." data-es="Propuestas de sensibilización y participación sin divulgar documentos internos.">Conception de pistes de sensibilisation et de participation, sans dévoiler les documents internes.</p></div>
              </div>
            </details>''' if project['id'] == 'utex-empreinte' else ''
    return f'''<article class="project-card project-{project['format']}" id="projet-{attr(project['id'])}" data-project="{attr(project['id'])}" data-category="{attr(' '.join(project['categories']))}">
            {render_carousel(project['slides'],project['name'],manifest)}
            <div class="project-details"><div>{heading}{element('p',project['summary'])}</div></div>
            {process}
          </article>'''

def render_work(content, manifest):
    categories=[('all',text('Tout voir','All work','Ver todo')),('branding',text('Identités','Identities','Identidades')),('communication',text('Campagnes & contenus','Campaigns & content','Campañas y contenidos')),('research',text('Recherche graphique','Graphic exploration','Exploración gráfica'))]
    buttons='\n          '.join(element('button',label,f'class="filter{" active" if key=="all" else ""}" type="button" data-filter="{key}" aria-pressed="{"true" if key=="all" else "false"}"') for key,label in categories)
    cards='\n          '.join(render_project(project,index,manifest) for index,project in enumerate(content['projects'],1))
    heading=element('h2',text('LE TRAVAIL<br><em>PARLE.</em>','THE WORK<br><em>SPEAKS.</em>','EL TRABAJO<br><em>HABLA.</em>'),'class="display-title" id="work-title"',True)
    intro=element('p',text('Identités, campagnes et créations visuelles.','Identities, campaigns and visual work.','Identidades, campañas y creaciones visuales.'),'class="section-lede"')
    return f'''<section class="work-section section-pad" id="realisations" aria-labelledby="work-title">
        <div class="section-topline">{element('span',text('Travaux sélectionnés','Selected work','Trabajos seleccionados'))}<span>2024 à 2026</span></div>
        {heading}
        {intro}
        <div class="filters" role="group" data-i18n-aria="projectFilters" aria-label="Filtrer les projets">
          {buttons}
        </div>
        <p class="filter-status sr-only" id="project-status" role="status" aria-live="polite" aria-atomic="true"></p>
        <div class="project-grid" id="project-grid">
          {cards}
        </div>
      </section>'''

def render_gallery(content, manifest):
    images='\n'.join(render_slide(slide,slide['project'],manifest,gallery=True) for slide in content['gallery'])
    return f'''<section class="design-library section-pad" id="galerie" aria-labelledby="gallery-title">
        <div class="section-topline">{element('span',text('Galerie','Gallery','Galería'))}{element('span',text('Créations visuelles','Visual work','Creaciones visuales'))}</div>
        {element('h2',text('GALERIE.','GALLERY.','GALERÍA.'),'class="display-title gallery-display" id="gallery-title"')}
        {element('p',text('Mon univers en images.','My visual world.','Mi universo en imágenes.'),'class="section-lede"')}
        <div data-gallery><ul class="gallery-grid">{images}</ul></div>
      </section>'''

def render_calendars(content, manifest):
    cards=[]
    for calendar in content['calendars']:
        slides=render_carousel([calendar['slide']],'Carrigrès',manifest,'calendar-slideshow',True)
        cards.append(f'<article class="calendar-card" id="calendrier-{calendar["id"]}">{slides}</article>')
    heading=element('h2',text('Carrigrès : les quatre calendriers','Carrigrès : four calendar formats','Carrigrès : cuatro formatos de calendario'),'class="gallery-series" id="calendars-title"')
    return f'''<section class="calendar-section section-pad" id="calendriers" aria-labelledby="calendars-title">
        <div class="section-topline">{element('span',text('Édition · Carrigrès','Print · Carrigrès','Edición · Carrigrès'))}{element('span',text('Un système, plusieurs usages','One system, several uses','Un sistema, varios usos'))}</div>
        {heading}
        <div class="calendar-grid">{' '.join(cards)}</div>
      </section>'''

def render_sites(manifest):
    source=ROOT/'assets/sites/manifest.json'
    if not source.exists():
        raise FileNotFoundError('The reviewed website screenshots are required: assets/sites/manifest.json')
    captures=json.loads(source.read_text())['images']
    entries=[
      ('Carrigrès','carrigres-web','https://www.carrigres.com/',text('Site WordPress et parcours de demande de devis.','WordPress website and quotation enquiry journey.','Sitio WordPress y recorrido de solicitud de presupuesto.')),
      ('Breathe & Rise Without Fear','breathe-without-fear','https://breathewithoutfear.org/',text('Site de l’initiative de Marie Desy.','Website for Marie Desy’s initiative.','Sitio de la iniciativa de Marie Desy.'))
    ]
    cards=[]
    for name,key,url,summary in entries:
        slides=[]
        for capture in captures:
            if capture['project']!=name:continue
            slides.append({k:capture[k] for k in ('path','width','height','title','alt')})
        assert len(slides)==3,(name,len(slides))
        gallery=render_carousel(slides,name,manifest,'website-slideshow')
        visit=element('a',text('Visiter le site','Visit website','Visitar sitio'),f'class="website-visit" href="{url}" target="_blank" rel="noopener noreferrer"')
        cards.append(f'<article class="website-card" id="{key}">{gallery}<div class="website-details"><div><h3>{html.escape(name)}</h3>{element("p",summary)}</div>{visit}</div></article>')
    return f'''<section class="websites-section section-pad" id="sites" aria-labelledby="websites-title">
        <div class="section-topline">{element('span',text('Expériences numériques','Digital experiences','Experiencias digitales'))}<span>WEB / UX</span></div>
        {element('h2',text('DES IDÉES<br><em>EN LIGNE.</em>','IDEAS<br><em>ONLINE.</em>','IDEAS<br><em>EN LÍNEA.</em>'),'class="display-title websites-title" id="websites-title"',True)}
        <div class="website-grid">{' '.join(cards)}</div>
      </section>'''

def render_metrics(content):
    cards=[]
    for metric in content['metrics']:
        cards.append(f'<div><strong>{html.escape(metric["value"])}</strong>{element("p",metric["label"])}{element("small",metric["period"])}</div>')
    return f'''<section class="numbers-section section-pad" id="preuves" aria-labelledby="numbers-title">
        <div class="section-topline">{element('span',text('Carrigrès · résultats documentés','Carrigrès · documented results','Carrigrès · resultados documentados'))}<span>2025</span></div>
        {element('h2',text('DES IDÉES.<br><em>DES PREUVES.</em>','IDEAS.<br><em>EVIDENCE.</em>','IDEAS.<br><em>EVIDENCIAS.</em>'),'id="numbers-title" class="numbers-title"',True)}
        <div class="number-grid">{' '.join(cards)}</div>
        {element('p',text('Source : bilan de communication Carrigrès, janvier–septembre 2025. Les données Google couvrent les cinq mois suivant l’indexation du site.','Source: Carrigrès communication report, January–September 2025. Google data covers the five months following website indexing.','Fuente: balance de comunicación Carrigrès, enero–septiembre de 2025. Los datos de Google abarcan los cinco meses posteriores a la indexación del sitio.'),'class="metrics-source"')}
      </section>'''

def replace_section(document, section_id, new_section, original_class=None):
    marker=f'PORTFOLIO:{section_id}'
    start=f'<!-- BEGIN {marker} -->'
    end=f'<!-- END {marker} -->'
    generated=f'{start}\n      {new_section}\n      {end}'
    if start in document:
        pattern=re.escape(start)+r'.*?'+re.escape(end)
    else:
        selector=f'id="{re.escape(section_id)}"' if not original_class else f'class="{re.escape(original_class)}"'
        pattern=rf'<section\b[^>]*{selector}[^>]*>.*?</section>'
    document,count=re.subn(pattern,lambda match:generated,document,count=1,flags=re.S)
    if count!=1:raise ValueError(f'Missing section {section_id}')
    return document

def collect_assets(content):
    slides=[slide for project in content['projects'] for slide in project['slides']]
    slides += [calendar['slide'] for calendar in content['calendars']]
    slides += content.get('gallery', [])
    return sorted({item[key] for item in slides for key in ('path','thumb') if item.get(key)})

def version_runtime_assets(document):
    # A returning visitor can receive new HTML while the browser still caches
    # an older script or stylesheet. Bind their URLs to the reviewed contents.
    resources = ('styles.css', 'portfolio-ui.css', 'editorial.css', 'portfolio-refinements.css', 'i18n.js', 'script.js', 'portfolio-refinements.js')
    for resource in resources:
        version = hashlib.sha256((ROOT / resource).read_bytes()).hexdigest()[:12]
        pattern = r'((?:src|href)=["\'])' + re.escape(resource) + r'(?:\?[^"\']*)?(["\'])'
        document, count = re.subn(
            pattern,
            lambda match: match.group(1) + resource + '?v=' + version + match.group(2),
            document,
        )
        if count != 1:
            raise ValueError(f'Expected one runtime resource reference: {resource}')
    return document

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--strict',action='store_true',help='Fail if a selected local artwork or thumbnail has not been imported.')
    args=parser.parse_args()
    content=json.loads((ROOT/'content/projects.json').read_text())
    selected=collect_assets(content)
    site_manifest=ROOT/'assets/sites/manifest.json'
    if site_manifest.exists():
        selected.extend(image['path'] for image in json.loads(site_manifest.read_text())['images'])
    missing=[path for path in selected if not (ROOT/path).is_file()]
    if args.strict and missing:
        raise SystemExit('Selected assets are missing:\n'+'\n'.join(missing))
    manifest=read_manifest()
    document=(ROOT/'index.html').read_text()
    document=replace_section(document,'realisations',render_work(content,manifest))
    document=replace_section(document,'galerie',render_gallery(content,manifest))
    if '<!-- BEGIN PORTFOLIO:calendriers -->' in document:
        document=replace_section(document,'calendriers',render_calendars(content,manifest))
    else:
        marker='<!-- END PORTFOLIO:galerie -->'
        document=document.replace(marker,marker+'\n      <!-- BEGIN PORTFOLIO:calendriers -->\n      '+render_calendars(content,manifest)+'\n      <!-- END PORTFOLIO:calendriers -->')
    document=replace_section(document,'sites',render_sites(manifest))
    document=replace_section(document,'preuves',render_metrics(content),'numbers-section section-pad')
    document=version_runtime_assets(document)
    (ROOT/'index.html').write_text('\n'.join(line.rstrip() for line in document.splitlines())+'\n')
    print(f'Rendered {len(content["projects"])} projects, {len(content["gallery"])} gallery images, four calendars and six website screenshots.')
    if missing:print(f'Local assembly: {len(missing)} image files still await export. Run --strict before release.')

if __name__=='__main__':main()
