/* Editorial interactions. Keep the original artwork and accessible viewer intact. */
(() => {
  "use strict";
  const init = () => {
    const lang = () => ["fr","en","es"].includes(document.documentElement.lang) ? document.documentElement.lang : "fr";
    const dictionary = {
      fr:{all:"Tout voir",logos:"Logos",mockups:"Mockups",visuals:"Visuels",more:"Voir plus de créations",less:"Réduire la galerie",pages:"Feuilleter toutes les pages",close:"Fermer",openOriginal:"Ouvrir le document original",reader:"Calendriers Carrigrès",galleryLabel:"Choisir une catégorie"},
      en:{all:"All",logos:"Logos",mockups:"Mockups",visuals:"Visuals",more:"See more creations",less:"Show fewer creations",pages:"Browse every page",close:"Close",openOriginal:"Open the original document",reader:"Carrigrès calendars",galleryLabel:"Choose a category"},
      es:{all:"Todo",logos:"Logotipos",mockups:"Mockups",visuals:"Visuales",more:"Ver más creaciones",less:"Reducir la galería",pages:"Ver todas las páginas",close:"Cerrar",openOriginal:"Abrir el documento original",reader:"Calendarios Carrigrès",galleryLabel:"Elegir una categoría"}
    };
    const t = key => dictionary[lang()]?.[key] || dictionary.fr[key];
    const gallery = document.querySelector("#galerie [data-gallery]");
    if (gallery) {
      const grid = gallery.querySelector(".gallery-grid");
      if (grid) {
        const items = [...grid.querySelectorAll(".gallery-item")];
        const picturePath = item => item.querySelector("a[data-preview]")?.getAttribute("href") || "";
        const kindOf = item => {
          const path = picturePath(item);
          const brand = item.querySelector(".gallery-brand")?.textContent?.toLowerCase() || "";
          const title = item.querySelector("[data-slide-title]")?.getAttribute("data-fr")?.toLowerCase() || "";
          // Apparel product posts and salon content are not branding mockups.
          if (/annieck|atelier|wali|bloom/i.test(brand)) return "visuals";
          if (/revendre-logo-p01|agorafrik-identite-p02|utex-empreinte-p02/.test(path)) return "logos";
          if (/logo/i.test(title) && !/évolution|analyse|construction/i.test(title)) return "logos";
          const physicalApplications = /agorafrik-identite-p(23|27|31|32|33|35|39)|carrigres-identite-p(23|24|27)|revendre-cadeau|revendre-carte-cadeau|revendre-lookbook|carrigres-calendrier/;
          if (physicalApplications.test(path)) return "mockups";
          if (/tote bag|tee-shirt|casque|mug|badge|étiquette|carte cadeau|couverture du lookbook/i.test(title)) return "mockups";
          return "visuals";
        };
        items.forEach(item => { item.dataset.artworkType = kindOf(item); });
        const preferred = ["agorafrik-identite-p35.webp","wali-visuels-p13.webp","atelier-campagnes-p22.webp","revendre-styles-p39.webp"];
        const teaserItems = preferred.map(name => items.find(item => picturePath(item).endsWith(name))).filter(Boolean).slice(0,4);
        // The four visible teaser artworks should appear promptly rather than waiting for lazy loading.
        teaserItems.forEach(item => {
          const preview = item.querySelector('img');
          if (preview) {
            preview.loading = 'eager';
            preview.fetchPriority = 'high';
          }
        });
        items.forEach(item => { item.hidden = false; });
        const teaser = document.createElement("ul");
        teaser.className = "gallery-teaser";
        teaser.setAttribute("aria-label", "Sélection de créations");
        const panel = document.createElement("div");
        panel.className = "gallery-more";
        panel.id = "gallery-more";
        panel.hidden = true;
        const controls = document.createElement("div");
        controls.className = "gallery-category-controls";
        controls.setAttribute("role", "group");
        const buttons = {};
        let filter = "all";
        for (const kind of ["all","logos","mockups","visuals"]) {
          const control = document.createElement("button");
          control.type = "button";
          control.className = "gallery-category-button";
          control.dataset.galleryCategory = kind;
          control.setAttribute("aria-pressed", kind === "all" ? "true" : "false");
          control.addEventListener("click", () => {
            filter = kind;
            items.forEach(item => { item.hidden = kind !== "all" && item.dataset.artworkType !== kind; });
            renderLabels();
          });
          controls.appendChild(control);
          buttons[kind] = control;
        }
        const more = document.createElement("button");
        more.type = "button";
        more.className = "gallery-more-button";
        more.setAttribute("aria-controls", panel.id);
        const buttonText = document.createElement("span");
        const buttonCount = document.createElement("span");
        buttonCount.className = "gallery-more-count";
        more.append(buttonText, buttonCount);
        const bottomLess = document.createElement("button");
        bottomLess.type = "button";
        bottomLess.className = "gallery-less-button";
        const countFor = kind => kind === "all" ? items.length : items.filter(item => item.dataset.artworkType === kind).length;
        const renderLabels = () => {
          const open = !panel.hidden;
          buttonText.textContent = t(open ? "less" : "more");
          buttonCount.textContent = open ? "" : String(Math.max(0,items.length-teaserItems.length)) + " +";
          bottomLess.textContent = t("less");
          controls.setAttribute("aria-label",t("galleryLabel"));
          for (const [key, button] of Object.entries(buttons)) {
            button.textContent = t(key) + " (" + countFor(key) + ")";
            button.setAttribute("aria-pressed", String(key === filter));
          }
        };
        const showFull = () => {
          const fragment = document.createDocumentFragment();
          teaserItems.forEach(item => fragment.appendChild(item));
          grid.prepend(fragment);
          teaser.hidden = true;
          panel.hidden = false;
          more.setAttribute("aria-expanded", "true");
          renderLabels();
        };
        const showTeaser = () => {
          filter = "all";
          items.forEach(item => { item.hidden = false; });
          teaserItems.forEach(item => teaser.appendChild(item));
          teaser.hidden = false;
          panel.hidden = true;
          more.setAttribute("aria-expanded", "false");
          renderLabels();
        };
        more.addEventListener("click", () => panel.hidden ? showFull() : showTeaser());
        bottomLess.addEventListener("click", () => {
          showTeaser();
          more.focus({preventScroll:true});
          gallery.closest("#galerie")?.scrollIntoView({block:"start",behavior:"auto"});
        });
        gallery.prepend(teaser);
        gallery.appendChild(more);
        panel.append(controls,grid,bottomLess);
        gallery.appendChild(panel);
        showTeaser();
        document.addEventListener("portfolio:languagechange",renderLabels);
      }
    }

    // Original print files are public read-only documents. Load only on demand.
    const calendarSources = {
      "calendrier-mural":{id:"1ewa3oQDFFRyAy6Vzzw6HmrQvk-UbSrNo",fr:"Calendrier mural",en:"Wall calendar",es:"Calendario de pared"},
      "calendrier-table":{id:"1csy5f0hEuTbIccQ93ZaiG0D-Lw9U7KSQ",fr:"Calendrier de table, 15 pages dont les douze mois",en:"Desk calendar, 15 pages including all twelve months",es:"Calendario de mesa, 15 páginas incluidos los doce meses"},
      "calendrier-triptyque":{id:"1arDusWDL8xQRec7BsjKY2K5NBcsLCZRt",fr:"Calendrier triptyque",en:"Three-panel calendar",es:"Calendario tríptico"},
      "calendrier-sous-main":{id:"1k8uksHWgNWzm-SpIAcXHqT8PZu6ozwyo",fr:"Calendrier sous-main",en:"Desk pad calendar",es:"Calendario de escritorio"}
    };
    const calendarCards = [...document.querySelectorAll(".calendar-card")];
    if (calendarCards.length && typeof HTMLDialogElement !== "undefined") {
      const dialog = document.createElement("dialog");
      dialog.className = "calendar-reader";
      dialog.setAttribute("aria-labelledby","calendar-reader-title");
      const header = document.createElement("div");
      header.className = "calendar-reader-header";
      const title = document.createElement("h3"); title.id = "calendar-reader-title";
      const close = document.createElement("button"); close.type="button"; close.className="calendar-reader-close";
      header.append(title,close);
      const frame = document.createElement("iframe");
      frame.title = t("reader"); frame.loading = "lazy"; frame.setAttribute("allowfullscreen","");
      frame.setAttribute("referrerpolicy","no-referrer");
      const footer = document.createElement("div"); footer.className="calendar-reader-footer";
      const openOriginal = document.createElement("a"); openOriginal.target="_blank";openOriginal.rel="noopener noreferrer";footer.appendChild(openOriginal);
      dialog.append(header,frame,footer); document.body.appendChild(dialog);
      close.addEventListener("click",()=>dialog.close());
      dialog.addEventListener("close",()=>frame.removeAttribute("src"));
      dialog.addEventListener("click",event=>{if(event.target===dialog)dialog.close();});
      let selected = null;
      const readerLabels = () => {
        close.textContent=t("close");
        title.textContent=selected ? selected[lang()] : t("reader");
        frame.title=t("reader");
        openOriginal.textContent=t("openOriginal");
      };
      calendarCards.forEach(card=>{
        const source=calendarSources[card.id]; if(!source)return;
        const btn=document.createElement("button");btn.type="button";btn.className="calendar-pages-button";
        btn.addEventListener("click",()=>{
          selected=source;
          const view="https://drive.google.com/file/d/"+encodeURIComponent(source.id)+"/view";
          openOriginal.href=view;
          frame.src="https://drive.google.com/file/d/"+encodeURIComponent(source.id)+"/preview";
          readerLabels();
          dialog.showModal();
        });
        card.appendChild(btn);
        const label=()=>{btn.textContent=t("pages");btn.setAttribute("aria-haspopup","dialog");};
        label();document.addEventListener("portfolio:languagechange",label);
      });
      document.addEventListener("portfolio:languagechange",readerLabels);
    }

    // Motion remains optional; hover, focus, manual interaction and zoom pause playback.
    const motion = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!motion?.matches) {
      const slideshows=[...document.querySelectorAll(".project-card [data-slideshow],.calendar-card [data-slideshow]")];
      const observer=typeof IntersectionObserver==="function" ? new IntersectionObserver(entries=>{
        entries.forEach(entry=>{entry.target.dataset.inViewport=entry.isIntersecting?"true":"false";});
      },{threshold:0.4}) : null;
      slideshows.forEach(root=>{
        if(root.querySelectorAll("[data-slide]").length<2)return;
        root.dataset.inViewport=observer?"false":"true";observer?.observe(root);
        let paused=false;
        root.addEventListener("pointerenter",()=>{paused=true;});
        root.addEventListener("pointerleave",()=>{paused=false;});
        root.addEventListener("focusin",()=>{paused=true;});
        root.addEventListener("focusout",()=>{paused=false;});
        root.addEventListener("pointerdown",()=>{paused=true;});
        window.setInterval(()=>{
          if(paused||document.hidden||root.dataset.inViewport!=="true"||document.querySelector("#design-dialog[open], .calendar-reader[open]"))return;
          const next=root.querySelector("[data-slide-next]");
          const track=root.querySelector(".slide-track");
          if(!next||!track)return;
          if(next.disabled)track.scrollTo({left:0,behavior:"smooth"});else next.click();
        },7000);
      });
    }
  };
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
