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

test('Three expertise areas replace generic numbered skill cards without imagery',()=>{
  const section=elements.find(node=>node.attrs.id==='competences');
  assert(section);
  const pillars=below(section).filter(n=>n.attrs.class==='expertise-pillar');
  assert.equal(pillars.length,3);
  assert.equal(below(section).filter(n=>n.tag==='img').length,0);
  assert(!below(section).some(n=>n.attrs.class==='competence-index'),'Do not reproduce school-like numbered skills');
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
