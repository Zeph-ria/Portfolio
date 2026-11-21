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

def render_slide(slide, name, manifest, calendar=False, number=0):
    width, height, thumb_width, thumb_height = image_dimensions(slide, manifest)
    path, thumb = slide['path'], slide.get('thumb', slide['path'])
    alt = slide.get('alt') or {language: f'{name} — {slide["caption"][language]}' for language in LANGUAGES}
    source = f' data-source="{attr(slide["source"])}"' if slide.get('source') else ''
    fit = ' data-preview-fit="cover"' if calendar else ''
    quality = 'live-website-screenshot' if path.startswith('assets/sites/') else 'canva-export'
    label = element('span', text('Agrandir', 'Enlarge', 'Ampliar'), 'class="preview-affordance" aria-hidden="true"')
    return f'''<li data-slide>
                  <figure>
                    <a data-preview href="{attr(path)}"{source}{fit}>
                      <img src="{attr(thumb)}" width="{thumb_width}" height="{thumb_height}" loading="lazy" decoding="async" alt="{attr(alt['fr'])}" {i18n(alt, 'alt')} data-full-src="{attr(path)}" data-full-width="{width}" data-full-height="{height}" data-asset-quality="{quality}">
                      {label}
                    </a>
                    <figcaption>{element('span',slide['title'],'data-slide-title')}{element('span',slide['caption'],'data-slide-caption')}</figcaption>
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

def render_case(project):
    labels = {
        'objective': text('L’objectif','The objective','El objetivo'),
        'approach': text('L’approche','The approach','El enfoque'),
        'deliverables': text('Les livrables','The deliverables','Los entregables'),
        'outcome': text('Les résultats observés','Observed results','Resultados observados')
    }
    rows = []
    for key in ('objective','approach','deliverables'):
        rows.append(f'<div>{element("dt",labels[key])}{element("dd",project[key])}</div>')
    if project.get('journey'):
        steps = ''.join(f'<li><span class="journey-step">{index:02}</span><div>{element("strong",step["title"])}{element("p",step["body"])}</div></li>' for index,step in enumerate(project['journey'],1))
        heading=element('dt',text('Le parcours d’une demande','The enquiry journey','El recorrido de una solicitud'))
        rows.append(f'<div>{heading}<dd><ol class="enquiry-journey">{steps}</ol></dd></div>')
    if project.get('outcome'):
        rows.append(f'<div>{element("dt",labels["outcome"])}{element("dd",project["outcome"])}</div>')
    summary = element('summary',text('Étude du projet','Project study','Estudio del proyecto'))
    return f'<details class="case-study">{summary}<dl>{"".join(rows)}</dl></details>'

def render_project(project, index, manifest, featured=False):
    category = element('span',project['category'])
    context = element('p',project['context'],'class="project-context"') if project.get('context') else ''
    role = element('span',text('Mon rôle','My role','Mi papel'),'class="role-label"')+element('span',project['role'])
    angle = element('p',project['angle'],'class="project-angle"') if project.get('angle') else ''
    insight = ''
    if featured:
        labels = {'decision': text('Le choix structurant','The defining choice','La decisión clave'),
                  'evidence': text('Ce que le projet réunit','What the work brings together','Lo que reúne el proyecto')}
        rows = ''.join(f'<div>{element("dt",labels[key])}{element("dd",project[key])}</div>' for key in ('decision','evidence'))
        insight = f'<dl class="project-insight">{rows}</dl>'
    emphasis = ' featured-project' if featured else ''
    return f'''<article class="project-card project-{project['format']}{emphasis}" id="projet-{attr(project['id'])}" data-project="{attr(project['id'])}" data-category="{attr(' '.join(project['categories']))}">
            <div class="project-topline"><span>{index:02}</span>{category}</div>
            <div class="project-details"><div><h3>{html.escape(project['name'])}</h3>{angle}</div></div>
            {render_carousel(project['slides'],project['name'],manifest)}
            <div class="project-story">
              {element('p',project['summary'],'class="project-summary"')}
              <p class="project-role">{role}</p>
              {context}
              {insight}
              {render_case(project)}
            </div>
          </article>'''

def render_work(content, manifest):
    categories=[('all',text('Tout voir','All work','Ver todo')),('branding',text('Identités','Identities','Identidades')),('communication',text('Campagnes & contenus','Campaigns & content','Campañas y contenidos')),('digital',text('Stratégie & digital','Strategy & digital','Estrategia y digital'))]
    buttons='\n          '.join(element('button',label,f'class="filter{" active" if key=="all" else ""}" type="button" data-filter="{key}" aria-pressed="{"true" if key=="all" else "false"}"') for key,label in categories)
    featured = set(content.get('featuredProjects', []))
    cards='\n          '.join(render_project(project,index,manifest,project['id'] in featured) for index,project in enumerate(content['projects'],1))
    heading=element('h2',text('LE TRAVAIL<br><em>PARLE.</em>','THE WORK<br><em>SPEAKS.</em>','EL TRABAJO<br><em>HABLA.</em>'),'class="display-title" id="work-title"',True)
    intro=element('p',text('Rendre une offre plus claire, donner envie de participer, faire reconnaître une marque. Ces projets montrent comment je relie une intention à des images, des mots et des parcours concrets.','Make an offer clearer, invite participation, give a brand a recognisable presence. These projects show how I connect an intention with images, words and practical journeys.','Aclarar una oferta, invitar a participar, dar a una marca una presencia reconocible. Estos proyectos muestran cómo conecto una intención con imágenes, palabras y recorridos concretos.'),'class="section-lede"')
    guidance=element('p',text('Feuilletez les projets ici. Cliquez sur un visuel pour le voir en entier et lire ses détails.','Browse the projects here. Select an image to see it in full and read the details.','Explora los proyectos aquí. Selecciona una imagen para verla completa y leer los detalles.'),'class="work-guidance"')
    return f'''<section class="work-section section-pad" id="realisations" aria-labelledby="work-title">
        <div class="section-topline">{element('span',text('Travaux sélectionnés','Selected work','Trabajos seleccionados'))}<span>2024 — 2026</span></div>
        {heading}
        {intro}
        <div class="filters" role="group" data-i18n-aria="projectFilters" aria-label="Filtrer les projets">
          {buttons}
        </div>
        {guidance}
        <p class="filter-status sr-only" id="project-status" role="status" aria-live="polite" aria-atomic="true"></p>
        <div class="project-grid" id="project-grid">
          {cards}
        </div>
      </section>'''

def render_calendars(content, manifest):
    cards=[]
    for calendar in content['calendars']:
        slides=render_carousel([calendar['slide']],'Carrigrès',manifest,'calendar-slideshow',True)
        cards.append(f'<article class="calendar-card" id="calendrier-{calendar["id"]}">{slides}</article>')
    heading=element('h2',text('UNE ANNÉE.<br><em>QUATRE FORMATS.</em>','ONE YEAR.<br><em>FOUR FORMATS.</em>','UN AÑO.<br><em>CUATRO FORMATOS.</em>'),'class="display-title calendar-title" id="gallery-title"',True)
    intro=element('p',text('Une identité qui accompagne le quotidien. Pour Carrigrès, quatre calendriers conçus selon leur usage : au mur, sur la table et sur le bureau.','An identity that stays present every day. Four Carrigrès calendars designed for their uses: on the wall, on the table and at the desk.','Una identidad que acompaña el día a día. Cuatro calendarios Carrigrès pensados para su uso: en la pared, en la mesa y en el escritorio.'),'class="section-lede"')
    hint=element('p',text('Les aperçus occupent le cadre. Au clic, chaque calendrier s’affiche en entier et peut être agrandi.','The previews fill their frames. Select a calendar to see the full design and zoom in.','Las vistas previas llenan sus marcos. Selecciona un calendario para verlo completo y ampliarlo.'),'class="calendar-guidance"')
    return f'''<section class="design-library calendar-section section-pad" id="galerie" aria-labelledby="gallery-title">
        <div class="section-topline">{element('span',text('Édition · Carrigrès','Print · Carrigrès','Edición · Carrigrès'))}{element('span',text('Un système, plusieurs usages','One system, several uses','Un sistema, varios usos'))}</div>
        {heading}
        {intro}
        {hint}
        <div class="calendar-grid">{' '.join(cards)}</div>
      </section>'''

def render_sites(manifest):
    source=ROOT/'assets/sites/manifest.json'
    if not source.exists():
        raise FileNotFoundError('The reviewed website screenshots are required: assets/sites/manifest.json')
    captures=json.loads(source.read_text())['images']
    entries=[
      ('Carrigrès','carrigres-web','https://www.carrigres.com/',text('Refonte WordPress, présentation de l’offre et formulaire de devis intégré : un parcours de la découverte des matériaux à la prise de contact.','WordPress redesign, product presentation and an embedded quotation form: a journey from discovering materials to making contact.','Rediseño WordPress, presentación de la oferta y formulario de presupuesto integrado: un recorrido desde descubrir los materiales hasta contactar.')),
      ('Breathe & Rise Without Fear','breathe-without-fear','https://breathewithoutfear.org/',text('Conception du site de l’initiative de Marie Desy : une mission incarnée, des ressources accessibles et des récits d’action qui prolongent la page d’accueil.','Website design for Marie Desy’s initiative: a mission with a human presence, accessible resources and action stories that extend beyond the homepage.','Diseño del sitio de la iniciativa de Marie Desy: una misión con presencia humana, recursos accesibles y relatos de acción que amplían la página de inicio.'))
    ]
    cards=[]
    for name,key,url,summary in entries:
        slides=[]
        for capture in captures:
            if capture['project']!=name:continue
            slides.append({k:capture[k] for k in ('path','width','height','title','caption','alt')})
        assert len(slides)==3,(name,len(slides))
        gallery=render_carousel(slides,name,manifest,'website-slideshow')
        visit=element('a',text('Visiter le site','Visit website','Visitar sitio'),f'class="website-visit" href="{url}" target="_blank" rel="noopener noreferrer"')
        cards.append(f'<article class="website-card" id="{key}">{gallery}<div class="website-details"><div><h3>{html.escape(name)}</h3>{element("p",summary)}</div>{visit}</div></article>')
    return f'''<section class="websites-section section-pad" id="sites" aria-labelledby="websites-title">
        <div class="section-topline">{element('span',text('Expériences numériques','Digital experiences','Experiencias digitales'))}<span>WEB / UX</span></div>
        {element('h2',text('DES SITES<br><em>À EXPLORER.</em>','WEBSITES<br><em>TO EXPLORE.</em>','SITIOS<br><em>POR EXPLORAR.</em>'),'class="display-title websites-title" id="websites-title"',True)}
        {element('p',text('L’accueil donne le ton. Les pages intérieures montrent comment le contenu, les images et la navigation répondent à un besoin concret.','The homepage sets the tone. Interior pages show how content, imagery and navigation answer a concrete need.','El inicio marca el tono. Las páginas interiores muestran cómo el contenido, las imágenes y la navegación responden a una necesidad concreta.'),'class="section-lede"')}
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
    return sorted({item[key] for item in slides for key in ('path','thumb') if item.get(key)})

def version_runtime_assets(document):
    # A returning visitor can receive new HTML while the browser still caches
    # an older script or stylesheet. Bind their URLs to the reviewed contents.
    resources = ('styles.css', 'portfolio-ui.css', 'editorial.css', 'i18n.js', 'script.js')
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
    document=replace_section(document,'galerie',render_calendars(content,manifest))
    document=replace_section(document,'sites',render_sites(manifest))
    document=replace_section(document,'preuves',render_metrics(content),'numbers-section section-pad')
    document=version_runtime_assets(document)
    (ROOT/'index.html').write_text('\n'.join(line.rstrip() for line in document.splitlines())+'\n')
    print(f'Rendered {len(content["projects"])} projects, {sum(len(project["slides"]) for project in content["projects"])} project pages, four calendars and six website screenshots.')
    if missing:print(f'Local assembly: {len(missing)} image files still await export. Run --strict before release.')

if __name__=='__main__':main()
