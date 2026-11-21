/* Portfolio editorial refinements: progressive enhancement, no dependency. */
(() => {
  const init = () => {
    const lang = () => ['fr','en','es'].includes(document.documentElement.lang) ? document.documentElement.lang : 'fr';
    const words = {
      fr:{all:'Tout voir',logos:'Logos',mockups:'Mockups',visuals:'Visuels',open:'Explorer les créations',close:'Réduire la galerie',hint:'Choisissez une catégorie pour découvrir les créations.'},
      en:{all:'All',logos:'Logos',mockups:'Mockups',visuals:'Visuals',open:'Explore the collection',close:'Collapse gallery',hint:'Choose a category to explore the collection.'},
      es:{all:'Todo',logos:'Logotipos',mockups:'Mockups',visuals:'Visuales',open:'Explorar las creaciones',close:'Reducir la galería',hint:'Elige una categoría para explorar las creaciones.'}
    };
    const gallery = document.querySelector('#galerie [data-gallery]');
    if(gallery){
      const grid=gallery.querySelector('.gallery-grid');
      if(grid){
        // Categories describe the artwork, not the client. Avoid showing construction boards as finished logos.
        const categorise=item=>{
          const title=(item.querySelector('[data-slide-title]')?.getAttribute('data-fr')||'').toLowerCase();
          const path=(item.querySelector('a[data-preview]')?.getAttribute('href')||'').toLowerCase();
          if(/logo|signature|identit[eé]/.test(title) && !/évolution|construction|identité industrielle/.test(title)) return 'logos';
          if(/mug|tee-shirt|tote|badge|étiquette|casque|vêtement|carte cadeau|coffret en situation|panneau art shop|objets|cartes et|lookbook/.test(title)) return 'mockups';
          if(/-identite-p(3[12359]|2[347])\./.test(path)) return 'mockups';
          return 'visuals';
        };
        const items=[...grid.querySelectorAll('.gallery-item')];
        items.forEach(item=>item.dataset.artworkType=categorise(item));
        const controls=document.createElement('div');
        controls.className='gallery-category-controls';
        controls.setAttribute('role','group');
        controls.setAttribute('aria-label','Gallery categories');
        const panel=document.createElement('details');
        panel.className='gallery-disclosure';
        const toggle=document.createElement('summary');
        toggle.className='gallery-disclosure-toggle';
        const label=document.createElement('span');
        toggle.appendChild(label);
        const content=document.createElement('div');
        content.className='gallery-disclosure-content';
        grid.parentNode.insertBefore(panel,grid);
        content.appendChild(grid);
        panel.append(toggle,content);
        gallery.insertBefore(controls,panel);
        let filter='all';
        const buttons={};
        for(const type of ['all','logos','mockups','visuals']){
          const button=document.createElement('button');
          button.type='button';
          button.className='gallery-category-button';
          button.dataset.galleryCategory=type;
          button.setAttribute('aria-pressed',String(type==='all'));
          button.addEventListener('click',()=>{
            filter=type;
            for(const [key,control] of Object.entries(buttons))control.setAttribute('aria-pressed',String(key===type));
            items.forEach(item=>item.hidden=type!=='all'&&item.dataset.artworkType!==type);
            panel.open=true;
            render();
          });
          controls.appendChild(button); buttons[type]=button;
        }
        const render=()=>{
          const t=words[lang()]||words.fr;
          label.textContent=panel.open?t.close:t.open;
          for(const [key,button] of Object.entries(buttons)){
            button.textContent=t[key]+' · '+(key==='all'?items.length:items.filter(item=>item.dataset.artworkType===key).length);
          }
        };
        panel.addEventListener('toggle',render);
        document.addEventListener('portfolio:languagechange',render);
        render();
      }
    }
    // Timed advance only while a slideshow is visible, and never over user intent.
    if(!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches){
      const slideshows=[...document.querySelectorAll('.project-card [data-slideshow],.calendar-card [data-slideshow]')];
      const visibility=typeof IntersectionObserver==='function'?new IntersectionObserver(entries=>{
        entries.forEach(entry=>entry.target.dataset.inViewport=entry.isIntersecting?'true':'false');
      },{threshold:.4}):null;
      slideshows.forEach(root=>{
        if(root.querySelectorAll('[data-slide]').length<2)return;
        root.dataset.inViewport=visibility?'false':'true';
        visibility?.observe(root);
        let paused=false;
        root.addEventListener('pointerenter',()=>{paused=true});
        root.addEventListener('pointerleave',()=>{paused=false});
        root.addEventListener('focusin',()=>{paused=true});
        root.addEventListener('focusout',()=>{paused=false});
        root.addEventListener('pointerdown',()=>{paused=true});
        window.setInterval(()=>{
          if(paused||document.hidden||root.dataset.inViewport!=='true'||document.querySelector('#design-dialog[open]'))return;
          const next=root.querySelector('[data-slide-next]');
          const prev=root.querySelector('[data-slide-prev]');
          if(!next||!prev)return;
          if(next.disabled){const first=root.querySelector('[data-slide]'); if(first){const track=root.querySelector('.slide-track'); if(track)track.scrollTo({left:0,behavior:'smooth'}); prev.click();}}else next.click();
        },6500);
      });
    }
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
