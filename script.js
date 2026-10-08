const btn=document.getElementById("downloadBtn"),btn2=document.getElementById("downloadBtn2"),version=document.getElementById("version"),menu=document.querySelector(".mobile-menu"),menuBtn=document.querySelector(".menu-btn"),nav=document.querySelector(".nav"),progress=document.getElementById("progress"),heroVisual=document.getElementById("heroVisual");
const reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if(!reduce)document.documentElement.classList.add("js-ready");
const finePointer=window.matchMedia("(pointer:fine)").matches;
const linkId=document.querySelector('meta[name="vyra-enhanced"]');
if(!linkId){
  const l=document.createElement("link");l.rel="stylesheet";l.href="enhancements.css?v=20261009";document.head.appendChild(l);
  const m=document.createElement("meta");m.name="vyra-enhanced";m.content="1";document.head.appendChild(m);
}

const api="https://api.github.com/repos/mm2vault/VYRA/releases?per_page=30";
fetch(api,{headers:{Accept:"application/vnd.github+json"}}).then(r=>r.ok?r.json():Promise.reject()).then(rs=>{
  const latest=rs.filter(x=>!x.draft).sort((a,b)=>new Date(b.published_at||b.created_at)-new Date(a.published_at||a.created_at))[0];
  if(!latest)throw 0;
  const apk=(latest.assets||[]).find(x=>x.name.toLowerCase().includes("release")&&x.name.toLowerCase().endsWith(".apk")) || (latest.assets||[]).find(x=>x.name.toLowerCase().endsWith(".apk"));
  const size=apk?.size?(" · "+(apk.size/1048576).toFixed(1)+" MB"):"";
  version.textContent="Son sürüm: "+latest.tag_name+(latest.prerelease?" · prerelease":"")+size;
  const url=apk?.browser_download_url||latest.html_url;
  if(btn)btn.href=url;
  if(btn2)btn2.href=url;
  const meta=document.createElement("div");
  meta.className="release-meta";
  meta.innerHTML="<span>"+(apk?"APK hazır":"Release bulundu")+"</span><span>"+new Date(latest.published_at||latest.created_at).toLocaleDateString("tr-TR")+"</span>";
  document.querySelector(".version-row")?.after(meta);
}).catch(()=>{
  if(version)version.textContent="En güncel APK GitHub Releases üzerinde.";
  if(btn)btn.href="https://github.com/mm2vault/VYRA/releases";
  if(btn2)btn2.href="https://github.com/mm2vault/VYRA/releases";
});

const closeMenu=()=>{menu?.classList.remove("open");menuBtn?.setAttribute("aria-expanded","false")};
menuBtn?.addEventListener("click",()=>{
  const open=menu.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded",String(open));
});
menu?.querySelectorAll("a").forEach(a=>a.addEventListener("click",closeMenu));
document.addEventListener("pointerdown",e=>{
  if(menu?.classList.contains("open")&&!menu.contains(e.target)&&e.target!==menuBtn)closeMenu();
});
document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeMenu();if(document.getElementById("lightbox")?.classList.contains("open"))closeLightbox?.()}});

const revealObserver=new IntersectionObserver(entries=>entries.forEach(e=>{
  if(e.isIntersecting){e.target.classList.add("visible");revealObserver.unobserve(e.target)}
}),{threshold:.08,rootMargin:"0px 0px -30px"});
document.querySelectorAll(".reveal").forEach(el=>revealObserver.observe(el));

let targetX=innerWidth/2,targetY=innerHeight*.4,currentX=targetX,currentY=targetY;
if(!reduce&&finePointer){
  addEventListener("pointermove",e=>{targetX=e.clientX;targetY=e.clientY},{passive:true});
  const pointer=()=>{
    currentX+=(targetX-currentX)*.12;currentY+=(targetY-currentY)*.12;
    document.documentElement.style.setProperty("--mx",currentX+"px");
    document.documentElement.style.setProperty("--my",currentY+"px");
    requestAnimationFrame(pointer);
  };
  pointer();
}

const updateScroll=()=>{
  const h=document.documentElement.scrollHeight-innerHeight;
  if(progress)progress.style.width=(h>0?(scrollY/h)*100:0)+"%";
  nav?.classList.toggle("scrolled",scrollY>18);
};
addEventListener("scroll",updateScroll,{passive:true});updateScroll();

if(!reduce&&finePointer){
  const phone=heroVisual?.querySelector(".phone");
  heroVisual?.addEventListener("pointermove",e=>{
    const r=heroVisual.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
    if(phone)phone.style.transform="rotate(4deg) rotateY("+(x*10)+"deg) rotateX("+(-y*10)+"deg) translate("+x*5+"px,"+y*5+"px)";
    heroVisual.querySelectorAll(".tilt-card").forEach((el,i)=>{el.style.transform="translate3d("+(x*(i+1)*8)+"px,"+(y*(i+1)*8)+"px,0)"});
  },{passive:true});
  heroVisual?.addEventListener("pointerleave",()=>{
    if(phone)phone.style.transform="rotate(4deg)";
    heroVisual.querySelectorAll(".tilt-card").forEach(el=>el.style.transform="");
  });
  document.querySelectorAll(".magnetic").forEach(el=>{
    el.addEventListener("pointermove",e=>{
      const r=el.getBoundingClientRect(),x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;
      el.style.transform="translate("+(x*.08)+"px,"+(y*.08)+"px)";
    });
    el.addEventListener("pointerleave",()=>el.style.transform="");
  });
  document.querySelectorAll(".feature.tilt-card").forEach(el=>{
    el.addEventListener("pointermove",e=>{
      const r=el.getBoundingClientRect(),x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;
      el.style.transform="perspective(700px) rotateX("+(-y/r.height*5)+"deg) rotateY("+(x/r.width*5)+"deg) translateY(-3px)";
    });
    el.addEventListener("pointerleave",()=>el.style.transform="");
  });
}

const canvas=document.getElementById("particles"),ctx=canvas?.getContext("2d");
if(canvas&&!reduce&&!((navigator.connection?.saveData)||innerWidth<520)){
  let W=0,H=0,dpr=Math.min(devicePixelRatio||1,2),dots=[],raf=0;
  const resize=()=>{
    W=innerWidth;H=innerHeight;canvas.width=W*dpr;canvas.height=H*dpr;canvas.style.width=W+"px";canvas.style.height=H+"px";
    ctx.setTransform(dpr,0,0,dpr,0,0);
    dots=Array.from({length:Math.min(72,Math.floor(W/16))},()=>({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.4+.25,v:(Math.random()-.5)*.18,a:Math.random()*.45+.12}));
  };
  resize();addEventListener("resize",resize,{passive:true});
  const draw=()=>{
    ctx.clearRect(0,0,W,H);
    for(const p of dots){
      p.y-=.07;p.x+=p.v;if(p.y<-5)p.y=H+5;if(p.x<-5)p.x=W+5;if(p.x>W+5)p.x=-5;
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle="rgba(194,108,255,"+p.a+")";ctx.fill();
    }
    raf=requestAnimationFrame(draw);
  };
  draw();
  addEventListener("pagehide",()=>cancelAnimationFrame(raf),{once:true});
}

document.querySelectorAll(".shot img").forEach(img=>{
  img.loading="lazy";img.decoding="async";
});

const heroActions=document.querySelector(".hero .actions");
if(heroActions&&!document.querySelector(".hero-scroll-hint")){
  const hint=document.createElement("div");
  hint.className="hero-scroll-hint";hint.innerHTML="<span aria-hidden=\"true\"></span> Aşağı kaydır ve VYRA'yı keşfet";
  heroActions.parentElement?.appendChild(hint);
}

const cinematicStyleFix=document.createElement("style");
cinematicStyleFix.textContent=".cine-story .cine-stage{transition:box-shadow .35s ease}.cine-story .cine-stage.deep{box-shadow:0 55px 140px #000,0 0 100px #8d3cff20}.cine-story .cine-stage.deep .cine-phone{box-shadow:0 55px 120px #000,0 0 105px #8d3cff4a}";
document.head.appendChild(cinematicStyleFix);

const screenImages=[
 "https://i.imgur.com/QtuxYWK.jpeg",
 "https://i.imgur.com/xReSL3X.jpeg",
 "https://i.imgur.com/2T3pYsK.jpeg",
 "https://i.imgur.com/3o4hIif.jpeg",
 "https://i.imgur.com/vT8892A.jpeg"
];

const cinematic=document.createElement("section");
cinematic.id="cinematic";
cinematic.innerHTML=
'<div class="cine-head reveal">'+
'<span>04 / CINEMATIC SHOWCASE</span>'+
'<h2>VYRA\'yı<br><em>yakından hisset.</em></h2>'+
'<p>Gerçek VYRA ekranlarını, ürün filmi hissi veren bir scroll deneyimine dönüştürdük. Aşağı indikçe telefon, ışık ve ekran değişimi birlikte ilerler.</p>'+
'<div class="cine-scroll-note"><i></i> Kaydırarak sahneleri değiştir</div>'+
'</div>'+
'<div class="cine-story">'+
'<div class="cine-stage" id="cineStage">'+
'<div class="cine-orb"></div><div class="cine-orb o2"></div><div class="cine-orb o3"></div>'+
'<div class="cine-hotspot h1"></div><div class="cine-hotspot h2"></div><div class="cine-hotspot h3"></div>'+
'<div class="cine-label">VYRA / EXPERIENCE</div>'+
'<div class="cine-counter"><b id="cineCounter">01</b> / 05</div>'+
'<div class="cine-step" id="cineStep">01 / 05</div>'+
'<div class="cine-phone" id="cinePhone"><img id="cineImage" src="'+screenImages[0]+'" alt="VYRA uygulama önizlemesi"></div>'+
'<div class="cine-caption"><div><strong id="cineTitle">HOME EXPERIENCE</strong><small id="cineSub">Hızlı, sade ve müzik odaklı.</small></div><div class="cine-dots" id="cineDots"></div></div>'+
'<div class="cine-controls"><button id="cinePrev" type="button">← Önceki</button><button id="cineNext" type="button">Sonraki →</button></div>'+
'<div class="cine-progress"><i id="cineProgress"></i></div>'+
'</div></div>'+
'<div class="cine-steps" id="cineSteps" aria-label="VYRA ekranları"></div>';

document.querySelector(".manifesto")?.before(cinematic);
const cineHead=cinematic.querySelector(".cine-head");
if(cineHead)revealObserver.observe(cineHead);

const cineData=[
 ["HOME EXPERIENCE","Hızlı, sade ve müzik odaklı."],
 ["DISCOVER","Yeni müzikleri keşfet ve akışını koru."],
 ["PLAYER","Müziği merkeze alan oynatma deneyimi."],
 ["LIBRARY","Koleksiyonun, geçmişin ve listelerin."],
 ["PLAYLIST","Kendi müzik akışını kendin oluştur."]
];
let cineIndex=0,cineTimer=0;
const cineImage=document.getElementById("cineImage"),cineTitle=document.getElementById("cineTitle"),cineSub=document.getElementById("cineSub"),cineStep=document.getElementById("cineStep"),cineCounter=document.getElementById("cineCounter"),cinePhone=document.getElementById("cinePhone"),cineDots=document.getElementById("cineDots"),cineSteps=document.getElementById("cineSteps"),cineStage=document.getElementById("cineStage"),cineProgress=document.getElementById("cineProgress"),cineStory=cinematic.querySelector(".cine-story");

cineData.forEach((_,i)=>{
  const d=document.createElement("i");cineDots.appendChild(d);
  const b=document.createElement("button");b.type="button";b.setAttribute("aria-label","Ekran "+(i+1));b.addEventListener("click",()=>{setCine(i);cineStage?.scrollIntoView({behavior:reduce?"auto":"smooth",block:"center"})});cineSteps.appendChild(b);
});

function renderCineDots(){
  cineDots?.querySelectorAll("i").forEach((d,n)=>d.classList.toggle("active",n===cineIndex));
  cineSteps?.querySelectorAll("button").forEach((b,n)=>{b.classList.toggle("active",n===cineIndex);b.setAttribute("aria-current",n===cineIndex?"step":"false")});
}
function setCine(i,instant=false){
  cineIndex=(i+5)%5;
  if(!cinePhone||!cineImage)return;
  cineStage?.classList.add("is-transitioning");
  cinePhone.style.opacity=instant?"1":".35";
  cinePhone.style.transform="translate3d(0,0,0) scale(.96) rotateY("+(cineIndex-2)*3+"deg) rotateZ("+((cineIndex%2?1:-1)*.6)+"deg)";
  clearTimeout(cineTimer);
  cineTimer=setTimeout(()=>{
    cineImage.src=screenImages[cineIndex];
    cineTitle.textContent=cineData[cineIndex][0];
    cineSub.textContent=cineData[cineIndex][1];
    cineStep.textContent=String(cineIndex+1).padStart(2,"0")+" / 05";
    cineCounter.textContent=String(cineIndex+1).padStart(2,"0");
    renderCineDots();
    cinePhone.style.opacity="1";
    cinePhone.style.transform="translate3d(0,0,0) scale(1) rotateY("+(cineIndex-2)*3+"deg) rotateZ("+((cineIndex%2?1:-1)*.35)+"deg)";
    cineStage?.classList.remove("is-transitioning");
  },instant?0:120);
}
document.getElementById("cinePrev")?.addEventListener("click",()=>setCine(cineIndex-1));
document.getElementById("cineNext")?.addEventListener("click",()=>setCine(cineIndex+1));
setCine(0,true);

let cineTick=0;
const updateCinematicFromScroll=()=>{
  cineTick=0;
  if(!cineStory||reduce)return;
  const r=cineStory.getBoundingClientRect(),travel=Math.max(1,r.height-innerHeight*.72);
  const raw=(innerHeight*.28-r.top)/travel;
  const p=Math.min(1,Math.max(0,raw));
  const idx=Math.min(4,Math.floor(p*5));
  if(idx!==cineIndex)setCine(idx);
  const local=(p*5)%1;
  const lift=(local-.5)*10;
  const scale=1+Math.sin(p*Math.PI)*.035;
  const z=(idx-2)*3;
  if(cinePhone)cinePhone.style.transform="translate3d(0,"+lift+"px,0) scale("+scale+") rotateY("+z+"deg) rotateZ("+((idx%2?1:-1)*.4)+"deg)";
  if(cineProgress)cineProgress.style.width=Math.max(20,Math.min(100,(p*100)))+"%";
  if(p>.82)cineStage?.classList.add("deep");else cineStage?.classList.remove("deep");
};
const onScrollCine=()=>{
  if(cineTick)return;
  cineTick=requestAnimationFrame(updateCinematicFromScroll);
};
addEventListener("scroll",onScrollCine,{passive:true});
addEventListener("resize",onScrollCine,{passive:true});

let touchX=0;
cineStage?.addEventListener("touchstart",e=>{touchX=e.changedTouches[0].clientX},{passive:true});
cineStage?.addEventListener("touchend",e=>{
  const dx=e.changedTouches[0].clientX-touchX;
  if(Math.abs(dx)>50)setCine(dx<0?cineIndex+1:cineIndex-1);
},{passive:true});

const lightbox=document.createElement("div");
lightbox.id="lightbox";lightbox.setAttribute("role","dialog");lightbox.setAttribute("aria-modal","true");lightbox.setAttribute("aria-hidden","true");
lightbox.innerHTML='<button aria-label="Görseli kapat" type="button">×</button><img alt="VYRA ekran görüntüsü">';
document.body.appendChild(lightbox);
const lbImg=lightbox.querySelector("img"),lbClose=lightbox.querySelector("button");let lightboxReturn=null;
const closeLightbox=()=>{
  lightbox.classList.remove("open");lightbox.setAttribute("aria-hidden","true");document.body.style.overflow="";
  lightboxReturn?.focus?.();lightboxReturn=null;
};
document.querySelectorAll(".shot img").forEach(img=>img.addEventListener("click",e=>{
  e.preventDefault();e.stopPropagation();lightboxReturn=e.currentTarget;lbImg.src=e.currentTarget.src;lbImg.alt=e.currentTarget.alt||"VYRA ekran görüntüsü";
  lightbox.classList.add("open");lightbox.setAttribute("aria-hidden","false");document.body.style.overflow="hidden";lbClose.focus();
}));
lbClose.addEventListener("click",closeLightbox);
lightbox.addEventListener("click",e=>{if(e.target===lightbox)closeLightbox()});

const playerPanel=document.querySelector(".experience-panel.big");
if(playerPanel){
  const info=playerPanel.querySelector(".player-info");
  if(info&&!playerPanel.querySelector(".demo-badge")){
    const badge=document.createElement("div");badge.className="demo-badge";badge.innerHTML="<i></i> VISUAL DEMO";
    info.parentElement?.insertBefore(badge,info);
  }
  const progressBar=playerPanel.querySelector(".progress i"),controls=playerPanel.querySelector(".player-controls"),playButton=controls?.querySelector(".play"),barArea=playerPanel.querySelector(".progress");
  if(controls&&progressBar&&playButton&&barArea){
    controls.classList.add("player-demo-controls");
    const time=document.createElement("div");time.className="demo-time";time.innerHTML="<span>00:00</span><span>03:42</span>";barArea.after(time);
    let playing=false,startedAt=0,pausedAt=0,raf=0,total=222;
    const render=()=>{
      if(!playing)return;
      const seconds=Math.min(total,pausedAt+(performance.now()-startedAt)/1000);
      const pct=(seconds/total)*100;
      progressBar.style.width=pct+"%";
      time.firstElementChild.textContent=Math.floor(seconds/60).toString().padStart(2,"0")+":" + Math.floor(seconds%60).toString().padStart(2,"0");
      if(seconds>=total){playing=false;pausedAt=0;progressBar.style.width="0%";time.firstElementChild.textContent="00:00";playerPanel.classList.remove("playing");playerPanel.classList.add("paused");playButton.textContent="▶";playButton.setAttribute("aria-label","Görsel demoyu başlat");return}
      raf=requestAnimationFrame(render);
    };
    const toggle=()=>{
      if(!playing){startedAt=performance.now();playing=true;playerPanel.classList.add("playing");playerPanel.classList.remove("paused");playButton.textContent="Ⅱ";playButton.setAttribute("aria-label","Görsel demoyu durdur");cancelAnimationFrame(raf);render()}
      else{pausedAt=Math.min(total,pausedAt+(performance.now()-startedAt)/1000);playing=false;playerPanel.classList.remove("playing");playerPanel.classList.add("paused");playButton.textContent="▶";playButton.setAttribute("aria-label","Görsel demoyu başlat");cancelAnimationFrame(raf)}
    };
    playButton.type="button";playButton.setAttribute("aria-label","Görsel demoyu başlat");playButton.tabIndex=0;
    playButton.addEventListener("click",toggle);
    playButton.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();toggle()}});
    controls.querySelectorAll("b").forEach((b,i)=>{
      if(i===1)return;
      b.type="button";b.tabIndex=0;b.setAttribute("role","button");
      b.addEventListener("click",()=>{pausedAt=i===0?Math.max(0,pausedAt-10):Math.min(total,pausedAt+10);const pct=(pausedAt/total)*100;progressBar.style.width=pct+"%";time.firstElementChild.textContent=Math.floor(pausedAt/60).toString().padStart(2,"0")+":" + Math.floor(pausedAt%60).toString().padStart(2,"0")});
      b.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();b.click()}});
    });
  }
}

addEventListener("keydown",e=>{
  if((e.key==="ArrowRight"||e.key==="ArrowLeft")&&document.activeElement?.closest("#cinematic")){
    e.preventDefault();setCine(cineIndex+(e.key==="ArrowRight"?1:-1));
  }
});
