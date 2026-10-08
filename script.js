const $=(s,p=document)=>p.querySelector(s);
const $$=(s,p=document)=>[...p.querySelectorAll(s)];
const reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const fine=window.matchMedia("(pointer:fine)").matches;

if(!reduce)document.documentElement.classList.add("js-ready");

const btn=$("#downloadBtn"),btn2=$("#downloadBtn2"),version=$("#version");
const releases="https://api.github.com/repos/mm2vault/VYRA/releases?per_page=30";

fetch(releases,{headers:{Accept:"application/vnd.github+json"}}).then(r=>r.ok?r.json():Promise.reject()).then(list=>{
  const latest=list.filter(r=>!r.draft).sort((a,b)=>new Date(b.published_at||b.created_at)-new Date(a.published_at||a.created_at))[0];
  if(!latest)throw new Error("No release");
  const apk=(latest.assets||[]).find(a=>a.name.toLowerCase().includes("release")&&a.name.toLowerCase().endsWith(".apk"))
    ||(latest.assets||[]).find(a=>a.name.toLowerCase().endsWith(".apk"));
  const url=apk?.browser_download_url||latest.html_url;
  if(btn)btn.href=url;
  if(btn2)btn2.href=url;
  if(version)version.textContent="Son sürüm: "+latest.tag_name+(apk?" · APK hazır":"");
}).catch(()=>{
  if(version)version.textContent="En güncel APK GitHub Releases üzerinde.";
});

const menu=$(".mobile-menu"),menuBtn=$(".menu-btn");
const closeMenu=()=>{menu?.classList.remove("open");menuBtn?.setAttribute("aria-expanded","false")};
menuBtn?.addEventListener("click",()=>{
  const open=menu.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded",String(open));
});
$$(".mobile-menu a").forEach(a=>a.addEventListener("click",closeMenu));
document.addEventListener("pointerdown",e=>{
  if(menu?.classList.contains("open")&&!menu.contains(e.target)&&e.target!==menuBtn)closeMenu();
});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeMenu()});

const revealObserver=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
},{threshold:.08,rootMargin:"0px 0px -25px"});
$$(".reveal").forEach(el=>revealObserver.observe(el));

const progress=$("#progress");
const updateProgress=()=>{
  const max=document.documentElement.scrollHeight-innerHeight;
  if(progress)progress.style.width=(max>0?scrollY/max*100:0)+"%";
};
addEventListener("scroll",updateProgress,{passive:true});
updateProgress();

const stage=$("#heroStage");
if(stage&&!reduce&&fine){
  const phone=$(".phone",stage);
  stage.addEventListener("pointermove",e=>{
    const r=stage.getBoundingClientRect();
    const x=(e.clientX-r.left)/r.width-.5;
    const y=(e.clientY-r.top)/r.height-.5;
    if(phone)phone.style.transform="rotate(4deg) rotateY("+(x*8)+"deg) rotateX("+(-y*8)+"deg) translate("+(x*4)+"px,"+(y*4)+"px)";
  });
  stage.addEventListener("pointerleave",()=>{
    if(phone)phone.style.transform="rotate(4deg)";
  });
}

if(!reduce&&fine){
  $$(".btn").forEach(el=>{
    el.addEventListener("pointermove",e=>{
      const r=el.getBoundingClientRect();
      const x=e.clientX-r.left-r.width/2;
      const y=e.clientY-r.top-r.height/2;
      el.style.transform="translate("+(x*.05)+"px,"+(y*.05)+"px)";
    });
    el.addEventListener("pointerleave",()=>{el.style.transform=""});
  });
}

$$(".shot").forEach(shot=>{
  shot.addEventListener("click",()=>{
    const img=$("img",shot);
    if(!img)return;
    const overlay=document.createElement("div");
    overlay.className="image-viewer";
    overlay.innerHTML='<button type="button" aria-label="Kapat">×</button><img alt="">';
    $("img",overlay).src=img.src;
    $("img",overlay).alt=img.alt;
    document.body.appendChild(overlay);
    const close=()=>overlay.remove();
    $("button",overlay).addEventListener("click",close);
    overlay.addEventListener("click",e=>{if(e.target===overlay)close()});
    document.addEventListener("keydown",function esc(e){if(e.key==="Escape"){close();document.removeEventListener("keydown",esc)}});
  });
});

const player=$(".player-panel");
const play=$(".play",player);
const bar=$(".player-progress i",player);
const times=$$(".player-time span",player);

if(player&&play&&bar){
  let playing=false,started=0,elapsed=0,total=222,frame=0;
  const render=()=>{
    if(!playing)return;
    const current=Math.min(total,elapsed+(performance.now()-started)/1000);
    bar.style.width=current/total*100+"%";
    times[0].textContent=String(Math.floor(current/60)).padStart(2,"0")+":"+String(Math.floor(current%60)).padStart(2,"0");
    if(current>=total){
      playing=false;elapsed=0;bar.style.width="0%";times[0].textContent="00:00";play.textContent="▶";return;
    }
    frame=requestAnimationFrame(render);
  };
  play.addEventListener("click",()=>{
    if(playing){
      elapsed+= (performance.now()-started)/1000;
      playing=false;
      cancelAnimationFrame(frame);
      play.textContent="▶";
    }else{
      started=performance.now();
      playing=true;
      play.textContent="Ⅱ";
      render();
    }
  });
  $$("[data-skip]",player).forEach(control=>{
    control.addEventListener("click",()=>{
      elapsed=Math.max(0,Math.min(total,elapsed+Number(control.dataset.skip)));
      bar.style.width=elapsed/total*100+"%";
      times[0].textContent=String(Math.floor(elapsed/60)).padStart(2,"0")+":"+String(Math.floor(elapsed%60)).padStart(2,"0");
    });
  });
}
