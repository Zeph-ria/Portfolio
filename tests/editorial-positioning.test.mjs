import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {test} from 'node:test';
import {readHtml} from './helpers/html.mjs';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const html=readFileSync(resolve(root,'index.html'),'utf8');
const doc=JSON.parse(readFileSync(resolve(root,'content/projects.json'),'utf8'));
const {elements,errors}=readHtml(html);
const below=node=>node.children.flatMap(child=>[child,...below(child)]);

test('Three flagship projects are surfaced before the supporting gallery work',()=>{
  assert.deepEqual(errors,[]);
  const projects=elements.filter(node=>node.tag==='article' && node.attrs['data-project']);
  assert.deepEqual(projects.map(node=>node.attrs['data-project']),doc.projects.map(project=>project.id));
  assert.deepEqual(projects.slice(0,3).map(node=>node.attrs['data-project']),['carrigres','agorafrik','utex-empreinte']);
  assert.equal(projects.length,10);
  assert.equal(projects.filter(node=>node.attrs['data-editorial-tier']==='lead').length,3);
  for(const card of projects.slice(0,3)){
    const role=below(card).find(n=>n.attrs.class==='project-role');
    assert(role,'A leading project needs a precise contribution');
    for(const lang of ['fr','en','es'])assert(role.attrs['data-'+lang]?.trim());
  }
  for(const card of projects.slice(3)){
    assert.equal(card.attrs['data-editorial-tier'],'support');
  }
});

test('New copy emphasizes scope without claiming that proposed ESG work was deployed',()=>{
  const carrigres=doc.projects.find(project=>project.id==='carrigres');
  assert(carrigres.summary.fr.includes('demande de devis'));
  const utex=doc.projects.find(project=>project.id==='utex-empreinte');
  assert(utex.summary.fr.includes('proposition de programme ESG'));
  assert(utex.summary.fr.includes('Les documents internes restent confidentiels.'));
  assert(!html.includes('class="utex-process"'),'No internal programme steps should be disclosed');
  assert(!html.includes('canva.com/design/DAG4l6UmPgY'),'No confidential full deck link');
});

test('Four expertise areas include AI without generic numbered cards or imagery',()=>{
  const section=elements.find(node=>node.attrs.id==='competences');
  assert(section);
  const pillars=below(section).filter(n=>n.attrs.class==='expertise-pillar');
  assert.equal(pillars.length,4);
  assert.equal(below(section).filter(n=>n.tag==='img').length,0);
  assert(!below(section).some(n=>n.attrs.class==='competence-index'),'Do not reproduce school-like numbered skills');
  assert(pillars.some(pillar=>below(pillar).some(node=>node.tag==='h3' && node.attrs['data-fr']==='IA & automatisation')),
    'AI and automation must be visible as an explicit skill');
  for(const pillar of pillars){
    const title=below(pillar).find(n=>n.tag==='h3');
    const copy=below(pillar).find(n=>n.tag==='p');
    assert(title && copy);
    for(const lang of ['fr','en','es']){
      assert(title.attrs['data-'+lang]?.trim());
      assert(copy.attrs['data-'+lang]?.trim());
    }
  }
});



test('Biography shares a balanced editorial story across three translated chapters',()=>{
  const about=elements.find(node=>node.attrs.id==='apropos');
  assert(about,'Biography should exist');
  const chapters=below(about).filter(node=>node.attrs.class==='about-chapter');
  assert.equal(chapters.length,3);
  for(const chapter of chapters){
    const label=below(chapter).find(node=>node.attrs.class==='about-chapter-label');
    const paragraph=below(chapter).find(node=>node.tag==='p');
    assert(label && paragraph);
    for(const lang of ['fr','en','es']){
      assert(label.attrs['data-'+lang]?.trim(),'Missing localized chapter label');
      assert(paragraph.attrs['data-'+lang]?.trim(),'Missing localized chapter copy');
    }
  }
  assert(!html.includes('Je continue à apprendre'),'Junior-sounding closing sentence must be replaced');
  assert(html.includes('data-fr="Des sciences politiques à l’intelligence artificielle'));
});



test('The exact approved sentence is the central headline in all three languages',()=>{
  const feature=elements.find(node=>node.tag==='section' && node.attrs.class==='feature');
  assert(feature,'The editorial feature must exist');
  const h2=below(feature).find(node=>node.tag==='h2');
  assert(h2);
  assert.equal(h2.attrs['data-fr'],'Je relie les idées à <em>ce qui les rend possibles.</em>');
  assert.equal(h2.attrs['data-en'],'I connect ideas to <em>what makes them possible.</em>');
  assert.equal(h2.attrs['data-es'],'Conecto las ideas con <em>lo que las hace posibles.</em>');
  assert(!html.includes('Je travaille sur <em>le fond</em> autant que sur la forme.'),
    'The former generic headline must not return');
});

test('Every localized public element has French, English and Spanish copy',()=>{
  const localized=elements.filter(node=>Object.hasOwn(node.attrs,'data-fr'));
  assert(localized.length > 80);
  for(const node of localized){
    for(const language of ['fr','en','es'])
      assert(node.attrs['data-'+language]?.trim(),
        'Missing '+language+' for '+node.tag+' '+(node.attrs.class||node.attrs.id||''));
  }
});
