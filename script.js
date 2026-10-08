const btn=document.getElementById("downloadBtn"),btn2=document.getElementById("downloadBtn2"),version=document.getElementById("version"),menu=document.querySelector(".mobile-menu"),menuBtn=document.querySelector(".menu-btn"),nav=document.querySelector(".nav"),progress=document.getElementById("progress"),heroVisual=document.getElementById("heroVisual");
const reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if(!reduce)document.documentElement.classList.add("js-ready");
const finePointer=window.matchMedia("(pointer:fine)").matches;
const linkId=document.querySelector('meta[name="vyra-enhanced"]');
if(!linkId){
  const l=document.createElement("link");l.rel="stylesheet";l.href="enhancements.css?v=20261009.4";document.head.appendChild(l);
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
