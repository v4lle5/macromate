import{a as b,b as s,c as z,d as v,e as p,f as r,g as de}from"./chunks/chunk-MCIAZV6Q.js";var F=class{constructor(e){this.hass=e}subscribe(e){return this.hass.connection.subscribeMessage(e,{type:"recipe_manager/subscribe"})}async getAllRecipes(){return this.hass.callWS({type:"recipe_manager/recipes/get_all"})}async getRecipe(e){return this.hass.callWS({type:"recipe_manager/recipes/get",recipe_id:e})}async scrapeRecipe(e,t=!1){return this.hass.callWS({type:"recipe_manager/recipes/scrape",url:e,enabled:t})}async addRecipe(e){return this.hass.callWS({type:"recipe_manager/recipes/add",...e})}async updateRecipe(e,t){return this.hass.callWS({type:"recipe_manager/recipes/update",recipe_id:e,...t})}async deleteRecipe(e){return this.hass.callWS({type:"recipe_manager/recipes/delete",recipe_id:e})}async toggleFavourite(e){return this.hass.callWS({type:"recipe_manager/recipes/toggle_favourite",recipe_id:e})}async downloadRecipeImage(e,t){if(!window.confirm("Allow MacroMate to download and privately normalize this remote image?"))throw{code:"invalid_request"};return this.hass.callWS({type:"recipe_manager/recipes/download_image",recipe_id:e,image_url:t,enabled:!0})}async getTags(){return this.hass.callWS({type:"recipe_manager/tags/get_all"})}async getMealPlan(e){let t={type:"recipe_manager/meal_plan/get"};return e&&(t.week_start=e),this.hass.callWS(t)}async addToMealPlan(e,t,i,a=1,n=null){let o={type:"recipe_manager/meal_plan/add",recipe_id:e,date:t,meal_type:i,servings:a};return n&&(o.notes=n),this.hass.callWS(o)}async removeFromMealPlan(e){return this.hass.callWS({type:"recipe_manager/meal_plan/remove",entry_id:e})}async clearMealPlanWeek(e){return this.hass.callWS({type:"recipe_manager/meal_plan/clear",week_start:e,confirm:!0})}async getGlobalTimers(){return this.hass.callWS({type:"recipe_manager/global_timers/get"})}async addGlobalTimer(e){return this.hass.callWS({type:"recipe_manager/global_timers/add",...e})}async updateGlobalTimer(e,t){return this.hass.callWS({type:"recipe_manager/global_timers/update",timer_id:e,...t})}async deleteGlobalTimer(e){return this.hass.callWS({type:"recipe_manager/global_timers/delete",timer_id:e})}async importRecipeKeeper(e){return this.hass.callWS({type:"recipe_manager/import/recipe_keeper",html_content:e})}async uploadRecipeImage(e,t){return this.hass.callWS({type:"recipe_manager/recipes/upload_image",recipe_id:e,image_data:t})}};var L=(l,e)=>`macromate:ui:${l.context.user}:${e}`;function pe(l,e){try{let t=l.getItem(e);return t&&t.length<=131072?JSON.parse(t):null}catch{return null}}function he(l){if(!l.current()||!l.context.admin)return{};let e=pe(sessionStorage,L(l,"view"))||{},t=pe(localStorage,L(l,"timers")),i=Date.now();return{view:typeof e.view=="string"?e.view:null,recipeId:typeof e.recipeId=="string"?e.recipeId:null,recentIds:Array.isArray(e.recentIds)?e.recentIds.filter(a=>typeof a=="string"&&a.length<=128).slice(0,200):[],timers:Array.isArray(t)?t.slice(0,100).filter(a=>a&&typeof a.id=="string"&&typeof a.label=="string"&&a.label.length<=300&&Number.isFinite(a.total)&&a.total>0&&a.total<=604800&&Number.isFinite(a.remaining)&&Number.isFinite(a.savedAt)).map(a=>({id:a.id,label:a.label,total:a.total,remaining:Math.max(0,a.remaining-(a.running?Math.max(0,Math.floor((i-a.savedAt)/1e3)):0)),running:a.running===!0,presetId:a.presetId||null})).filter(a=>a.remaining>0):[]}}function me(l,e,t){if(!(!l?.current()||!l.context.admin))try{sessionStorage.setItem(L(l,"view"),JSON.stringify(e)),localStorage.setItem(L(l,"timers"),JSON.stringify(t.filter(i=>!i.global).slice(0,100).map(i=>({id:i.id,label:i.label,total:i.total,remaining:i.remaining,running:i.running===!0,presetId:i.presetId||null,savedAt:Date.now()}))))}catch{}}var P=Object.freeze({theme:"glass-wave",darkMode:"system",fontSize:"medium",columns:3,showFavourites:!0,showPlanner:!0,recentCount:12,timerSound:"beep",keepScreenOn:!1,keepScreenOnMins:30,showUnitConversion:!1,language:"en",unitSystem:"metric"});function w(l={}){let e=l&&typeof l=="object"&&!Array.isArray(l)?l:{};return{...P,...e,theme:"glass-wave",unitSystem:"metric",showUnitConversion:!1,darkMode:["off","system","on"].includes(e.darkMode)?e.darkMode:P.darkMode,fontSize:["small","medium","large"].includes(e.fontSize)?e.fontSize:P.fontSize,columns:[2,3,4,5,8,10].includes(e.columns)?e.columns:P.columns}}var Fe={"--rm-font-family":'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',"--rm-font-size-sm":"calc(var(--rm-font-size-base) * 0.875)","--rm-font-size-xs":"max(12px, calc(var(--rm-font-size-base) * 0.8125))","--rm-line-height":"1.55","--rm-touch-target":"44px","--rm-radius":"18px","--rm-radius-sm":"12px","--rm-radius-lg":"24px","--rm-space-1":"4px","--rm-space-2":"8px","--rm-space-3":"12px","--rm-space-4":"16px","--rm-space-5":"24px","--rm-space-6":"32px","--rm-disabled-opacity":"1"},Le=Object.freeze({light:Object.freeze({"--rm-bg-canvas":"#F9EFDA","--rm-bg-main":"#F9EFDA","--rm-bg-surface":"rgba(253, 248, 239, 0.72)","--rm-bg-elevated":"#FDF8EF","--rm-dialog-bg":"#FDF8EF","--rm-text":"#263B47","--rm-text-secondary":"#53666E","--rm-text-muted":"#53666E","--rm-accent":"#DCCDB8","--rm-primary":"#DCCDB8","--rm-accent-text":"#263B47","--rm-accent-ink":"#263B47","--rm-accent-soft":"#EFE3CE","--rm-border":"#C5CBC7","--rm-border-subtle":"#EFE3CE","--rm-border-strong":"#576C65","--rm-focus":"#576C65","--rm-success":"#576C65","--rm-success-soft":"#C5CBC7","--rm-success-ink":"#263B47","--rm-success-text":"#ffffff","--rm-warning":"#735A1F","--rm-warning-soft":"#EFE3CE","--rm-warning-text":"#ffffff","--rm-danger":"#8C4936","--rm-danger-soft":"#E4A9A3","--rm-danger-text":"#ffffff","--rm-error":"#8C4936","--rm-error-soft":"#E4A9A3","--rm-error-ink":"#263B47","--rm-error-text":"#ffffff","--rm-terracotta":"#B46F52","--rm-rose":"#E4A9A3","--rm-ochre":"#C19A3F","--rm-sage":"#576C65","--rm-disabled-bg":"#EFE3CE","--rm-disabled-text":"#53666E","--rm-shadow":"0 8px 28px rgba(91, 67, 44, 0.10)","--rm-glass-highlight":"rgba(255, 255, 255, 0.7)"}),dark:Object.freeze({"--rm-bg-canvas":"#27231F","--rm-bg-main":"#302A24","--rm-bg-surface":"rgba(61, 52, 43, 0.90)","--rm-bg-elevated":"#40362D","--rm-dialog-bg":"#40362D","--rm-text":"#F9EFDA","--rm-text-secondary":"#DCCDB8","--rm-text-muted":"#C5CBC7","--rm-accent":"#DCCDB8","--rm-primary":"#DCCDB8","--rm-accent-text":"#263B47","--rm-accent-ink":"#DCCDB8","--rm-accent-soft":"#514336","--rm-border":"#776A5A","--rm-border-subtle":"#514336","--rm-border-strong":"#C5CBC7","--rm-focus":"#DCCDB8","--rm-success":"#a6d9b7","--rm-success-soft":"#244837","--rm-success-ink":"#a6d9b7","--rm-success-text":"#173524","--rm-warning":"#ecd28d","--rm-warning-soft":"#494021","--rm-warning-text":"#382b0e","--rm-danger":"#ffb9a7","--rm-danger-soft":"#55352f","--rm-danger-text":"#47251d","--rm-error":"#ffb9a7","--rm-error-soft":"#55352f","--rm-error-ink":"#ffb9a7","--rm-error-text":"#47251d","--rm-terracotta":"#B46F52","--rm-rose":"#E4A9A3","--rm-ochre":"#C19A3F","--rm-sage":"#C5CBC7","--rm-disabled-bg":"#514336","--rm-disabled-text":"#C5CBC7","--rm-shadow":"0 8px 28px rgba(0, 0, 0, 0.22)","--rm-glass-highlight":"rgba(253, 248, 239, 0.08)"})});function Pe(l={},e=!1){let t=w(l),i=t.darkMode==="on"||t.darkMode==="system"&&e;return{...Fe,...Le[i?"dark":"light"],"--rm-font-size-base":{small:"14px",medium:"16px",large:"18px"}[t.fontSize],"--rm-grid-columns":`repeat(${t.columns}, minmax(0, 1fr))`}}function ue(l,e={},t=!1){let i=w(e),a=i.darkMode==="on"||i.darkMode==="system"&&t?"dark":"light";for(let[n,o]of Object.entries(Pe(i,t)))l.style.setProperty(n,o);l.toggleAttribute("glass-wave",!0),l.setAttribute("data-appearance",a),l.style.colorScheme=a}var ge=["de","es","fr","it","nl","pt"],N=["de","en","es","fr","it","nl","pt"];var{getLocale:Ne,setLocale:Oe}=de({sourceLocale:"en",targetLocales:ge,loadLocale:l=>({de:()=>import("./chunks/de-6NBW56XJ.js"),es:()=>import("./chunks/es-A3J7ZU3H.js"),fr:()=>import("./chunks/fr-GWNL7MIW.js"),it:()=>import("./chunks/it-NFOVWZSQ.js"),nl:()=>import("./chunks/nl-BCWQZI3N.js"),pt:()=>import("./chunks/pt-ARZFEKX4.js")})[l]()});async function A(l){let e=N.includes(l)?l:"en";e!==Ne()&&await Oe(e)}var I=new Set,q=new Set,k=null,R=null;function y(){return typeof navigator<"u"&&"wakeLock"in navigator}function U(){let l=!!k;q.forEach(e=>e(l))}async function ve(){if(R)return R;if(!(!y()||k)&&!(typeof document<"u"&&document.visibilityState!=="visible"))return R=(async()=>{try{let l=await navigator.wakeLock.request("screen");if(!I.size||document.visibilityState!=="visible"){await l.release();return}k=l,k.addEventListener("release",()=>{k=null,U()}),U()}catch(l){console.warn("[RM] Wake Lock request failed:",l)}finally{R=null}})(),R}async function je(){if(k){try{await k.release()}catch{}k=null,U()}}async function fe(){I.size>0?await ve():await je()}typeof document<"u"&&document.addEventListener("visibilitychange",()=>{document.visibilityState==="visible"&&I.size>0&&ve()});async function O(l){I.add(l),await fe()}async function D(l){I.delete(l),await fe()}function xe(l){return q.add(l),()=>q.delete(l)}var f=b`
  :host {
    min-width: 0;
    min-height: 0;
    color: var(--rm-text, #243c42);
    color-scheme: inherit;
    font-family: var(
      --rm-font-family,
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      sans-serif
    );
    font-size: var(--rm-font-size-base, 15px);
    line-height: var(--rm-line-height, 1.55);
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  button,
  input,
  select,
  textarea {
    font-family: inherit;
    line-height: 1.4;
    letter-spacing: inherit;
  }

  input,
  select,
  textarea {
    min-width: 0;
    max-width: 100%;
    accent-color: var(--rm-accent, #315d75);
    color-scheme: inherit;
  }

  input::placeholder,
  textarea::placeholder {
    color: var(--rm-text-secondary, #506770);
    opacity: 1;
  }

  select option {
    color: var(--rm-text, #243c42);
    background: var(--rm-dialog-bg, #f3f7f8);
  }

  :host :is(button, a, input, select, textarea, [tabindex]):focus-visible {
    outline: 3px solid var(--rm-focus, var(--rm-accent, #315d75));
    outline-offset: 2px;
  }

  :host button:disabled {
    color: var(--rm-disabled-text, var(--rm-text-secondary, #506770));
    background: var(--rm-disabled-bg, var(--rm-bg-elevated, #e4ecef));
    opacity: 1;
    cursor: not-allowed;
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation: none !important;
      transition: none !important;
      scroll-behavior: auto !important;
    }
  }
`;var V=class extends v{static properties={recipes:{type:Array},allRecipes:{type:Array},tags:{type:Array},searchQuery:{type:String},activeTag:{type:String},columns:{type:Number},showFavourites:{type:Boolean},hideSidebar:{type:Boolean},scrollPos:{type:Number},recentRecipes:{type:Array},recentCount:{type:Number},_filterMode:{type:String},_starFilter:{type:Number},_sortByRating:{type:Boolean},_showRatingMenu:{type:Boolean},_selectedCourses:{type:Object},_selectedCategories:{type:Object},_selectedCollections:{type:Object},filterPreset:{type:Object}};constructor(){super(),this.recipes=[],this.allRecipes=[],this.tags=[],this.searchQuery="",this.activeTag=null,this.columns=3,this.showFavourites=!0,this.hideSidebar=!1,this.scrollPos=0,this.recentRecipes=[],this.recentCount=12,this._filterMode="all",this._starFilter=0,this._sortByRating=!1,this._showRatingMenu=!1,this._selectedCourses=new Set,this._selectedCategories=new Set,this._selectedCollections=new Set,this._lastScrollPos=0,this._hasRestoredScroll=!1,this.filterPreset=null}_toggleChip(e,t){let i=e==="courses"?"_selectedCourses":e==="categories"?"_selectedCategories":"_selectedCollections",a=new Set(this[i]);a.has(t)?a.delete(t):a.add(t),this[i]=a}updated(e){if(e.has("filterPreset")&&this.filterPreset){let{filterMode:t,selectedValues:i}=this.filterPreset;this._filterMode=t,this._selectedCourses=new Set,this._selectedCategories=new Set,this._selectedCollections=new Set,t==="courses"&&(this._selectedCourses=new Set(i)),t==="categories"&&(this._selectedCategories=new Set(i)),t==="collections"&&(this._selectedCollections=new Set(i))}e.has("scrollPos")&&(this._hasRestoredScroll=!1),this.scrollPos!=null&&!this._hasRestoredScroll&&(this._hasRestoredScroll=!0,this.updateComplete.then(()=>{requestAnimationFrame(()=>{let t=this.shadowRoot?.querySelector(".grid-scroll");t&&(t.scrollTop=this.scrollPos)})}))}_handleSearchInput(e){this.dispatchEvent(new CustomEvent("rm-search",{detail:{query:e.target.value},bubbles:!0,composed:!0}))}_handleClearSearch(){this.dispatchEvent(new CustomEvent("rm-search",{detail:{query:""},bubbles:!0,composed:!0}))}_handleTagClick(e){this.dispatchEvent(new CustomEvent("rm-tag-filter",{detail:{tag:e},bubbles:!0,composed:!0}))}_handleOpenRecipe(e){this.dispatchEvent(new CustomEvent("rm-open-recipe",{detail:{recipe:e},bubbles:!0,composed:!0}))}_handleToggleFavourite(e,t){e.stopPropagation(),this.dispatchEvent(new CustomEvent("rm-toggle-favourite",{detail:{recipeId:t.id},bubbles:!0,composed:!0}))}_recipeMatchesTag(e,t){return t?e.tags?.includes(t)||e.courses?.includes(t)||e.categories?.includes(t)||e.collections?.includes(t):!0}_recipeMatchesSearch(e,t){let i=(t||"").trim().toLowerCase();return i?e.name?.toLowerCase().includes(i)||e.description?.toLowerCase().includes(i)||e.tags?.some(a=>a.toLowerCase().includes(i)):!0}_formatTime(e){if(!e)return null;if(e<60)return`${e}m`;let t=Math.floor(e/60),i=e%60;return i?`${t}h ${i}m`:`${t}h`}_getFilteredList(){let e=this._selectedCourses.size>0,t=this._selectedCategories.size>0,i=this._selectedCollections.size>0,a=e||t||i,n;switch(a?n=this.allRecipes.filter(o=>{let c=!e||(o.courses||[]).some(u=>this._selectedCourses.has(u)),d=!t||(o.categories||[]).some(u=>this._selectedCategories.has(u)),m=!i||(o.collections||[]).some(u=>this._selectedCollections.has(u));return c&&d&&m&&this._recipeMatchesSearch(o,this.searchQuery)}):n=this.recipes,this._filterMode){case"favourites":n=this.allRecipes.filter(o=>o.is_favourite).filter(o=>!a||n.some(c=>c.id===o.id));break;case"recent":n=this.recentRecipes.slice(0,this.recentCount).filter(o=>!a||n.some(c=>c.id===o.id));break}return n=n.filter(o=>this._recipeMatchesSearch(o,this.searchQuery)&&this._recipeMatchesTag(o,this.activeTag)),this._starFilter>0&&(n=n.filter(o=>(o.rating||0)>=this._starFilter)),this._sortByRating&&(n=[...n].sort((o,c)=>(c.rating||0)-(o.rating||0))),n}get _allCourses(){let e=new Set;return this.allRecipes.forEach(t=>(t.courses||[]).forEach(i=>e.add(i))),[...e].sort()}get _coursecounts(){let e={};return this.allRecipes.forEach(t=>(t.courses||[]).forEach(i=>{e[i]=(e[i]||0)+1})),e}get _allCategories(){let e=new Set;return this.allRecipes.forEach(t=>(t.categories||[]).forEach(i=>e.add(i))),[...e].sort()}get _categorycounts(){let e={};return this.allRecipes.forEach(t=>(t.categories||[]).forEach(i=>{e[i]=(e[i]||0)+1})),e}get _allCollections(){let e=new Set;return this.allRecipes.forEach(t=>(t.collections||[]).forEach(i=>e.add(i))),[...e].sort()}get _collectioncounts(){let e={};return this.allRecipes.forEach(t=>(t.collections||[]).forEach(i=>{e[i]=(e[i]||0)+1})),e}_renderStars(e){let t=e||0;return s`
      <div class="card-stars">
        ${[1,2,3,4,5].map(i=>s`<span class="card-star ${i<=t?"filled":""}"
              >${i<=t?"\u2605":"\u2606"}</span
            >`)}
      </div>
    `}_renderRecipeCard(e){let t=e.total_time||(e.prep_time||0)+(e.cook_time||0)||null;return s`
      <article class="recipe-card">
        <div class="recipe-thumb">
          ${e.image_url?s`
                <img
                  src="${e.image_url}"
                  alt="${e.name}"
                  loading="lazy"
                />
              `:s`
                <div class="recipe-thumb-placeholder">
                  <ha-icon icon="mdi:food"></ha-icon>
                </div>
              `}
          <button
            class="fav-btn ${e.is_favourite?"active":""}"
            @click=${i=>this._handleToggleFavourite(i,e)}
            title="${e.is_favourite?r("Remove from favourites"):r("Add to favourites")}"
          >
            <ha-icon
              icon="${e.is_favourite?"mdi:heart":"mdi:heart-outline"}"
            ></ha-icon>
          </button>
        </div>
        <div class="recipe-info">
          <h3 class="recipe-name">
            <button
              class="recipe-open"
              @click=${()=>this._handleOpenRecipe(e)}
            >
              ${e.name}
            </button>
          </h3>
          ${this._renderStars(e.rating)}
          <div class="recipe-meta">
            ${t?s`
                  <span class="meta-chip">
                    <ha-icon icon="mdi:clock-outline"></ha-icon>
                    ${this._formatTime(t)}
                  </span>
                `:""}
            ${e.servings?s`
                  <span class="meta-chip">
                    <ha-icon icon="mdi:account-group-outline"></ha-icon>
                    ${e.servings}
                  </span>
                `:""}
            ${e.tags?.length?s`
                  <span class="meta-chip tag-chip">${e.tags[0]}</span>
                `:""}
          </div>
        </div>
      </article>
    `}_renderRatingMenu(){return s`
      <div class="rating-menu" @click=${e=>e.stopPropagation()}>
        <div class="rating-menu-section">${r("Filter by rating")}</div>
        ${[0,1,2,3,4,5].map(e=>s`
            <button
              class="rating-menu-item ${this._starFilter===e?"active":""}"
              @click=${()=>{this._starFilter=e,this._showRatingMenu=!1}}
            >
              ${e===0?r("All ratings"):r(p`${"\u2605".repeat(e)}${"\u2606".repeat(5-e)} ${e}+`)}
            </button>
          `)}
        <div class="rating-menu-section" style="margin-top:6px">
          ${r("Sort")}
        </div>
        <button
          class="rating-menu-item ${this._sortByRating?"active":""}"
          @click=${()=>{this._sortByRating=!this._sortByRating,this._showRatingMenu=!1}}
        >
          ${r(p`${this._sortByRating?"\u2713 ":""}Sort by rating`)}
        </button>
      </div>
    `}render(){let e=this._getFilteredList(),t=this._filterMode==="all"&&this.showFavourites&&!this.activeTag&&!this.searchQuery&&!this._starFilter&&!this._sortByRating,i=t?e.filter(c=>c.is_favourite):[],a=t&&i.length?e.filter(c=>!c.is_favourite):e,n=`grid-template-columns: var(--rm-grid-columns, repeat(${this.columns}, minmax(0, 1fr)));`,o=this._starFilter>0||this._sortByRating;return s`
      <div
        class="grid-container"
        @click=${()=>{this._showRatingMenu&&(this._showRatingMenu=!1)}}
      >
        <!-- Search bar — only shown on narrow (sidebar-less) view -->
        ${this.hideSidebar?"":s`
              <div class="search-row">
                <div class="search-wrap">
                  <ha-icon icon="mdi:magnify" class="search-icon"></ha-icon>
                  <input
                    type="text"
                    class="search-input"
                    placeholder="${r("Search recipes\u2026")}"
                    .value=${this.searchQuery}
                    @input=${this._handleSearchInput}
                  />
                  ${this.searchQuery?s`
                        <button
                          class="clear-btn"
                          @click=${this._handleClearSearch}
                        >
                          <ha-icon icon="mdi:close"></ha-icon>
                        </button>
                      `:""}
                </div>
              </div>
            `}

        <!-- Filter tabs + rating filter button (wide view) -->
        ${this.hideSidebar?s`
              <div class="filter-tabs-row">
                <div class="filter-tabs">
                  ${[["all","mdi:view-grid",r("All"),null],["courses","mdi:silverware-fork-knife",r("Courses"),"_selectedCourses"],["categories","mdi:tag-multiple-outline",r("Categories"),"_selectedCategories"],["collections","mdi:folder-multiple-outline",r("Collections"),"_selectedCollections"],["favourites","mdi:heart-outline",r("Favourites"),null],["recent","mdi:history",r("Recent"),null]].map(([c,d,m,u])=>s`
                      <button
                        class="filter-tab ${this._filterMode===c?"active":""}"
                        @click=${()=>{this._filterMode=c,c==="all"&&(this._selectedCourses=new Set,this._selectedCategories=new Set,this._selectedCollections=new Set)}}
                      >
                        <ha-icon icon="${d}"></ha-icon>
                        <span>${m}</span>
                        ${u&&this[u]?.size>0?s`<span class="tab-badge"></span>`:""}
                      </button>
                    `)}
                </div>
                <!-- Rating filter button -->
                <div class="rating-filter-wrap">
                  <button
                    class="rating-filter-btn ${o?"active":""}"
                    @click=${c=>{c.stopPropagation(),this._showRatingMenu=!this._showRatingMenu}}
                    title="${r("Filter/sort by rating")}"
                  >
                    <ha-icon icon="mdi:filter-menu-outline"></ha-icon>
                    ${o?s`<span class="rating-filter-badge"></span>`:""}
                  </button>
                  ${this._showRatingMenu?this._renderRatingMenu():""}
                </div>
              </div>
            `:""}

        <!-- Sub-filter chips for Courses / Categories / Collections (multi-select) -->
        ${this.hideSidebar&&this._filterMode==="courses"&&this._allCourses.length?s`
              <div class="sub-filter-row">
                <button
                  class="sub-chip ${this._selectedCourses.size?"":"active"}"
                  @click=${()=>{this._selectedCourses=new Set}}
                >
                  ${r("All")}
                </button>
                ${this._allCourses.map(c=>s`
                    <button
                      class="sub-chip ${this._selectedCourses.has(c)?"active":""}"
                      @click=${()=>this._toggleChip("courses",c)}
                    >
                      ${c}<span class="sub-chip-count"
                        >${this._coursecounts[c]||0}</span
                      >
                    </button>
                  `)}
              </div>
            `:""}
        ${this.hideSidebar&&this._filterMode==="categories"&&this._allCategories.length?s`
              <div class="sub-filter-row">
                <button
                  class="sub-chip ${this._selectedCategories.size?"":"active"}"
                  @click=${()=>{this._selectedCategories=new Set}}
                >
                  ${r("All")}
                </button>
                ${this._allCategories.map(c=>s`
                    <button
                      class="sub-chip ${this._selectedCategories.has(c)?"active":""}"
                      @click=${()=>this._toggleChip("categories",c)}
                    >
                      ${c}<span class="sub-chip-count"
                        >${this._categorycounts[c]||0}</span
                      >
                    </button>
                  `)}
              </div>
            `:""}
        ${this.hideSidebar&&this._filterMode==="collections"&&this._allCollections.length?s`
              <div class="sub-filter-row">
                <button
                  class="sub-chip ${this._selectedCollections.size?"":"active"}"
                  @click=${()=>{this._selectedCollections=new Set}}
                >
                  ${r("All")}
                </button>
                ${this._allCollections.map(c=>s`
                    <button
                      class="sub-chip ${this._selectedCollections.has(c)?"active":""}"
                      @click=${()=>this._toggleChip("collections",c)}
                    >
                      ${c}<span class="sub-chip-count"
                        >${this._collectioncounts[c]||0}</span
                      >
                    </button>
                  `)}
              </div>
            `:""}

        <!-- Tag chips (narrow view only) -->
        ${!this.hideSidebar&&this.tags.length?s`
              <div class="tags-row">
                ${this.tags.map(c=>s`
                    <button
                      class="tag-btn ${this.activeTag===c?"active":""}"
                      @click=${()=>this._handleTagClick(c)}
                    >
                      ${c}
                    </button>
                  `)}
              </div>
            `:""}

        <!-- Active filter hint -->
        ${o?s`
              <div class="active-filter-bar">
                ${this._starFilter>0?s`<span
                      >${r(p`⭐ ${this._starFilter}+ stars`)}</span
                    >`:""}
                ${this._sortByRating?s`<span>${r("Sorted by rating")}</span>`:""}
                <button
                  class="clear-filter-btn"
                  @click=${()=>{this._starFilter=0,this._sortByRating=!1}}
                >
                  <ha-icon icon="mdi:close"></ha-icon> ${r("Clear")}
                </button>
              </div>
            `:""}

        <!-- Recipe content -->
        <div
          class="grid-scroll"
          @scroll=${c=>{this._lastScrollPos=c.target.scrollTop}}
        >
          ${e.length===0?s`
                <div class="empty-state">
                  <ha-icon icon="mdi:pot-steam-outline"></ha-icon>
                  <p>
                    ${this.searchQuery||this.activeTag?r("No matching recipes"):this._starFilter>0?r(p`No recipes with ${this._starFilter}+ stars`):this._filterMode==="favourites"?r("No favourites yet \u2014 heart a recipe!"):this._filterMode==="recent"?r("No recently viewed recipes yet."):r("No recipes found")}
                  </p>
                </div>
              `:s`
                ${t&&i.length?s`
                      <div class="section-label">${r("Favourites")}</div>
                      <div class="recipe-grid" style=${n}>
                        ${i.map(c=>this._renderRecipeCard(c))}
                      </div>
                      ${a.length?s`<div class="section-label">
                            ${r("All Recipes")}
                          </div>`:""}
                    `:""}

                <div class="recipe-grid" style=${n}>
                  ${a.map(c=>this._renderRecipeCard(c))}
                </div>
              `}
        </div>
      </div>
    `}static styles=b`
    :host {
      display: block;
      height: 100%;
      position: relative;
    }

    .grid-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
      min-width: 0;
      min-height: 0;
    }

    /* Search (narrow only) */
    .search-row {
      padding: 10px 14px 6px;
      flex-shrink: 0;
    }
    .search-wrap {
      display: flex;
      align-items: center;
      background: var(--rm-bg-elevated, #2c2c2e);
      border-radius: 10px;
      padding: 0 10px;
      gap: 8px;
      border: 1px solid var(--rm-border-strong, var(--rm-border));
    }
    .search-icon {
      color: var(--rm-text-secondary, #8e8e93);
      --mdc-icon-size: 18px;
    }
    .search-input {
      flex: 1;
      background: none;
      border: none;
      outline: none;
      color: var(--rm-text, #e5e5ea);
      font-size: var(--rm-font-size-base, 16px);
      padding: 11px 0;
      min-width: 0;
    }
    .search-input::placeholder {
      color: var(--rm-text-secondary, #8e8e93);
    }
    .clear-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--rm-text-secondary, #8e8e93);
      padding: 2px;
      display: flex;
      align-items: center;
    }
    .clear-btn ha-icon {
      --mdc-icon-size: 16px;
    }

    /* Filter tabs row (wide view) */
    .filter-tabs-row {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 8px 14px 4px;
      flex-shrink: 0;
      border-bottom: 1px solid var(--rm-border, rgba(255, 255, 255, 0.08));
    }

    .filter-tabs {
      display: flex;
      gap: 2px;
      flex: 1;
      overflow-x: auto;
      scrollbar-width: none;
      min-width: 0;
    }
    .filter-tabs::-webkit-scrollbar {
      display: none;
    }

    .filter-tab {
      display: flex;
      align-items: center;
      gap: 5px;
      background: none;
      border: none;
      border-radius: 8px;
      padding: 8px 12px;
      min-height: var(--rm-touch-target, 44px);
      font-size: var(--rm-font-size-sm, 14px);
      font-weight: 500;
      color: var(--rm-text-secondary, #8e8e93);
      cursor: pointer;
      white-space: nowrap;
      transition:
        background 0.12s,
        color 0.12s;
    }
    .filter-tab ha-icon {
      --mdc-icon-size: 16px;
      flex-shrink: 0;
    }
    .filter-tab:hover {
      background: var(--rm-accent-soft);
      color: var(--rm-text);
    }
    .filter-tab {
      position: relative;
    }
    .tab-badge {
      position: absolute;
      top: 4px;
      right: 4px;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--rm-accent);
    }
    .filter-tab.active {
      background: var(--rm-accent-soft);
      color: var(--rm-accent-ink, var(--rm-text));
      font-weight: 600;
    }

    /* Rating filter button */
    .rating-filter-wrap {
      position: relative;
      flex-shrink: 0;
    }
    .rating-filter-btn {
      background: none;
      border: 1px solid var(--rm-border);
      border-radius: 8px;
      padding: 6px 10px;
      cursor: pointer;
      color: var(--rm-text-secondary);
      display: flex;
      align-items: center;
      gap: 4px;
      position: relative;
      min-width: var(--rm-touch-target, 44px);
      min-height: var(--rm-touch-target, 44px);
      transition:
        background 0.12s,
        color 0.12s;
    }
    .rating-filter-btn ha-icon {
      --mdc-icon-size: 18px;
    }
    .rating-filter-btn:hover {
      background: var(--rm-accent-soft);
      color: var(--rm-text);
    }
    .rating-filter-btn.active {
      color: var(--rm-accent-ink, var(--rm-text));
      border-color: var(--rm-accent);
      background: var(--rm-accent-soft);
    }
    .rating-filter-badge {
      position: absolute;
      top: 4px;
      right: 4px;
      width: 7px;
      height: 7px;
      background: var(--rm-accent);
      border-radius: 50%;
    }

    .rating-menu {
      position: absolute;
      top: calc(100% + 4px);
      right: 0;
      background: var(--rm-dialog-bg, var(--rm-bg-surface));
      border: 1px solid var(--rm-border);
      border-radius: 10px;
      box-shadow: var(--rm-shadow, 0 4px 12px rgba(0, 0, 0, 0.2));
      min-width: 170px;
      z-index: 50;
      overflow: hidden;
      padding: 4px 0;
    }
    .rating-menu-section {
      font-size: var(--rm-font-size-xs, 12px);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--rm-text-muted);
      padding: 8px 14px 4px;
    }
    .rating-menu-item {
      display: block;
      width: 100%;
      background: none;
      border: none;
      text-align: left;
      padding: 10px 14px;
      font-size: var(--rm-font-size-sm, 14px);
      min-height: var(--rm-touch-target, 44px);
      cursor: pointer;
      color: var(--rm-text-secondary);
      transition: background 0.12s;
    }
    .rating-menu-item:hover {
      background: var(--rm-accent-soft);
      color: var(--rm-text);
    }
    .rating-menu-item.active {
      color: var(--rm-accent-ink, var(--rm-text));
      font-weight: 600;
    }

    /* Active filter hint bar */
    .active-filter-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 14px;
      font-size: var(--rm-font-size-xs, 12px);
      color: var(--rm-accent-ink, var(--rm-text));
      background: var(--rm-accent-soft);
      flex-shrink: 0;
    }
    .clear-filter-btn {
      margin-left: auto;
      background: none;
      border: none;
      display: flex;
      align-items: center;
      gap: 3px;
      color: var(--rm-text-secondary);
      font-size: var(--rm-font-size-xs, 12px);
      cursor: pointer;
    }
    .clear-filter-btn ha-icon {
      --mdc-icon-size: 14px;
    }

    /* Sub-filter chips */
    .sub-filter-row {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      padding: 6px 14px;
      flex-shrink: 0;
      max-height: 88px;
      overflow-y: auto;
      scrollbar-width: thin;
      scrollbar-color: var(--rm-border) transparent;
    }
    .sub-filter-row::-webkit-scrollbar {
      width: 4px;
    }
    .sub-filter-row::-webkit-scrollbar-track {
      background: transparent;
    }
    .sub-filter-row::-webkit-scrollbar-thumb {
      background: var(--rm-border);
      border-radius: 4px;
    }
    .sub-chip {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: var(--rm-bg-elevated);
      border: 1px solid var(--rm-border);
      border-radius: 20px;
      color: var(--rm-text-secondary);
      font-size: var(--rm-font-size-xs, 12px);
      padding: 4px 8px 4px 12px;
      cursor: pointer;
      white-space: nowrap;
      min-height: 36px;
      transition: all 0.15s;
    }
    .sub-chip.active {
      background: var(--rm-accent-soft);
      border-color: var(--rm-accent);
      color: var(--rm-accent-ink, var(--rm-text));
    }
    .sub-chip-count {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: var(--rm-accent);
      color: var(--rm-accent-text, #fff);
      border-radius: 10px;
      font-size: var(--rm-font-size-xs, 12px);
      font-weight: 700;
      padding: 1px 5px;
      min-width: 16px;
      line-height: 1.4;
    }

    /* Tags (narrow view) */
    .tags-row {
      display: flex;
      gap: 6px;
      padding: 4px 14px 8px;
      overflow-x: auto;
      flex-shrink: 0;
      scrollbar-width: none;
    }
    .tags-row::-webkit-scrollbar {
      display: none;
    }
    .tag-btn {
      background: var(--rm-bg-elevated);
      border: 1px solid var(--rm-border);
      border-radius: 20px;
      color: var(--rm-text-secondary);
      font-size: var(--rm-font-size-xs, 12px);
      padding: 4px 10px;
      cursor: pointer;
      white-space: nowrap;
      min-height: 36px;
      transition: all 0.15s;
    }
    .tag-btn.active {
      background: var(--rm-accent-soft);
      border-color: var(--rm-accent);
      color: var(--rm-accent-ink, var(--rm-text));
    }

    /* Grid scroll area */
    .grid-scroll {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      padding: 4px 14px 16px;
      scrollbar-width: thin;
      scrollbar-color: var(--rm-border) transparent;
    }

    .section-label {
      font-size: var(--rm-font-size-xs, 12px);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--rm-text-secondary);
      margin: 8px 0 6px;
    }

    .recipe-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 12px;
      margin-bottom: 12px;
    }

    /* Recipe card */
    .recipe-card {
      position: relative;
      background: var(--rm-bg-surface);
      border-radius: var(--rm-radius, 12px);
      overflow: hidden;
      cursor: pointer;
      transition:
        transform 0.15s,
        box-shadow 0.15s;
      border: 1px solid var(--rm-border);
    }
    .recipe-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--rm-shadow);
    }
    .recipe-card:focus-within {
      outline: 3px solid var(--rm-focus, var(--rm-accent));
      outline-offset: 2px;
    }
    .recipe-open {
      border: 0;
      padding: 0;
      background: transparent;
      color: inherit;
      font: inherit;
      text-align: left;
      cursor: pointer;
    }
    .recipe-open::after {
      content: "";
      position: absolute;
      inset: 0;
    }

    .recipe-thumb {
      position: relative;
      aspect-ratio: 4/3;
      background: var(--rm-border);
      overflow: hidden;
    }
    .recipe-thumb img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .recipe-thumb-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--rm-text-secondary);
    }
    .recipe-thumb-placeholder ha-icon {
      --mdc-icon-size: 36px;
    }

    .fav-btn {
      position: absolute;
      top: 6px;
      right: 6px;
      background: rgba(0, 0, 0, 0.5);
      border: none;
      border-radius: 50%;
      width: 44px;
      height: 44px;
      z-index: 1;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      transition: color 0.15s;
      padding: 0;
    }
    .fav-btn ha-icon {
      --mdc-icon-size: 22px;
    }
    .fav-btn.active {
      color: var(--rm-rose);
    }

    .recipe-info {
      padding: 12px 14px 14px;
    }
    .recipe-name {
      margin: 0 0 4px;
      font-size: var(--rm-font-size-base, 16px);
      font-weight: 600;
      color: var(--rm-text);
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      line-height: 1.4;
    }

    /* Star rating on cards */
    .card-stars {
      display: flex;
      gap: 1px;
      margin-bottom: 5px;
    }
    .card-star {
      font-size: var(--rm-font-size-sm, 14px);
      line-height: 1;
      color: var(--rm-border, rgba(200, 150, 0, 0.25));
      -webkit-text-stroke: 1px rgba(200, 150, 0, 0.5);
    }
    .card-star.filled {
      color: var(--rm-ochre);
      -webkit-text-stroke: 1px var(--rm-warning);
    }

    .recipe-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }
    .meta-chip {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      font-size: var(--rm-font-size-xs, 12px);
      color: var(--rm-text-secondary);
      background: var(--rm-bg-elevated);
      border-radius: 6px;
      padding: 2px 6px;
    }
    .meta-chip ha-icon {
      --mdc-icon-size: 12px;
    }
    .tag-chip {
      background: var(--rm-accent-soft);
      color: var(--rm-accent-ink, var(--rm-text));
    }

    /* Empty state */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      gap: 12px;
      color: var(--rm-text-secondary);
      text-align: center;
    }
    .empty-state ha-icon {
      --mdc-icon-size: 56px;
      opacity: 0.4;
    }
    .empty-state p {
      margin: 0;
      font-size: var(--rm-font-size-base, 16px);
    }
    ${f}
  `};try{customElements.define("rm-recipe-grid",V)}catch{}var We={"\xBD":.5,"\xBC":.25,"\xBE":.75,"\u2153":.3333333333333333,"\u2154":.6666666666666666,"\u215B":.125,"\u215C":.375,"\u215D":.625,"\u215E":.875};function G(l){if(l==null)return null;let e=String(l).trim().replace(",","."),t,i=e.match(/^(\d+)?\s*([½¼¾⅓⅔⅛⅜⅝⅞])$/),a=e.match(/^(?:(\d+)\s+)?(\d+)\/(\d+)$/);if(i)t=Number(i[1]||0)+We[i[2]];else if(a){if(Number(a[3])===0)return null;t=Number(a[1]||0)+Number(a[2])/Number(a[3])}else if(/^\d+(?:\.\d+)?$/.test(e))t=Number(e);else return null;return Number.isFinite(t)&&t>=0&&t<=1e6?t:null}function _e(l,e){let t=G(l);if(t===null||!Number.isFinite(e)||e<=0||e>1e4)return l;let i=t*e;return!Number.isFinite(i)||i>1e10?l:String(Number(i.toFixed(4)))}function E(l){return String(l).split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g).map(e=>e.startsWith("**")?s`<strong>${e.slice(2,-2)}</strong>`:e.startsWith("`")?s`<code>${e.slice(1,-1)}</code>`:e.startsWith("*")?s`<em>${e.slice(1,-1)}</em>`:e)}function M(l){return String(l||"").split(`
`).map(e=>e.startsWith("### ")?s`<h3>${E(e.slice(4))}</h3>`:e.startsWith("## ")?s`<h2>${E(e.slice(3))}</h2>`:e.startsWith("# ")?s`<h1>${E(e.slice(2))}</h1>`:/^[-*] /.test(e)?s`<ul>
                  <li>${E(e.slice(2))}</li>
                </ul>`:s`<p>${E(e)}</p>`)}var we=b`
  :host {
    display: block;
    height: 100%;
    overflow: auto;
    overscroll-behavior: contain;
  }
  section {
    padding: 24px;
    max-width: 1000px;
    margin: auto;
  }
  h2 {
    margin: 0 0 20px;
    font-size: clamp(22px, 3vw, 28px);
    line-height: 1.25;
    letter-spacing: -0.02em;
  }
  h3 {
    font-size: var(--rm-font-size-base, 16px);
  }
  nav,
  .toolbar,
  .row {
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
    margin-bottom: 12px;
  }
  button,
  select,
  input,
  textarea {
    font: inherit;
    color: inherit;
    background: var(--rm-bg-surface, white);
    border: 1px solid var(--rm-border-strong, var(--rm-border, #a6bbc4));
    border-radius: 12px;
    padding: 10px 14px;
    min-height: 44px;
  }
  button {
    cursor: pointer;
    font-weight: 600;
  }
  button:hover,
  button.active {
    background: var(--rm-accent-soft, #dce9f0);
    color: var(--rm-accent-ink, var(--rm-text));
  }
  label {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin: 12px 0;
  }
  input,
  textarea,
  select {
    max-width: 100%;
    box-sizing: border-box;
  }
  textarea {
    min-height: 80px;
    resize: vertical;
  }
  input[type="checkbox"],
  input[type="radio"] {
    min-height: 20px;
    width: 20px;
    height: 20px;
  }
  pre {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    max-height: 340px;
    overflow: auto;
  }
  .record {
    padding: 14px;
    background: var(--rm-bg-surface, white);
    border: 1px solid var(--rm-border, #ddd);
    border-radius: var(--rm-radius, 16px);
    margin: 8px 0;
  }
  .muted {
    color: var(--rm-text-secondary, #666);
  }
  .row strong {
    flex: 1;
    min-width: 0;
    overflow-wrap: anywhere;
  }
  .checked strong {
    text-decoration: line-through;
  }
  form {
    max-width: 720px;
  }
  .danger {
    color: var(--rm-error-ink, #983d25);
  }
  @media (max-width: 600px) {
    section {
      padding: 12px;
    }
    nav {
      gap: 4px;
    }
    nav button {
      padding: 8px 12px;
      font-size: var(--rm-font-size-sm, 14px);
    }
  }
  ${f}
`;var H=class extends v{static properties={api:{attribute:!1},recipe:{attribute:!1},servings:{type:Number},open:{state:!0},error:{state:!0},result:{state:!0}};static styles=we;constructor(){super(),this.servings=1,this.open=!1,this.error="",this.result=null}get de(){return this.api?.hass?.language?.startsWith("de")}async submit(e){e.preventDefault();let t=e.target,i={recipe_id:this.recipe.id,servings:Number(t.elements.servings.value),meal_type:t.elements.meal_type.value};t.elements.date.value&&(i.date=t.elements.date.value);try{this.result=await this.api.call("recipe_log",i),this.error="",this.open=!1}catch(a){this.error=a.message}}render(){let e=["per_serving","per_recipe"].includes(this.recipe?.nutrition_basis)&&Number.isFinite(this.recipe?.declared_nutrition?.calories);return s`<section style="padding:8px">
      <button
        @click=${()=>{this.open=!this.open}}
        ?disabled=${!e||!!this.api?.pending}
      >
        ${this.de?"Portionen eintragen":"Log servings"}</button
      >${e?"":s`<small>
            ${this.de?"Deklarierte Kalorien und bekannte N\xE4hrwertbasis erforderlich.":"Declared calories and a known nutrition basis are required."}</small
          >`}${this.open?s`<form @submit=${this.submit}>
            <label
              >${this.de?"Rezeptportionen":"Recipe servings"}<input
                aria-label="Recipe servings"
                name="servings"
                type="number"
                required
                min="0.001"
                max="10000"
                step="any"
                .value=${this.servings} /></label
            ><label
              >${this.de?"Mahlzeit":"Meal"}<select name="meal_type">
                <option value="breakfast">
                  ${this.de?"Fr\xFChst\xFCck":"Breakfast"}
                </option>
                <option value="lunch">
                  ${this.de?"Mittagessen":"Lunch"}
                </option>
                <option value="dinner" selected>
                  ${this.de?"Abendessen":"Dinner"}
                </option>
                <option value="snack">${this.de,"Snack"}</option>
              </select></label
            ><label
              >${this.de?"Datum (leer = heute in Home Assistant)":"Date (empty = Home Assistant today)"}<input
                name="date"
                type="date"
            /></label>
            <p class="muted">
              ${this.de?"Speichert einen unver\xE4nderlichen Rezept-N\xE4hrwert-Snapshot im Tagebuch.":"Saves an immutable snapshot of declared recipe nutrition in the diary."}
            </p>
            <button type="submit" ?disabled=${!!this.api?.pending}>
              ${this.de?"Best\xE4tigen und eintragen":"Confirm and log"}
            </button>
          </form>`:""}${this.error?s`<p role="alert">${this.error}</p>`:""}${this.result?s`<p role="status">
            ${this.de?"Tagebucheintrag gespeichert.":"Diary entry saved."}
          </p>`:""}
    </section>`}};customElements.define("mm-recipe-log",H);function ye(l,e){return s`<fieldset>
    <legend>Declared nutrition for diary logging</legend>
    <p>
      Original nutrition text is retained separately. Enter numeric values only
      when declared by the recipe. Missing values stay unknown.
    </p>
    <label
      >Nutrition basis<select
        aria-label="Nutrition basis"
        .value=${l.nutrition_basis||"unknown"}
        @change=${t=>e("nutrition_basis",t.target.value)}
      >
        <option value="unknown">Unknown</option>
        <option value="per_serving">Per serving</option>
        <option value="per_recipe">Whole recipe</option>
      </select></label
    >${["calories","protein","carbs","fat","fiber","sugar","sodium","saturated_fat"].map(t=>s`<label
          >Declared ${t.replaceAll("_"," ")}
          (${t==="calories"?"kcal":t==="sodium"?"mg":"g"})<input
            aria-label=${`Declared ${t.replaceAll("_"," ")} (${t==="calories"?"kcal":t==="sodium"?"mg":"g"})`}
            type="number"
            min="0"
            step="any"
            .value=${l.declared_nutrition?.[t]??""}
            @input=${i=>e("declared_nutrition",{...l.declared_nutrition,[t]:i.target.value})}
        /></label>`)}
  </fieldset>`}function ke(l){return Object.fromEntries(Object.entries(l||{}).filter(([,e])=>e!==""&&e!==void 0).map(([e,t])=>[e,t===null?null:Number(t)]))}var $e=l=>class extends l{_startEdit(){let e=this.recipe.nutrition||{};this._editData={nutrition_basis:this.recipe.nutrition_basis||"unknown",declared_nutrition:{...this.recipe.declared_nutrition||{}},name:this.recipe.name||"",description:this.recipe.description||"",source_url:this.recipe.source_url||"",servings:this.recipe.servings||"",prep_time:this.recipe.prep_time||"",cook_time:this.recipe.cook_time||"",tags:[...this.recipe.tags||[]],courses:[...this.recipe.courses||[]],categories:[...this.recipe.categories||[]],collections:[...this.recipe.collections||[]],notes:this.recipe.notes||"",rating:this.recipe.rating||0,image_url:this.recipe.media_refs?.image_url??this.recipe.image_url??"",photos:[...this.recipe.media_refs?.photos??this.recipe.photos??[]],ingredients:[...this.recipe.ingredients||[]],instructions:[...this.recipe.instructions||[]],cal:e.calories??"",fat:e.fat??"",satf:e.saturated_fat??"",chol:e.cholesterol??"",sod:e.sodium??"",carb:e.carbohydrates??"",fib:e.fiber??"",sug:e.sugar??"",prot:e.protein??""},this._editing=!0}_cancelEdit(){this._editing=!1,this._editData={}}_handleEditField(e,t){this._editData={...this._editData,[e]:t}}_renderListPicker(e,t,i){let a=this._editData[e]||[],n=this._tagPickerField===e,o=(i||[]).filter(d=>!a.includes(d)),c=n?this._tagPickerInput:"";return s`
        <div class="edit-field list-picker-field">
          <label>${t}</label>
          <div class="list-picker-wrap">
            <!-- Selected chips -->
            <div class="list-picker-chips">
              ${a.map(d=>s`
                  <span class="list-chip selected">
                    ${d}
                    <button
                      class="list-chip-remove"
                      @click=${()=>this._toggleListValue(e,d)}
                      title="${r("Remove")}"
                    >
                      ×
                    </button>
                  </span>
                `)}
              <button
                class="list-chip-add-btn"
                @click=${()=>{this._tagPickerField=n?null:e,this._tagPickerInput=""}}
                title="${r(p`Add ${t.toLowerCase()}`)}"
              >
                <ha-icon icon="mdi:plus"></ha-icon>
              </button>
            </div>
            <!-- Picker dropdown -->
            ${n?s`
                  <div class="list-picker-dropdown">
                    ${o.length?s`
                          <div class="list-picker-existing">
                            ${o.map(d=>s`
                                <span
                                  class="list-chip available"
                                  @click=${()=>{this._toggleListValue(e,d)}}
                                >
                                  ${d}
                                </span>
                              `)}
                          </div>
                        `:""}
                    <div class="list-picker-new-row">
                      <input
                        class="list-picker-input"
                        type="text"
                        placeholder="${r(p`New ${t.toLowerCase()}…`)}"
                        .value=${c}
                        @input=${d=>{this._tagPickerInput=d.target.value}}
                        @keydown=${d=>{d.key==="Enter"&&(d.preventDefault(),this._addListValue(e,this._tagPickerInput)),d.key==="Escape"&&(this._tagPickerField=null)}}
                      />
                      <button
                        class="list-picker-new-btn"
                        @click=${()=>this._addListValue(e,this._tagPickerInput)}
                        ?disabled=${!this._tagPickerInput.trim()}
                      >
                        ${r("Add")}
                      </button>
                    </div>
                  </div>
                `:""}
          </div>
        </div>
      `}_toggleListValue(e,t){let i=this._editData[e]||[],a=i.includes(t)?i.filter(n=>n!==t):[...i,t];this._editData={...this._editData,[e]:a}}_addListValue(e,t){let i=(t||"").trim();if(!i)return;let a=this._editData[e]||[];a.includes(i)||(this._editData={...this._editData,[e]:[...a,i]}),this._tagPickerInput="",this._tagPickerField=null}_startEditIngredient(e){let t=(this._editData.ingredients||[])[e];if(t)if(t.is_heading||t.name?.startsWith("#")){let i=t.name?.startsWith("#")?t.name.slice(1).trim():t.name;this._editIngEdit={idx:e,heading:!0,name:i}}else this._editIngEdit={idx:e,heading:!1,amount:t.amount||"",unit:t.unit||"",name:t.name||""}}_saveEditIngredient(){let e=this._editIngEdit;if(!e)return;let t=[...this._editData.ingredients||[]];e.heading?t[e.idx]={name:`# ${e.name}`,is_heading:!0}:t[e.idx]={amount:e.amount,unit:e.unit,name:e.name},this._editData={...this._editData,ingredients:t},this._editIngEdit=null}_cancelEditIngredient(){this._editIngEdit=null}_editAddIngredient(){let e=this._editIngInput.trim();if(!e)return;let t;if(e.startsWith("#"))t={name:e,is_heading:!0};else{let i=e.split(/\s+/),a="",n="",o="";i.length>=3&&!isNaN(parseFloat(i[0]))?(a=i[0],n=i[1],o=i.slice(2).join(" ")):i.length===2&&!isNaN(parseFloat(i[0]))?(a=i[0],o=i[1]):o=e,t={amount:a,unit:n,name:o}}this._editData={...this._editData,ingredients:[...this._editData.ingredients||[],t]},this._editIngInput=""}_editRemoveIngredient(e){this._editData={...this._editData,ingredients:(this._editData.ingredients||[]).filter((t,i)=>i!==e)}}_editMoveIngredient(e,t){let i=[...this._editData.ingredients||[]],a=e+t;a<0||a>=i.length||([i[e],i[a]]=[i[a],i[e]],this._editData={...this._editData,ingredients:i})}_editMoveStep(e,t){let i=[...this._editData.instructions||[]],a=e+t;a<0||a>=i.length||([i[e],i[a]]=[i[a],i[e]],this._editData={...this._editData,instructions:i})}_editDropIngredient(e,t){if(e===t||e<0||t<0)return;let i=[...this._editData.ingredients||[]],[a]=i.splice(e,1);i.splice(t,0,a),this._editData={...this._editData,ingredients:i},this._dragIngOver=-1,this._dragIngFrom=-1}_editDropStep(e,t){if(e===t||e<0||t<0)return;let i=[...this._editData.instructions||[]],[a]=i.splice(e,1);i.splice(t,0,a),this._editData={...this._editData,instructions:i},this._dragStepOver=-1,this._dragStepFrom=-1}_editAddStep(e){e.trim()&&(this._editData={...this._editData,instructions:[...this._editData.instructions||[],e.trim()]})}_editRemoveStep(e){this._editData={...this._editData,instructions:(this._editData.instructions||[]).filter((t,i)=>i!==e)}}async _editUploadImage(e){if(!e||!this.recipe?.id)return;this._editImageUploading=!0;let t=new FileReader;t.onload=async i=>{let a=i.target.result.split(",")[1];try{let n=await this.api.uploadRecipeImage(this.recipe.id,a),o=n?.image_url||n?.local_url;o&&(this._editData={...this._editData,image_url:this._editData.image_url||o,photos:[...new Set([...this._editData.photos||[],o])]})}catch(n){console.warn("Image upload failed:",n)}finally{this._editImageUploading=!1}},t.readAsDataURL(e)}async _saveEdit(){let e=this._editData,t={},i={cal:"calories",fat:"fat",satf:"saturated_fat",chol:"cholesterol",sod:"sodium",carb:"carbohydrates",fib:"fiber",sug:"sugar",prot:"protein"},a=!1;for(let[o,c]of Object.entries(i))e[o]!==""&&e[o]!=null&&(t[c]=e[o],a=!0);let n={name:e.name,description:e.description,source_url:e.source_url,image_url:e.image_url||null,servings:e.servings===""?null:Number(e.servings),prep_time:e.prep_time===""?null:Number(e.prep_time),cook_time:e.cook_time===""?null:Number(e.cook_time),tags:Array.isArray(e.tags)?e.tags:[],courses:Array.isArray(e.courses)?e.courses:[],categories:Array.isArray(e.categories)?e.categories:[],collections:Array.isArray(e.collections)?e.collections:[],notes:e.notes,rating:e.rating||null,photos:e.photos||[],ingredients:e.ingredients||[],instructions:e.instructions||[],nutrition:a?t:null,nutrition_basis:e.nutrition_basis||"unknown",declared_nutrition:ke(e.declared_nutrition)};try{await this.api.updateRecipe(this.recipe.id,n),this._editing=!1,this.dispatchEvent(new CustomEvent("rm-recipe-saved",{bubbles:!0,composed:!0}))}catch(o){this._saveError=o.message,this.requestUpdate()}}_renderEditPanel(){let e=this._editData;return s`
        <div
          class="edit-overlay"
          @click=${t=>{t.target===t.currentTarget&&this._cancelEdit()}}
        >
          <div class="edit-panel">
            <div class="edit-header">
              <span>${r("Edit Recipe")}</span>
              <button class="icon-btn" @click=${this._cancelEdit}>
                <ha-icon icon="mdi:close"></ha-icon>
              </button>
            </div>
            <div class="edit-body">
              ${this._renderField(r("Name"),"name","text")}

              <!-- Image section -->
              <div class="edit-section-label">${r("Image")}</div>
              <div class="edit-photo-row">
                ${(()=>{let t=[...new Set([e.image_url,...e.photos||[]].filter(Boolean))];return s`
                    ${t.map(i=>s`
                        <div
                          class="edit-photo-thumb ${i===e.image_url?"selected":""}"
                          @click=${()=>this._handleEditField("image_url",i)}
                          title="${r("Set as main image")}"
                        >
                          <img
                            src="${this.api.transport.previewURL(i)||z}"
                            alt=""
                          />
                          ${i===e.image_url?s`<span class="edit-thumb-badge"
                                ><ha-icon icon="mdi:check"></ha-icon
                              ></span>`:""}
                        </div>
                      `)}
                    <label
                      class="edit-photo-add ${this._editImageUploading?"loading":""}"
                      title="${r("Upload photo")}"
                    >
                      <input
                        type="file"
                        accept="image/*"
                        style="display:none"
                        @change=${i=>{let a=i.target.files?.[0];a&&this._editUploadImage(a),i.target.value=""}}
                      />
                      <ha-icon
                        icon="${this._editImageUploading?"mdi:loading":"mdi:plus"}"
                      ></ha-icon>
                    </label>
                  `})()}
              </div>
              <div class="edit-field">
                <label>${r("Or paste image URL")}</label>
                <input
                  type="url"
                  .value=${e.image_url??""}
                  @input=${t=>this._handleEditField("image_url",t.target.value)}
                  placeholder="https://…"
                />
              </div>

              ${this._renderField(r("Description"),"description","textarea")}
              ${this._renderField(r("Source URL"),"source_url","url")}
              ${this._saveError?s`<p role="alert">${this._saveError}</p>`:""}
              ${ye(e,(t,i)=>this._handleEditField(t,i))}

              <div class="edit-row-3">
                ${this._renderField(r("Prep (min)"),"prep_time","number")}
                ${this._renderField(r("Cook (min)"),"cook_time","number")}
                ${this._renderField(r("Servings"),"servings","number")}
              </div>

              <!-- Star rating picker -->
              <div class="edit-field">
                <label>${r("Rating")}</label>
                <div class="edit-stars">
                  ${[1,2,3,4,5].map(t=>s`
                      <span
                        class="edit-star ${t<=(e.rating||0)?"filled":""}"
                        @click=${()=>this._handleEditField("rating",e.rating===t?0:t)}
                        >★</span
                      >
                    `)}
                </div>
              </div>

              ${this._renderListPicker("tags",r("Tags"),this.allTags)}
              ${this._renderListPicker("courses",r("Courses"),this.allCourses)}
              ${this._renderListPicker("categories",r("Categories"),this.allCategories)}
              ${this._renderListPicker("collections",r("Collections"),this.allCollections)}
              ${this._renderField(r("Notes"),"notes","textarea")}

              <!-- Ingredients editor -->
              <div class="edit-section-label">
                ${r(p`Ingredients (${(e.ingredients||[]).length})`)}
              </div>
              ${(e.ingredients||[]).length?s`
                    <ul class="edit-ing-list">
                      ${(e.ingredients||[]).map((t,i)=>{let a=this._editIngEdit?.idx===i,n=t.is_heading||t.name?.startsWith("#");if(a){let o=this._editIngEdit;return s`
                            <li
                              class="edit-ing-inline-edit ${n?"edit-ing-heading":""}"
                            >
                              ${o.heading?s`
                                    <input
                                      class="ing-inline-input ing-inline-name"
                                      type="text"
                                      placeholder="${r("Section header")}"
                                      .value=${o.name}
                                      @input=${c=>{this._editIngEdit={...o,name:c.target.value}}}
                                      @keydown=${c=>{c.key==="Enter"&&this._saveEditIngredient(),c.key==="Escape"&&this._cancelEditIngredient()}}
                                    />
                                  `:s`
                                    <input
                                      class="ing-inline-input ing-inline-amt"
                                      type="text"
                                      placeholder="${r("Amt")}"
                                      .value=${o.amount}
                                      @input=${c=>{this._editIngEdit={...o,amount:c.target.value}}}
                                      @keydown=${c=>{c.key==="Enter"&&this._saveEditIngredient(),c.key==="Escape"&&this._cancelEditIngredient()}}
                                    />
                                    <input
                                      class="ing-inline-input ing-inline-unit"
                                      type="text"
                                      placeholder="${r("Unit")}"
                                      .value=${o.unit}
                                      @input=${c=>{this._editIngEdit={...o,unit:c.target.value}}}
                                      @keydown=${c=>{c.key==="Enter"&&this._saveEditIngredient(),c.key==="Escape"&&this._cancelEditIngredient()}}
                                    />
                                    <input
                                      class="ing-inline-input ing-inline-name"
                                      type="text"
                                      placeholder="${r("Ingredient")}"
                                      .value=${o.name}
                                      @input=${c=>{this._editIngEdit={...o,name:c.target.value}}}
                                      @keydown=${c=>{c.key==="Enter"&&this._saveEditIngredient(),c.key==="Escape"&&this._cancelEditIngredient()}}
                                    />
                                  `}
                              <button
                                class="ing-inline-save"
                                @click=${this._saveEditIngredient}
                                title="${r("Save")}"
                              >
                                <ha-icon icon="mdi:check"></ha-icon>
                              </button>
                              <button
                                class="ing-inline-cancel"
                                @click=${this._cancelEditIngredient}
                                title="${r("Cancel")}"
                              >
                                <ha-icon icon="mdi:close"></ha-icon>
                              </button>
                            </li>
                          `}return s`
                          <li
                            draggable="true"
                            class="${n?"edit-ing-heading":""} ${this._dragIngOver===i?"drag-over":""}"
                            @dragstart=${o=>{this._dragIngFrom=i,o.dataTransfer.effectAllowed="move",o.dataTransfer.setData("text/plain",String(i))}}
                            @dragover=${o=>{o.preventDefault(),o.dataTransfer.dropEffect="move",this._dragIngOver!==i&&(this._dragIngOver=i)}}
                            @dragleave=${()=>{this._dragIngOver===i&&(this._dragIngOver=-1)}}
                            @drop=${o=>{o.preventDefault(),this._editDropIngredient(this._dragIngFrom,i)}}
                            @dragend=${()=>{this._dragIngOver=-1,this._dragIngFrom=-1}}
                          >
                            <ha-icon
                              icon="mdi:drag-vertical"
                              class="drag-handle"
                            ></ha-icon>
                            <span
                              class="edit-ing-text"
                              @click=${()=>this._startEditIngredient(i)}
                              title="${r("Click to edit")}"
                            >
                              ${n?s`<strong
                                    >${t.name?.startsWith("#")?t.name.slice(1).trim():t.name}</strong
                                  >`:s`${t.amount?`${t.amount}${t.unit?" "+t.unit:""} `:""}${t.name}`}
                            </span>
                            <div class="edit-reorder-btns">
                              <button
                                class="edit-move-btn"
                                ?disabled=${i===0}
                                @click=${()=>this._editMoveIngredient(i,-1)}
                                title="${r("Move up")}"
                              >
                                <ha-icon icon="mdi:chevron-up"></ha-icon>
                              </button>
                              <button
                                class="edit-move-btn"
                                ?disabled=${i===e.ingredients.length-1}
                                @click=${()=>this._editMoveIngredient(i,1)}
                                title="${r("Move down")}"
                              >
                                <ha-icon icon="mdi:chevron-down"></ha-icon>
                              </button>
                            </div>
                            <button
                              class="edit-remove-btn"
                              @click=${()=>this._editRemoveIngredient(i)}
                            >
                              <ha-icon icon="mdi:close"></ha-icon>
                            </button>
                          </li>
                        `})}
                    </ul>
                  `:""}
              <div class="edit-add-row">
                <input
                  type="text"
                  .value=${this._editIngInput}
                  @input=${t=>{this._editIngInput=t.target.value}}
                  @keydown=${t=>{t.key==="Enter"&&this._editAddIngredient()}}
                  placeholder="${r('e.g. "2 cups flour" or "# Section Header"')}"
                />
                <button class="edit-add-btn" @click=${this._editAddIngredient}>
                  ${r("Add")}
                </button>
              </div>

              <!-- Instructions editor -->
              <div class="edit-section-label">
                ${r(p`Directions (${(e.instructions||[]).length} steps)`)}
              </div>
              ${(e.instructions||[]).length?s`
                    <ol class="edit-steps-list">
                      ${(e.instructions||[]).map((t,i)=>s`
                          <li
                            draggable="true"
                            class="${this._dragStepOver===i?"drag-over":""}"
                            @dragstart=${a=>{this._dragStepFrom=i,a.dataTransfer.effectAllowed="move",a.dataTransfer.setData("text/plain",String(i))}}
                            @dragover=${a=>{a.preventDefault(),a.dataTransfer.dropEffect="move",this._dragStepOver!==i&&(this._dragStepOver=i)}}
                            @dragleave=${()=>{this._dragStepOver===i&&(this._dragStepOver=-1)}}
                            @drop=${a=>{a.preventDefault(),this._editDropStep(this._dragStepFrom,i)}}
                            @dragend=${()=>{this._dragStepOver=-1,this._dragStepFrom=-1}}
                          >
                            <ha-icon
                              icon="mdi:drag-vertical"
                              class="drag-handle"
                            ></ha-icon>
                            <span class="edit-ing-text">${t}</span>
                            <div class="edit-reorder-btns">
                              <button
                                class="edit-move-btn"
                                ?disabled=${i===0}
                                @click=${()=>this._editMoveStep(i,-1)}
                                title="${r("Move up")}"
                              >
                                <ha-icon icon="mdi:chevron-up"></ha-icon>
                              </button>
                              <button
                                class="edit-move-btn"
                                ?disabled=${i===e.instructions.length-1}
                                @click=${()=>this._editMoveStep(i,1)}
                                title="${r("Move down")}"
                              >
                                <ha-icon icon="mdi:chevron-down"></ha-icon>
                              </button>
                            </div>
                            <button
                              class="edit-remove-btn"
                              @click=${()=>this._editRemoveStep(i)}
                            >
                              <ha-icon icon="mdi:close"></ha-icon>
                            </button>
                          </li>
                        `)}
                    </ol>
                  `:""}
              <div class="edit-add-row">
                <textarea
                  rows="2"
                  .value=${this._editStepInput}
                  @input=${t=>{this._editStepInput=t.target.value}}
                  @keydown=${t=>{t.key==="Enter"&&!t.shiftKey&&(t.preventDefault(),this._editAddStep(this._editStepInput),this._editStepInput="")}}
                  placeholder="${r("Type a step, press Enter to add\u2026")}"
                ></textarea>
                <button
                  class="edit-add-btn"
                  @click=${()=>{this._editAddStep(this._editStepInput),this._editStepInput=""}}
                >
                  ${r("Add")}
                </button>
              </div>

              <!-- Nutrition section -->
              <div class="edit-section-label">
                ${r("Nutrition Facts (per serving)")}
              </div>
              <div class="edit-row-3">
                ${this._renderField(r("Calories (kcal)"),"cal","number")}
                ${this._renderField(r("Protein (g)"),"prot","number")}
                ${this._renderField(r("Fat (g)"),"fat","number")}
              </div>
              <div class="edit-row-3">
                ${this._renderField(r("Saturated Fat (g)"),"satf","number")}
                ${this._renderField(r("Carbs (g)"),"carb","number")}
                ${this._renderField(r("Fiber (g)"),"fib","number")}
              </div>
              <div class="edit-row-3">
                ${this._renderField(r("Sugar (g)"),"sug","number")}
                ${this._renderField(r("Sodium (mg)"),"sod","number")}
                ${this._renderField(r("Cholesterol (mg)"),"chol","number")}
              </div>
            </div>
            <div class="edit-footer">
              <button
                class="action-btn danger-outline"
                @click=${this._handleDeleteRecipe}
                title="${this._confirmDelete?r("Click again to confirm delete"):r("Delete recipe")}"
              >
                <ha-icon
                  icon="${this._confirmDelete?"mdi:alert":"mdi:trash-can-outline"}"
                ></ha-icon>
                ${this._confirmDelete?r("Confirm?"):r("Delete")}
              </button>
              <div class="edit-footer-right">
                <button class="action-btn" @click=${this._cancelEdit}>
                  ${r("Cancel")}
                </button>
                <button class="action-btn primary" @click=${this._saveEdit}>
                  ${r("Save")}
                </button>
              </div>
            </div>
          </div>
        </div>
      `}_renderField(e,t,i){let a=this._editData[t]??"";return i==="textarea"?s`
          <div class="edit-field">
            <label>${e}</label>
            <textarea
              .value=${a}
              @input=${n=>this._handleEditField(t,n.target.value)}
              rows="3"
            ></textarea>
          </div>
        `:s`
        <div class="edit-field">
          <label>${e}</label>
          <input
            type="${i}"
            .value=${String(a)}
            @input=${n=>this._handleEditField(t,n.target.value)}
          />
        </div>
      `}};var Se=b`
  :host {
    display: block;
    height: 100%;
  }

  .detail-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    position: relative;
    overflow: hidden;
  }

  /* Wide two-column layout */
  .detail-container.wide {
    flex-direction: row;
  }
  .detail-left {
    width: 320px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    border-right: 1px solid var(--rm-border);
    overflow: hidden;
  }
  .detail-left .hero-img {
    height: 240px;
    flex-shrink: 0;
    position: relative;
    overflow: hidden;
    background: var(--rm-bg-elevated);
  }
  .detail-left .hero-img img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .detail-left .hero-img .hero-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--rm-text-secondary);
  }
  .detail-left .hero-img .hero-placeholder ha-icon {
    --mdc-icon-size: 64px;
    opacity: 0.3;
  }
  .detail-left-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 12px 14px 16px;
    scrollbar-width: thin;
    scrollbar-color: var(--rm-border) transparent;
  }
  .detail-right {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .detail-right-header {
    padding: 16px 16px 0;
    flex-shrink: 0;
  }
  .detail-right-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 6px 16px 24px;
    scrollbar-width: thin;
    scrollbar-color: var(--rm-border) transparent;
  }
  .notes-section {
    margin-top: 20px;
    padding-top: 14px;
    border-top: 1px solid var(--rm-border);
  }
  .notes-section h3 {
    margin: 0 0 8px;
    font-size: var(--rm-font-size-sm, 14px);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--rm-text-secondary);
  }

  /* Recipe title */
  .recipe-title {
    margin: 0 0 6px;
    font-size: 20px;
    font-weight: 700;
    color: var(--rm-text);
    line-height: 1.2;
  }
  .recipe-title.wide-centered {
    text-align: center;
    font-size: 22px;
  }
  .detail-desc.wide-centered {
    text-align: center;
  }
  .detail-right-header .quick-rating {
    justify-content: center;
  }
  .detail-right-header .action-btns-row {
    justify-content: center;
  }

  /* Quick rating */
  .quick-rating {
    display: flex;
    gap: 2px;
    margin: 0 0 8px;
  }
  .qr-star {
    font-size: 20px;
    cursor: pointer;
    color: var(--rm-border);
    -webkit-text-stroke: 1px rgba(200, 150, 0, 0.4);
    transition: color 0.15s;
  }
  .qr-star.filled {
    color: var(--rm-ochre);
    -webkit-text-stroke: 1px var(--rm-warning);
  }
  .qr-star:hover {
    color: var(--rm-ochre);
  }

  /* Action buttons row */
  .action-btns-row {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    margin: 6px 0 10px;
    justify-content: center;
  }
  .action-icon-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--rm-text-secondary);
    font-size: var(--rm-font-size-xs, 12px);
    font-weight: 600;
    transition: color 0.15s;
    text-decoration: none;
    width: 56px;
  }
  .action-icon-btn .btn-icon {
    width: 46px;
    height: 46px;
    border-radius: 50%;
    background: var(--rm-accent-soft, rgba(255, 107, 53, 0.12));
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s;
    flex-shrink: 0;
  }
  .action-icon-btn ha-icon {
    --mdc-icon-size: 22px;
  }
  .action-icon-btn:hover .btn-icon {
    background: var(--rm-accent-soft);
  }
  .action-icon-btn:hover {
    color: var(--rm-accent-ink, var(--rm-text));
  }
  .action-icon-btn.fav-active .btn-icon {
    background: var(--rm-error-soft, #f6e5df);
  }
  .action-icon-btn.fav-active {
    color: var(--rm-error-ink, #983d25);
  }
  .action-icon-btn.danger .btn-icon {
    background: var(--rm-error, #983d25);
    color: var(--rm-error-text, #fff);
  }
  .action-icon-btn.danger {
    color: var(--rm-error-ink, #983d25);
  }

  /* Meta chips (wide layout) */
  .meta-chips {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 10px;
    justify-content: center;
  }
  .meta-chip-icon {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--rm-bg-elevated);
    border: 1px solid var(--rm-border);
    border-radius: 20px;
    padding: 5px 12px;
    font-size: var(--rm-font-size-xs, 12px);
    color: var(--rm-text-secondary);
    font-weight: 600;
  }
  .meta-chip-icon ha-icon {
    --mdc-icon-size: 14px;
  }

  /* Chip groups: column of rows, each row = label chip + value chips */
  .chips-area {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  .chip-group-row {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    align-items: center;
  }
  .chip-label {
    background: var(--rm-bg-main);
    border: 1px solid var(--rm-border);
    color: var(--rm-text-secondary);
    font-weight: 600;
    cursor: default;
  }

  /* Hero */
  .hero {
    flex-shrink: 0;
    height: 180px;
    position: relative;
    background: var(--rm-bg-elevated, #2c2c2e);
    overflow: hidden;
  }
  .hero.no-image {
    height: 80px;
  }
  .hero img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .hero-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to bottom,
      transparent 50%,
      rgba(0, 0, 0, 0.7) 100%
    );
  }
  .hero-placeholder {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--rm-text-secondary, #8e8e93);
  }
  .hero-placeholder ha-icon {
    --mdc-icon-size: 48px;
    opacity: 0.4;
  }

  .hero-actions {
    position: absolute;
    top: 10px;
    right: 10px;
    display: flex;
    gap: 6px;
  }
  .hero-btn {
    background: rgba(0, 0, 0, 0.55);
    border: none;
    border-radius: 50%;
    width: 34px;
    height: 34px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.85);
    text-decoration: none;
    transition:
      background 0.15s,
      color 0.15s;
    padding: 0;
  }
  .hero-btn ha-icon {
    --mdc-icon-size: 18px;
  }
  .hero-btn:hover {
    background: rgba(0, 0, 0, 0.75);
  }
  .hero-btn.fav-active {
    color: var(--rm-rose);
  }
  .hero-btn.delete-btn.confirm {
    background: var(--rm-error, #983d25);
    color: var(--rm-error-text, #fff);
  }

  /* Scroll area */
  .detail-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 14px 16px 24px;
    scrollbar-width: thin;
    scrollbar-color: var(--rm-border, rgba(255, 255, 255, 0.08)) transparent;
  }

  .detail-head {
    margin-bottom: 12px;
  }
  .detail-desc {
    margin: 0 0 8px;
    font-size: var(--rm-font-size-sm, 14px);
    color: var(--rm-text-secondary, #8e8e93);
    line-height: 1.5;
  }

  .meta-row {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-bottom: 10px;
  }
  .meta-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: var(--rm-bg-elevated, #2c2c2e);
    border-radius: 8px;
    padding: 6px 12px;
    min-width: 60px;
  }
  .meta-label {
    font-size: var(--rm-font-size-xs, 12px);
    color: var(--rm-text-secondary, #8e8e93);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .meta-val {
    font-size: var(--rm-font-size-sm, 14px);
    font-weight: 600;
    color: var(--rm-text, #e5e5ea);
  }

  .tags-row {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-bottom: 6px;
  }
  .tag-chip {
    background: var(--rm-accent-soft, rgba(255, 107, 53, 0.15));
    color: var(--rm-accent-ink, var(--rm-text));
    border-radius: 20px;
    padding: 3px 10px;
    font-size: var(--rm-font-size-xs, 12px);
  }

  /* Chip groups (courses, categories, collections) */
  .chip-group {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 5px;
    margin-top: 5px;
  }
  .chip-group-label {
    font-size: var(--rm-font-size-xs, 12px);
    color: var(--rm-text-secondary, #8e8e93);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .chip {
    border-radius: 20px;
    padding: 3px 10px;
    font-size: var(--rm-font-size-xs, 12px);
    border: none;
    cursor: default;
  }
  .chip-nav {
    cursor: pointer;
    transition:
      filter 0.15s,
      opacity 0.15s;
  }
  .chip-nav:hover {
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  .chip-course {
    background: var(--rm-accent-soft);
    color: var(--rm-accent-ink, var(--rm-text));
  }
  .chip-category {
    background: var(--rm-success-soft, #e2eee7);
    color: var(--rm-success-ink, #326044);
  }
  .chip-collection {
    background: var(--rm-warning-soft, #f2ebd5);
    color: var(--rm-warning, #765600);
  }
  .chip-tag {
    background: var(--rm-accent-soft);
    color: var(--rm-accent-ink, var(--rm-text));
  }

  /* Scaler */
  .scaler-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .scaler-icon {
    --mdc-icon-size: 18px;
    color: var(--rm-text-secondary);
    flex-shrink: 0;
  }
  .scaler-ctrl {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .scaler-btn {
    background: var(--rm-bg-elevated);
    border: 1px solid var(--rm-border);
    border-radius: 50%;
    width: 34px;
    height: 34px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--rm-text-secondary);
    padding: 0;
    transition: all 0.15s;
  }
  .scaler-btn:hover {
    background: var(--rm-accent-soft);
    color: var(--rm-accent-ink, var(--rm-text));
    border-color: var(--rm-accent);
  }
  .scaler-btn ha-icon {
    --mdc-icon-size: 18px;
  }
  .scaler-val {
    font-size: var(--rm-font-size-sm, 14px);
    font-weight: 600;
    color: var(--rm-text);
    min-width: 34px;
    height: 34px;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--rm-bg-elevated);
    border: 1px solid var(--rm-border);
    border-radius: 8px;
  }

  /* Tabs */
  .tabs-row {
    display: flex;
    border-bottom: 1px solid var(--rm-border, rgba(255, 255, 255, 0.08));
    margin-bottom: 14px;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .tabs-row::-webkit-scrollbar {
    display: none;
  }
  .tab-btn {
    flex-shrink: 0;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    padding: 11px 14px;
    cursor: pointer;
    font-size: var(--rm-font-size-sm, 14px);
    font-weight: 600;
    color: var(--rm-text-secondary, #8e8e93);
    transition:
      color 0.15s,
      border-color 0.15s;
    white-space: nowrap;
  }
  .tab-btn.active {
    color: var(--rm-accent-ink, var(--rm-text));
    border-bottom-color: var(--rm-accent, #ff6b35);
  }

  /* Wake lock button */
  .wakelock-row {
    display: flex;
    justify-content: flex-end;
    padding: 4px 0 10px;
  }
  .wakelock-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: none;
    border: 1px solid var(--rm-border);
    border-radius: 20px;
    padding: 4px 12px;
    font-size: var(--rm-font-size-xs, 12px);
    cursor: pointer;
    color: var(--rm-text-secondary);
    transition: all 0.15s;
  }
  .wakelock-btn ha-icon {
    --mdc-icon-size: 14px;
  }
  .wakelock-btn.active {
    background: var(--rm-accent-soft);
    color: var(--rm-accent-ink, var(--rm-text));
    border-color: var(--rm-accent);
  }
  .wakelock-unsupported {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    border: 1px dashed var(--rm-border);
    border-radius: 20px;
    padding: 4px 12px;
    font-size: var(--rm-font-size-xs, 12px);
    color: var(--rm-text-muted);
  }
  .wakelock-unsupported ha-icon {
    --mdc-icon-size: 14px;
  }

  /* Metric toggle */
  .metric-toggle-row {
    display: flex;
    justify-content: flex-end;
    padding: 0 0 8px;
  }
  .metric-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: none;
    border: 1px solid var(--rm-border);
    border-radius: 20px;
    padding: 4px 12px;
    font-size: var(--rm-font-size-xs, 12px);
    cursor: pointer;
    color: var(--rm-text-secondary);
    transition: all 0.15s;
  }
  .metric-btn ha-icon {
    --mdc-icon-size: 14px;
  }
  .metric-btn.active {
    background: var(--rm-accent-soft);
    color: var(--rm-accent-ink, var(--rm-text));
    border-color: var(--rm-accent);
  }

  /* Ingredient section heading */
  .ing-heading {
    list-style: none;
    font-size: var(--rm-font-size-xs, 12px);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--rm-accent-ink, var(--rm-text));
    padding: 10px 0 4px;
    margin-top: 6px;
  }

  /* Ingredients */
  .ingredient-list {
    list-style: none;
    padding: 0;
    margin: 0 0 16px;
  }
  .ingredient-item {
    display: flex;
    gap: 10px;
    align-items: baseline;
    padding: 10px 0;
    border-bottom: 1px solid var(--rm-border, rgba(255, 255, 255, 0.06));
  }
  .ingredient-item:last-child {
    border-bottom: none;
  }
  .ing-amount {
    font-size: var(--rm-font-size-sm, 14px);
    font-weight: 700;
    color: var(--rm-accent-ink, var(--rm-text));
    min-width: 70px;
    flex-shrink: 0;
  }
  .ing-name {
    font-size: var(--rm-font-size-base, 16px);
    color: var(--rm-text, #e5e5ea);
  }
  .ing-notes {
    font-size: var(--rm-font-size-sm, 14px);
    color: var(--rm-text-secondary, #8e8e93);
    font-style: italic;
  }

  /* Ingredient checkbox selection */
  .ingredient-item.selectable {
    cursor: pointer;
    border-radius: 6px;
    padding-left: 4px;
  }
  .ingredient-item.selectable:hover {
    background: var(--rm-accent-soft, rgba(255, 107, 53, 0.1));
  }
  .ing-check {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid var(--rm-border, rgba(255, 255, 255, 0.15));
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition:
      background 0.15s,
      border-color 0.15s;
  }
  .ing-check.checked {
    background: var(--rm-accent, #ff6b35);
    border-color: var(--rm-accent, #ff6b35);
    color: var(--rm-accent-text, #fff);
  }
  .ing-check ha-icon {
    --mdc-icon-size: 12px;
  }

  /* Shopping */
  .shopping-section {
    margin-top: 12px;
  }
  .shopping-btn {
    width: 100%;
    justify-content: center;
    gap: 6px;
  }
  .shopping-btn ha-icon {
    --mdc-icon-size: 18px;
  }
  .shopping-picker-panel {
    display: flex;
    flex-direction: column;
    gap: 8px;
    background: var(--rm-bg-elevated, #2c2c2e);
    border: 1px solid var(--rm-border, rgba(255, 255, 255, 0.12));
    border-radius: 10px;
    padding: 10px;
  }
  .picker-select-row {
    display: flex;
    gap: 6px;
    align-items: center;
    flex-wrap: wrap;
  }
  .picker-sel-btn {
    background: none;
    border: 1px solid var(--rm-border, rgba(255, 255, 255, 0.12));
    border-radius: 6px;
    color: var(--rm-text-secondary, #8e8e93);
    padding: 4px 10px;
    cursor: pointer;
    font-size: var(--rm-font-size-xs, 12px);
  }
  .picker-sel-btn:hover {
    background: var(--rm-accent-soft);
    color: var(--rm-text);
  }
  .picker-btns {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }
  .shopping-note {
    font-size: var(--rm-font-size-xs, 12px);
    color: var(--rm-text-secondary, #8e8e93);
  }
  .list-select {
    flex: 1;
    background: var(--rm-bg-elevated, #2c2c2e);
    border: 1px solid var(--rm-border, rgba(255, 255, 255, 0.12));
    border-radius: 8px;
    color: var(--rm-text, #e5e5ea);
    padding: 8px 10px;
    font-size: var(--rm-font-size-sm, 14px);
    min-width: 120px;
  }
  .shopping-success {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--rm-success-ink, #326044);
    font-size: var(--rm-font-size-sm, 14px);
    padding: 8px 0;
  }
  .shopping-success ha-icon {
    --mdc-icon-size: 20px;
  }

  /* Directions */
  .steps-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .step-item {
    display: flex;
    gap: 14px;
    margin-bottom: 20px;
    align-items: flex-start;
  }
  .step-num {
    flex-shrink: 0;
    width: 30px;
    height: 30px;
    background: var(--rm-accent, #ff6b35);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--rm-font-size-sm, 14px);
    font-weight: 700;
    color: var(--rm-accent-text, #fff);
    cursor: pointer;
    transition:
      background 0.15s,
      color 0.15s,
      border-color 0.15s;
    user-select: none;
  }
  .step-num:hover {
    opacity: 0.8;
  }
  .step-num.done {
    background: transparent;
    border: 2px solid var(--rm-border, rgba(255, 255, 255, 0.2));
    color: var(--rm-text-muted);
  }
  .step-num.done ha-icon {
    --mdc-icon-size: 16px;
  }
  .step-item.step-done .step-text {
    color: var(--rm-text-secondary);
    text-decoration: line-through;
    text-decoration-color: var(--rm-border);
  }
  .step-text {
    font-size: var(--rm-font-size-base, 16px);
    color: var(--rm-text, #e5e5ea);
    line-height: 1.7;
    transition: opacity 0.2s;
  }

  /* Timer chip in directions */
  .time-chip {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    background: var(--rm-accent-soft, rgba(255, 107, 53, 0.15));
    color: var(--rm-accent-ink, var(--rm-text));
    border: 1px solid var(--rm-accent, #ff6b35);
    border-radius: 12px;
    padding: 1px 7px;
    font-size: var(--rm-font-size-xs, 12px);
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s;
    vertical-align: middle;
  }
  .time-chip ha-icon {
    --mdc-icon-size: 12px;
  }
  .time-chip:hover {
    background: var(--rm-accent, #ff6b35);
    color: var(--rm-accent-text, #fff);
  }

  /* Notes */
  .notes-text {
    font-size: var(--rm-font-size-sm, 14px);
    color: var(--rm-text, #e5e5ea);
    line-height: 1.6;
  }
  .empty-tab {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    font-size: var(--rm-font-size-sm, 14px);
    color: var(--rm-text-secondary, #8e8e93);
    text-align: center;
    padding: 20px 0;
    margin: 0;
  }
  .empty-tab ha-icon {
    --mdc-icon-size: 40px;
    opacity: 0.35;
  }
  .empty-tab p {
    margin: 0;
  }

  /* Nutrition (legacy table) */
  .nutrition-panel {
    max-width: 340px;
    border: 2px solid var(--rm-text, #e5e5ea);
    border-radius: 4px;
    padding: 8px 12px;
    margin: 0 auto;
  }
  .nutr-header {
    font-size: 28px;
    font-weight: 900;
    color: var(--rm-text, #e5e5ea);
    line-height: 1;
    margin-bottom: 2px;
  }
  .nutr-sub {
    font-size: var(--rm-font-size-xs, 12px);
    color: var(--rm-text-secondary, #8e8e93);
    margin-bottom: 6px;
  }
  .nutr-divider {
    border-top: 1px solid var(--rm-border, rgba(255, 255, 255, 0.15));
    margin: 2px 0;
  }
  .nutr-divider.thick {
    border-top: 6px solid var(--rm-text, #e5e5ea);
    margin: 4px 0;
  }
  .nutr-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding: 2px 0;
    font-size: var(--rm-font-size-sm, 14px);
    color: var(--rm-text, #e5e5ea);
  }
  .nutr-bold {
    font-weight: 700;
    font-size: var(--rm-font-size-base, 16px);
  }
  .nutr-indent {
    padding-left: 14px;
    font-size: var(--rm-font-size-xs, 12px);
  }
  .nutr-val {
    font-weight: 600;
    white-space: nowrap;
  }
  .nutr-val em {
    font-style: normal;
    font-size: var(--rm-font-size-xs, 12px);
    color: var(--rm-text-secondary, #8e8e93);
  }

  /* Nutrition card */
  .nutr-card {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .nutr-top {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .nutr-ring-wrap {
    flex-shrink: 0;
    width: 90px;
    height: 90px;
  }
  .nutr-macro-cols {
    display: flex;
    gap: 10px;
    flex: 1;
    justify-content: space-around;
  }
  .nutr-macro-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }
  .nutr-mcol-num {
    font-size: 17px;
    font-weight: 700;
    line-height: 1;
  }
  .nutr-mcol-label {
    font-size: var(--rm-font-size-xs, 12px);
    color: var(--rm-text-secondary);
    font-weight: 500;
  }
  .nutr-mcol-label::before {
    content: "";
    display: inline-block;
    width: 7px;
    height: 7px;
    margin-right: 5px;
    border-radius: 50%;
    background: var(--macro-color);
  }
  .nutr-mcol-pct {
    font-size: var(--rm-font-size-xs, 12px);
    font-weight: 600;
  }
  .nutr-serving-note {
    font-size: var(--rm-font-size-xs, 12px);
    color: var(--rm-text-muted);
    text-align: center;
    margin-top: -4px;
  }
  /* Daily RDA expandable */
  .nutr-rda-toggle {
    display: flex;
    align-items: center;
    gap: 6px;
    background: none;
    border: none;
    border-top: 1px solid var(--rm-border);
    padding: 10px 0 0;
    cursor: pointer;
    color: var(--rm-text);
    font-size: var(--rm-font-size-sm, 14px);
    font-weight: 600;
    width: 100%;
    text-align: left;
  }
  .nutr-rda-title {
    flex: 1;
  }
  .nutr-rda-count {
    font-size: var(--rm-font-size-xs, 12px);
    font-weight: 700;
    color: var(--rm-text-secondary);
    background: var(--rm-bg-elevated);
    border: 1px solid var(--rm-border);
    border-radius: 10px;
    padding: 1px 7px;
  }
  .nutr-rda-toggle ha-icon {
    --mdc-icon-size: 18px;
    color: var(--rm-text-secondary);
  }
  .nutr-rda-rows {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding-top: 6px;
  }
  .nutr-rda-row {
    display: grid;
    grid-template-columns: 1fr auto auto;
    grid-template-rows: auto 4px;
    column-gap: 8px;
    row-gap: 4px;
    font-size: var(--rm-font-size-xs, 12px);
  }
  .nutr-rda-label {
    color: var(--rm-text-secondary);
    grid-column: 1;
    grid-row: 1;
  }
  .nutr-rda-val {
    color: var(--rm-text);
    font-weight: 600;
    grid-column: 2;
    grid-row: 1;
    white-space: nowrap;
  }
  .nutr-rda-pct {
    color: var(--rm-text-muted);
    grid-column: 3;
    grid-row: 1;
    white-space: nowrap;
    min-width: 36px;
    text-align: right;
  }
  .nutr-rda-bar-wrap {
    grid-column: 1 / -1;
    grid-row: 2;
    background: var(--rm-border);
    border-radius: 2px;
    height: 4px;
    overflow: hidden;
  }
  .nutr-rda-bar {
    height: 100%;
    background: var(--rm-accent);
    border-radius: 2px;
    transition: width 0.3s;
  }
  .nutr-rda-bar.over {
    background: var(--rm-error, #983d25);
  }

  /* Photos tab */
  .photos-tab {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .photos-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 10px;
  }
  .photo-item {
    position: relative;
    aspect-ratio: 4/3;
    border-radius: 8px;
    overflow: hidden;
    border: 2px solid transparent;
  }
  .photo-item.main-photo {
    border-color: var(--rm-accent, #ff6b35);
  }
  .photo-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .photo-badge {
    position: absolute;
    bottom: 4px;
    left: 4px;
    background: var(--rm-accent, #ff6b35);
    color: var(--rm-accent-text, #fff);
    font-size: var(--rm-font-size-xs, 12px);
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 4px;
  }
  .photo-action {
    position: absolute;
    background: rgba(0, 0, 0, 0.6);
    border: none;
    border-radius: 50%;
    width: 28px;
    height: 28px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    padding: 0;
    transition: background 0.15s;
  }
  .photo-action ha-icon {
    --mdc-icon-size: 14px;
  }
  .photo-action:hover {
    background: rgba(0, 0, 0, 0.85);
  }
  .remove-photo {
    top: 4px;
    right: 4px;
  }
  .set-main {
    bottom: 4px;
    left: 4px;
  }

  .photo-add-section {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding-top: 8px;
    border-top: 1px solid var(--rm-border, rgba(255, 255, 255, 0.08));
  }
  .photo-add-label {
    font-size: var(--rm-font-size-xs, 12px);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--rm-text-secondary, #8e8e93);
  }
  .photo-url-row {
    display: flex;
    gap: 8px;
  }
  .photo-url-input {
    flex: 1;
    background: var(--rm-bg-elevated, #2c2c2e);
    border: 1px solid var(--rm-border, rgba(255, 255, 255, 0.12));
    border-radius: 8px;
    color: var(--rm-text, #e5e5ea);
    padding: 8px 10px;
    font-size: var(--rm-font-size-sm, 14px);
  }
  .photo-url-input:focus {
    outline: none;
    border-color: var(--rm-accent, #ff6b35);
  }
  .camera-btns {
    display: flex;
    gap: 10px;
  }
  .camera-btn-split {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: var(--rm-bg-elevated, #2c2c2e);
    border: 2px solid var(--rm-accent, #ff6b35);
    border-radius: 10px;
    color: var(--rm-text, #e5e5ea);
    padding: 16px 8px;
    cursor: pointer;
    font-size: var(--rm-font-size-xs, 12px);
    text-align: center;
    transition:
      background 0.15s,
      border-color 0.15s;
  }
  .camera-btn-split:hover {
    background: var(--rm-accent-soft, rgba(255, 107, 53, 0.12));
  }
  .camera-btn-split ha-icon {
    --mdc-icon-size: 28px;
    color: var(--rm-accent-ink, var(--rm-text));
  }
  .camera-input {
    display: none;
  }

  /* Buttons */
  .action-btn {
    background: var(--rm-bg-elevated, #2c2c2e);
    border: 1px solid var(--rm-border, rgba(255, 255, 255, 0.12));
    border-radius: 8px;
    color: var(--rm-text, #e5e5ea);
    padding: 8px 14px;
    cursor: pointer;
    font-size: var(--rm-font-size-sm, 14px);
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: background 0.15s;
  }
  .action-btn.primary {
    background: var(--rm-accent, #ff6b35);
    border-color: var(--rm-accent, #ff6b35);
    color: var(--rm-accent-text, #fff);
  }
  .action-btn:disabled {
    color: var(--rm-disabled-text, var(--rm-text-secondary));
    background: var(--rm-disabled-bg, var(--rm-bg-elevated));
    cursor: not-allowed;
  }
  .icon-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--rm-text-secondary, #8e8e93);
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
  }

  /* Edit overlay */
  .edit-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: flex-end;
    z-index: 10;
  }
  .edit-panel {
    background: var(--rm-dialog-bg, var(--rm-bg-surface, #1c1c1e));
    border-radius: var(--rm-radius, 12px) var(--rm-radius, 12px) 0 0;
    width: 100%;
    max-height: 82vh;
    display: flex;
    flex-direction: column;
  }
  .edit-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    border-bottom: 1px solid var(--rm-border, rgba(255, 255, 255, 0.08));
    font-weight: 600;
    font-size: var(--rm-font-size-base, 16px);
    color: var(--rm-text, #e5e5ea);
    flex-shrink: 0;
  }
  .edit-body {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .edit-section-label {
    font-size: var(--rm-font-size-xs, 12px);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--rm-text-muted, #8e8e93);
    margin-top: 4px;
    padding-top: 8px;
    border-top: 1px solid var(--rm-border, rgba(255, 255, 255, 0.08));
  }
  .edit-row-3 {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 10px;
  }
  .edit-field {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .edit-field label {
    font-size: var(--rm-font-size-xs, 12px);
    color: var(--rm-text-secondary, #8e8e93);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .edit-field input,
  .edit-field textarea {
    background: var(--rm-bg-elevated, #2c2c2e);
    border: 1px solid var(--rm-border, rgba(255, 255, 255, 0.12));
    border-radius: 8px;
    color: var(--rm-text, #e5e5ea);
    padding: 8px 10px;
    font-size: var(--rm-font-size-sm, 14px);
    font-family: inherit;
    resize: vertical;
  }
  .edit-field input:focus,
  .edit-field textarea:focus {
    outline: none;
    border-color: var(--rm-accent, #ff6b35);
  }
  .edit-photo-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: flex-start;
  }
  .edit-photo-thumb {
    position: relative;
    width: 144px;
    height: 144px;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    flex-shrink: 0;
    border: 2px solid transparent;
    transition: border-color 0.15s;
  }
  .edit-photo-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .edit-photo-thumb.selected {
    border-color: var(--rm-accent, #ff6b35);
  }
  .edit-thumb-badge {
    position: absolute;
    bottom: 6px;
    right: 6px;
    background: var(--rm-accent, #ff6b35);
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .edit-thumb-badge ha-icon {
    --mdc-icon-size: 16px;
    color: var(--rm-accent-text, #fff);
  }
  .edit-photo-add {
    width: 144px;
    height: 144px;
    border-radius: 8px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--rm-accent-soft, rgba(255, 107, 53, 0.12));
    border: 2px dashed var(--rm-accent, #ff6b35);
    cursor: pointer;
    color: var(--rm-accent-ink, var(--rm-text));
    transition: background 0.15s;
  }
  .edit-photo-add:hover {
    background: var(--rm-accent-soft);
  }
  .edit-photo-add.loading {
    opacity: 0.6;
    cursor: not-allowed;
  }
  .edit-photo-add ha-icon {
    --mdc-icon-size: 40px;
  }
  .edit-stars {
    display: flex;
    gap: 4px;
    padding: 4px 0;
  }
  .edit-star {
    font-size: 32px;
    color: var(--rm-border, rgba(255, 255, 255, 0.3));
    cursor: pointer;
    transition: color 0.12s;
    line-height: 1;
    -webkit-text-stroke: 1px rgba(200, 150, 50, 0.5);
  }
  .edit-star.filled {
    color: var(--rm-ochre);
    -webkit-text-stroke: 1px var(--rm-warning);
  }
  .edit-star:hover {
    color: var(--rm-ochre);
  }
  .edit-footer {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-top: 1px solid var(--rm-border, rgba(255, 255, 255, 0.08));
    flex-shrink: 0;
  }
  .edit-footer-right {
    display: flex;
    gap: 8px;
  }

  /* Edit ingredient/step lists */
  .edit-ing-list,
  .edit-steps-list {
    list-style: none;
    padding: 0;
    margin: 0 0 6px;
  }
  .edit-ing-list li,
  .edit-steps-list li {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 5px 0;
    border-bottom: 1px solid var(--rm-border, rgba(255, 255, 255, 0.06));
    font-size: var(--rm-font-size-sm, 14px);
    color: var(--rm-text, #e5e5ea);
  }
  .edit-ing-heading {
    font-weight: 700;
    color: var(--rm-accent-ink, var(--rm-text)) !important;
  }
  .edit-ing-text {
    flex: 1;
    line-height: 1.4;
  }
  .drag-handle {
    flex-shrink: 0;
    cursor: grab;
    color: var(--rm-text-muted, #636366);
    --mdc-icon-size: 18px;
    touch-action: none;
  }
  .drag-handle:active {
    cursor: grabbing;
  }
  .edit-ing-list li.drag-over,
  .edit-steps-list li.drag-over {
    border-top: 2px solid var(--rm-accent);
    margin-top: -1px;
  }
  .edit-reorder-btns {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    gap: 0;
  }
  .edit-move-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    line-height: 1;
    color: var(--rm-text-secondary, #8e8e93);
    --mdc-icon-size: 14px;
  }
  .edit-move-btn:disabled {
    opacity: 0.2;
    cursor: default;
  }
  .edit-remove-btn {
    background: none;
    border: none;
    cursor: pointer;
    flex-shrink: 0;
    color: var(--rm-text-secondary, #8e8e93);
    padding: 2px;
    margin-top: 1px;
  }
  .edit-remove-btn ha-icon {
    --mdc-icon-size: 14px;
  }
  .edit-add-row {
    display: flex;
    gap: 8px;
    align-items: flex-end;
    margin-bottom: 4px;
  }
  .edit-add-row input,
  .edit-add-row textarea {
    flex: 1;
    background: var(--rm-bg-elevated, #232833);
    border: 1px solid var(--rm-border, rgba(255, 255, 255, 0.12));
    border-radius: 8px;
    color: var(--rm-text, #e5e5ea);
    padding: 7px 10px;
    font-size: var(--rm-font-size-sm, 14px);
    font-family: inherit;
    resize: none;
  }
  .edit-add-row input:focus,
  .edit-add-row textarea:focus {
    outline: none;
    border-color: var(--rm-accent, #9fa8da);
  }
  .edit-add-btn {
    background: var(--rm-accent, #9fa8da);
    border: none;
    border-radius: 8px;
    color: var(--rm-accent-text, #fff);
    padding: 7px 12px;
    cursor: pointer;
    font-size: var(--rm-font-size-sm, 14px);
    white-space: nowrap;
    flex-shrink: 0;
  }

  /* Danger outline button */
  .action-btn.danger-outline {
    color: var(--rm-error-ink, #983d25);
    border-color: var(--rm-error, #983d25);
  }
  .action-btn.danger-outline:hover {
    background: var(--rm-error, #983d25);
    color: var(--rm-error-text, #fff);
  }

  /* ── Wide grid layout (2 cols × auto rows) ─────────────── */
  /* Whole card scrolls — no independent column scrolling */
  .detail-container.wide {
    overflow-x: hidden;
    overflow-y: auto;
  }

  .wide-layout {
    --ion-grid-columns: 12;
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 14px;
    width: 100%;
    box-sizing: border-box;
    flex-shrink: 0;
  }

  /* Each row is a flex container — no gap (columns are exact % fractions summing to 100%).
       align-items:stretch makes both columns the same height.
       Column spacing uses margin-left + reduced width on col-2 items. */
  .wide-row {
    display: flex;
    flex-direction: row;
    align-items: stretch;
    width: 100%;
    box-sizing: border-box;
  }

  /* Col 1 — image card: exact Ionic 4/12 column; aspect-ratio:1/1 makes height = width */
  .wide-image-card {
    flex: 0 0 calc(calc(4 / var(--ion-grid-columns, 12)) * 100%);
    width: calc(calc(4 / var(--ion-grid-columns, 12)) * 100%);
    max-width: calc(calc(4 / var(--ion-grid-columns, 12)) * 100%);
    min-width: 0;
    aspect-ratio: 1 / 1;
    border-radius: 16px;
    overflow: hidden;
    background: var(--rm-bg-elevated);
    border: 1px solid var(--rm-border);
  }
  .wide-image-square {
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
  }
  .wide-image-square img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .wide-image-square .hero-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--rm-text-secondary);
  }
  .wide-image-square .hero-placeholder ha-icon {
    --mdc-icon-size: 64px;
    opacity: 0.3;
  }
  .slide-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(0, 0, 0, 0.45);
    border: none;
    color: #fff;
    cursor: pointer;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    z-index: 2;
    transition: background 0.15s;
  }
  .slide-btn:hover {
    background: rgba(0, 0, 0, 0.7);
  }
  .slide-btn ha-icon {
    --mdc-icon-size: 20px;
  }
  .slide-prev {
    left: 6px;
  }
  .slide-next {
    right: 6px;
  }
  .slide-dots {
    position: absolute;
    bottom: 7px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 5px;
    z-index: 2;
  }
  .slide-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.45);
    transition: background 0.15s;
  }
  .slide-dot.active {
    background: #fff;
  }

  /* Col 2 — info card: 8/12 minus the 14px gap, with margin-left for the gap */
  .wide-info-card {
    flex: 0 0 calc(calc(8 / var(--ion-grid-columns, 12)) * 100% - 14px);
    width: calc(calc(8 / var(--ion-grid-columns, 12)) * 100% - 14px);
    max-width: calc(calc(8 / var(--ion-grid-columns, 12)) * 100% - 14px);
    min-width: 0;
    box-sizing: border-box;
    margin-left: 14px;
    border-radius: 16px;
    background: var(--rm-bg-elevated);
    border: 1px solid var(--rm-border);
    padding: 16px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .wide-title {
    margin: 0 0 4px;
    font-size: 22px;
    font-weight: 700;
    color: var(--rm-text);
    line-height: 1.2;
    text-align: center;
  }
  .wide-desc {
    text-align: center;
    margin: 6px 0;
    font-size: var(--rm-font-size-sm, 14px);
    color: var(--rm-text-secondary);
    line-height: 1.5;
  }
  .wide-info-card .quick-rating {
    justify-content: center;
    margin-bottom: 6px;
  }
  .wide-info-card .action-btns-row {
    justify-content: center;
    flex-wrap: wrap;
    width: 100%;
  }
  .wide-info-card .meta-chips {
    justify-content: center;
    margin-top: 6px;
  }
  /* Chips pushed to bottom-left of info card */
  .wide-info-card .chips-area {
    align-self: flex-start;
    margin-top: auto;
    padding-top: 10px;
  }

  /* Row 2, Col 1 — ingredients column: exact Ionic 4/12, aligns with image above */
  .wide-ing-col {
    flex: 0 0 calc(calc(4 / var(--ion-grid-columns, 12)) * 100%);
    width: calc(calc(4 / var(--ion-grid-columns, 12)) * 100%);
    max-width: calc(calc(4 / var(--ion-grid-columns, 12)) * 100%);
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  /* Row 2, Col 2 — directions column: 8/12 minus gap, margin-left for spacing */
  .wide-dir-col {
    flex: 0 0 calc(calc(8 / var(--ion-grid-columns, 12)) * 100% - 14px);
    width: calc(calc(8 / var(--ion-grid-columns, 12)) * 100% - 14px);
    max-width: calc(calc(8 / var(--ion-grid-columns, 12)) * 100% - 14px);
    min-width: 0;
    margin-left: 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  /* Ingredients column controls: scaler left, cart right — above ingredients only */
  .wide-ing-controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 2px;
    min-height: 42px;
  }
  .wide-dir-spacer {
    min-height: 42px;
  }
  .ing-shop-btn {
    background: var(--rm-bg-elevated);
    border: 1px solid var(--rm-border);
    border-radius: 50%;
    width: 34px;
    height: 34px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--rm-text-secondary);
    padding: 0;
    transition: all 0.15s;
  }
  .ing-shop-btn ha-icon {
    --mdc-icon-size: 18px;
  }
  .ing-shop-btn:hover {
    background: var(--rm-accent-soft);
    color: var(--rm-accent-ink, var(--rm-text));
    border-color: var(--rm-accent);
  }
  .ing-shop-btn.active {
    background: var(--rm-accent-soft);
    color: var(--rm-accent-ink, var(--rm-text));
    border-color: var(--rm-accent);
  }
  .ing-shop-success {
    color: var(--rm-success-ink, #326044);
    display: flex;
    align-items: center;
  }
  .ing-shop-success ha-icon {
    --mdc-icon-size: 22px;
  }
  .shopping-review-panel {
    display: flex;
    flex-direction: column;
    gap: 10px;
    background: var(--rm-bg-elevated, #2c2c2e);
    border: 1px solid var(--rm-border, rgba(255, 255, 255, 0.12));
    border-radius: 10px;
    padding: 12px;
  }
  .review-title {
    font-size: var(--rm-font-size-xs, 12px);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--rm-text-secondary, #8e8e93);
  }
  .review-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-height: 300px;
    overflow-y: auto;
  }
  .review-row {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .review-ing {
    display: flex;
    align-items: baseline;
    gap: 4px;
    flex-wrap: wrap;
  }
  .review-qty {
    font-size: 0.8rem;
    color: var(--rm-text-secondary, #8e8e93);
    flex-shrink: 0;
  }
  .review-ing-name {
    font-size: 0.9rem;
    font-weight: 500;
  }
  .review-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }
  .review-chip {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    padding: 4px 10px;
    border-radius: 999px;
    border: 1.5px solid var(--rm-border, rgba(255, 255, 255, 0.12));
    background: none;
    cursor: pointer;
    font-size: var(--rm-font-size-xs, 12px);
    color: var(--rm-text, #e5e5ea);
    font-family: inherit;
    transition: all 0.15s;
    white-space: nowrap;
  }
  .review-chip ha-icon {
    --mdc-icon-size: 13px;
  }
  .review-chip.selected {
    border-color: var(--rm-accent, #ff6b35);
    background: var(--rm-accent-soft, rgba(255, 107, 53, 0.12));
    color: var(--rm-accent-ink, var(--rm-text));
    font-weight: 600;
  }
  .review-chip.manual {
    border-style: dashed;
  }
  .review-btns {
    margin-top: 2px;
  }

  /* Section cards (ingredients, nutrition, notes) */
  .wide-section-card {
    background: var(--rm-bg-elevated);
    border: 1px solid var(--rm-border);
    border-radius: 14px;
    padding: 12px 14px;
  }
  .wide-section-title {
    font-size: var(--rm-font-size-sm, 14px);
    font-weight: 700;
    color: var(--rm-text);
    margin-bottom: 10px;
    padding-bottom: 6px;
    border-bottom: 1px solid var(--rm-border);
  }

  /* Per-step direction cards in wide layout */
  .wide-step-card {
    display: flex;
    gap: 14px;
    align-items: flex-start;
  }
  .wide-step-card .step-num {
    flex-shrink: 0;
  }
  .wide-step-card .step-text {
    flex: 1;
  }
  .wide-step-card.step-done .step-text {
    color: var(--rm-text-secondary);
    text-decoration: line-through;
    text-decoration-color: var(--rm-border);
  }

  /* ── Markdown content ─────────────────────────────── */
  .md-content {
    font-size: var(--rm-font-size-sm, 14px);
    line-height: 1.65;
  }
  .md-content p {
    margin: 0 0 6px;
  }
  .md-content p.md-gap {
    margin: 0 0 10px;
  }
  .md-content h1 {
    font-size: 18px;
    font-weight: 700;
    margin: 10px 0 4px;
  }
  .md-content h2 {
    font-size: var(--rm-font-size-base, 16px);
    font-weight: 700;
    margin: 8px 0 4px;
  }
  .md-content h3 {
    font-size: var(--rm-font-size-sm, 14px);
    font-weight: 700;
    margin: 6px 0 3px;
  }
  .md-content ul,
  .md-content ol {
    padding-left: 20px;
    margin: 4px 0 8px;
  }
  .md-content li {
    margin: 2px 0;
  }
  .md-content strong {
    font-weight: 700;
  }
  .md-content em {
    font-style: italic;
  }
  .md-content code {
    font-family: monospace;
    font-size: var(--rm-font-size-xs, 12px);
    background: var(--rm-bg-elevated);
    padding: 1px 4px;
    border-radius: 3px;
  }
  .md-content a {
    color: var(--rm-accent-ink, var(--rm-text));
    text-decoration: none;
  }
  .md-content a:hover {
    text-decoration: underline;
  }
  .md-content hr {
    border: none;
    border-top: 1px solid var(--rm-border);
    margin: 8px 0;
  }

  /* ── List picker (tags / courses / categories / collections) ─── */
  .list-picker-field {
    position: relative;
  }
  .list-picker-wrap {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .list-picker-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    align-items: center;
    min-height: 28px;
  }
  .list-chip {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    padding: 3px 8px;
    border-radius: 14px;
    font-size: var(--rm-font-size-xs, 12px);
    border: 1px solid var(--rm-border);
    background: var(--rm-bg-elevated);
    color: var(--rm-text);
    cursor: default;
    transition: all 0.12s;
  }
  .list-chip.selected {
    background: var(--rm-accent-soft);
    border-color: var(--rm-accent);
    color: var(--rm-accent-ink, var(--rm-text));
  }
  .list-chip.available {
    cursor: pointer;
    color: var(--rm-text-muted);
  }
  .list-chip.available:hover {
    border-color: var(--rm-accent);
    color: var(--rm-accent-ink, var(--rm-text));
    background: var(--rm-accent-soft);
  }
  .list-chip-remove {
    background: none;
    border: none;
    padding: 0 0 0 2px;
    cursor: pointer;
    color: inherit;
    font-size: var(--rm-font-size-sm, 14px);
    line-height: 1;
    opacity: 0.7;
  }
  .list-chip-remove:hover {
    opacity: 1;
  }
  .list-chip-add-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 1px dashed var(--rm-border);
    background: none;
    cursor: pointer;
    color: var(--rm-text-muted);
    transition: all 0.12s;
  }
  .list-chip-add-btn:hover {
    border-color: var(--rm-accent);
    color: var(--rm-accent-ink, var(--rm-text));
  }
  .list-chip-add-btn ha-icon {
    --mdc-icon-size: 14px;
  }
  .list-picker-dropdown {
    background: var(--rm-bg-elevated);
    border: 1px solid var(--rm-border);
    border-radius: 10px;
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
  }
  .list-picker-existing {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }
  .list-picker-new-row {
    display: flex;
    gap: 6px;
  }
  .list-picker-input {
    flex: 1;
    background: var(--rm-bg-surface, var(--rm-bg-main));
    border: 1px solid var(--rm-border);
    border-radius: 7px;
    color: var(--rm-text);
    padding: 5px 9px;
    font-size: var(--rm-font-size-sm, 14px);
    font-family: inherit;
    min-width: 0;
  }
  .list-picker-input:focus {
    outline: none;
    border-color: var(--rm-accent);
  }
  .list-picker-new-btn {
    padding: 5px 12px;
    border-radius: 7px;
    border: 1px solid var(--rm-accent);
    background: var(--rm-accent);
    color: var(--rm-accent-text, #fff);
    cursor: pointer;
    font-size: var(--rm-font-size-sm, 14px);
    font-family: inherit;
  }
  .list-picker-new-btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  /* ── Inline ingredient edit ──────────────────────── */
  .edit-ing-text {
    cursor: pointer;
    flex: 1;
  }
  .edit-ing-text:hover {
    color: var(--rm-accent-ink, var(--rm-text));
  }
  .edit-ing-inline-edit {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 0;
    list-style: none;
  }
  .ing-inline-input {
    background: var(--rm-bg-elevated);
    border: 1px solid var(--rm-accent);
    border-radius: 6px;
    color: var(--rm-text);
    padding: 4px 6px;
    font-size: var(--rm-font-size-sm, 14px);
    font-family: inherit;
    min-width: 0;
  }
  .ing-inline-input:focus {
    outline: none;
  }
  .ing-inline-amt {
    width: 52px;
    flex: 0 0 52px;
  }
  .ing-inline-unit {
    width: 60px;
    flex: 0 0 60px;
  }
  .ing-inline-name {
    flex: 1;
  }
  .ing-inline-save,
  .ing-inline-cancel {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    border: 1px solid var(--rm-border);
    background: none;
    cursor: pointer;
    color: var(--rm-text-muted);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .ing-inline-save {
    border-color: var(--rm-accent);
    color: var(--rm-accent-ink, var(--rm-text));
  }
  .ing-inline-save:hover {
    background: var(--rm-accent);
    color: var(--rm-accent-text, #fff);
  }
  .ing-inline-save ha-icon,
  .ing-inline-cancel ha-icon {
    --mdc-icon-size: 13px;
  }

  .detail-container,
  .detail-right,
  .detail-left-scroll,
  .detail-right-scroll,
  .detail-scroll,
  .edit-body {
    min-width: 0;
    min-height: 0;
  }
  .detail-desc,
  .ing-name,
  .notes-text,
  .recipe-title {
    overflow-wrap: anywhere;
  }
  .action-btn,
  .tab-btn,
  .wakelock-btn,
  .metric-btn,
  .photo-url-input,
  .edit-field input,
  .edit-field textarea {
    min-height: var(--rm-touch-target, 44px);
  }
  .hero-btn,
  .scaler-btn,
  .icon-btn,
  .photo-action,
  .slide-btn,
  .ing-shop-btn {
    width: var(--rm-touch-target, 44px);
    height: var(--rm-touch-target, 44px);
  }
  .action-icon-btn {
    width: 76px;
    line-height: 1.4;
  }
  .edit-field input,
  .edit-field textarea,
  .photo-url-input {
    font-size: var(--rm-font-size-base, 16px);
    border-color: var(--rm-border-strong, var(--rm-border));
  }
  .edit-panel {
    border: 1px solid var(--rm-border);
    max-height: 82dvh;
  }
  .edit-footer,
  .edit-footer-right {
    flex-wrap: wrap;
  }
  @media (max-width: 480px) {
    .edit-row-3 {
      grid-template-columns: minmax(0, 1fr);
    }
    .action-btns-row {
      gap: 8px;
    }
    .nutr-top {
      flex-wrap: wrap;
      justify-content: center;
    }
    .photo-url-row {
      flex-wrap: wrap;
    }
  }
  ${f}
`;var ze="recipe-detail",Te=[{key:"calories",label:r("Calories"),unit:"kcal",bold:!0},{key:"fat",label:r("Total Fat"),unit:"g"},{key:"saturated_fat",label:r("Saturated Fat"),unit:"g",indent:!0},{key:"cholesterol",label:r("Cholesterol"),unit:"mg"},{key:"sodium",label:r("Sodium"),unit:"mg"},{key:"carbohydrates",label:r("Total Carbohydrate"),unit:"g"},{key:"fiber",label:r("Dietary Fiber"),unit:"g",indent:!0},{key:"sugar",label:r("Total Sugars"),unit:"g",indent:!0},{key:"protein",label:r("Protein"),unit:"g"}],Ce=/(\d+\s*(?:hours?|hrs?)\s*(?:and\s*)?\d*\s*(?:minutes?|mins?)?|\d+\s*(?:minutes?|mins?|seconds?|secs?|hours?|hrs?))/gi;function Be(l){let e=l.toLowerCase(),t=0,i=e.match(/(\d+)\s*h(?:ours?|rs?)?/);i&&(t+=parseInt(i[1])*3600);let a=e.match(/(\d+)\s*m(?:in(?:utes?)?)?(?!\s*l)/);a&&(t+=parseInt(a[1])*60);let n=e.match(/(\d+)\s*s(?:ec(?:onds?)?)?/);if(n&&(t+=parseInt(n[1])),!t){let o=e.match(/^(\d+)$/);o&&(t=parseInt(o[1])*60)}return t||0}var qe={calories:{label:r("Calories"),val:2e3,unit:"kcal"},fat:{label:r("Total Fat"),val:65,unit:"g"},saturated_fat:{label:r("Saturated Fat"),val:20,unit:"g"},cholesterol:{label:r("Cholesterol"),val:300,unit:"mg"},sodium:{label:r("Sodium"),val:2300,unit:"mg"},carbohydrates:{label:r("Total Carbohydrate"),val:300,unit:"g"},fiber:{label:r("Dietary Fiber"),val:28,unit:"g"},sugar:{label:r("Added Sugars"),val:50,unit:"g"},protein:{label:r("Protein"),val:50,unit:"g"}},Ue={oz:{factor:28.3495,to:"g",toFull:"g"},lb:{factor:453.592,to:"g",toFull:"g",thresholdKg:500},cup:{factor:250,to:"ml",toFull:"ml"},cups:{factor:250,to:"ml",toFull:"ml"},"fl oz":{factor:29.5735,to:"ml",toFull:"ml"},pt:{factor:473.176,to:"ml",toFull:"ml"},qt:{factor:946.353,to:"ml",toFull:"ml"}};function Ve(l,e){if(!l||!e)return null;let t=G(l);if(t===null)return null;let i=e.toLowerCase().trim(),a=Ue[i];if(!a)return null;let n=t*a.factor,o=a.to;i==="lb"&&n>=500&&(n=n/1e3,o="kg"),o==="ml"&&n>=1e3&&(n=n/1e3,o="L");let c=n>=10?Math.round(n):Math.round(n*10)/10;return{amount:String(c),unit:o}}var Q=class extends $e(v){static properties={recipe:{type:Object},api:{type:Object},settings:{type:Object},wide:{type:Boolean},_editing:{type:Boolean},_editData:{type:Object},_servingMult:{type:Number},_activeTab:{type:String},_confirmDelete:{type:Boolean},_downloading:{type:Boolean},_photoUrlInput:{type:String},_addingPhotoUrl:{type:Boolean},_wakeActive:{type:Boolean},_completedSteps:{type:Object},_editIngInput:{type:String},_editStepInput:{type:String},_nutritionExpanded:{type:Boolean},_dragIngOver:{type:Number},_dragStepOver:{type:Number},_editImageUploading:{type:Boolean},_slideIdx:{type:Number},allTags:{type:Array},allCourses:{type:Array},allCategories:{type:Array},allCollections:{type:Array},_tagPickerField:{type:String},_tagPickerInput:{type:String},_editIngEdit:{type:Object}};constructor(){super(),this.recipe=null,this.api=null,this.settings={},this.wide=!1,this._editing=!1,this._editData={},this._servingMult=1,this._activeTab="ingredients",this._confirmDelete=!1,this._downloading=!1,this._photoUrlInput="",this._addingPhotoUrl=!1,this._wakeActive=!1,this._completedSteps=new Set,this._editIngInput="",this._editStepInput="",this._nutritionExpanded=!1,this._dragIngOver=-1,this._dragStepOver=-1,this._dragIngFrom=-1,this._dragStepFrom=-1,this._editImageUploading=!1,this._slideIdx=0,this.allTags=[],this.allCourses=[],this.allCategories=[],this.allCollections=[],this._tagPickerField=null,this._tagPickerInput="",this._editIngEdit=null,this._slideTimer=null,this._slideTouchStartX=null,this._wakeLockTimeout=null,this._wakeLockUnsubscribeFn=null}connectedCallback(){super.connectedCallback(),this._wakeLockUnsubscribeFn=xe(e=>{this._wakeActive=e})}disconnectedCallback(){super.disconnectedCallback(),this._releaseWakeLock(),this._wakeLockUnsubscribeFn?.(),this._wakeLockUnsubscribeFn=null,this._stopSlideTimer()}async _requestWakeLock(){this._wakeLockTimeout&&(clearTimeout(this._wakeLockTimeout),this._wakeLockTimeout=null),await O(ze);let e=this.settings?.wakeLockDuration??60;this._wakeLockTimeout=setTimeout(()=>this._releaseWakeLock(),e*6e4)}async _releaseWakeLock(){this._wakeLockTimeout&&(clearTimeout(this._wakeLockTimeout),this._wakeLockTimeout=null),await D(ze)}updated(e){if(e.has("recipe")&&this.recipe){let t=e.get("recipe"),i=!t||t.id!==this.recipe.id;this._servingMult=1,i&&(this._editing=!1,this._confirmDelete=!1,this._photoUrlInput="",this._completedSteps=new Set),this._slideIdx=0,this._startSlideTimer()}e.has("settings")&&this._startSlideTimer(),(e.has("recipe")||e.has("settings"))&&this.recipe&&(this.settings?.keepScreenOn?this._requestWakeLock():this._releaseWakeLock()),e.has("recipe")&&!this.recipe&&this._releaseWakeLock()}_formatTime(e){if(!e)return null;if(e<60)return r(p`${e} min`);let t=Math.floor(e/60),i=e%60;return i?r(p`${t}h ${i}m`):r(p`${t}h`)}_scaleAmount(e){return _e(e,this._servingMult)}_handleToggleFav(){this.dispatchEvent(new CustomEvent("rm-toggle-favourite",{detail:{recipeId:this.recipe.id},bubbles:!0,composed:!0}))}async _handleDownloadImage(){if(this.recipe.image_url){this._downloading=!0;try{let e=await this.api.downloadRecipeImage(this.recipe.id,this.recipe.image_url);e?.local_url&&this.dispatchEvent(new CustomEvent("rm-update-recipe",{detail:{recipeId:this.recipe.id,data:{image_url:e.local_url}},bubbles:!0,composed:!0}))}catch(e){console.warn("Image download failed:",e)}finally{this._downloading=!1}}}_handleDeleteRecipe(){if(!this._confirmDelete){this._confirmDelete=!0,setTimeout(()=>{this._confirmDelete=!1},3e3);return}this.dispatchEvent(new CustomEvent("rm-delete-recipe",{detail:{recipeId:this.recipe.id},bubbles:!0,composed:!0}))}_handleQuickRate(e){let t=this.recipe.rating===e?null:e;this.dispatchEvent(new CustomEvent("rm-update-recipe",{detail:{recipeId:this.recipe.id,data:{rating:t}},bubbles:!0,composed:!0}))}_handleShowPlanner(){this.dispatchEvent(new CustomEvent("rm-show-planner",{bubbles:!0,composed:!0}))}_handleChipNav(e,t){this.dispatchEvent(new CustomEvent("rm-chip-nav",{detail:{filterMode:e,value:t},bubbles:!0,composed:!0}))}_fireTimer(e,t){let i=this.recipe?.name,a=i?r(p`${i} — ${t}`):t;this.dispatchEvent(new CustomEvent("rm-start-timer",{detail:{seconds:e,label:a},bubbles:!0,composed:!0}))}async _handleAddPhotoUrl(){let e=this._photoUrlInput.trim();if(e){this._addingPhotoUrl=!0;try{let a={photos:[...this.recipe.photos||[],e]};this.recipe.image_url||(a.image_url=e),this.dispatchEvent(new CustomEvent("rm-update-recipe",{detail:{recipeId:this.recipe.id,data:a},bubbles:!0,composed:!0})),this._photoUrlInput=""}finally{this._addingPhotoUrl=!1}}}_handleCameraCapture(e){let t=e.target.files?.[0];if(!t)return;let i=new FileReader;i.onload=async a=>{let n=a.target.result.split(",")[1];try{await this.api.uploadRecipeImage(this.recipe.id,n)}catch(o){console.warn("Camera upload failed:",o)}},i.readAsDataURL(t)}_setMainPhoto(e){this.dispatchEvent(new CustomEvent("rm-update-recipe",{detail:{recipeId:this.recipe.id,data:{image_url:e}},bubbles:!0,composed:!0}))}_removePhoto(e){let t=(this.recipe.photos||[]).filter(a=>a!==e),i={photos:t};this.recipe.image_url===e&&(i.image_url=t[0]||null),this.dispatchEvent(new CustomEvent("rm-update-recipe",{detail:{recipeId:this.recipe.id,data:i},bubbles:!0,composed:!0}))}_getSlideImages(){let e=this.recipe;if(!e)return[];let t=[e.image_url,...e.photos||[]].filter(Boolean);return[...new Set(t)]}_prevSlide(){let e=this._getSlideImages();e.length<2||(this._slideIdx=(this._slideIdx-1+e.length)%e.length,this._startSlideTimer())}_nextSlide(){let e=this._getSlideImages();e.length<2||(this._slideIdx=(this._slideIdx+1)%e.length,this._startSlideTimer())}_startSlideTimer(){this._stopSlideTimer();let e=this.settings?.slideshowInterval??5;e<=0||this._getSlideImages().length<2||(this._slideTimer=setInterval(()=>{this._slideIdx=(this._slideIdx+1)%this._getSlideImages().length},e*1e3))}_stopSlideTimer(){this._slideTimer&&(clearInterval(this._slideTimer),this._slideTimer=null)}_slideTouchStart(e){this._slideTouchStartX=e.touches[0]?.clientX??null}_slideTouchEnd(e){if(this._slideTouchStartX==null)return;let t=(e.changedTouches[0]?.clientX??0)-this._slideTouchStartX;this._slideTouchStartX=null,!(Math.abs(t)<50)&&(t<0?this._nextSlide():this._prevSlide())}_renderSlideshow(e){let t=this._getSlideImages(),i=Math.min(this._slideIdx,t.length-1),a=t.length>1,n=t[i]||null;return s`
      <div
        class="wide-image-square"
        @touchstart=${a?this._slideTouchStart:null}
        @touchend=${a?this._slideTouchEnd:null}
      >
        ${n?s`<img
              src="${this.api.transport.previewURL(n)||z}"
              alt="${e.name}"
            />`:s`
              <div class="hero-placeholder">
                <ha-icon icon="mdi:food"></ha-icon>
              </div>
            `}
        ${a?s`
              <button
                class="slide-btn slide-prev"
                @click=${this._prevSlide}
                title="${r("Previous")}"
              >
                <ha-icon icon="mdi:chevron-left"></ha-icon>
              </button>
              <button
                class="slide-btn slide-next"
                @click=${this._nextSlide}
                title="${r("Next")}"
              >
                <ha-icon icon="mdi:chevron-right"></ha-icon>
              </button>
              <div class="slide-dots">
                ${t.map((o,c)=>s`<span
                      class="slide-dot ${c===i?"active":""}"
                    ></span>`)}
              </div>
            `:""}
      </div>
    `}_renderChipGroup(e,t,i){return t?.length?s`
      <div class="chip-group">
        <span class="chip-group-label">${e}:</span>
        ${t.map(a=>s`<span class="chip ${i}">${a}</span>`)}
      </div>
    `:""}_renderChipGroups(e){let t=e.courses||[],i=e.categories||[],a=e.collections||[];return!t.length&&!i.length&&!a.length?"":s`
      <div class="chips-area">
        ${t.length?s` <div class="chip-group-row">
              <span class="chip chip-label">${r("Course:")}</span>
              ${t.map(n=>s`<button
                    class="chip chip-course chip-nav"
                    @click=${()=>this._handleChipNav("courses",n)}
                    title="${r(p`Filter by course: ${n}`)}"
                  >
                    ${n}
                  </button>`)}
            </div>`:""}
        ${i.length?s` <div class="chip-group-row">
              <span class="chip chip-label">${r("Category:")}</span>
              ${i.map(n=>s`<button
                    class="chip chip-category chip-nav"
                    @click=${()=>this._handleChipNav("categories",n)}
                    title="${r(p`Filter by category: ${n}`)}"
                  >
                    ${n}
                  </button>`)}
            </div>`:""}
        ${a.length?s` <div class="chip-group-row">
              <span class="chip chip-label">${r("Collection:")}</span>
              ${a.map(n=>s`<button
                    class="chip chip-collection chip-nav"
                    @click=${()=>this._handleChipNav("collections",n)}
                    title="${r(p`Filter by collection: ${n}`)}"
                  >
                    ${n}
                  </button>`)}
            </div>`:""}
      </div>
    `}_renderMetaRow(e){if(!(e.servings||e.prep_time||e.cook_time||e.total_time))return"";let i=e.total_time||(e.prep_time||0)+(e.cook_time||0)||null,a=(e.prep_time||0)+(e.cook_time||0),n=i&&i!==a;return s`
      <div class="meta-chips">
        ${e.servings?s`
              <span class="meta-chip-icon">
                <ha-icon icon="mdi:silverware-fork-knife"></ha-icon>
                ${e.servings_text||e.servings}
              </span>
            `:""}
        ${e.prep_time?s`
              <span class="meta-chip-icon">
                <ha-icon icon="mdi:pencil-outline"></ha-icon>
                ${this._formatTime(e.prep_time)}
              </span>
            `:""}
        ${e.cook_time?s`
              <span class="meta-chip-icon">
                <ha-icon icon="mdi:pot-steam-outline"></ha-icon>
                ${this._formatTime(e.cook_time)}
              </span>
            `:""}
        ${n?s`
              <span class="meta-chip-icon">
                <ha-icon icon="mdi:clock-outline"></ha-icon>
                ${this._formatTime(i)}
              </span>
            `:""}
      </div>
    `}_renderQuickRating(e){let t=e.rating||0;return s`
      <div class="quick-rating">
        ${[1,2,3,4,5].map(i=>s`
            <span
              class="qr-star ${i<=t?"filled":""}"
              @click=${()=>this._handleQuickRate(i)}
              >★</span
            >
          `)}
      </div>
    `}_renderActionButtons(e){return s`
      <div class="action-btns-row">
        <button
          class="action-icon-btn ${e.is_favourite?"fav-active":""}"
          @click=${this._handleToggleFav}
          title="${e.is_favourite?r("Remove from favourites"):r("Add to favourites")}"
        >
          <span class="btn-icon"
            ><ha-icon
              icon="${e.is_favourite?"mdi:heart":"mdi:heart-outline"}"
            ></ha-icon
          ></span>
          <span>${r("Favourite")}</span>
        </button>
        <button
          class="action-icon-btn"
          @click=${this._handleShowPlanner}
          title="${r("Add to meal plan")}"
        >
          <span class="btn-icon"
            ><ha-icon icon="mdi:calendar-plus"></ha-icon
          ></span>
          <span>${r("Plan")}</span>
        </button>
        ${e.source_url?s`
              <a
                class="action-icon-btn"
                href="${e.source_url}"
                target="_blank"
                rel="noopener"
                title="${r("Open source")}"
              >
                <span class="btn-icon"
                  ><ha-icon icon="mdi:open-in-new"></ha-icon
                ></span>
                <span>${r("Source")}</span>
              </a>
            `:""}
        <button
          class="action-icon-btn"
          @click=${this._startEdit}
          title="${r("Edit recipe")}"
        >
          <span class="btn-icon"
            ><ha-icon icon="mdi:pencil-outline"></ha-icon
          ></span>
          <span>${r("Edit")}</span>
        </button>
      </div>
    `}_renderScaler(){return this.recipe?.servings?s`
      <div class="scaler-row">
        <ha-icon class="scaler-icon" icon="mdi:silverware-fork-knife"></ha-icon>
        <div class="scaler-ctrl">
          <button
            class="scaler-btn"
            @click=${()=>{this._servingMult>.25&&(this._servingMult=Math.round((this._servingMult-.25)*4)/4)}}
          >
            <ha-icon icon="mdi:minus"></ha-icon>
          </button>
          <span class="scaler-val">×${this._servingMult}</span>
          <button
            class="scaler-btn"
            @click=${()=>{this._servingMult=Math.round((this._servingMult+.25)*4)/4}}
          >
            <ha-icon icon="mdi:plus"></ha-icon>
          </button>
        </div>
      </div>
    `:""}_renderWakeLock(){return this.settings?.keepScreenOn?y()?s`
      <div class="wakelock-row">
        <button
          class="wakelock-btn ${this._wakeActive?"active":""}"
          @click=${()=>this._wakeActive?this._releaseWakeLock():this._requestWakeLock()}
          title="${this._wakeActive?r("Release screen lock"):r("Keep screen on")}"
        >
          <ha-icon
            icon="${this._wakeActive?"mdi:eye":"mdi:eye-off-outline"}"
          ></ha-icon>
          ${this._wakeActive?r("Screen on"):r("Keep screen on")}
        </button>
      </div>
    `:s`
        <div class="wakelock-row">
          <span
            class="wakelock-unsupported"
            title="${r("Requires a secure (HTTPS) connection and a browser that supports the Wake Lock API")}"
          >
            <ha-icon icon="mdi:eye-off-outline"></ha-icon>
            ${r("Screen lock unavailable")}
          </span>
        </div>
      `:""}render(){if(!this.recipe)return s``;let e=this.recipe;return this.wide?this._renderWide(e):this._renderNarrow(e)}_renderWide(e){let t=this._groupIngredients(e.ingredients);return s`
      <div class="detail-container wide">
        <!--
          CSS grid: 2 cols (1fr 2fr) × auto rows
          [image]   [info card]
          [ings]    [directions]
          Whole card scrolls — no independent column scrolling
        -->
        <div class="wide-layout">
          <!-- row 1: image (1/3) + info card (2/3) -->
          <div class="wide-row">
            <!-- col 1: square image card (padding-top:100% inner wrapper forces square) -->
            <div class="wide-image-card">${this._renderSlideshow(e)}</div>

            <!-- col 2: info card -->
            <div class="wide-info-card">
              <h1 class="wide-title">${e.name}</h1>
              ${this._renderActionButtons(e)}
              <mm-recipe-log
                .api=${this.api.transport}
                .recipe=${e}
                .servings=${(e.servings||1)*this._servingMult}
              ></mm-recipe-log>
              ${e.description?s`<div class="wide-desc md-content">
                    ${M(e.description)}
                  </div>`:""}
              ${this._renderMetaRow(e)} ${this._renderChipGroups(e)}
            </div>
          </div>
          <!-- end wide-row 1 -->

          <!-- row 2: ingredients (1/3) + directions (2/3) -->
          <div class="wide-row">
            <!-- col 1: ingredients column -->
            <div class="wide-ing-col">
              <!-- Ingredient serving controls -->
              <div class="wide-ing-controls">${this._renderScaler()}</div>

              ${t.map(i=>s`
                  <div class="wide-section-card">
                    ${i.header?s`<div class="wide-section-title">${i.header}</div>`:""}
                    ${i.items.length?s`
                          <ul class="ingredient-list">
                            ${i.items.map(a=>{let{amount:n,unit:o}=this._getDisplayAmount(a);return s`
                                <li class="ingredient-item">
                                  <span class="ing-amount"
                                    >${n} ${o}</span
                                  >
                                  <span class="ing-name"
                                    >${a.name}${a.notes?s` <em class="ing-notes"
                                          >(${a.notes})</em
                                        >`:""}</span
                                  >
                                </li>
                              `})}
                          </ul>
                        `:""}
                  </div>
                `)}

              <div class="wide-section-card">
                ${this._renderNutritionRing(e)}
              </div>
            </div>

            <!-- col 2: directions column, each step its own card -->
            <div class="wide-dir-col">
              <div class="wide-dir-spacer"></div>
              ${this._renderWakeLock()}
              ${(e.instructions||[]).length?(e.instructions||[]).map((i,a)=>{let n=this._completedSteps.has(a);return s`
                      <div
                        class="wide-section-card wide-step-card ${n?"step-done":""}"
                      >
                        <span
                          class="step-num ${n?"done":""}"
                          @click=${o=>{o.stopPropagation(),this._toggleStepComplete(a)}}
                          title="${n?r("Mark incomplete"):r("Mark complete")}"
                          >${n?s`<ha-icon icon="mdi:check"></ha-icon>`:a+1}</span
                        >
                        <span class="step-text"
                          >${this._renderStepWithTimers(i)}</span
                        >
                      </div>
                    `}):s`<p class="empty-tab">
                    ${r("No directions listed.")}
                  </p>`}
              ${e.notes?s`
                    <div class="wide-section-card">
                      <div class="wide-section-title">${r("Notes")}</div>
                      <div class="notes-text md-content">
                        ${M(e.notes)}
                      </div>
                    </div>
                  `:""}
            </div>
          </div>
          <!-- end wide-row 2 -->
        </div>

        <!-- Edit overlay -->
        ${this._editing?this._renderEditPanel():""}
      </div>
    `}_renderNarrow(e){let t=e.total_time||(e.prep_time||0)+(e.cook_time||0)||null;return s`
      <div class="detail-container">
        <!-- Hero image -->
        <div class="hero ${e.image_url?"":"no-image"}">
          ${e.image_url?s`
                <img
                  src="${this.api.transport.previewURL(e.image_url)||z}"
                  alt="${e.name}"
                />
                <div class="hero-overlay"></div>
              `:s`
                <div class="hero-placeholder">
                  <ha-icon icon="mdi:food"></ha-icon>
                </div>
              `}
          <div class="hero-actions">
            <button
              class="hero-btn ${e.is_favourite?"fav-active":""}"
              @click=${this._handleToggleFav}
              title="${e.is_favourite?r("Remove from favourites"):r("Add to favourites")}"
            >
              <ha-icon
                icon="${e.is_favourite?"mdi:heart":"mdi:heart-outline"}"
              ></ha-icon>
            </button>
            ${e.source_url?s`
                  <a
                    class="hero-btn"
                    href="${e.source_url}"
                    target="_blank"
                    rel="noopener"
                    title="${r("Open source")}"
                  >
                    <ha-icon icon="mdi:open-in-new"></ha-icon>
                  </a>
                `:""}
          </div>
        </div>

        <div class="detail-scroll">
          <!-- Recipe meta -->
          <div class="detail-head">
            <h2 class="recipe-title">${e.name}</h2>
            ${this._renderActionButtons(e)}
            <mm-recipe-log
              .api=${this.api.transport}
              .recipe=${e}
              .servings=${(e.servings||1)*this._servingMult}
            ></mm-recipe-log>
            ${e.description?s`<div class="detail-desc md-content">
                  ${M(e.description)}
                </div>`:""}

            <div class="meta-row">
              ${e.prep_time?s`
                    <div class="meta-item">
                      <span class="meta-label">${r("Prep")}</span>
                      <span class="meta-val"
                        >${this._formatTime(e.prep_time)}</span
                      >
                    </div>
                  `:""}
              ${e.cook_time?s`
                    <div class="meta-item">
                      <span class="meta-label">${r("Cook")}</span>
                      <span class="meta-val"
                        >${this._formatTime(e.cook_time)}</span
                      >
                    </div>
                  `:""}
              ${t?s`
                    <div class="meta-item">
                      <span class="meta-label">${r("Total")}</span>
                      <span class="meta-val"
                        >${this._formatTime(t)}</span
                      >
                    </div>
                  `:""}
              ${e.servings?s`
                    <div class="meta-item">
                      <span class="meta-label">${r("Serves")}</span>
                      <span class="meta-val"
                        >${e.servings_text||e.servings}</span
                      >
                    </div>
                  `:""}
            </div>

            ${this._renderChipGroups(e)}
          </div>

          <!-- Serving scaler -->
          ${this._renderScaler()}

          <!-- Tabs -->
          <div class="tabs-row">
            ${[["ingredients",r("Ingredients")],["directions",r("Directions")],["notes",r("Notes")],["nutrition",r("Nutrition")],["photos",r("Photos")]].map(([i,a])=>s`
                <button
                  class="tab-btn ${this._activeTab===i?"active":""}"
                  @click=${()=>{this._activeTab=i}}
                >
                  ${a}
                </button>
              `)}
          </div>

          <!-- Wake lock button (shown when setting enabled) -->
          ${this._renderWakeLock()}

          <!-- Tab content -->
          <div class="tab-content">
            ${this._activeTab==="ingredients"?this._renderIngredients(e):""}
            ${this._activeTab==="directions"?this._renderDirections(e):""}
            ${this._activeTab==="notes"?this._renderNotes(e):""}
            ${this._activeTab==="nutrition"?this._renderNutritionRing(e):""}
            ${this._activeTab==="photos"?this._renderPhotos(e):""}
          </div>
        </div>

        <!-- Edit panel (inline overlay) -->
        ${this._editing?this._renderEditPanel():""}
      </div>
    `}_getDisplayAmount(e){let t=Ve(this._scaleAmount(e.amount),e.unit);return t||{amount:this._scaleAmount(e.amount)||"",unit:e.unit||""}}_groupIngredients(e){let t=[],i={header:null,items:[]};for(let a of e||[])a.is_heading||a.name?.startsWith("#")?((i.items.length>0||i.header!==null)&&t.push(i),i={header:(a.name?.startsWith("#")?a.name.slice(1).trim():a.name)||"",items:[]}):i.items.push(a);return(i.items.length>0||i.header!==null)&&t.push(i),t.length?t:[{header:null,items:e||[]}]}_renderIngredients(e){return s`
      ${e.ingredients?.length?s`
            <ul class="ingredient-list">
              ${e.ingredients.map((t,i)=>{if(t.is_heading||t.name?.startsWith("#")){let o=t.name?.startsWith("#")?t.name.slice(1).trim():t.name;return s`<li class="ing-heading">${o}</li>`}let{amount:a,unit:n}=this._getDisplayAmount(t);return s`
                  <li class="ingredient-item">
                    <span class="ing-amount">${a} ${n}</span>
                    <span class="ing-name"
                      >${t.name}${t.notes?s` <em class="ing-notes">(${t.notes})</em>`:""}</span
                    >
                  </li>
                `})}
            </ul>
          `:s`<p class="empty-tab">${r("No ingredients listed.")}</p>`}
    `}_toggleStepComplete(e){let t=new Set(this._completedSteps);t.has(e)?t.delete(e):t.add(e),this._completedSteps=t}_renderDirections(e){return e.instructions?.length?s`
      <ol class="steps-list">
        ${e.instructions.map((t,i)=>{let a=this._completedSteps.has(i);return s`
            <li class="step-item ${a?"step-done":""}">
              <span
                class="step-num ${a?"done":""}"
                @click=${n=>{n.stopPropagation(),this._toggleStepComplete(i)}}
                title="${a?r("Mark incomplete"):r("Mark complete")}"
                >${a?s`<ha-icon icon="mdi:check"></ha-icon>`:i+1}</span
              >
              <span class="step-text">${this._renderStepWithTimers(t)}</span>
            </li>
          `})}
      </ol>
    `:s`<p class="empty-tab">${r("No directions listed.")}</p>`}_renderStepWithTimers(e){let t=[],i=0,a;for(Ce.lastIndex=0;(a=Ce.exec(e))!==null;){a.index>i&&t.push(e.slice(i,a.index));let n=a[0],o=Be(n);o>0?t.push(s`<button
            class="time-chip"
            @click=${c=>{c.stopPropagation(),this._fireTimer(o,n)}}
            title="${r(p`Start timer for ${n}`)}"
          >
            <ha-icon icon="mdi:timer-outline"></ha-icon>${n}
          </button>`):t.push(n),i=a.index+a[0].length}return i<e.length&&t.push(e.slice(i)),t}_renderNotes(e){return s`
      ${e.notes?s`<div class="notes-text md-content">${M(e.notes)}</div>`:s`<p class="empty-tab">${r("No notes.")}</p>`}
    `}_renderNutrition(e){let t=e.nutrition||{};if(!Te.some(n=>t[n.key]!=null&&t[n.key]!==""))return s`
        <div class="empty-tab">
          <p>${r("No nutrition info. Add it via the edit panel.")}</p>
        </div>
      `;let a=e.servings?r(p`Per serving (${e.servings_text||e.servings})`):r("Per serving");return s`
      <div class="nutrition-panel">
        <div class="nutr-header">${r("Nutrition Facts")}</div>
        <div class="nutr-sub">${a}</div>
        <div class="nutr-divider thick"></div>
        ${Te.map(n=>{let o=t[n.key];return o==null||o===""?"":s`
            <div
              class="nutr-row ${n.bold?"nutr-bold":""} ${n.indent?"nutr-indent":""}"
            >
              <span class="nutr-label">${n.label}</span>
              <span class="nutr-val"
                >${o}${n.unit!=="kcal"?s`<em> ${n.unit}</em>`:""}</span
              >
            </div>
            <div class="nutr-divider"></div>
          `})}
      </div>
    `}_renderNutritionRing(e){let t=e?.declared_nutrition||{},i=h=>typeof h=="number"&&Number.isFinite(h)&&h>=0?h:null,a=i(t.calories),n=i(t.fat),o=i(t.carbs),c=i(t.protein),d=[n,o,c].every(h=>h!==null),m=n*9,u=o*4,T=c*4,g=d?m+u+T:0;if(![a,n,o,c].some(h=>h!==null))return s` <div class="nutr-card">
          <p class="empty-tab" style="margin:0;padding:8px 0;text-align:center">
            ${r("No nutritional information available.")}
          </p>
        </div>
        ${this._renderOriginalNutrition(e)}`;let j=[{label:r("Carbs"),val:o,cal:u,color:"var(--rm-ochre)"},{label:r("Total fat"),val:n,cal:m,color:"var(--rm-terracotta)"},{label:r("Protein"),val:c,cal:T,color:"var(--rm-sage)"}],C=42,x=50,_=50,Ie=7,$=2*Math.PI*C,W=Ie+$*4/360,ae=g>0?Math.max(0,u/g*$-W):0,se=g>0?Math.max(0,m/g*$-W):0,ne=g>0?Math.max(0,T/g*$-W):0,oe=-90,ce=oe+(g>0?u/g*360:0),De=ce+(g>0?m/g*360:0),Ee=a!==null?Math.round(a):null,B=Object.entries(qe).filter(([h])=>i(t[h==="carbohydrates"?"carbs":h])!==null&&e.nutrition_basis==="per_serving").map(([h,S])=>{let le=i(t[h==="carbohydrates"?"carbs":h]),Me=Math.min(Math.round(le/S.val*100),999);return{key:h,label:S.label,val:le,unit:S.unit,pct:Me}});return s`
      <div class="nutr-card">
        <!-- Top row: donut ring + macro columns -->
        <div class="nutr-top">
          <div class="nutr-ring-wrap">
            <svg
              width="90"
              height="90"
              viewBox="0 0 100 100"
              style="display:block"
            >
              <!-- Background track — always visible -->
              <circle
                cx="${x}"
                cy="${_}"
                r="${C}"
                fill="none"
                stroke="var(--rm-border)"
                stroke-width="7"
              />
              <!-- Colored arcs: all 3 inline in the same html template so they
                   inherit SVG namespace from the parser. Hidden via opacity when
                   there's no data. Dynamic values are attributes, not new elements. -->
              <circle
                cx="${x}"
                cy="${_}"
                r="${C}"
                fill="none"
                stroke="var(--rm-ochre)"
                stroke-width="7"
                stroke-linecap="round"
                stroke-dasharray="${ae} ${$}"
                transform="rotate(${oe} ${x} ${_})"
                opacity="${g>0&&ae>0?.95:0}"
              />
              <circle
                cx="${x}"
                cy="${_}"
                r="${C}"
                fill="none"
                stroke="var(--rm-terracotta)"
                stroke-width="7"
                stroke-linecap="round"
                stroke-dasharray="${se} ${$}"
                transform="rotate(${ce} ${x} ${_})"
                opacity="${g>0&&se>0?.95:0}"
              />
              <circle
                cx="${x}"
                cy="${_}"
                r="${C}"
                fill="none"
                stroke="var(--rm-sage)"
                stroke-width="7"
                stroke-linecap="round"
                stroke-dasharray="${ne} ${$}"
                transform="rotate(${De} ${x} ${_})"
                opacity="${g>0&&ne>0?.95:0}"
              />
              <text
                x="${x}"
                y="${_-2}"
                text-anchor="middle"
                fill="var(--rm-text)"
                font-size="16"
                font-weight="700"
                font-family="inherit"
              >
                ${Ee??"\u2013"}
              </text>
              <text
                x="${x}"
                y="${_+12}"
                text-anchor="middle"
                fill="var(--rm-text-secondary)"
                font-size="9"
                font-family="inherit"
              >
                ${r("cals")}
              </text>
            </svg>
          </div>

          <div class="nutr-macro-cols">
            ${j.map(h=>{let S=g>0?Math.round(h.cal/g*100):0;return s`
                <div class="nutr-macro-col" style="--macro-color:${h.color}">
                  <span class="nutr-mcol-num"
                    >${h.val!==null?`${h.val} g`:"\u2014"}</span
                  >
                  <span class="nutr-mcol-label">${h.label}</span>
                  ${S>0?s`<span class="nutr-mcol-pct">${S}% cals</span>`:""}
                </div>
              `})}
          </div>
        </div>

        ${e?.servings?s`
              <div class="nutr-serving-note">
                ${e.nutrition_basis==="per_serving"?r("Per serving"):e.nutrition_basis==="per_recipe"?"Per recipe":"Unknown nutrition basis"}
              </div>
            `:""}

        <!-- Daily RDA collapsible -->
        ${B.length?s`
              <button
                class="nutr-rda-toggle"
                @click=${()=>{this._nutritionExpanded=!this._nutritionExpanded}}
              >
                <span class="nutr-rda-title"
                  >${r("Daily RDA Nutrition")}</span
                >
                <span class="nutr-rda-count">${B.length}</span>
                <ha-icon
                  icon="${this._nutritionExpanded?"mdi:chevron-up":"mdi:chevron-down"}"
                ></ha-icon>
              </button>
              ${this._nutritionExpanded?s`
                    <div class="nutr-rda-rows">
                      ${B.map(h=>s`
                          <div class="nutr-rda-row">
                            <span class="nutr-rda-label">${h.label}</span>
                            <span class="nutr-rda-val"
                              >${h.val} ${h.unit}</span
                            >
                            <span class="nutr-rda-pct">${h.pct}%</span>
                            <div class="nutr-rda-bar-wrap">
                              <div
                                class="nutr-rda-bar ${h.pct>100?"over":""}"
                                style="width:${Math.min(h.pct,100)}%"
                              ></div>
                            </div>
                          </div>
                        `)}
                    </div>
                  `:""}
            `:""}
      </div>
      ${this._renderOriginalNutrition(e)}
    `}_renderOriginalNutrition(e){let t=Object.entries(e.nutrition||{}).filter(([,i])=>i!==null&&i!=="");return t.length?s`<details class="nutr-original" open>
          <summary>Original nutrition text</summary>
          ${t.map(([i,a])=>s`<p>
                <strong>${i}</strong>
                <span
                  >${typeof a=="object"?JSON.stringify(a):a}</span
                >
              </p>`)}
        </details>`:""}_renderPhotos(e){let t=e.photos||[],i=e.image_url,a=i?[i,...t.filter(n=>n!==i)]:t;return s`
      <div class="photos-tab">
        ${a.length?s`
              <div class="photos-grid">
                ${a.map(n=>s`
                    <div
                      class="photo-item ${n===i?"main-photo":""}"
                    >
                      <img
                        src="${this.api.transport.previewURL(n)||z}"
                        alt="${r("Recipe photo")}"
                        loading="lazy"
                      />
                      ${n===i?s`<span class="photo-badge">${r("Main")}</span>`:s`
                            <button
                              class="photo-action set-main"
                              @click=${()=>this._setMainPhoto(n)}
                              title="${r("Set as main photo")}"
                            >
                              <ha-icon icon="mdi:star-outline"></ha-icon>
                            </button>
                          `}
                      <button
                        class="photo-action remove-photo"
                        @click=${()=>this._removePhoto(n)}
                        title="${r("Remove photo")}"
                      >
                        <ha-icon icon="mdi:close"></ha-icon>
                      </button>
                    </div>
                  `)}
              </div>
            `:s`
              <div class="empty-tab">
                <ha-icon icon="mdi:image-off-outline"></ha-icon>
                <p>${r("No photos yet.")}</p>
              </div>
            `}

        <div class="photo-add-section">
          <div class="photo-add-label">${r("Add a photo")}</div>
          <div class="photo-url-row">
            <input
              type="url"
              class="photo-url-input"
              placeholder="${r("Paste image URL\u2026")}"
              .value=${this._photoUrlInput}
              @input=${n=>{this._photoUrlInput=n.target.value}}
              @keydown=${n=>{n.key==="Enter"&&this._handleAddPhotoUrl()}}
            />
            <button
              class="action-btn primary"
              ?disabled=${!this._photoUrlInput.trim()||this._addingPhotoUrl}
              @click=${this._handleAddPhotoUrl}
            >
              ${r("Add")}
            </button>
          </div>
          <div class="camera-btns">
            <label class="camera-btn-split">
              <ha-icon icon="mdi:camera"></ha-icon>
              <span>${r("Take Photo")}</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                class="camera-input"
                @change=${this._handleCameraCapture}
              />
            </label>
            <label class="camera-btn-split">
              <ha-icon icon="mdi:image-multiple-outline"></ha-icon>
              <span>${r("Choose from Library")}</span>
              <input
                type="file"
                accept="image/*"
                class="camera-input"
                @change=${this._handleCameraCapture}
              />
            </label>
          </div>
        </div>
      </div>
    `}static styles=Se};try{customElements.define("rm-recipe-detail",Q)}catch{}var Ge=["breakfast","lunch","dinner","snack"],K=class extends v{static properties={api:{type:Object},recipes:{type:Array},settings:{type:Object},fromRecipe:{type:Object},_weekStart:{type:String},_plan:{type:Array},_loading:{type:Boolean},_showPicker:{type:Boolean},_pickerTarget:{type:Object},_pickerSearch:{type:String},_pickerServings:{type:Number}};constructor(){super(),this.api=null,this.recipes=[],this.settings={},this.fromRecipe=null,this._plan=[],this._loading=!1,this._showPicker=!1,this._pickerTarget=null,this._pickerSearch="",this._pickerServings=2,this._weekStart=this._getMondayISO(new Date)}updated(e){(e.has("api")||e.has("_weekStart"))&&this.api&&this._loadPlan()}_getMondayISO(e){let t=e.getDay(),i=t===0?-6:1-t,a=new Date(e);a.setDate(a.getDate()+i);let n=a.getFullYear(),o=String(a.getMonth()+1).padStart(2,"0"),c=String(a.getDate()).padStart(2,"0");return`${n}-${o}-${c}`}_addDays(e,t){let i=new Date(e+"T00:00:00Z");return i.setUTCDate(i.getUTCDate()+t),i.toISOString().split("T")[0]}_formatDisplayDate(e){return new Date(e+"T00:00:00Z").getUTCDate().toString()}_formatMonthYear(e){return new Date(e+"T00:00:00Z").toLocaleDateString(this.settings?.language||"en",{month:"long",year:"numeric",timeZone:"UTC"})}_formatDayName(e){return new Date(e+"T00:00:00Z").toLocaleDateString(this.settings?.language||"en",{weekday:"short",timeZone:"UTC"})}_prevWeek(){this._weekStart=this._addDays(this._weekStart,-7)}_nextWeek(){this._weekStart=this._addDays(this._weekStart,7)}_isCurrentWeek(){return this._weekStart===this._getMondayISO(new Date)}async _loadPlan(){this._loading=!0;try{let e=await this.api.getMealPlan(this._weekStart);this._plan=e?.entries??[]}catch{this._plan=[]}finally{this._loading=!1}}_getEntriesForSlot(e,t){return this._plan.filter(i=>i.date===e&&i.meal_type===t)}_openPicker(e,t){this._pickerTarget={date:e,mealType:t},this._pickerSearch="",this._pickerServings=2,this._showPicker=!0}async _handlePickRecipe(e){this._pickerTarget&&(await this.api.addToMealPlan(e.id,this._pickerTarget.date,this._pickerTarget.mealType,this._pickerServings),this._showPicker=!1,await this._loadPlan())}async _handleRemoveEntry(e){await this.api.removeFromMealPlan(e),await this._loadPlan()}async _handleClearWeek(){await this.api.clearMealPlanWeek(this._weekStart),await this._loadPlan()}_openRecipeDetail(e){let t=this.recipes.find(i=>i.id===e.recipe_id);t&&this.dispatchEvent(new CustomEvent("rm-open-recipe",{detail:{recipe:t},bubbles:!0,composed:!0}))}_mealTypeLabel(e){switch(e){case"breakfast":return r("Breakfast");case"lunch":return r("Lunch");case"dinner":return r("Dinner");case"snack":return r("Snack");default:return e}}get _pickerFiltered(){let e=this._pickerSearch.trim().toLowerCase();return e?this.recipes.filter(t=>t.name?.toLowerCase().includes(e)||t.tags?.some(i=>i.toLowerCase().includes(e))):this.recipes}render(){let e=Array.from({length:7},(i,a)=>this._addDays(this._weekStart,a)),t=new Date().toISOString().split("T")[0];return s`
      <div class="planner-container">
        ${this.fromRecipe?s`
              <div class="back-to-recipe">
                <button
                  class="back-recipe-btn"
                  @click=${()=>this.dispatchEvent(new CustomEvent("rm-back-to-recipe",{bubbles:!0,composed:!0}))}
                >
                  <ha-icon icon="mdi:arrow-left"></ha-icon>
                  <span>${r(p`Back to ${this.fromRecipe.name}`)}</span>
                </button>
              </div>
            `:""}
        <!-- Week navigation -->
        <div class="week-nav">
          <button
            class="nav-btn"
            aria-label=${r("Previous week")}
            @click=${this._prevWeek}
          >
            <ha-icon icon="mdi:chevron-left"></ha-icon>
          </button>
          <div class="week-label">
            <span class="week-month"
              >${this._formatMonthYear(this._weekStart)}</span
            >
            ${this._isCurrentWeek()?s`<span class="today-badge">${r("This week")}</span>`:s`
                  <button
                    class="text-link"
                    @click=${()=>{this._weekStart=this._getMondayISO(new Date)}}
                  >
                    ${r("Today")}
                  </button>
                `}
          </div>
          <button
            class="nav-btn"
            aria-label=${r("Next week")}
            @click=${this._nextWeek}
          >
            <ha-icon icon="mdi:chevron-right"></ha-icon>
          </button>
        </div>

        <div
          class="week-scroll"
          tabindex="0"
          role="region"
          aria-label=${r("Meal plan")}
        >
          <!-- Day headers share the grid's horizontal scroll on narrow screens. -->
          <div class="day-headers">
            ${e.map(i=>s`
                <div class="day-header ${i===t?"today":""}">
                  <span class="day-name">${this._formatDayName(i)}</span>
                  <span class="day-num">${this._formatDisplayDate(i)}</span>
                </div>
              `)}
          </div>

          <!-- Plan grid scroll -->
          <div class="plan-scroll">
            ${this._loading?s`
                  <div class="plan-loading">
                    <ha-circular-progress active></ha-circular-progress>
                  </div>
                `:s`
                  ${Ge.map(i=>s`
                      <div class="meal-row">
                        <div class="meal-label">
                          ${this._mealTypeLabel(i)}
                        </div>
                        <div class="meal-cells">
                          ${e.map(a=>{let n=this._getEntriesForSlot(a,i);return s`
                              <div
                                class="meal-cell ${a===t?"today":""}"
                              >
                                ${n.map(o=>{let c=this.recipes.find(d=>d.id===o.recipe_id);return s`
                                    <div class="meal-entry">
                                      <button
                                        class="entry-open"
                                        aria-label=${c?.name??r("Unknown")}
                                        @click=${()=>this._openRecipeDetail(o)}
                                      >
                                        ${c?.image_url?s`
                                              <img
                                                src="${c.image_url}"
                                                alt="${c?.name||""}"
                                                class="entry-thumb"
                                              />
                                            `:s`
                                              <span
                                                class="entry-thumb entry-placeholder"
                                              >
                                                <ha-icon
                                                  icon="mdi:food"
                                                ></ha-icon>
                                              </span>
                                            `}
                                        <span class="entry-name"
                                          >${c?.name??r("Unknown")}</span
                                        >
                                        ${o.servings&&o.servings!==1?s`
                                              <span class="entry-servings"
                                                >×${o.servings}</span
                                              >
                                            `:""}
                                      </button>
                                      <button
                                        class="entry-remove"
                                        aria-label=${r("Remove")}
                                        @click=${d=>{d.stopPropagation(),this._handleRemoveEntry(o.id)}}
                                      >
                                        <ha-icon icon="mdi:close"></ha-icon>
                                      </button>
                                    </div>
                                  `})}
                                <button
                                  class="add-slot-btn"
                                  aria-label=${`${this._formatDayName(a)} ${this._formatDisplayDate(a)} \xB7 ${this._mealTypeLabel(i)}: ${r("Add recipe")}`}
                                  @click=${()=>this._openPicker(a,i)}
                                >
                                  <ha-icon icon="mdi:plus"></ha-icon>
                                </button>
                              </div>
                            `})}
                        </div>
                      </div>
                    `)}
                `}

            <!-- Clear week button -->
            ${this._plan.length?s`
                  <div class="clear-row">
                    <button
                      class="text-danger-btn"
                      @click=${this._handleClearWeek}
                    >
                      <ha-icon icon="mdi:calendar-remove-outline"></ha-icon>
                      ${r("Clear this week")}
                    </button>
                  </div>
                `:""}
          </div>
        </div>

        <!-- Recipe picker dialog -->
        ${this._showPicker?this._renderPicker():""}
      </div>
    `}_renderPicker(){let e=this._pickerTarget;return s`
      <div
        class="picker-overlay"
        @click=${t=>{t.target===t.currentTarget&&(this._showPicker=!1)}}
      >
        <div class="picker-panel">
          <div class="picker-header">
            <span
              >${r(p`Add to ${this._mealTypeLabel(e.mealType)}`)}</span
            >
            <button
              class="icon-btn"
              aria-label=${r("Close")}
              @click=${()=>{this._showPicker=!1}}
            >
              <ha-icon icon="mdi:close"></ha-icon>
            </button>
          </div>
          <div class="picker-servings-row">
            <span class="picker-label">${r("Servings:")}</span>
            <div class="servings-ctrl">
              <button
                class="scaler-btn"
                aria-label=${r("Decrease servings")}
                ?disabled=${this._pickerServings<=1}
                @click=${()=>{this._pickerServings>1&&this._pickerServings--}}
              >
                <ha-icon icon="mdi:minus"></ha-icon>
              </button>
              <span class="servings-val">${this._pickerServings}</span>
              <button
                class="scaler-btn"
                aria-label=${r("Increase servings")}
                @click=${()=>{this._pickerServings++}}
              >
                <ha-icon icon="mdi:plus"></ha-icon>
              </button>
            </div>
          </div>
          <div class="picker-search-wrap">
            <ha-icon icon="mdi:magnify" class="search-icon"></ha-icon>
            <input
              type="text"
              class="picker-search"
              aria-label=${r("Search recipes\u2026")}
              placeholder="${r("Search recipes\u2026")}"
              .value=${this._pickerSearch}
              @input=${t=>{this._pickerSearch=t.target.value}}
            />
          </div>
          <div class="picker-list">
            ${this._pickerFiltered.length===0?s`
                  <div class="picker-empty">${r("No recipes found")}</div>
                `:this._pickerFiltered.map(t=>s`
                    <button
                      class="picker-item"
                      @click=${()=>this._handlePickRecipe(t)}
                    >
                      ${t.image_url?s`
                            <img
                              src="${t.image_url}"
                              alt="${t.name}"
                              class="picker-thumb"
                            />
                          `:s`
                            <span class="picker-thumb picker-placeholder">
                              <ha-icon icon="mdi:food"></ha-icon>
                            </span>
                          `}
                      <span class="picker-info">
                        <span class="picker-name">${t.name}</span>
                        ${t.tags?.length?s`<span class="picker-tags"
                              >${t.tags.slice(0,2).join(", ")}</span
                            >`:""}
                      </span>
                      ${t.is_favourite?s`<ha-icon
                            icon="mdi:heart"
                            class="picker-fav"
                          ></ha-icon>`:""}
                    </button>
                  `)}
          </div>
        </div>
      </div>
    `}static styles=b`
    :host {
      display: block;
      height: 100%;
    }

    .planner-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
      position: relative;
      min-height: 0;
      min-width: 0;
    }

    /* Back to recipe */
    .back-to-recipe {
      padding: 6px 14px 0;
      flex-shrink: 0;
    }
    .back-recipe-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: none;
      border: none;
      cursor: pointer;
      color: var(--rm-accent-ink, var(--rm-text));
      font-size: var(--rm-font-size-sm, 14px);
      font-weight: 500;
      padding: 4px 6px;
      border-radius: 8px;
      transition: background 0.15s;
    }
    .back-recipe-btn:hover {
      background: var(--rm-accent-soft, rgba(255, 107, 53, 0.12));
    }
    .back-recipe-btn ha-icon {
      --mdc-icon-size: 18px;
    }

    /* Week nav */
    .week-nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px;
      flex-shrink: 0;
      border-bottom: 1px solid var(--rm-border, rgba(255, 255, 255, 0.08));
    }
    .nav-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--rm-text-secondary, #8e8e93);
      width: 44px;
      height: 44px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
    }
    .nav-btn:hover {
      background: var(--rm-border, rgba(255, 255, 255, 0.08));
    }
    .week-label {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      justify-content: center;
      font-size: var(--rm-font-size-sm, 14px);
      font-weight: 500;
      color: var(--rm-text, #e5e5ea);
    }
    .today-badge {
      font-size: var(--rm-font-size-xs, 12px);
      background: var(--rm-accent-soft, rgba(255, 107, 53, 0.15));
      color: var(--rm-accent-ink, var(--rm-text));
      border-radius: 10px;
      padding: 2px 8px;
    }
    .text-link {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--rm-accent-ink, var(--rm-text));
      font-size: var(--rm-font-size-xs, 12px);
      padding: 0;
    }

    /* Day headers */
    .week-scroll {
      flex: 1;
      min-height: 0;
      overflow: auto;
      overscroll-behavior: contain;
      scrollbar-width: thin;
      scrollbar-color: var(--rm-border-strong, var(--rm-border)) transparent;
    }
    .day-headers {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 8px;
      padding: 12px 14px 8px;
      flex-shrink: 0;
      min-width: 980px;
      position: sticky;
      top: 0;
      z-index: 1;
      background: var(--rm-dialog-bg, var(--rm-bg-main));
    }
    .day-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
    }
    .day-name {
      font-size: var(--rm-font-size-xs, 12px);
      text-transform: uppercase;
      color: var(--rm-text-secondary, #8e8e93);
      letter-spacing: 0.05em;
    }
    .day-num {
      font-size: var(--rm-font-size-sm, 14px);
      font-weight: 600;
      color: var(--rm-text, #e5e5ea);
    }
    .day-header.today .day-num {
      background: var(--rm-accent, #ff6b35);
      color: var(--rm-accent-text, #fff);
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--rm-font-size-xs, 12px);
    }

    /* Plan scroll */
    .plan-scroll {
      min-width: 980px;
      padding: 4px 14px 16px;
    }

    .plan-loading {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 120px;
    }

    .meal-row {
      margin-bottom: 16px;
    }
    .meal-label {
      font-size: var(--rm-font-size-xs, 12px);
      text-transform: uppercase;
      letter-spacing: 0.07em;
      color: var(--rm-text-secondary, #8e8e93);
      font-weight: 600;
      padding: 4px 2px 3px;
    }
    .meal-cells {
      display: grid;
      grid-template-columns: repeat(7, minmax(0, 1fr));
      gap: 8px;
    }
    .meal-cell {
      min-height: 76px;
      background: var(--rm-bg-elevated, #2c2c2e);
      border-radius: 12px;
      padding: 6px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      border: 1px solid var(--rm-border);
    }
    .meal-cell.today {
      border-color: var(--rm-accent, #ff6b35);
    }

    .meal-entry {
      display: flex;
      align-items: center;
      gap: 3px;
      flex-wrap: wrap;
      background: var(--rm-bg-surface);
      border: 1px solid var(--rm-border);
      border-radius: 8px;
      padding: 6px;
      font-size: var(--rm-font-size-sm, 14px);
      color: var(--rm-text, #e5e5ea);
      position: relative;
      min-width: 0;
    }
    .entry-open {
      display: flex;
      align-items: flex-start;
      gap: 6px;
      flex: 1 1 100%;
      min-width: 0;
      min-height: 44px;
      padding: 0;
      border: 0;
      background: transparent;
      color: inherit;
      cursor: pointer;
      text-align: left;
    }
    .entry-thumb {
      width: 24px;
      height: 24px;
      border-radius: 3px;
      object-fit: cover;
      flex-shrink: 0;
    }
    .entry-placeholder {
      background: var(--rm-border, rgba(255, 255, 255, 0.08));
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .entry-placeholder ha-icon {
      --mdc-icon-size: 10px;
    }
    .entry-name {
      flex: 1;
      min-width: 0;
      overflow-wrap: anywhere;
      font-size: var(--rm-font-size-sm, 14px);
    }
    .entry-servings {
      font-size: var(--rm-font-size-xs, 12px);
      color: var(--rm-text-secondary, #8e8e93);
      flex-shrink: 0;
    }
    .entry-remove {
      background: var(--rm-error-soft, #f6e5df);
      border: none;
      border-radius: 50%;
      width: 44px;
      height: 44px;
      min-width: 44px;
      margin-left: auto;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--rm-error-ink, #983d25);
      padding: 0;
      opacity: 1;
      flex-shrink: 0;
      transition: background 0.15s;
    }
    .entry-remove:hover {
      background: var(--rm-error, #983d25);
      color: var(--rm-error-text, #fff);
    }
    .entry-remove ha-icon {
      --mdc-icon-size: 18px;
    }

    .add-slot-btn {
      background: none;
      border: 1px dashed var(--rm-border, rgba(255, 255, 255, 0.12));
      border-radius: 4px;
      cursor: pointer;
      color: var(--rm-text-secondary, #8e8e93);
      min-height: 44px;
      min-width: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition:
        border-color 0.15s,
        color 0.15s;
      padding: 0;
      margin-top: auto;
    }
    .add-slot-btn ha-icon {
      --mdc-icon-size: 20px;
    }
    .add-slot-btn:hover {
      border-color: var(--rm-accent, #ff6b35);
      color: var(--rm-accent-ink, var(--rm-text));
    }

    .clear-row {
      display: flex;
      justify-content: center;
      padding: 8px;
    }
    .text-danger-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--rm-error-ink, #983d25);
      font-size: var(--rm-font-size-sm, 14px);
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 6px 10px;
      border-radius: 6px;
    }
    .text-danger-btn:hover {
      opacity: 1;
      background: var(--rm-error-soft, #f6e5df);
    }
    .text-danger-btn ha-icon {
      --mdc-icon-size: 16px;
    }

    /* Picker */
    .picker-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.55);
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      z-index: 20;
    }
    .picker-panel {
      background: var(--rm-dialog-bg, var(--rm-bg-surface, #1c1c1e));
      border-radius: var(--rm-radius, 12px) var(--rm-radius, 12px) 0 0;
      width: 100%;
      max-height: 80%;
      display: flex;
      flex-direction: column;
      box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.3);
      border: 1px solid var(--rm-border);
      min-height: 0;
    }
    .picker-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 16px;
      border-bottom: 1px solid var(--rm-border, rgba(255, 255, 255, 0.08));
      font-weight: 600;
      font-size: var(--rm-font-size-base, 16px);
      color: var(--rm-text, #e5e5ea);
      text-transform: capitalize;
      flex-shrink: 0;
    }
    .icon-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--rm-text-secondary, #8e8e93);
      width: 44px;
      height: 44px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
    }

    .picker-servings-row {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 16px;
      border-bottom: 1px solid var(--rm-border, rgba(255, 255, 255, 0.06));
      flex-shrink: 0;
    }
    .picker-label {
      font-size: var(--rm-font-size-sm, 14px);
      color: var(--rm-text-secondary, #8e8e93);
    }
    .servings-ctrl {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .scaler-btn {
      background: var(--rm-bg-elevated, #2c2c2e);
      border: 1px solid var(--rm-border, rgba(255, 255, 255, 0.08));
      border-radius: 50%;
      width: 44px;
      height: 44px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--rm-text, #e5e5ea);
      padding: 0;
    }
    .scaler-btn ha-icon {
      --mdc-icon-size: 14px;
    }
    .servings-val {
      font-size: var(--rm-font-size-sm, 14px);
      font-weight: 600;
      color: var(--rm-text, #e5e5ea);
      min-width: 24px;
      text-align: center;
    }

    .picker-search-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 14px;
      border-bottom: 1px solid var(--rm-border, rgba(255, 255, 255, 0.06));
      flex-shrink: 0;
    }
    .search-icon {
      color: var(--rm-text-secondary, #8e8e93);
      --mdc-icon-size: 18px;
    }
    .picker-search {
      flex: 1;
      background: none;
      border: none;
      outline: none;
      color: var(--rm-text, #e5e5ea);
      font-size: var(--rm-font-size-base, 16px);
      padding: 10px 0;
    }
    .picker-search::placeholder {
      color: var(--rm-text-secondary, #8e8e93);
    }

    .picker-list {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      scrollbar-width: thin;
      scrollbar-color: var(--rm-border, rgba(255, 255, 255, 0.08)) transparent;
    }
    .picker-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 16px;
      width: 100%;
      border: 0;
      background: transparent;
      color: var(--rm-text);
      text-align: left;
      cursor: pointer;
      border-bottom: 1px solid var(--rm-border, rgba(255, 255, 255, 0.05));
      transition: background 0.12s;
    }
    .picker-item:hover {
      background: var(--rm-bg-elevated, #2c2c2e);
    }
    .picker-thumb {
      width: 44px;
      height: 44px;
      border-radius: 8px;
      object-fit: cover;
      flex-shrink: 0;
    }
    .picker-placeholder {
      background: var(--rm-bg-elevated, #2c2c2e);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--rm-text-secondary, #8e8e93);
    }
    .picker-placeholder ha-icon {
      --mdc-icon-size: 22px;
    }
    .picker-info {
      display: block;
      flex: 1;
      min-width: 0;
    }
    .picker-name {
      font-size: var(--rm-font-size-sm, 14px);
      font-weight: 500;
      color: var(--rm-text, #e5e5ea);
      display: block;
    }
    .picker-tags {
      font-size: var(--rm-font-size-xs, 12px);
      color: var(--rm-text-secondary, #8e8e93);
    }
    .picker-fav {
      color: var(--rm-error-ink, #983d25);
      --mdc-icon-size: 16px;
    }
    .picker-empty {
      padding: 30px;
      text-align: center;
      color: var(--rm-text-secondary, #8e8e93);
      font-size: var(--rm-font-size-sm, 14px);
    }
    ${f}
  `};try{customElements.define("rm-meal-planner",K)}catch{}var X=class extends v{static properties={hass:{type:Object},language:{type:String},_label:{state:!0},_origin:{state:!0},_rows:{state:!0},_created:{state:!0},_busy:{state:!0},_message:{state:!0},_manual:{state:!0},_copied:{state:!0}};constructor(){super(),this._epoch=0,this._rows=[],this._label="",this._origin=globalThis.location?.origin||"",this._created=null,this._busy=!1,this._message="",this._manual=!1,this._copied=!1}t(e,t){return(this.language||this.hass?.language||"en").startsWith("de")?e:t}willUpdate(e){if(e.has("hass")){let t=`${this.hass?.user?.id}:${this.hass?.user?.is_admin===!0}`;(this._transport!==this.hass?.credentials||this._identity!==t)&&(this._epoch++,this._forget(),this._rows=[],this._busy=!1,this._message="",this._transport=this.hass?.credentials,this._identity=t,this.hass?.user?.is_admin===!0&&this._transport&&queueMicrotask(()=>this._load()))}}disconnectedCallback(){this._epoch++,this._forget(),this._rows=[],this._busy=!1,super.disconnectedCallback()}_forget(){this._created=null,this._manual=!1,this._copied=!1,this._message="";let e=this.shadowRoot?.querySelector("textarea");e&&(e.value="")}_live(e){return this.isConnected&&e===this._epoch&&this.hass?.user?.is_admin===!0&&this._identity===`${this.hass?.user?.id}:${this.hass?.user?.is_admin===!0}`&&this._transport===this.hass?.credentials}_address(){let e=new URL(this._origin.trim());if(!["http:","https:"].includes(e.protocol)||e.username||e.password||e.search||e.hash||!["","/"].includes(e.pathname))throw new Error("Invalid origin");return e.origin}_connection(){return this._created?JSON.stringify({service:"MacroMate",base_url:this._address(),headers:{Authorization:`Bearer ${this._created.token}`,"Content-Type":"application/json"},discovery:{method:"POST",url:this._address()+"/api/macromate/agent/action/describe",body:{}},instructions:["Store this credential privately; never repeat it in replies or logs.","Call discovery first. Use the returned actions and schemas via POST /api/macromate/agent/action/{action} with the supplied headers and JSON body. No Python client or repository checkout is required.","For each mutation generate a unique stable request_id. After a timeout retain the same request_id and identical payload, and inspect readback before retrying. Never duplicate a write with a new ID.","Create recipes with recipes_add, then read recipes_get using the exact returned recipe.id. Use metric quantities and only known nutrition values. Existing recipes may be read and updated; other permissions are not granted by this connection."]},null,2):""}async _load(){if(this._busy||!this.hass?.credentials)return;let e=this._epoch;if(this._live(e)){this._busy=!0,this._message="";try{let t=await this.hass.credentials("list");if(!this._live(e))return;if(!Array.isArray(t.credentials))throw new Error("Invalid response");this._rows=t.credentials.filter(i=>/^[a-f0-9]{32}$/.test(i?.id||"")&&typeof i.label=="string"&&!i.revoked&&(!i.expires_at||i.expires_at*1e3>Date.now())),this._created&&!this._rows.some(i=>i.id===this._created.id)&&this._forget()}catch{this._live(e)&&(this._message=this.t("Zug\xE4nge konnten nicht geladen werden. Bitte aktualisieren.","Could not load access. Please refresh."))}finally{this._live(e)&&(this._busy=!1)}}}async _create(){if(this._busy)return;let e=this._epoch;if(!this._live(e))return;try{this._address()}catch{this._message=this.t("Bitte eine g\xFCltige Home-Assistant-Adresse eingeben.","Enter a valid Home Assistant address.");return}let t=this._label.trim()||this.t("Mein Agent","My agent");if(!(t.length>100||/[\x00-\x1f]/.test(t))){this._forget(),this._busy=!0,this._message="";try{let i=await this.hass.credentials("create",{label:t});if(!this._live(e))return;if(!/^[a-f0-9]{32}$/.test(i.id||"")||!/^mm1\.[a-f0-9]{32}\.[A-Za-z0-9_-]{43}$/.test(i.token||"")||i.token.split(".")[1]!==i.id)throw new Error("Invalid response");this._created={id:i.id,token:i.token},this._rows=[...this._rows,{id:i.id,label:t}]}catch(i){this._live(e)&&(this._message=i?.code==="unauthorized"?this.t("Bitte als Home-Assistant-Administrator anmelden.","Sign in as a Home Assistant administrator."):this.t("Zugang nicht best\xE4tigt. Liste aktualisieren und einen neu angelegten Zugang ohne Schl\xFCssel trennen, bevor du es erneut versuchst.","Access was not confirmed. Refresh the list and disconnect any newly created access without a key before trying again."))}finally{this._live(e)&&(this._busy=!1)}}}async _revoke(e){if(this._busy)return;let t=this._epoch;if(this._live(t)){this._busy=!0,this._message="";try{if(await this.hass.credentials("revoke",{id:e}),!this._live(t))return;this._created?.id===e&&this._forget(),this._rows=this._rows.filter(i=>i.id!==e)}catch{this._live(t)&&(this._message=this.t("Trennen nicht best\xE4tigt. Bitte die Liste aktualisieren.","Disconnect was not confirmed. Please refresh the list."))}finally{this._live(t)&&(this._busy=!1)}}}async _copy(){let e=this._epoch;if(!this._live(e)||!this._created)return;let t;try{t=this._connection()}catch{this._message=this.t("Bitte die Home-Assistant-Adresse pr\xFCfen.","Check the Home Assistant address.");return}try{await navigator.clipboard.writeText(t),this._live(e)&&(this._copied=!0)}catch{if(!this._live(e))return;if(this._manual=!0,this._message=this.t("Bitte die markierten Verbindungsdaten kopieren.","Copy the selected connection details."),await this.updateComplete,this._live(e)){let i=this.shadowRoot.querySelector("textarea");i?.focus(),i?.select()}}}render(){if(this.hass?.user?.is_admin!==!0)return s``;let e="";try{e=this._connection()}catch{}return s`
      <section>
        <h3>${this.t("Agent verbinden","Connect agent")}</h3>
        <p>
          ${this.t("Dein Agent darf Rezepte lesen, anlegen und bearbeiten.","Your agent can read, create and edit recipes.")}
        </p>
        <label
          >${this.t("Name des Agenten","Agent name")}
          <input
            aria-label=${this.t("Name des Agenten","Agent name")}
            maxlength="100"
            .value=${this._label}
            placeholder=${this.t("Mein Agent","My agent")}
            ?disabled=${this._busy||!!this._created}
            @input=${t=>{this._label=t.target.value}}
          />
        </label>
        <label
          >${this.t("Home-Assistant-Adresse","Home Assistant address")}
          <input
            aria-label=${this.t("Home-Assistant-Adresse","Home Assistant address")}
            type="url"
            .value=${this._origin}
            @input=${t=>{this._origin=t.target.value,this._copied=!1}}
          />
        </label>
        <p class="hint">
          ${this.t("Im selben Netz kann dein Agent diese Adresse direkt nutzen.","On the same network your agent can use this address directly.")}
        </p>
        ${this._created?s`
              <div class="handoff">
                <p>
                  ${this.t("Zugang erstellt. Kopiere die Verbindung und \xFCbergib sie deinem Agenten. Der Schl\xFCssel wird nur jetzt angezeigt.","Access created. Copy the connection and give it to your agent. The key is only shown now.")}
                </p>
                <div class="actions">
                  <button @click=${this._copy} ?disabled=${!e}>
                    ${this.t("Verbindung kopieren","Copy connection")}
                  </button>
                  <button class="secondary" @click=${this._forget}>
                    ${this.t("Fertig","Done")}
                  </button>
                </div>
                ${this._copied?s`<p role="status">
                      ${this.t("Verbindung kopiert.","Connection copied.")}
                    </p>`:""}
                <details .open=${this._manual}>
                  <summary>
                    ${this.t("Verbindungsdaten anzeigen","Show connection details")}
                  </summary>
                  <textarea
                    aria-label=${this.t("Verbindungsdaten","Connection details")}
                    readonly
                    spellcheck="false"
                    .value=${e}
                  ></textarea>
                </details>
              </div>
            `:s`<button @click=${this._create} ?disabled=${this._busy}>
              ${this.t("Agent verbinden","Connect agent")}
            </button>`}
        ${this._message?s`<p role="status">${this._message}</p>`:""}
      </section>
      <section>
        <div class="heading">
          <h3>${this.t("Aktive Zug\xE4nge","Active access")}</h3>
          <button
            class="secondary"
            @click=${this._load}
            ?disabled=${this._busy}
          >
            ${this.t("Zug\xE4nge aktualisieren","Refresh access")}
          </button>
        </div>
        ${this._rows.length?s`<ul>
              ${this._rows.map(t=>s` <li data-credential-id=${t.id}>
                    <span>${t.label}</span>
                    <button
                      class="secondary"
                      @click=${()=>this._revoke(t.id)}
                      ?disabled=${this._busy}
                    >
                      ${this.t("Trennen","Disconnect")}
                    </button>
                  </li>`)}
            </ul>`:s`<p class="hint">
              ${this.t("Noch kein aktiver Zugang.","No active access yet.")}
            </p>`}
      </section>
    `}static styles=[f,b`
      :host {
        display: block;
        color: var(--rm-text);
      }
      section {
        padding: 16px 0;
        border-bottom: 1px solid var(--rm-border);
      }
      h3 {
        margin: 0 0 10px;
        font-size: 1rem;
      }
      p {
        line-height: 1.5;
      }
      .hint {
        color: var(--rm-text-secondary);
        font-size: 0.85rem;
      }
      label {
        display: grid;
        gap: 6px;
        margin: 14px 0;
        font-size: 0.9rem;
      }
      input,
      textarea {
        box-sizing: border-box;
        width: 100%;
        min-width: 0;
        padding: 12px;
        border: 1px solid var(--rm-border);
        border-radius: var(--rm-radius-sm, 8px);
        background: var(--rm-bg-input, var(--rm-bg-surface));
        color: var(--rm-text);
        font: inherit;
      }
      textarea {
        margin-top: 12px;
        min-height: 180px;
        resize: vertical;
        font: 0.8rem monospace;
      }
      button {
        min-height: 44px;
        padding: 10px 14px;
        border: 1px solid var(--rm-border);
        border-radius: var(--rm-radius-sm, 8px);
        background: var(--rm-accent);
        color: var(--rm-accent-text);
        cursor: pointer;
        font: inherit;
      }
      button.secondary {
        background: var(--rm-bg-surface);
        color: var(--rm-text);
      }
      button:disabled {
        opacity: 0.6;
        cursor: default;
      }
      button:focus-visible,
      input:focus-visible,
      textarea:focus-visible,
      summary:focus-visible {
        outline: 2px solid var(--rm-text);
        outline-offset: 2px;
      }
      .actions,
      .heading {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
      }
      .heading {
        justify-content: space-between;
      }
      .heading h3 {
        margin: 0;
      }
      details {
        margin-top: 14px;
      }
      summary {
        min-height: 44px;
        display: list-item;
        align-content: center;
        cursor: pointer;
      }
      ul {
        list-style: none;
        padding: 0;
        margin-bottom: 0;
      }
      li {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 12px 0;
      }
      li span {
        min-width: 0;
        overflow-wrap: anywhere;
      }
    `]};customElements.define("mm-agent-access",X);var Ae="unified",He=[["en","English"],["es","Espa\xF1ol"],["fr","Fran\xE7ais"],["de","Deutsch"],["pt","Portugu\xEAs"],["nl","Nederlands"],["it","Italiano"]],Z=class extends v{static properties={hass:{type:Object},settings:{type:Object},_activeTab:{type:String},_rmVersion:{type:String},_rmcVersion:{type:String},_backupState:{type:String}};constructor(){super(),this.settings={},this._activeTab="advanced",this._rmVersion="\u2026",this._rmcVersion="\u2026",this._backupState=null}updated(e){e.has("hass")&&this.hass&&this._rmVersion==="\u2026"&&this._fetchVersionsFromHacs()}async _backup(){if(this._backupState!=="loading"){this._backupState="loading";try{let e=await this.hass.callWS({type:"recipe_manager/backup"}),t=JSON.stringify(e,null,2),i=new Blob([t],{type:"application/json"}),a=URL.createObjectURL(i),n=document.createElement("a");n.href=a,n.download=`macromate-backup-${new Date().toISOString().slice(0,10)}.json`,n.click(),URL.revokeObjectURL(a),this._backupState="done"}catch(e){console.error("[RM] Backup failed:",e),this._backupState="error"}setTimeout(()=>{this._backupState=null},3e3)}}_fetchVersionsFromHacs(){this.hass&&(this._rmVersion="\u2026",this._rmcVersion="\u2026",this.hass.callWS({type:"recipe_manager/get_info"}).then(e=>{this._rmVersion=e.version||"\u2014",this._rmcVersion=Ae}).catch(()=>{this._rmVersion="\u2014",this._rmcVersion=Ae}))}_update(e){let t=w({...this.settings,...e});this.dispatchEvent(new CustomEvent("rm-settings-change",{detail:{settings:t},bubbles:!0,composed:!0}))}render(){let e=w(this.settings);return s`
      <div class="settings-root">
        <div class="tab-bar">
          ${[["advanced","mdi:tune-variant",r("Advanced")],...this.hass?.user?.is_admin===!0?[["agent","mdi:robot-outline","Agent"]]:[],["sync","mdi:cloud-sync-outline",r("Sync")],["help","mdi:help-circle-outline",r("Help")]].map(([t,i,a])=>s`
              <button
                class="tab-item ${this._activeTab===t?"active":""}"
                aria-pressed=${this._activeTab===t}
                @click=${()=>{this._activeTab=t}}
              >
                <ha-icon icon="${i}"></ha-icon>
                <span>${a}</span>
              </button>
            `)}
        </div>
        <div class="settings-body">
          ${this._activeTab==="advanced"?this._renderAdvanced(e):""}
          ${this._activeTab==="agent"&&this.hass?.user?.is_admin===!0?s`<mm-agent-access
                .hass=${this.hass}
                .language=${e.language}
              ></mm-agent-access>`:""}
          ${this._activeTab==="sync"?this._renderSync():""}
          ${this._activeTab==="help"?this._renderHelp():""}
        </div>
      </div>
    `}_renderAdvanced(e){return s`
      <div class="section">
        <div class="setting-row">
          <span class="setting-name">${r("Language")}</span>
          <select
            class="setting-select"
            aria-label=${r("Language")}
            @change=${t=>this._update({language:t.target.value})}
          >
            ${He.map(([t,i])=>s`
                <option
                  value="${t}"
                  ?selected=${(e.language??"en")===t}
                >
                  ${i}
                </option>
              `)}
          </select>
        </div>
      </div>
      <!-- ── Timer Sound ── -->
      <div class="section">
        <div class="section-label">${r("Timer Sound")}</div>

        <div class="setting-row">
          <span class="setting-name">${r("Alarm sound")}</span>
          <select
            class="setting-select"
            aria-label=${r("Alarm sound")}
            @change=${t=>this._update({timerSound:t.target.value})}
          >
            <option
              value="beep"
              ?selected=${(e.timerSound??"beep")==="beep"}
            >
              ${r("Beep")}
            </option>
            <option value="ding" ?selected=${e.timerSound==="ding"}>
              ${r("Ding")}
            </option>
            <option value="alarm" ?selected=${e.timerSound==="alarm"}>
              ${r("Alarm (3 beeps)")}
            </option>
            <option value="none" ?selected=${e.timerSound==="none"}>
              ${r("Silent")}
            </option>
            <option value="file" ?selected=${e.timerSound==="file"}>
              ${r("Custom file\u2026")}
            </option>
          </select>
        </div>

        ${e.timerSound==="file"?s`
              <div class="setting-row">
                <div class="setting-info">
                  <span class="setting-name">${r("Sound file")}</span>
                  <span class="setting-hint"
                    >${e.timerSoundFileName||r("No file selected")}</span
                  >
                </div>
                <label class="file-label">
                  <input
                    type="file"
                    accept="audio/*"
                    class="file-input"
                    @change=${this._handleSoundFileChange}
                  />
                  <ha-icon icon="mdi:folder-music-outline"></ha-icon>
                  ${e.timerSoundFile?r("Change"):r("Choose file")}
                </label>
              </div>
            `:""}

        <div class="setting-row">
          <div class="setting-info">
            <span class="setting-name">${r("Test sound")}</span>
            <span class="setting-hint"
              >${r("Play a preview of the selected alarm")}</span
            >
          </div>
          <button
            class="seg-btn active"
            @click=${()=>this._testSound(e.timerSound??"beep",e.timerSoundFile)}
          >
            <ha-icon icon="mdi:volume-high"></ha-icon> ${r("Play")}
          </button>
        </div>
      </div>

      <!-- ── Keep Screen On ── -->
      <div class="section">
        <div class="section-label">${r("Keep Screen On")}</div>

        <div class="setting-row">
          <div class="setting-info">
            <span class="setting-name"
              >${r("Keep screen on while viewing a recipe")}</span
            >
            <span class="setting-hint"
              >${r("Uses the Wake Lock API \u2014 engages automatically while a recipe is open")}</span
            >
          </div>
          <label class="toggle">
            <input
              type="checkbox"
              aria-label=${r("Keep screen on while viewing a recipe")}
              ?checked=${e.keepScreenOn}
              @change=${t=>this._update({keepScreenOn:t.target.checked})}
            />
            <span class="toggle-track"><span class="toggle-thumb"></span></span>
          </label>
        </div>

        ${e.keepScreenOn&&!y()?s`
              <div class="setting-row muted-row">
                <span class="setting-hint"
                  >${r(`Not available in this browser/connection \u2014 the Wake Lock API requires a secure (HTTPS) connection to Home Assistant. This is the most common reason "keep screen on" doesn't work.`)}</span
                >
              </div>
            `:""}
        ${e.keepScreenOn?s`
              <div class="setting-row">
                <div class="setting-info">
                  <span class="setting-name">${r("Auto-release after")}</span>
                  <span class="setting-hint"
                    >${r("Screen lock released after this many minutes")}</span
                  >
                </div>
                <div class="btn-group">
                  ${[15,30,45,60].map(t=>s`
                      <button
                        class="seg-btn ${(e.wakeLockDuration??60)===t?"active":""}"
                        aria-pressed=${(e.wakeLockDuration??60)===t}
                        @click=${()=>this._update({wakeLockDuration:t})}
                      >
                        ${t}m
                      </button>
                    `)}
                </div>
              </div>
            `:""}
      </div>

      <!-- ── Image Slideshow ── -->
      <div class="section">
        <div class="section-label">${r("Image Slideshow")}</div>

        <div class="setting-row">
          <div class="setting-info">
            <span class="setting-name">${r("Auto-advance interval")}</span>
            <span class="setting-hint"
              >${r("Seconds between slides when a recipe has multiple images (0 = off)")}</span
            >
          </div>
          <div class="btn-group">
            ${[0,3,5,10,15].map(t=>s`
                <button
                  class="seg-btn ${(e.slideshowInterval??5)===t?"active":""}"
                  aria-pressed=${(e.slideshowInterval??5)===t}
                  @click=${()=>this._update({slideshowInterval:t})}
                >
                  ${t===0?r("Off"):`${t}s`}
                </button>
              `)}
          </div>
        </div>
      </div>
    `}_handleSoundFileChange(e){let t=e.target.files?.[0];if(!t)return;let i=new FileReader;i.onload=a=>{this._update({timerSoundFile:a.target.result,timerSoundFileName:t.name})},i.readAsDataURL(t)}_testSound(e,t){if(e==="file"){typeof t=="string"&&t.length<=2e6&&/^data:audio\/[a-z0-9.+-]+;base64,[A-Za-z0-9+/]*={0,2}$/.test(t)&&new Audio(t).play().catch(a=>console.warn("Could not play file:",a));return}try{let i=new(window.AudioContext||window.webkitAudioContext);if(e==="ding"){let a=i.createOscillator(),n=i.createGain();a.connect(n),n.connect(i.destination),a.type="sine",a.frequency.setValueAtTime(1046,i.currentTime),n.gain.setValueAtTime(.6,i.currentTime),n.gain.exponentialRampToValueAtTime(.001,i.currentTime+1),a.start(i.currentTime),a.stop(i.currentTime+1)}else if(e==="alarm")for(let a=0;a<3;a++){let n=i.currentTime+a*.35,o=i.createOscillator(),c=i.createGain();o.connect(c),c.connect(i.destination),o.type="square",o.frequency.setValueAtTime(660,n),c.gain.setValueAtTime(.3,n),c.gain.exponentialRampToValueAtTime(.001,n+.2),o.start(n),o.stop(n+.2)}else if(e!=="none"){let a=i.createOscillator(),n=i.createGain();a.connect(n),n.connect(i.destination),a.type="sine",a.frequency.setValueAtTime(880,i.currentTime),n.gain.setValueAtTime(.5,i.currentTime),n.gain.exponentialRampToValueAtTime(.001,i.currentTime+.5),a.start(i.currentTime),a.stop(i.currentTime+.5)}}catch(i){console.warn("Audio test failed:",i)}}_renderSync(){let e=this._backupState==="loading"?r("Backing up\u2026"):this._backupState==="done"?r("Downloaded \u2713"):this._backupState==="error"?r("Failed \u2717"):r("Download backup");return s`
      <div class="section">
        <div class="section-label">${r("Backup")}</div>

        <div class="setting-row">
          <div class="setting-info">
            <span class="setting-name">${r("Export recipes")}</span>
            <span class="setting-hint"
              >${r("Download all recipes and meal plans as a JSON file")}</span
            >
          </div>
          <button
            class="seg-btn backup-btn ${this._backupState||""}"
            ?disabled=${this._backupState==="loading"}
            @click=${()=>this._backup()}
          >
            ${e}
          </button>
        </div>
      </div>
    `}_renderHelp(){return s`
      <div class="section">
        <div class="section-label">${r("FAQ & Support")}</div>

        <a
          class="help-link"
          href="https://github.com/v4lle5/macromate#readme"
          target="_blank"
          rel="noopener noreferrer"
        >
          <ha-icon icon="mdi:help-circle-outline"></ha-icon>
          <div class="help-link-content">
            <span class="setting-name">${r("FAQ")}</span>
            <span class="setting-hint"
              >${r("Frequently asked questions")}</span
            >
          </div>
          <ha-icon icon="mdi:open-in-new" class="help-link-ext"></ha-icon>
        </a>

        <a
          class="help-link"
          href="https://github.com/v4lle5/macromate/issues"
          target="_blank"
          rel="noopener noreferrer"
        >
          <ha-icon icon="mdi:bug-outline"></ha-icon>
          <div class="help-link-content">
            <span class="setting-name">${r("Report a Problem")}</span>
            <span class="setting-hint"
              >${r("Submit an issue on GitHub")}</span
            >
          </div>
          <ha-icon icon="mdi:open-in-new" class="help-link-ext"></ha-icon>
        </a>

        <a
          class="help-link"
          href="https://github.com/v4lle5/macromate"
          target="_blank"
          rel="noopener noreferrer"
        >
          <ha-icon icon="mdi:github"></ha-icon>
          <div class="help-link-content">
            <span class="setting-name">${r("GitHub Repository")}</span>
            <span class="setting-hint">${r("View source code")}</span>
          </div>
          <ha-icon icon="mdi:open-in-new" class="help-link-ext"></ha-icon>
        </a>
      </div>

      <div class="section">
        <div class="section-label">${r("About")}</div>

        <div class="setting-row">
          <span class="setting-name">MacroMate</span>
          <span class="muted-note"
            >${r(p`Integration version ${this._rmVersion}`)}</span
          >
        </div>

        <div class="setting-row">
          <span class="setting-name">MacroMate UI</span>
          <span class="muted-note"
            >${r(p`Card version ${this._rmcVersion}`)}</span
          >
        </div>

        <div class="setting-row">
          <span class="setting-name">${r("Refresh versions")}</span>
          <button
            class="seg-btn"
            aria-label=${r("Refresh versions")}
            @click=${()=>this._fetchVersionsFromHacs()}
          >
            <ha-icon icon="mdi:refresh"></ha-icon>
          </button>
        </div>
      </div>
    `}_renderPlaceholder(e,t,i){return s`
      <div class="placeholder-tab">
        <ha-icon icon="${t}"></ha-icon>
        <div class="placeholder-title">${e}</div>
        <div class="placeholder-msg">${i}</div>
      </div>
    `}static styles=b`
    :host {
      display: block;
      height: 100%;
      overflow: hidden;
    }

    .settings-root {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .tab-bar {
      display: flex;
      border-bottom: 1px solid var(--rm-border, rgba(0, 0, 0, 0.08));
      background: var(--rm-bg-surface, #fff);
      flex-shrink: 0;
      overflow-x: auto;
      scrollbar-width: none;
    }
    .tab-bar::-webkit-scrollbar {
      display: none;
    }

    .tab-item {
      display: flex;
      align-items: center;
      gap: 5px;
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      padding: 10px 14px;
      font-size: var(--rm-font-size-sm);
      font-weight: 500;
      color: var(--rm-text-secondary, #6b5c4a);
      cursor: pointer;
      white-space: nowrap;
      transition:
        color 0.15s,
        border-color 0.15s;
      flex-shrink: 0;
    }
    .tab-item ha-icon {
      --mdc-icon-size: 16px;
      flex-shrink: 0;
    }
    .tab-item:hover {
      color: var(--rm-text, #2d2016);
    }
    .tab-item.active {
      color: var(--rm-accent-ink, var(--rm-text));
      border-bottom-color: var(--rm-accent);
    }

    .settings-body {
      flex: 1;
      overflow-y: auto;
      padding: 8px 20px 32px;
      background: var(--rm-bg-main);
    }

    .section {
      max-width: 880px;
      margin: 16px auto;
      border: 1px solid var(--rm-border);
      border-radius: var(--rm-radius);
      background: var(--rm-bg-surface);
      overflow: hidden;
    }

    .section-label {
      font-size: var(--rm-font-size-sm);
      font-weight: 700;
      letter-spacing: 0.02em;
      color: var(--rm-text-muted, #a08060);
      padding: 16px 20px 6px;
    }

    .setting-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 20px;
      border-bottom: 1px solid var(--rm-border-subtle);
      gap: 16px;
    }
    .setting-row:last-child {
      border-bottom: none;
    }
    .setting-row.muted-row {
      background: var(--rm-accent-soft);
    }

    .setting-name {
      font-size: 1em;
      font-weight: 600;
      flex-shrink: 1;
      overflow-wrap: anywhere;
      color: var(--rm-text);
    }

    .setting-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 0;
    }
    .setting-hint {
      font-size: var(--rm-font-size-xs);
      color: var(--rm-text-muted, #a08060);
    }

    .muted-note {
      font-size: var(--rm-font-size-sm);
      color: var(--rm-text-muted, #a08060);
    }

    .backup-btn {
      min-width: 140px;
      white-space: nowrap;
    }
    .backup-btn.done {
      background: var(--rm-success, #4caf50);
      color: var(--rm-success-text);
    }
    .backup-btn.error {
      background: var(--rm-danger, #e53935);
      color: var(--rm-danger-text);
    }
    .backup-btn.loading {
      opacity: 0.7;
      cursor: wait;
    }

    .help-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 20px;
      border-bottom: 1px solid var(--rm-border, rgba(0, 0, 0, 0.06));
      text-decoration: none;
      color: inherit;
    }
    .help-link:last-of-type {
      border-bottom: none;
    }
    .help-link ha-icon {
      color: var(--rm-accent-ink, var(--rm-text));
      flex-shrink: 0;
    }
    .help-link-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .help-link-ext {
      --mdc-icon-size: 16px;
      color: var(--rm-text-secondary);
    }

    .setting-select {
      background: var(--rm-bg-surface, #fff);
      color: var(--rm-text, #2d2016);
      border: 1px solid var(--rm-border-strong);
      border-radius: 8px;
      padding: 8px 12px;
      font-size: var(--rm-font-size-sm);
      cursor: pointer;
      min-width: 160px;
      max-width: 100%;
      flex-shrink: 1;
    }

    .btn-group {
      display: flex;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid var(--rm-border-strong);
      flex-shrink: 1;
    }
    .seg-btn {
      background: transparent;
      border: none;
      padding: 8px 14px;
      font-size: var(--rm-font-size-sm);
      font-weight: 500;
      cursor: pointer;
      color: var(--rm-text-secondary, #6b5c4a);
      border-right: 1px solid var(--rm-border, rgba(0, 0, 0, 0.1));
      transition:
        background 0.12s,
        color 0.12s;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .seg-btn ha-icon {
      --mdc-icon-size: 16px;
    }
    .seg-btn:last-child {
      border-right: none;
    }
    .seg-btn.active {
      background: var(--rm-accent);
      color: var(--rm-accent-text, #111);
    }
    .tab-item,
    .setting-select,
    .seg-btn,
    .file-label,
    .toggle {
      min-height: var(--rm-touch-target, 44px);
    }
    @media (max-width: 480px) {
      .settings-body {
        padding: 4px 12px 24px;
      }
      .setting-row {
        flex-wrap: wrap;
      }
      .btn-group {
        max-width: 100%;
        flex-wrap: wrap;
      }
      .seg-btn {
        flex: 1;
        justify-content: center;
      }
    }
    .seg-btn:hover:not(.active) {
      background: var(--rm-accent-soft);
      color: var(--rm-text);
    }

    .toggle {
      display: flex;
      align-items: center;
      cursor: pointer;
      flex-shrink: 0;
    }
    .toggle input {
      position: absolute;
      width: 1px;
      height: 1px;
      opacity: 0;
    }
    .toggle input:focus-visible + .toggle-track {
      outline: 3px solid var(--rm-focus);
      outline-offset: 3px;
    }
    .toggle-track {
      width: 44px;
      height: 24px;
      background: var(--rm-border-strong);
      border-radius: 12px;
      position: relative;
      transition: background 0.2s;
    }
    .toggle input:checked + .toggle-track {
      background: var(--rm-accent);
    }
    .toggle-thumb {
      position: absolute;
      top: 2px;
      left: 2px;
      width: 20px;
      height: 20px;
      background: var(--rm-bg-elevated);
      border-radius: 50%;
      transition: transform 0.2s;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    }
    .toggle input:checked ~ .toggle-track .toggle-thumb {
      transform: translateX(20px);
    }

    .file-label {
      display: flex;
      align-items: center;
      gap: 6px;
      background: var(--rm-bg-elevated);
      border: 1px solid var(--rm-border);
      border-radius: 8px;
      padding: 6px 12px;
      font-size: var(--rm-font-size-sm);
      color: var(--rm-text);
      cursor: pointer;
      transition: background 0.15s;
      flex-shrink: 0;
    }
    .file-label:hover {
      background: var(--rm-accent-soft);
    }
    .file-label ha-icon {
      --mdc-icon-size: 18px;
      color: var(--rm-accent-ink, var(--rm-text));
    }
    .file-input {
      position: absolute;
      width: 1px;
      height: 1px;
      opacity: 0;
    }
    .file-label:focus-within {
      outline: 3px solid var(--rm-focus);
      outline-offset: 3px;
    }

    .placeholder-tab {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 24px;
      gap: 12px;
      color: var(--rm-text-secondary);
      text-align: center;
    }
    .placeholder-tab ha-icon {
      --mdc-icon-size: 48px;
      opacity: 0.3;
    }
    .placeholder-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--rm-text);
    }
    .placeholder-msg {
      font-size: var(--rm-font-size-sm);
      max-width: 280px;
      line-height: 1.5;
    }
    ${f}
  `};try{customElements.define("rm-settings-view",Z)}catch{}import{MacroMateNutritionBase as Qe}from"../nutrition-base.js";var J=class extends Qe{get profilesEnabled(){return!0}renderOverview(){let e=document.createElement("mm-summary");e._hass=this.hass,e.data=this.data;let t=document.createElement("div");return t.className="nutrition-overview",t.append(e.renderEnergy(),e.renderMacros()),t}renderDiary(){super.renderDiary();let e=this.data.recommendation;if(e?.fallback_reasons?.includes("weight_unavailable")){let t=document.createElement("p");t.className="weight-fallback",t.setAttribute("role","status"),t.textContent=this.hass.language==="de"?`Gewichtssensor nicht verf\xFCgbar. Gespeichertes Profilgewicht: ${e.weight_kg} kg (kein Live-Messwert).`:`Weight sensor unavailable. Saved profile weight: ${e.weight_kg} kg (not live).`,this.diaryNode.append(t)}}};customElements.define("mm-nutrition",J);var Y="manual-toggle",Re=["grid","detail","settings","planner"];function ee(l){let e=Math.floor(l/3600),t=Math.floor(l%3600/60),i=l%60;return e>0?`${e}:${String(t).padStart(2,"0")}:${String(i).padStart(2,"0")}`:`${t}:${String(i).padStart(2,"0")}`}function te(l){try{let e=new(window.AudioContext||window.webkitAudioContext);e.createGain().connect(e.destination);let i=(a,n,o,c=.6)=>{let d=e.createOscillator(),m=e.createGain();d.connect(m),m.connect(e.destination),d.frequency.value=a,m.gain.setValueAtTime(c,e.currentTime+n),m.gain.exponentialRampToValueAtTime(.001,e.currentTime+n+o),d.start(e.currentTime+n),d.stop(e.currentTime+n+o+.05)};if(l==="beep")i(880,0,.15),i(880,.2,.15),i(880,.4,.15);else if(l==="ding")i(1318,0,.8,.5),i(1047,.1,.6,.3);else if(l==="alarm")for(let a=0;a<5;a++)i(880,a*.25,.12),i(660,a*.25+.13,.1)}catch{}}var ie=class extends v{static properties={hass:{type:Object},systemDark:{attribute:!1},_config:{type:Object},_view:{type:String},_recipes:{type:Array},_tags:{type:Array},_selectedRecipe:{type:Object},_loading:{type:Boolean},_error:{type:String},_searchQuery:{type:String},_activeTag:{type:String},_settings:{type:Object},_wide:{type:Boolean},_sidebarCollapsed:{type:Boolean},_gridScrollPos:{type:Number},_recentRecipeIds:{type:Array},_timers:{type:Array},_timerAlarm:{type:Object},_timerAlarmQueue:{type:Array},_timersPrevView:{type:String},_customTimerInput:{type:String},_hdrStarHover:{type:Number},_mobileMenuOpen:{type:Boolean},_navDirection:{type:String},_closingDetail:{type:Boolean},_gridFilterPreset:{type:Object},_timerPresets:{type:Array},_presetNameInput:{type:String},_presetMinsInput:{type:String},_alarmAddInput:{type:String},_plannerFromRecipe:{type:Object},_globalMode:{type:Boolean},_quickTimerLabel:{type:String},_globalWakeActive:{type:Boolean}};constructor(){super(),this._pendingViewRestore=null,this._view="grid",this._recipes=[],this._tags=[],this._selectedRecipe=null,this._loading=!1,this._error=null,this._searchQuery="",this._activeTag=null,this._settings=w(),this._languageAutoDetectPending=!0,A(this._settings.language),this._wide=!1,this._sidebarCollapsed=!1,this._gridScrollPos=0,this._recentRecipeIds=[],this._timers=[],this._timerAlarm=null,this._timerAlarmQueue=[],this._timersPrevView=null,this._customTimerInput="",this._hdrStarHover=0,this._mobileMenuOpen=!1,this._navDirection="forward",this._closingDetail=!1,this._gridFilterPreset=null,this._timerPresets=[],this._presetNameInput="",this._presetMinsInput="",this._alarmAddInput="",this._plannerFromRecipe=null,this._globalMode=!1,this._quickTimerLabel="",this._alarmLoopActive=!1,this._alarmInterval=null,this._alarmTimeout=null,this._alarmAudio=null,this._unsubscribe=null,this._refreshGeneration=0,this._refreshRequested=!1,this._refreshScheduled=!1,this._refreshRunning=!1,this._recipeRefreshDeferred=!1,this._darkModeQuery=null,this._resizeObserver=null,this._timerTick=null,this._globalWakeActive=!1,this._globalWakeUnsubscribeFn=null}setConfig(e){this._config=e}static getStubConfig(){return{}}getCardSize(){return 6}_updateHeight(){requestAnimationFrame(()=>requestAnimationFrame(()=>{let e=this.getBoundingClientRect().top,t=window.innerHeight-Math.max(e,0);t>100&&(this.style.height=`${t}px`)}))}connectedCallback(){super.connectedCallback(),this._darkModeQuery=window.matchMedia("(prefers-color-scheme: dark)"),this._darkModeQuery.addEventListener("change",this._onSystemDark),this._applyTheme(),this._resizeObserver=new ResizeObserver(e=>{let t=e[0]?.contentRect?.width??0;this._wide=t>=620}),this._resizeObserver.observe(this),this._onViewportResize=()=>this._updateHeight(),window.visualViewport?.addEventListener("resize",this._onViewportResize),window.addEventListener("resize",this._onViewportResize),this._updateHeight(),this._timerTick=setInterval(()=>this._tickTimers(),1e3)}disconnectedCallback(){super.disconnectedCallback(),this._refreshGeneration++,this._refreshRequested=!1,this._refreshScheduled=!1,this._refreshRunning=!1,this._unsubscribe&&(this._unsubscribe(),this._unsubscribe=null),this._darkModeQuery?.removeEventListener("change",this._onSystemDark),this._resizeObserver?.disconnect(),window.visualViewport?.removeEventListener("resize",this._onViewportResize),window.removeEventListener("resize",this._onViewportResize),this._timerTick&&(clearInterval(this._timerTick),this._timerTick=null),this._timerAlarm&&(this._stopAlarmLoop(),this._timerAlarm=null),this._timerAlarmQueue=[],this._globalWakeActive&&D(Y)}_onSystemDark=()=>{this._settings.darkMode==="system"&&this._applyTheme()};updated(e){if(e.has("hass")&&this.hass&&!this._api&&(this._api=new F(this.hass),this._api.transport=this.transport,this._init()),e.has("hass")&&this.hass&&this._languageAutoDetectPending){this._languageAutoDetectPending=!1;let t=(this.hass.language||"").split("-")[0].toLowerCase(),i=N.includes(t)?t:this._settings.language;this._settings={...this._settings,language:i},A(i)}e.has("hass")&&this._api&&(this._api.hass=this.hass),(e.has("_settings")||e.has("systemDark"))&&this._applyTheme(),(e.has("_view")||e.has("_selectedRecipe")||e.has("_timers")||e.has("_recentRecipeIds"))&&this._saveViewState(),(e.has("_view")||e.has("_closingDetail"))&&this._recipeRefreshDeferred&&!this.shadowRoot.querySelector("rm-recipe-detail")&&this._queueRefresh()}_saveViewState(){if(!this._cacheBootstrapped||!this.transport?.current())return;let e=Re.includes(this._view)?this._view:"grid";me(this.transport,{view:e,recipeId:e==="detail"&&this._selectedRecipe?.id||null,recentIds:this._recentRecipeIds},this._timers)}_restoreViewState(){let e=this._pendingViewRestore;if(this._pendingViewRestore=null,!(!e||!Re.includes(e.view)))if(e.view==="detail"&&e.recipeId){let t=this._recipes.find(i=>i.id===e.recipeId);t&&(this._selectedRecipe=t,this._view="detail")}else e.view!=="detail"&&(this._view=e.view)}_applyTheme(){ue(this,this._settings,this.systemDark??this._darkModeQuery?.matches??!1),this.dispatchEvent(new CustomEvent("macromate-appearance",{detail:{settings:this._settings},bubbles:!0,composed:!0}))}async _init(){if(this._loading=!0,this._error=null,this.hass.user.is_admin||(this._view="nutrition"),!this._cacheBootstrapped&&this.hass.user.is_admin){let e=he(this.transport);this._pendingViewRestore=e,this._recentRecipeIds=e.recentIds||[],this._timers=e.timers||[],this._cacheBootstrapped=!0}try{let e;try{e=await this.transport.call("preferences_get")}catch(t){if(this.hass.user.is_admin)throw t;return}if(e.preferences?.recipe_settings&&(this._settings=w({...this._settings,...e.preferences.recipe_settings}),await A(this._settings.language),this.transport.locale=this._settings.language,this.hass=this.transport.facade()),!this.hass.user.is_admin){this._view="nutrition";return}await Promise.all([this._loadRecipes(),this._loadTags(),this._loadGlobalTimers()]),this._restoreViewState(),await this._loadPresets(),await this._subscribe()}catch(e){this._error=e.message||r("Failed to load recipes")}finally{this._loading=!1}}async _loadGlobalTimers(){try{let{timers:e}=await this._api.getGlobalTimers(),t=Date.now()/1e3;this._timers=[...this._timers.filter(i=>!i.global),...(e||[]).map(i=>this._globalTimerToLocal(i,t))]}catch{}}_globalTimerToLocal(e,t=Date.now()/1e3){let i=e.running?Math.max(0,e.duration-(t-e.start_time)):e.paused_remaining??e.duration;return{id:e.id,label:e.label,total:e.duration,remaining:Math.round(i),running:e.running&&i>0,alarming:e.running&&i<=0,presetId:e.preset_id||null,global:!0,duration:e.duration,start_time:e.start_time,paused_remaining:e.paused_remaining}}async _loadRecipes(){let e=await this._api.getAllRecipes();this._recipes=e?.recipes??[]}async _loadTags(){let e=await this._api.getTags();this._tags=e?.tags??[]}async _subscribe(){if(this._unsubscribe)return;let e=this._refreshGeneration,t=await this._api.subscribe(()=>this._queueRefresh());!this.isConnected||e!==this._refreshGeneration||!this.transport.current()?t():this._unsubscribe=t}_queueRefresh(){if(this._refreshRequested=!0,this._refreshScheduled||this._refreshRunning)return;this._refreshScheduled=!0;let e=this._refreshGeneration;queueMicrotask(()=>{e===this._refreshGeneration&&(this._refreshScheduled=!1,this._refreshLive())})}async _refreshLive(){let e=this.transport;if(!this._refreshRequested||!this.isConnected||!e?.current()||e.pending)return;this._refreshRequested=!1,this._refreshRunning=!0;let t=this._refreshGeneration,i=()=>!!this.shadowRoot.querySelector("rm-recipe-detail"),a=i();try{let[n,o,c]=await Promise.all([a?null:this._api.getAllRecipes(),a?null:this._api.getTags(),a?null:this._api.getGlobalTimers()]);if(!this.isConnected||t!==this._refreshGeneration||this.transport!==e||!e.current())return;if(e.pending){this._refreshRequested=!0;return}this._recipeRefreshDeferred=a||i(),a&&!i()&&(this._refreshRequested=!0),this._recipeRefreshDeferred||(this._recipes=n?.recipes??[],this._tags=o?.tags??[],this._timers=[...this._timers.filter(d=>!d.global),...(c?.timers||[]).map(d=>this._globalTimerToLocal(d))])}catch{}finally{t===this._refreshGeneration&&(this._refreshRunning=!1,this._refreshRequested&&!e.pending&&e.current()&&this._queueRefresh())}}get _filteredRecipes(){let e=this._recipes;if(this._activeTag&&(e=e.filter(t=>t.tags?.includes(this._activeTag)||t.courses?.includes(this._activeTag)||t.categories?.includes(this._activeTag)||t.collections?.includes(this._activeTag))),this._searchQuery.trim()){let t=this._searchQuery.trim().toLowerCase();e=e.filter(i=>i.name?.toLowerCase().includes(t)||i.description?.toLowerCase().includes(t)||i.tags?.some(a=>a.toLowerCase().includes(t)))}return e}get _recentRecipes(){let e=this._settings.recentCount??12;return this._recentRecipeIds.slice(0,e).map(t=>this._recipes.find(i=>i.id===t)).filter(Boolean)}async _handleSettingsChange(e){let t=this._settings.language;if(this._settings=w(e.detail.settings),this._settings.language!==t){await A(this._settings.language),this.transport.locale=this._settings.language,this.hass=this.transport.facade(),this.requestUpdate();for(let i of this.shadowRoot.querySelectorAll("*"))i.requestUpdate?.()}try{await this.transport.call("preferences_update",{preferences:{recipe_settings:this._settings}}),this._error=null}catch(i){this._error=this._settings.language==="de"?i.code==="uncertain"?"Speicherstatus unklar. Gleiche Anfrage nur ausdr\xFCcklich erneut senden.":i.code==="pending"?"Zuerst die unklare Anfrage kl\xE4ren.":"Einstellungen konnten nicht gespeichert werden. Felder und Berechtigungen pr\xFCfen.":i.message}}async _toggleGlobalWakeLock(){y()&&(this._globalWakeActive?(await D(Y),this._globalWakeActive=!1):(await O(Y),this._globalWakeActive=!0))}_tickTimers(){if(!this._timers.length)return;let e=!1,t=[],i=Date.now()/1e3,a=this._timers.map(n=>{if(n.alarming||!n.running)return n;let o=n.global?Math.max(0,n.duration-(i-n.start_time)):n.remaining-1;if(e=!0,o<=0){if(n.presetId)return{...n,remaining:0,running:!1,alarming:!0};t.push({id:n.id,label:n.label})}return{...n,remaining:Math.round(o),running:o>0}});e&&(this._timers=a),t.length&&(this._timerAlarm||(this._timerAlarm=t.shift(),this._startAlarmLoop(this._settings.timerSound??"beep",this._settings.timerSoundFile)),t.length&&(this._timerAlarmQueue=[...this._timerAlarmQueue,...t]))}async _startTimer(e,t,i=null,a=!1){if(!Number.isFinite(e)||e<=0||e>604800||t&&String(t).length>300)return;let n=t||r(p`${Math.floor(e/60)} min timer`);if(a&&this._api)try{let c=Date.now()/1e3;await this._api.addGlobalTimer({label:n,duration:e,start_time:c,running:!0,paused_remaining:null,...i?{preset_id:i}:{}}),await this._loadGlobalTimers();return}catch(c){this._error=c.message;return}let o=crypto.randomUUID();this._timers=[...this._timers,{id:o,label:n,total:e,remaining:e,running:!0,presetId:i||null}]}async _stopTimer(e){if(this._timers.find(i=>i.id===e)?.global){try{await this._api.deleteGlobalTimer(e),await this._loadGlobalTimers()}catch(i){this._error=i.message}return}this._timers=this._timers.filter(i=>i.id!==e)}async _pauseTimer(e){let t=this._timers.find(i=>i.id===e);if(t){if(t.global){try{await this._api.updateGlobalTimer(e,t.running?{running:!1,paused_remaining:t.remaining}:{running:!0,start_time:Date.now()/1e3-(t.duration-t.remaining),paused_remaining:null}),await this._loadGlobalTimers()}catch(i){this._error=i.message}return}this._timers=this._timers.map(i=>i.id===e?{...i,running:!i.running}:i)}}async _addTimeToTimer(e,t){let i=this._timers.find(a=>a.id===e);if(i){if(i.global){try{await this._api.updateGlobalTimer(e,{duration:i.duration+t,running:!0,start_time:Date.now()/1e3-(i.duration-i.remaining),paused_remaining:null}),await this._loadGlobalTimers()}catch(a){this._error=a.message}return}this._timers=this._timers.map(a=>a.id===e?{...a,total:a.total+t,remaining:a.remaining+t,running:!0,alarming:!1}:a)}}_dismissAlarm(){this._timerAlarm&&(this._stopAlarmLoop(),this._stopTimer(this._timerAlarm.id),this._timerAlarm=this._timerAlarmQueue.length?this._timerAlarmQueue.shift():null,this._timerAlarm&&this._startAlarmLoop(this._settings.timerSound??"beep",this._settings.timerSoundFile))}async _loadPresets(){let e=await this.transport.call("timer_presets_get");this._timerPresets=e.presets||[]}async _addPresetTimer(){let e=this._presetNameInput.trim(),t=Number(this._presetMinsInput);if(!(!e||!Number.isFinite(t)||t<=0))try{await this.transport.call("timer_presets_add",{name:e,seconds:Math.round(t*60)}),await this._loadPresets(),this._presetNameInput="",this._presetMinsInput=""}catch(i){this._error=i.message}}async _removePreset(e){try{await this.transport.call("timer_presets_delete",{preset_id:e}),await this._loadPresets()}catch(t){this._error=t.message}}_startAlarmLoop(e,t){if(this._stopAlarmLoop(),e!=="none"&&!(e==="file"&&(typeof t!="string"||t.length>2e6||!/^data:audio\/[a-z0-9.+-]+;base64,[A-Za-z0-9+/]*={0,2}$/.test(t))))if(e==="file"&&t){this._alarmLoopActive=!0;let i=()=>{this._alarmLoopActive&&(this._alarmAudio=new Audio(t),this._alarmAudio.onended=()=>{this._alarmLoopActive&&(this._alarmTimeout=setTimeout(i,2e3))},this._alarmAudio.onerror=()=>{this._alarmLoopActive&&(this._alarmTimeout=setTimeout(()=>te("beep"),2e3))},this._alarmAudio.play().catch(()=>{}))};i()}else te(e),this._alarmInterval=setInterval(()=>te(e),4e3)}_stopAlarmLoop(){this._alarmLoopActive=!1,this._alarmInterval&&(clearInterval(this._alarmInterval),this._alarmInterval=null),this._alarmTimeout&&(clearTimeout(this._alarmTimeout),this._alarmTimeout=null),this._alarmAudio&&(this._alarmAudio.pause(),this._alarmAudio.onended=null,this._alarmAudio.onerror=null,this._alarmAudio=null)}_handleStartTimer(e){let{seconds:t,label:i}=e.detail;this._startTimer(t,i,null,this._globalMode)}_handleSearch(e){this._searchQuery=e.detail?.query??""}_handleTagFilter(e){let t=e.detail?.tag;this._activeTag=this._activeTag===t?null:t}_handleChipNav(e){let{filterMode:t,value:i}=e.detail;this._navDirection="back",t==="tags"?(this._activeTag=i,this._gridFilterPreset=null):(this._activeTag=null,this._gridFilterPreset={filterMode:t,selectedValues:[i]}),this._view="grid"}_handleBack(){this._closingDetail||(this._view==="detail"&&this._selectedRecipe&&!this._closingDetail?(this._closingDetail=!0,this._view="grid",window.matchMedia("(prefers-reduced-motion: reduce)").matches&&(this._closingDetail=!1,this._selectedRecipe=null)):(this._navDirection="back",this._view="grid",this._selectedRecipe=null,this._closingDetail=!1))}_onDetailTransitionEnd(e){e.target===e.currentTarget&&e.propertyName==="transform"&&this._closingDetail&&(this._closingDetail=!1,this._selectedRecipe=null)}_handleShowGrid(){if(!this.hass.user.is_admin){this._view="nutrition";return}this._navDirection="back",this._view="grid",this._selectedRecipe=null}_handleShowPlanner(){this._plannerFromRecipe=this._selectedRecipe||null,this._navDirection="forward",this._view="planner"}_handleBackToRecipe(){this._plannerFromRecipe&&(this._selectedRecipe=this._plannerFromRecipe,this._plannerFromRecipe=null,this._navDirection="back",this._view="detail")}_handleOpenRecipe(e){let t=this.shadowRoot?.querySelector("rm-recipe-grid");if(t){let a=t.shadowRoot?.querySelector(".grid-scroll");this._gridScrollPos=a?.scrollTop??0}let i=e.detail?.recipe;if(this._closingDetail=!1,this._navDirection="forward",this._selectedRecipe=i,this._view="detail",i?.id){let a=[i.id,...this._recentRecipeIds.filter(n=>n!==i.id)].slice(0,50);this._recentRecipeIds=a}}async _handleToggleFavourite(e){try{let{recipeId:t}=e.detail;await this._api.toggleFavourite(t),await this._loadRecipes(),this._selectedRecipe?.id===t&&(this._selectedRecipe=this._recipes.find(i=>i.id===t)??this._selectedRecipe)}catch{}}async _handleDeleteRecipe(e){try{await this._api.deleteRecipe(e.detail.recipeId),await this._loadRecipes(),await this._loadTags(),this._navDirection="back",this._view="grid",this._selectedRecipe=null}catch{}}async _handleUpdateRecipe(e){try{let{recipeId:t,data:i}=e.detail;await this._api.updateRecipe(t,i),await this._loadRecipes(),await this._loadTags(),this._selectedRecipe?.id===t&&(this._selectedRecipe=this._recipes.find(a=>a.id===t)??null)}catch{}}_renderStars(e){let t=e||0,i=this._hdrStarHover,a=i>0?i:t;return s`
      <div
        class="header-stars"
        @mouseleave=${()=>{this._hdrStarHover=0}}
        title="${i>0?r(p`Set rating: ${i}★`):t>0?r(p`Rating: ${t}★ — click to change`):r("Click to rate")}"
      >
        ${[1,2,3,4,5].map(n=>s`
            <button
              class="hdr-star ${n<=a?"filled":""}"
              aria-label=${r(p`Set rating: ${n}★`)}
              aria-pressed=${n===t}
              @mouseover=${()=>{this._hdrStarHover=n}}
              @click=${()=>this._handleRateRecipe(n)}
            >
              ★
            </button>
          `)}
      </div>
    `}async _handleRateRecipe(e){try{if(!this._selectedRecipe)return;let t=this._selectedRecipe.rating===e?null:e;this._hdrStarHover=0,await this._handleUpdateRecipe({detail:{recipeId:this._selectedRecipe.id,data:{rating:t}}})}catch{}}_renderSidebar(){if(!this.hass?.user?.is_admin)return s`<nav class="rm-sidebar">
        <div class="sb-nav">
          <button
            class="sb-item"
            @click=${()=>{this._view="nutrition"}}
          >
            ${this.hass.language==="de"?"Ern\xE4hrung":"Nutrition"}</button
          ><button
            class="sb-item"
            @click=${()=>{this._view="settings"}}
          >
            ${r("Settings")}
          </button>
        </div>
      </nav>`;let e=this._view,t=this._sidebarCollapsed,i=(a,n,o,c=!1,d=null)=>s`
      <button
        class="sb-item ${e===o?"active":""} ${c?"placeholder":""}"
        title="${c?r(p`${n} — coming soon`):n}"
        @click=${c?void 0:d||(()=>{this._navDirection="forward",this._view=o,this._selectedRecipe=null})}
        ?disabled=${c}
      >
        <ha-icon icon="${a}"></ha-icon>
        ${t?"":s`<span>${n}</span>`}
      </button>
    `;return s`
      <nav class="rm-sidebar ${t?"collapsed":""}">
        <div class="sb-top">
          <div class="sb-logo-row">
            <button
              class="sb-collapse-btn"
              @click=${()=>{this._sidebarCollapsed=!this._sidebarCollapsed}}
              title="${t?r("Expand sidebar"):r("Collapse sidebar")}"
            >
              <ha-icon
                icon="${t?"mdi:menu-close":"mdi:menu-open"}"
              ></ha-icon>
            </button>
          </div>

          ${t?"":s`
                <div class="sb-search">
                  <ha-icon icon="mdi:magnify" class="sb-search-icon"></ha-icon>
                  <input
                    class="sb-search-input"
                    type="text"
                    placeholder="${r("Search\u2026")}"
                    .value=${this._searchQuery}
                    @input=${a=>{this._searchQuery=a.target.value,this._navDirection="back",this._view="grid"}}
                  />
                  ${this._searchQuery?s`
                        <button
                          class="sb-search-clear"
                          @click=${()=>{this._searchQuery=""}}
                        >
                          <ha-icon icon="mdi:close"></ha-icon>
                        </button>
                      `:""}
                </div>
              `}
        </div>

        <div class="sb-nav">
          ${i("mdi:home",r("Home"),"grid")}
          ${i("mdi:heart-pulse",this._settings.language==="de"?"Ern\xE4hrung":"Nutrition","nutrition")}
          ${this._settings.showPlanner?i("mdi:calendar-week",r("Meal Planner"),"planner",!1,()=>{this._plannerFromRecipe=null,this._navDirection="forward",this._view="planner",this._selectedRecipe=null}):""}
          ${i("mdi:book-open-variant",r("Cookbook"),"cookbook",!0)}
          <button
            class="sb-item ${e==="timers"?"active":""}"
            title="${r("Timers")}"
            @click=${()=>{this._timersPrevView=this._view,this._view="timers"}}
          >
            <ha-icon icon="mdi:timer-outline"></ha-icon>
            ${t?"":s`<span>${r("Timers")}</span>`}
            ${this._timers.length?s`<span class="sb-timer-badge">${this._timers.length}</span>`:""}
          </button>
        </div>

        <div class="sb-bottom">
          <button
            class="sb-item placeholder"
            disabled
            title="${r("Sync \u2014 coming soon")}"
          >
            <ha-icon icon="mdi:cloud-sync-outline"></ha-icon>${t?"":s`<span>${r("Sync")}</span>`}
          </button>
          <button
            class="sb-item placeholder"
            disabled
            title="${r("Help \u2014 coming soon")}"
          >
            <ha-icon icon="mdi:help-circle-outline"></ha-icon>${t?"":s`<span>${r("Help")}</span>`}
          </button>
          <button
            class="sb-item ${e==="settings"?"active":""}"
            @click=${()=>{this._view="settings"}}
          >
            <ha-icon icon="mdi:cog-outline"></ha-icon>${t?"":s`<span>${r("Settings")}</span>`}
          </button>
        </div>
      </nav>
    `}_renderHeader(){let e=(this._view==="detail"||this._closingDetail)&&this._selectedRecipe,t=this._view==="settings",i=this._view==="timers",a=this._wide,n=t?r("Settings"):i?r("Timers"):e?"":this._view==="planner"?r("Meal Planner"):this._view==="nutrition"?this._settings.language==="de"?"Ern\xE4hrung":"Nutrition":r("Recipes");return s`
      <div class="rm-header">
        <div class="rm-header-left">
          ${e?s`
                <button
                  class="icon-btn"
                  @click=${this._handleBack}
                  title="${r("Back")}"
                >
                  <ha-icon icon="mdi:arrow-left"></ha-icon>
                </button>
              `:i&&this._timersPrevView==="detail"?s`
                  <button
                    class="icon-btn"
                    @click=${()=>{this._navDirection="back",this._view="detail",this._timersPrevView=null}}
                    title="${r("Back to recipe")}"
                  >
                    <ha-icon icon="mdi:arrow-left"></ha-icon>
                  </button>
                `:!a&&this._view!=="grid"&&!t&&!i?s`
                    <button
                      class="icon-btn"
                      aria-label=${r("Back")}
                      @click=${this._handleShowGrid}
                    >
                      <ha-icon icon="mdi:arrow-left"></ha-icon>
                    </button>
                  `:""}
          <div class="rm-title">
            <ha-icon icon="mdi:chef-hat"></ha-icon>
            <span>${n}</span>
          </div>
        </div>

        <div class="rm-header-right">
          <!-- Timer pills (compact, shown when timers are running, not in timer view) -->
          ${this._timers.length&&this._view!=="timers"?s`
                <button
                  class="timer-pills"
                  aria-label=${r("Timers")}
                  @click=${()=>{this._navDirection="forward",this._timersPrevView=this._view,this._view="timers"}}
                >
                  ${this._timers.slice(0,3).map(o=>s`
                      <div class="timer-pill ${o.running?"":"paused"}">
                        <ha-icon icon="mdi:timer-outline"></ha-icon>
                        <span>${ee(o.remaining)}</span>
                      </div>
                    `)}
                  ${this._timers.length>3?s`<span class="timer-more"
                        >+${this._timers.length-3}</span
                      >`:""}
                </button>
              `:""}
          ${e?this._renderStars(this._selectedRecipe.rating):""}

          <button
            class="icon-btn wake-toggle-btn ${this._globalWakeActive?"active":""}"
            @click=${this._toggleGlobalWakeLock}
            ?disabled=${!y()}
            title="${y()?this._globalWakeActive?r("Screen awake \u2014 click to allow sleep"):r("Keep screen awake"):r("Keep screen awake \u2014 requires a secure (HTTPS) connection and a supported browser")}"
          >
            <ha-icon
              icon="${this._globalWakeActive?"mdi:eye":"mdi:eye-off-outline"}"
            ></ha-icon>
          </button>

          ${t||i?s`
                <button
                  class="icon-btn"
                  aria-label=${r("Close")}
                  @click=${this._handleShowGrid}
                >
                  <ha-icon icon="mdi:close"></ha-icon>
                </button>
              `:a?"":s`
                  <button
                    class="icon-btn"
                    @click=${()=>{this._mobileMenuOpen=!this._mobileMenuOpen}}
                    title="${this._mobileMenuOpen?r("Close menu"):r("Menu")}"
                  >
                    <ha-icon
                      icon="${this._mobileMenuOpen?"mdi:close":"mdi:menu"}"
                    ></ha-icon>
                  </button>
                `}
        </div>
      </div>
    `}_renderBody(){let e=this._settings;if(this._view==="nutrition")return s`<mm-nutrition .hass=${this.hass}></mm-nutrition>`;if(this._view==="settings")return s`
        <rm-settings-view
          .hass=${this.hass}
          .settings=${e}
          @rm-settings-change=${this._handleSettingsChange}
        ></rm-settings-view>
      `;if(this._view==="timers")return this._renderTimersView();if(this._view==="planner")return s`
        <rm-meal-planner
          .api=${this._api}
          .recipes=${this._recipes}
          .fromRecipe=${this._plannerFromRecipe}
          .settings=${e}
          @rm-open-recipe=${this._handleOpenRecipe}
          @rm-back-to-recipe=${this._handleBackToRecipe}
        ></rm-meal-planner>
      `;if(this._loading)return s`
        <div class="rm-loading">
          <ha-circular-progress active size="large"></ha-circular-progress>
        </div>
      `;if(this._error)return s`
        <div class="rm-error">
          <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
          <p>${this._error}</p>
          <button class="text-btn" @click=${this._init.bind(this)}>
            ${r("Retry")}
          </button>
        </div>
      `;let t=(this._view==="detail"||this._closingDetail)&&this._selectedRecipe;return s`
      <div
        class="rm-slide-track ${this._view==="detail"?"show-detail":""}"
        @transitionend=${this._onDetailTransitionEnd}
      >
        <div class="rm-slide-pane">
          <rm-recipe-grid
            .recipes=${this._filteredRecipes}
            .allRecipes=${this._recipes}
            .tags=${this._tags}
            .searchQuery=${this._searchQuery}
            .activeTag=${this._activeTag}
            .columns=${e.columns}
            .showFavourites=${e.showFavourites}
            .hideSidebar=${this._wide}
            .scrollPos=${this._gridScrollPos}
            .recentRecipes=${this._recentRecipes}
            .recentCount=${e.recentCount??12}
            .filterPreset=${this._gridFilterPreset}
            @rm-search=${this._handleSearch}
            @rm-tag-filter=${this._handleTagFilter}
            @rm-open-recipe=${this._handleOpenRecipe}
            @rm-toggle-favourite=${this._handleToggleFavourite}
          ></rm-recipe-grid>
        </div>
        <div class="rm-slide-pane">
          ${t?s`
                <rm-recipe-detail
                  .recipe=${this._selectedRecipe}
                  .api=${this._api}
                  .settings=${e}
                  .wide=${this._wide}
                  .allTags=${this._tags||[]}
                  .allCourses=${[...new Set(this._recipes.flatMap(i=>i.courses||[]))].sort()}
                  .allCategories=${[...new Set(this._recipes.flatMap(i=>i.categories||[]))].sort()}
                  .allCollections=${[...new Set(this._recipes.flatMap(i=>i.collections||[]))].sort()}
                  @rm-back=${this._handleBack}
                  @rm-toggle-favourite=${this._handleToggleFavourite}
                  @rm-delete-recipe=${this._handleDeleteRecipe}
                  @rm-update-recipe=${this._handleUpdateRecipe}
                  @rm-recipe-saved=${async()=>{await this._loadRecipes(),this._selectedRecipe=this._recipes.find(i=>i.id===this._selectedRecipe?.id)||null}}
                  @rm-start-timer=${this._handleStartTimer}
                  @rm-show-planner=${this._handleShowPlanner}
                  @rm-chip-nav=${this._handleChipNav}
                ></rm-recipe-detail>
              `:""}
        </div>
      </div>
    `}_renderTimersView(){let e=this._customTimerInput.trim(),t=this._presetNameInput.trim()&&this._presetMinsInput.trim(),i=[{label:"+30s",secs:30},{label:"+1m",secs:60},{label:"+5m",secs:300},{label:"+10m",secs:600}],a=this._timers.filter(o=>!o.presetId),n=263.9;return s`
      <div class="timers-view">
        <!-- Active timers (non-preset): horizontal wrap of square arc tiles -->
        ${a.length?s`
              <div class="timer-list">
                ${a.map(o=>{let c=o.remaining<60?"var(--rm-ochre)":"var(--rm-accent)",d=n*(1-o.remaining/o.total);return s`
                    <div class="timer-card">
                      <button
                        class="preset-remove"
                        @click=${()=>this._stopTimer(o.id)}
                        title="${r("Remove")}"
                      >
                        <ha-icon icon="mdi:close"></ha-icon>
                      </button>
                      ${o.global?s`<ha-icon
                            class="timer-global-badge"
                            icon="mdi:earth"
                            title="${r("Global timer")}"
                          ></ha-icon>`:""}
                      <span class="timer-card-name">${o.label}</span>
                      <div class="preset-arc-wrap">
                        <svg viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="42"
                            fill="none"
                            stroke="var(--rm-border)"
                            stroke-width="6"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="42"
                            fill="none"
                            stroke="${c}"
                            stroke-width="6"
                            stroke-linecap="round"
                            stroke-dasharray="${n}"
                            stroke-dashoffset="${d}"
                            transform="rotate(-90 50 50)"
                            style="transition: stroke-dashoffset 0.8s linear, stroke 0.3s;"
                          />
                        </svg>
                        <div class="preset-arc-center">
                          <span class="preset-arc-time"
                            >${ee(o.remaining)}</span
                          >
                        </div>
                      </div>
                      <div class="preset-arc-btns">
                        <button
                          class="timer-ctrl-btn"
                          @click=${()=>this._pauseTimer(o.id)}
                          title="${o.running?r("Pause"):r("Resume")}"
                        >
                          <ha-icon
                            icon="${o.running?"mdi:pause":"mdi:play"}"
                          ></ha-icon>
                        </button>
                        <button
                          class="timer-ctrl-btn danger"
                          @click=${()=>this._stopTimer(o.id)}
                          title="${r("Stop")}"
                        >
                          <ha-icon icon="mdi:stop"></ha-icon>
                        </button>
                      </div>
                    </div>
                  `})}
              </div>
            `:s`
              <div class="timer-empty">
                <ha-icon icon="mdi:timer-off-outline"></ha-icon>
                <p>${r("No active timers.")}</p>
                <p class="timer-empty-hint">
                  ${r("Tap a highlighted time in a recipe's directions to start one.")}
                </p>
              </div>
            `}

        <!-- Spacer pushes add+presets to bottom -->
        <div style="flex:1"></div>

        <!-- Add timer section -->
        <div class="timer-add-section">
          <div class="timer-add-header">
            <span class="timer-add-title">${r("Add Timer")}</span>
            <label
              class="timer-global-toggle ${this._globalMode?"active":""}"
              title="${r("Sync timer across all devices via Home Assistant")}"
            >
              <input
                type="checkbox"
                .checked=${this._globalMode}
                @change=${o=>{this._globalMode=o.target.checked}}
              />
              <ha-icon icon="mdi:earth"></ha-icon>
              ${r("Global")}
            </label>
          </div>

          <div class="timer-add-group">
            <div class="timer-add-group-label">${r("Quick start")}</div>
            <div class="timer-add-row">
              <input
                type="text"
                class="timer-input"
                placeholder="${r("Label (optional)")}"
                .value=${this._quickTimerLabel}
                @input=${o=>{this._quickTimerLabel=o.target.value}}
                @keydown=${o=>{o.key==="Enter"&&e&&(this._startTimer(Math.round(parseFloat(this._customTimerInput)*60),this._quickTimerLabel.trim()||null,null,this._globalMode),this._customTimerInput="",this._quickTimerLabel="")}}
              />
              <input
                type="number"
                class="timer-input timer-mins-input"
                placeholder="${r("min")}"
                min="0.5"
                step="0.5"
                .value=${this._customTimerInput}
                @input=${o=>{this._customTimerInput=o.target.value}}
                @keydown=${o=>{o.key==="Enter"&&e&&(this._startTimer(Math.round(parseFloat(this._customTimerInput)*60),this._quickTimerLabel.trim()||null,null,this._globalMode),this._customTimerInput="",this._quickTimerLabel="")}}
              />
              <button
                class="action-btn primary"
                ?disabled=${!e}
                @click=${()=>{this._startTimer(Math.round(parseFloat(this._customTimerInput)*60),this._quickTimerLabel.trim()||null,null,this._globalMode),this._customTimerInput="",this._quickTimerLabel=""}}
              >
                <ha-icon icon="mdi:play" style="--mdc-icon-size:14px"></ha-icon>
                ${r("Start")}
              </button>
            </div>
          </div>

          <div class="timer-add-group">
            <div class="timer-add-group-label">${r("Save preset")}</div>
            <div class="timer-add-row">
              <input
                type="text"
                class="timer-input"
                placeholder="${r("Preset name")}"
                .value=${this._presetNameInput}
                @input=${o=>{this._presetNameInput=o.target.value}}
                @keydown=${o=>{o.key==="Enter"&&this._addPresetTimer()}}
              />
              <input
                type="number"
                class="timer-input timer-mins-input"
                placeholder="${r("min")}"
                min="0.5"
                step="0.5"
                .value=${this._presetMinsInput}
                @input=${o=>{this._presetMinsInput=o.target.value}}
                @keydown=${o=>{o.key==="Enter"&&this._addPresetTimer()}}
              />
              <button
                class="action-btn"
                ?disabled=${!t}
                @click=${this._addPresetTimer}
              >
                ${r("+ Preset")}
              </button>
            </div>
          </div>
        </div>

        <!-- Preset timers grid (bottom) -->
        ${this._timerPresets.length?s`
              <div class="timer-presets-grid">
                ${this._timerPresets.map(o=>{let c=this._timers.find(j=>j.presetId===o.id),d=c&&c.running,m=c&&c.alarming,u=c?c.remaining:o.seconds,T=c?c.total:o.seconds,g=m?"var(--rm-error)":u<60&&c?"var(--rm-ochre)":"var(--rm-accent)",re=m?0:c?n*(1-u/T):n;return s`
                    <div
                      class="timer-preset-card ${m?"alarming":""}"
                    >
                      <button
                        class="preset-remove"
                        @click=${()=>{c&&this._stopTimer(c.id),this._removePreset(o.id)}}
                        title="${r("Remove")}"
                      >
                        <ha-icon icon="mdi:close"></ha-icon>
                      </button>
                      <span class="preset-arc-name">${o.name}</span>
                      <div class="preset-arc-wrap">
                        <svg viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="44"
                            fill="none"
                            stroke="var(--rm-border)"
                            stroke-width="7"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="44"
                            fill="none"
                            stroke="${g}"
                            stroke-width="7"
                            stroke-linecap="round"
                            stroke-dasharray="${n}"
                            stroke-dashoffset="${re}"
                            transform="rotate(-90 50 50)"
                            style="transition: stroke-dashoffset 0.8s linear, stroke 0.3s;"
                          />
                        </svg>
                        <div class="preset-arc-center">
                          ${m?s`
                                <span
                                  class="preset-arc-time"
                                  style="color:var(--rm-error)"
                                  >${r("Done!")}</span
                                >
                              `:s`
                                <span class="preset-arc-time"
                                  >${ee(u)}</span
                                >
                              `}
                        </div>
                      </div>
                      <div class="preset-arc-btns">
                        ${m?s`
                              <button
                                class="preset-arc-btn"
                                @click=${()=>this._addTimeToTimer(c.id,30)}
                              >
                                ${r("+30s")}
                              </button>
                              <button
                                class="preset-arc-btn"
                                @click=${()=>this._addTimeToTimer(c.id,60)}
                              >
                                ${r("+1m")}
                              </button>
                              <button
                                class="preset-arc-btn"
                                @click=${()=>this._addTimeToTimer(c.id,300)}
                              >
                                ${r("+5m")}
                              </button>
                              <button
                                class="preset-arc-btn stop"
                                @click=${()=>this._stopTimer(c.id)}
                              >
                                ${r("Stop")}
                              </button>
                            `:d?s`
                                <button
                                  class="preset-arc-btn"
                                  @click=${()=>this._addTimeToTimer(c.id,30)}
                                >
                                  ${r("+30s")}
                                </button>
                                <button
                                  class="preset-arc-btn"
                                  @click=${()=>this._addTimeToTimer(c.id,60)}
                                >
                                  ${r("+1m")}
                                </button>
                                <button
                                  class="preset-arc-btn"
                                  @click=${()=>this._pauseTimer(c.id)}
                                >
                                  <ha-icon
                                    icon="mdi:pause"
                                    style="--mdc-icon-size:12px;vertical-align:middle"
                                  ></ha-icon>
                                </button>
                                <button
                                  class="preset-arc-btn stop"
                                  @click=${()=>this._stopTimer(c.id)}
                                >
                                  ${r("Stop")}
                                </button>
                              `:c?s`
                                  <button
                                    class="preset-arc-btn"
                                    @click=${()=>this._pauseTimer(c.id)}
                                  >
                                    ${r("Resume")}
                                  </button>
                                  <button
                                    class="preset-arc-btn stop"
                                    @click=${()=>this._stopTimer(c.id)}
                                  >
                                    ${r("Stop")}
                                  </button>
                                `:s`
                                  <button
                                    class="preset-arc-btn play"
                                    @click=${()=>this._startTimer(o.seconds,o.name,o.id)}
                                  >
                                    <ha-icon
                                      icon="mdi:play"
                                      style="--mdc-icon-size:14px;vertical-align:middle"
                                    ></ha-icon>
                                    ${r("Start")}
                                  </button>
                                `}
                      </div>
                    </div>
                  `})}
              </div>
            `:""}
      </div>
    `}_renderTimerAlarm(){let e=this._timerAlarm;return e?s`
      <div class="alarm-overlay">
        <div class="alarm-bubble">
          <ha-icon icon="mdi:alarm" class="alarm-icon"></ha-icon>
          <div class="alarm-label">${e.label}</div>
          <div class="alarm-sub">${r("Timer complete!")}</div>
          <div class="alarm-btns">
            <button
              class="alarm-btn"
              @click=${()=>this._addTimeToTimer(e.id,30)}
            >
              ${r("+30s")}
            </button>
            <button
              class="alarm-btn"
              @click=${()=>this._addTimeToTimer(e.id,60)}
            >
              ${r("+1 min")}
            </button>
            <button
              class="alarm-btn"
              @click=${()=>this._addTimeToTimer(e.id,300)}
            >
              ${r("+5 min")}
            </button>
            <button
              class="alarm-btn"
              @click=${()=>this._addTimeToTimer(e.id,600)}
            >
              ${r("+10 min")}
            </button>
            <div class="alarm-custom-row">
              <input
                type="number"
                class="alarm-custom-input"
                placeholder="${r("min")}"
                min="1"
                .value=${this._alarmAddInput}
                @input=${t=>{this._alarmAddInput=t.target.value}}
                @keydown=${t=>{if(t.key==="Enter"&&this._alarmAddInput){let i=parseInt(this._alarmAddInput);i>0&&this._addTimeToTimer(e.id,i*60),this._alarmAddInput=""}}}
              />
              <button
                class="alarm-btn accent"
                ?disabled=${!this._alarmAddInput}
                @click=${()=>{let t=parseInt(this._alarmAddInput);t>0&&this._addTimeToTimer(e.id,t*60),this._alarmAddInput=""}}
              >
                ${r("+min")}
              </button>
            </div>
            <button class="alarm-btn stop" @click=${this._dismissAlarm}>
              ${r("Stop")}
            </button>
          </div>
        </div>
      </div>
    `:""}_renderBottomNav(){if(!this.hass?.user?.is_admin)return s`<nav class="rm-bottom-nav">
        <button
          class="rm-bn-btn"
          @click=${()=>{this._view="nutrition"}}
        >
          ${this.hass.language==="de"?"Ern\xE4hrung":"Nutrition"}</button
        ><button
          class="rm-bn-btn"
          @click=${()=>{this._view="settings"}}
        >
          ${r("Settings")}
        </button>
      </nav>`;let e=this._view,t=(i,a,n,o)=>s`
      <button
        class="rm-bn-btn ${e===n?"active":""}"
        @click=${o||(()=>{this._navDirection="forward",this._view=n,this._selectedRecipe=null})}
        title="${a}"
      >
        <ha-icon icon="${i}"></ha-icon>
        <span>${a}</span>
      </button>
    `;return s`
      <nav class="rm-bottom-nav">
        ${t("mdi:home",r("Home"),"grid",()=>{this._navDirection="back",this._view="grid",this._selectedRecipe=null})}
        ${t("mdi:heart-pulse",this._settings.language==="de"?"Ern\xE4hrung":"Nutrition","nutrition")}
        ${t("mdi:calendar-week",r("Planner"),"planner",()=>{this._plannerFromRecipe=null,this._navDirection="forward",this._view="planner",this._selectedRecipe=null})}
        <button
          class="rm-bn-btn ${e==="timers"?"active":""}"
          @click=${()=>{this._navDirection="forward",this._timersPrevView=this._view,this._view="timers"}}
          title="${r("Timers")}"
        >
          <ha-icon icon="mdi:timer-outline"></ha-icon>
          <span>${r("Timers")}</span>
          ${this._timers.length?s`<span class="rm-bn-badge">${this._timers.length}</span>`:""}
        </button>
      </nav>
    `}_renderMobileMenu(){return s`
      <div
        class="rm-mobile-overlay"
        @click=${()=>{this._mobileMenuOpen=!1}}
      >
        <nav class="rm-mobile-menu" @click=${e=>e.stopPropagation()}>
          <div class="rm-mm-header">
            <ha-icon icon="mdi:chef-hat" class="rm-mm-logo"></ha-icon>
            <span class="rm-mm-title">${r("Recipes")}</span>
            <button
              class="icon-btn"
              @click=${()=>{this._mobileMenuOpen=!1}}
            >
              <ha-icon icon="mdi:close"></ha-icon>
            </button>
          </div>
          <div class="rm-mm-items">
            <button
              class="rm-mm-item"
              @click=${()=>{this._view="settings",this._mobileMenuOpen=!1}}
            >
              <ha-icon icon="mdi:cog-outline"></ha-icon>
              <span>${r("Settings")}</span>
            </button>
            <button class="rm-mm-item" disabled>
              <ha-icon icon="mdi:help-circle-outline"></ha-icon>
              <span>${r("Help")}</span>
              <span class="rm-mm-soon">${r("Soon")}</span>
            </button>
          </div>
        </nav>
      </div>
    `}render(){let e=this._wide;return s`
      <ha-card class="rm-card ${e?"rm-wide":""}">
        ${e?this._renderSidebar():""}
        <div class="rm-main">
          ${this._renderHeader()}
          <div class="rm-body" data-nav="${this._navDirection}">
            ${this._renderBody()}
          </div>
          ${e?"":this._renderBottomNav()}
        </div>

        ${!e&&this._mobileMenuOpen?this._renderMobileMenu():""}

        <!-- Timer alarm modal -->
        ${this._timerAlarm?this._renderTimerAlarm():""}
      </ha-card>
    `}static styles=b`
    :host {
      display: block;
      height: 100vh;
      height: calc(var(--vh, 1vh) * 100);
      max-height: -webkit-fill-available;
      --rm-bg-main: #f9efda;
      --rm-bg-surface: rgba(253, 248, 239, 0.72);
      --rm-bg-elevated: #fdf8ef;
      --rm-text: #263b47;
      --rm-text-secondary: #53666e;
      --rm-text-muted: #53666e;
      --rm-accent: #dccdb8;
      --rm-accent-soft: #efe3ce;
      --rm-border: #c5cbc7;
      --rm-shadow: 0 8px 28px rgba(35, 59, 71, 0.08);
      --rm-radius: 18px;
      --rm-radius-sm: 12px;
      --rm-font-size-base: 16px;
      --rm-grid-columns: repeat(3, minmax(0, 1fr));
      font-size: var(--rm-font-size-base);
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: antialiased;
    }

    button,
    select {
      min-height: var(--rm-touch-target, 44px);
    }

    ha-card {
      height: 100%;
      display: flex;
      flex-direction: column;
      padding: 0;
      margin: 0;
      overflow: hidden;
      position: relative;
      background: var(--rm-bg-surface);
    }
    ha-card.rm-card {
      background: var(--rm-bg-main);
      border: 1px solid var(--rm-border);
      border-radius: var(--rm-radius-lg, 24px);
      box-shadow: var(--rm-shadow);
      overflow: hidden;
      display: flex;
      flex-direction: row;
      height: 100%;
      margin: 0;
      color: var(--rm-text);
      position: relative;
    }

    /* ── Sidebar ─────────────────────────────── */

    .rm-sidebar {
      width: 216px;
      min-width: 216px;
      display: flex;
      flex-direction: column;
      background:
        linear-gradient(var(--rm-glass-highlight), transparent),
        var(--rm-bg-surface);
      border-right: 1px solid var(--rm-border);
      overflow: hidden;
      transition:
        width 0.2s ease,
        min-width 0.2s ease;
    }

    .rm-sidebar.collapsed {
      width: 56px;
      min-width: 56px;
    }

    ha-card:not(.rm-wide) .rm-sidebar {
      display: none;
    }

    .sb-top {
      padding: 20px 12px 12px;
      flex-shrink: 0;
    }

    .sb-logo-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 2px 8px;
    }

    .sb-logo {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 700;
      font-size: 1em;
      color: var(--rm-text);
      letter-spacing: -0.025em;
      overflow: hidden;
    }
    .sb-logo ha-icon {
      --mdc-icon-size: 22px;
      flex-shrink: 0;
    }

    .sb-collapse-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--rm-text-muted);
      padding: 4px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      flex-shrink: 0;
      transition:
        background 0.15s,
        color 0.15s;
    }
    .sb-collapse-btn:hover {
      background: var(--rm-accent-soft);
      color: var(--rm-text);
    }
    .sb-collapse-btn ha-icon {
      --mdc-icon-size: 20px;
    }

    .sb-search {
      display: flex;
      align-items: center;
      background: var(--rm-bg-main);
      border-radius: 8px;
      padding: 0 8px;
      gap: 6px;
      margin-bottom: 8px;
      border: 1px solid var(--rm-border);
    }
    .sb-search-icon {
      --mdc-icon-size: 16px;
      color: var(--rm-text-muted);
      flex-shrink: 0;
    }
    .sb-search-input {
      flex: 1;
      background: none;
      border: none;
      outline: none;
      color: var(--rm-text);
      font-size: var(--rm-font-size-sm);
      padding: 7px 0;
    }
    .sb-search-input::placeholder {
      color: var(--rm-text-muted);
    }
    .sb-search-clear {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--rm-text-muted);
      padding: 2px;
      display: flex;
      align-items: center;
    }
    .sb-search-clear ha-icon {
      --mdc-icon-size: 14px;
    }

    .sb-nav {
      flex: 1;
      overflow-y: auto;
      padding: 8px 10px 12px;
      scrollbar-width: none;
    }
    .sb-nav::-webkit-scrollbar {
      display: none;
    }

    .sb-bottom {
      padding: 12px 10px 16px;
      border-top: 1px solid var(--rm-border);
    }

    .sb-item {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      padding: 9px 10px;
      background: none;
      border: none;
      border-radius: var(--rm-radius-sm);
      font-size: var(--rm-font-size-sm);
      color: var(--rm-text-secondary);
      cursor: pointer;
      text-align: left;
      transition:
        background 0.12s,
        color 0.12s;
      position: relative;
    }
    .rm-sidebar.collapsed .sb-item {
      justify-content: center;
      padding: 10px 6px;
    }
    .sb-item ha-icon {
      --mdc-icon-size: 20px;
      flex-shrink: 0;
    }
    .sb-item:hover:not(:disabled) {
      background: var(--rm-accent-soft);
      color: var(--rm-text);
    }
    .sb-item.active {
      background: var(--rm-accent-soft);
      color: var(--rm-accent-ink, var(--rm-text));
      font-weight: 600;
    }
    .sb-item.placeholder {
      opacity: 0.4;
      cursor: default;
    }

    .sb-timer-badge {
      margin-left: auto;
      background: var(--rm-accent);
      color: var(--rm-accent-text, #fff);
      border-radius: 10px;
      font-size: var(--rm-font-size-xs);
      font-weight: 700;
      padding: 1px 6px;
      min-width: 18px;
      text-align: center;
    }
    .rm-sidebar.collapsed .sb-timer-badge {
      position: absolute;
      top: 4px;
      right: 4px;
      margin-left: 0;
      font-size: var(--rm-font-size-xs);
      padding: 1px 4px;
    }

    /* ── Main content ────────────────────────── */

    .rm-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
      overflow: hidden;
    }

    .rm-header {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      padding: 12px 20px;
      border-bottom: 1px solid var(--rm-border);
      background: var(--rm-bg-surface);
      flex-shrink: 0;
      gap: 8px;
    }

    .rm-header-left,
    .rm-header-right {
      display: flex;
      align-items: center;
      gap: 6px;
      min-width: 0;
    }
    .rm-header-left {
      flex: 1;
      min-width: 0;
    }
    .rm-header-right {
      flex-shrink: 0;
      flex-wrap: wrap;
      max-width: 100%;
      margin-left: auto;
    }

    .rm-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1.125em;
      font-weight: 700;
      color: var(--rm-text);
      overflow: hidden;
      white-space: nowrap;
      flex: 1;
      min-width: 0;
    }
    .rm-title ha-icon {
      --mdc-icon-size: 22px;
      color: var(--rm-accent-ink, var(--rm-text));
      flex-shrink: 0;
    }
    .rm-title span {
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Star rating in header */
    .header-stars {
      display: flex;
      gap: 1px;
      align-items: center;
    }
    .hdr-star {
      font-size: 20px;
      width: var(--rm-touch-target, 44px);
      padding: 0;
      border: none;
      border-radius: var(--rm-radius-sm);
      background: transparent;
      color: var(--rm-text-secondary);
      line-height: 1;
      cursor: pointer;
      transition:
        color 0.1s,
        transform 0.1s;
      -webkit-text-stroke: 1px currentColor;
    }
    .hdr-star:hover {
      transform: scale(1.2);
      color: var(--rm-warning);
    }
    .hdr-star.filled {
      color: var(--rm-warning);
      -webkit-text-stroke: 1px currentColor;
    }

    /* Timer pills */
    .timer-pills {
      display: flex;
      align-items: center;
      gap: 4px;
      cursor: pointer;
      padding: 2px;
      background: transparent;
      border: none;
      border-radius: var(--rm-radius-sm);
      min-width: 0;
      flex-wrap: wrap;
      justify-content: flex-end;
    }
    .timer-pill {
      display: flex;
      align-items: center;
      gap: 3px;
      background: var(--rm-accent-soft);
      color: var(--rm-accent-ink, var(--rm-text));
      border-radius: 10px;
      padding: 3px 8px;
      font-size: var(--rm-font-size-xs);
      font-weight: 700;
      white-space: nowrap;
    }
    .timer-pill.paused {
      background: var(--rm-bg-elevated);
      color: var(--rm-text-secondary);
      border: 1px dashed var(--rm-border-strong);
    }
    .timer-pill ha-icon {
      --mdc-icon-size: 12px;
    }
    .timer-more {
      font-size: var(--rm-font-size-xs);
      color: var(--rm-text-secondary);
      padding: 0 4px;
    }

    .rm-body {
      flex: 1;
      min-height: 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      position: relative;
    }

    .icon-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--rm-text-secondary);
      width: var(--rm-touch-target, 44px);
      height: var(--rm-touch-target, 44px);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition:
        background 0.15s,
        color 0.15s;
      padding: 0;
      flex-shrink: 0;
    }
    .icon-btn:hover {
      background: var(--rm-accent-soft);
      color: var(--rm-text);
    }
    .icon-btn:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }
    .icon-btn:disabled:hover {
      background: none;
    }
    .wake-toggle-btn.active {
      background: var(--rm-accent-soft);
      color: var(--rm-accent-ink, var(--rm-text));
    }

    .text-btn {
      background: var(--rm-accent);
      color: var(--rm-accent-text, #fff);
      border: none;
      border-radius: var(--rm-radius-sm);
      padding: 8px 16px;
      cursor: pointer;
      font-size: var(--rm-font-size-sm);
      font-weight: 500;
    }

    .rm-loading {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 200px;
    }

    .rm-error {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      gap: 12px;
      color: var(--rm-text-secondary);
      text-align: center;
    }
    .rm-error ha-icon {
      --mdc-icon-size: 48px;
      color: var(--rm-error-ink);
    }
    .rm-error p {
      margin: 0;
      font-size: var(--rm-font-size-sm);
    }

    /* ── Timers view ─────────────────────────── */

    .timers-view {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow-y: auto;
      padding: 12px 16px 16px;
      gap: 12px;
    }

    .timer-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 40px 0 24px;
      color: var(--rm-text-secondary);
      text-align: center;
      font-size: var(--rm-font-size-sm);
    }
    .timer-empty ha-icon {
      --mdc-icon-size: 48px;
      opacity: 0.35;
    }
    .timer-empty p {
      margin: 0;
    }
    .timer-empty-hint {
      font-size: var(--rm-font-size-xs) !important;
      color: var(--rm-text-muted) !important;
    }

    /* Active timer list: horizontal wrap of square arc tiles */
    .timer-list {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
    .timer-card {
      position: relative;
      width: 180px;
      height: 180px;
      background: var(--rm-bg-elevated);
      border-radius: 16px;
      border: 1px solid var(--rm-border);
      padding: 10px 8px 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      box-sizing: border-box;
    }
    .timer-card-name {
      font-size: var(--rm-font-size-xs);
      font-weight: 600;
      color: var(--rm-text);
      text-align: center;
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .timer-ctrl-btn {
      background: none;
      border: 1px solid var(--rm-border);
      border-radius: 50%;
      width: var(--rm-touch-target, 44px);
      height: var(--rm-touch-target, 44px);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--rm-text-secondary);
      padding: 0;
      transition:
        background 0.15s,
        color 0.15s;
    }
    .timer-ctrl-btn ha-icon {
      --mdc-icon-size: 14px;
    }
    .timer-ctrl-btn:hover {
      background: var(--rm-accent-soft);
      color: var(--rm-accent-ink, var(--rm-text));
    }
    .timer-ctrl-btn.danger:hover {
      background: var(--rm-error-soft);
      color: var(--rm-error-ink);
      border-color: var(--rm-error);
    }

    /* Preset timer grid: square arc tiles */
    .timer-presets-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
    .timer-preset-card {
      position: relative;
      width: 160px;
      height: 160px;
      background: var(--rm-bg-elevated);
      border: 1px solid var(--rm-border);
      border-radius: 16px;
      padding: 8px 8px 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      box-sizing: border-box;
    }
    .timer-preset-card.alarming {
      border-color: var(--rm-error);
      animation: alarm-pulse-border 0.8s ease-in-out infinite alternate;
    }
    @keyframes alarm-pulse-border {
      from {
        box-shadow: 0 0 0 0 rgba(207, 102, 121, 0);
      }
      to {
        box-shadow: 0 0 0 6px rgba(207, 102, 121, 0.3);
      }
    }
    /* Arc wrap fills available vertical space in the square tile */
    .preset-arc-wrap {
      position: relative;
      flex: 1;
      width: 100%;
      min-height: 0;
    }
    .preset-arc-wrap svg {
      width: 100%;
      height: 100%;
      display: block;
    }
    .preset-arc-center {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .preset-arc-time {
      font-size: 17px;
      font-weight: 700;
      color: var(--rm-text);
      line-height: 1;
      font-variant-numeric: tabular-nums;
    }
    .preset-arc-name {
      font-size: var(--rm-font-size-xs);
      font-weight: 600;
      color: var(--rm-text);
      text-align: center;
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .preset-arc-btns {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
      justify-content: center;
    }
    .preset-arc-btn {
      background: var(--rm-bg-main);
      border: 1px solid var(--rm-border);
      border-radius: 10px;
      padding: 2px 6px;
      font-size: var(--rm-font-size-xs);
      color: var(--rm-text-secondary);
      cursor: pointer;
      transition: all 0.15s;
    }
    .preset-arc-btn:hover {
      background: var(--rm-accent-soft);
      color: var(--rm-accent-ink, var(--rm-text));
      border-color: var(--rm-accent);
    }
    .preset-arc-btn.stop {
      color: var(--rm-error-ink);
      border-color: var(--rm-error);
    }
    .preset-arc-btn.stop:hover {
      background: var(--rm-error-soft);
    }
    .preset-arc-btn.play {
      background: var(--rm-accent);
      color: var(--rm-accent-text, #fff);
      border-color: var(--rm-accent);
      padding: 3px 12px;
      font-size: var(--rm-font-size-xs);
      border-radius: 12px;
    }
    .preset-arc-btn.play:hover {
      opacity: 0.85;
    }
    .preset-remove {
      position: absolute;
      top: 4px;
      right: 4px;
      background: none;
      border: none;
      cursor: pointer;
      color: var(--rm-text-muted);
      opacity: 0;
      padding: 2px;
      border-radius: 50%;
      transition: opacity 0.15s;
      z-index: 1;
    }
    .timer-preset-card:hover .preset-remove,
    .timer-card:hover .preset-remove,
    .preset-remove:focus-visible {
      opacity: 1;
    }
    .preset-remove ha-icon {
      --mdc-icon-size: 13px;
    }

    /* Timer add section */
    .timer-add-section {
      border-top: 1px solid var(--rm-border);
      padding-top: 12px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .timer-add-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .timer-add-title {
      font-size: var(--rm-font-size-xs);
      font-weight: 600;
      color: var(--rm-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .timer-global-toggle {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border-radius: 20px;
      border: 1px solid var(--rm-border);
      cursor: pointer;
      font-size: var(--rm-font-size-xs);
      color: var(--rm-text-muted);
      transition: all 0.15s;
      user-select: none;
    }
    .timer-global-toggle input {
      width: 16px;
      height: 16px;
      accent-color: var(--rm-accent);
    }
    .timer-global-toggle:focus-within {
      outline: 3px solid var(--rm-focus);
      outline-offset: 2px;
    }
    .timer-global-toggle ha-icon {
      --mdc-icon-size: 14px;
    }
    .timer-global-toggle.active {
      border-color: var(--rm-accent);
      color: var(--rm-accent-ink, var(--rm-text));
      background: var(--rm-accent-soft);
    }
    .timer-add-group {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    .timer-add-group-label {
      font-size: var(--rm-font-size-xs);
      font-weight: 500;
      color: var(--rm-text-muted);
    }
    .timer-add-row {
      display: flex;
      gap: 6px;
      align-items: center;
    }
    .timer-input {
      flex: 1;
      background: var(--rm-bg-elevated);
      border: 1px solid var(--rm-border);
      border-radius: 8px;
      color: var(--rm-text);
      padding: 6px 9px;
      font-size: var(--rm-font-size-sm);
      font-family: inherit;
      min-width: 0;
    }
    .timer-mins-input {
      max-width: 72px;
      flex: 0 0 72px;
    }
    .timer-input:focus {
      outline: none;
      border-color: var(--rm-accent);
    }
    .timer-global-badge {
      position: absolute;
      top: 4px;
      right: 22px;
      --mdc-icon-size: 11px;
      color: var(--rm-accent-ink, var(--rm-text));
      opacity: 0.75;
    }

    .action-btn {
      background: var(--rm-bg-elevated);
      border: 1px solid var(--rm-border);
      border-radius: 8px;
      color: var(--rm-text);
      padding: 8px 14px;
      cursor: pointer;
      font-size: var(--rm-font-size-sm);
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: background 0.15s;
    }
    .action-btn.primary {
      background: var(--rm-accent);
      border-color: var(--rm-accent);
      color: var(--rm-accent-text, #fff);
    }
    .action-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* ── Timer alarm bubble ──────────────────── */

    .alarm-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      z-index: 200;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .alarm-bubble {
      background: var(--rm-bg-surface);
      border-radius: 20px;
      padding: 28px 24px;
      text-align: center;
      max-width: 300px;
      width: calc(100% - 48px);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .alarm-icon {
      --mdc-icon-size: 52px;
      color: var(--rm-accent-ink, var(--rm-text));
      animation: alarm-pulse 0.8s ease-in-out infinite alternate;
    }

    @keyframes alarm-pulse {
      from {
        transform: scale(1);
        opacity: 1;
      }
      to {
        transform: scale(1.15);
        opacity: 0.8;
      }
    }

    .alarm-label {
      font-size: 18px;
      font-weight: 700;
      color: var(--rm-text);
    }

    .alarm-sub {
      font-size: var(--rm-font-size-sm);
      color: var(--rm-text-secondary);
      margin-bottom: 8px;
    }

    .alarm-btns {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      width: 100%;
    }

    .alarm-btn {
      background: var(--rm-bg-elevated);
      border: 1px solid var(--rm-border);
      border-radius: 10px;
      color: var(--rm-text);
      padding: 10px;
      cursor: pointer;
      font-size: var(--rm-font-size-sm);
      font-weight: 500;
      transition: background 0.15s;
    }
    .alarm-btn:hover {
      background: var(--rm-accent-soft);
    }
    .alarm-btn:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }
    .alarm-btn.accent {
      background: var(--rm-accent);
      color: var(--rm-accent-text, #fff);
      border-color: var(--rm-accent);
    }
    .alarm-btn.stop {
      background: var(--rm-error);
      color: var(--rm-error-text);
      border-color: var(--rm-error);
      grid-column: 1 / -1;
    }
    .alarm-btn.stop:hover {
      opacity: 0.85;
    }
    .alarm-custom-row {
      display: flex;
      gap: 6px;
      grid-column: 1 / -1;
    }
    .alarm-custom-input {
      flex: 1;
      background: var(--rm-bg-elevated);
      border: 1px solid var(--rm-border);
      border-radius: 8px;
      color: var(--rm-text);
      padding: 8px 10px;
      font-size: var(--rm-font-size-sm);
      font-family: inherit;
    }
    .alarm-custom-input:focus {
      outline: none;
      border-color: var(--rm-accent);
    }

    /* ── View transitions ───────────────────────────────────── */

    /* Generic directional slide for full-screen views (settings, add, planner, etc.) */
    @keyframes rm-slide-forward {
      from {
        opacity: 0;
        transform: translateX(48px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    @keyframes rm-slide-back {
      from {
        opacity: 0;
        transform: translateX(-48px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    .rm-body[data-nav="forward"] > *:not(.rm-detail-overlay) {
      animation: rm-slide-forward 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
    .rm-body[data-nav="back"] > *:not(.rm-detail-overlay) {
      animation: rm-slide-back 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }

    /* Recipe detail — sliding track (grid left pane, detail right pane) */
    .rm-slide-track {
      display: flex;
      flex-direction: row;
      width: 200%;
      height: 100%;
      transform: translateX(0);
      transition: transform 0.75s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      will-change: transform;
    }
    .rm-slide-track.show-detail {
      transform: translateX(-50%);
    }
    .rm-slide-pane {
      flex: 0 0 50%;
      height: 100%;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .rm-slide-pane > * {
      flex: 1;
      min-height: 0;
    }

    @media (prefers-reduced-motion: reduce) {
      *,
      *::before,
      *::after {
        animation: none !important;
        transition: none !important;
      }
    }

    /* ── Mobile bottom nav ───────────────── */

    .rm-bottom-nav {
      display: flex;
      justify-content: space-around;
      background: var(--rm-bg-surface);
      border-top: 1px solid var(--rm-border);
      padding: 6px 0;
      box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.06);
      z-index: 10;
      flex-shrink: 0;
    }

    .rm-bn-btn {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      background: none;
      border: none;
      cursor: pointer;
      color: var(--rm-text-muted);
      font-size: var(--rm-font-size-xs);
      font-weight: 500;
      padding: 6px 4px;
      position: relative;
      transition: color 0.15s;
      -webkit-tap-highlight-color: transparent;
      outline: none;
    }
    .rm-bn-btn ha-icon {
      --mdc-icon-size: 22px;
    }
    .rm-bn-btn.active {
      color: var(--rm-accent-ink, var(--rm-text));
    }
    .rm-bn-btn:hover {
      color: var(--rm-text);
    }

    .rm-bn-badge {
      position: absolute;
      top: 2px;
      right: calc(50% - 20px);
      background: var(--rm-accent);
      color: var(--rm-accent-text, #fff);
      border-radius: var(--rm-radius-sm);
      font-size: var(--rm-font-size-xs);
      font-weight: 700;
      padding: 1px 4px;
      min-width: 14px;
      text-align: center;
    }

    /* ── Mobile slide-in menu ────────────── */

    .rm-mobile-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.4);
      z-index: 100;
      display: flex;
      justify-content: flex-end;
    }

    .rm-mobile-menu {
      width: min(280px, 80%);
      height: 100%;
      background: var(--rm-bg-surface);
      border-left: 1px solid var(--rm-border);
      display: flex;
      flex-direction: column;
      animation: rm-menu-slide-in 0.22s ease;
      overflow: hidden;
    }

    @keyframes rm-menu-slide-in {
      from {
        transform: translateX(100%);
      }
      to {
        transform: translateX(0);
      }
    }

    .rm-mm-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 12px 14px 16px;
      border-bottom: 1px solid var(--rm-border);
      flex-shrink: 0;
    }
    .rm-mm-logo {
      color: var(--rm-accent-ink, var(--rm-text));
      --mdc-icon-size: 22px;
    }
    .rm-mm-title {
      flex: 1;
      font-weight: 700;
      font-size: 1em;
      color: var(--rm-text);
    }

    .rm-mm-items {
      padding: 8px 0;
      flex: 1;
      overflow-y: auto;
    }

    .rm-mm-item {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      padding: 12px 16px;
      background: none;
      border: none;
      cursor: pointer;
      color: var(--rm-text-secondary);
      font-size: var(--rm-font-size-sm);
      text-align: left;
      transition:
        background 0.12s,
        color 0.12s;
      -webkit-tap-highlight-color: transparent;
    }
    .rm-mm-item ha-icon {
      --mdc-icon-size: 20px;
      flex-shrink: 0;
    }
    .rm-mm-item:hover:not(:disabled) {
      background: var(--rm-accent-soft);
      color: var(--rm-text);
    }
    .rm-mm-item:disabled {
      opacity: 0.4;
      cursor: default;
    }

    .rm-mm-soon {
      margin-left: auto;
      font-size: var(--rm-font-size-xs);
      font-weight: 700;
      background: var(--rm-accent-soft);
      color: var(--rm-accent-ink, var(--rm-text));
      border-radius: 6px;
      padding: 2px 6px;
    }
    @media (hover: none) {
      .preset-remove {
        opacity: 1;
      }
    }
    @media (max-width: 480px) {
      .rm-header {
        padding: 10px 12px;
        flex-wrap: wrap;
      }
      .rm-header-right {
        max-width: 100%;
        flex-wrap: wrap;
        margin-left: auto;
      }
      .rm-title {
        font-size: 1em;
      }
      .rm-title ha-icon {
        display: none;
      }
    }

    ${f}
  `};try{customElements.define("mm-unified-app",ie)}catch{}export{ie as UnifiedApp};
