(() => {
  const root=document.documentElement;
  const themeButton=document.createElement('button');
  themeButton.className='theme-switch';
  document.querySelector('.header-actions').prepend(themeButton);
  const sun='<circle cx="12" cy="12" r="4"/><path d="M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/>';
  const moon='<path d="M20.5 13A8.5 8.5 0 0 1 11 3.5 8.5 8.5 0 1 0 20.5 13Z"/>';
  function syncTheme(){const dark=root.dataset.theme==='dark';themeButton.innerHTML=`<svg viewBox="0 0 24 24" aria-hidden="true">${dark?moon:sun}</svg><span class="theme-label">${dark?'Dark':'Light'}</span>`;themeButton.setAttribute('aria-label','Dark mode');themeButton.setAttribute('aria-pressed',String(dark));document.querySelector('meta[name="theme-color"]').content=dark?'#171112':'#fff9ee';}
  themeButton.addEventListener('click',()=>{root.dataset.theme=root.dataset.theme==='dark'?'light':'dark';try{localStorage.setItem('chickbuck-theme',root.dataset.theme);}catch{}syncTheme();});
  syncTheme();

  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let userPaused=false;
  try{userPaused=localStorage.getItem('chickbuck-effects')==='paused';}catch{}
  const effectsButton=document.createElement('button');effectsButton.className='effects-toggle';
  document.querySelector('.hero-bottom').append(effectsButton);
  function syncMotion(){const paused=userPaused||reduced.matches;root.classList.toggle('effects-paused',paused);effectsButton.textContent=paused?'▶ Play effects':'Ⅱ Pause effects';effectsButton.setAttribute('aria-label',paused?'Play animated effects':'Pause animated effects');effectsButton.setAttribute('aria-pressed',String(!paused));effectsButton.disabled=reduced.matches;effectsButton.title=reduced.matches?'Animations follow your reduced-motion preference':'';if(paused)context?.clearRect(0,0,width,height);start();}
  effectsButton.addEventListener('click',()=>{userPaused=!userPaused;try{localStorage.setItem('chickbuck-effects',userPaused?'paused':'playing');}catch{}syncMotion();});
  reduced.addEventListener('change',syncMotion);

  const ticker=document.querySelector('.ticker');const original=ticker.firstElementChild;const track=document.createElement('div');track.className='ticker-track';ticker.replaceChildren(track);track.append(original,original.cloneNode(true));
  if('IntersectionObserver' in window){const reveals=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('in-view');reveals.unobserve(entry.target);}}),{threshold:.12});document.querySelectorAll('.section-heading,.deal-inner,.story-poster,.story-copy,.find-banner').forEach(element=>{element.classList.add('reveal-ready');reveals.observe(element);});}
  document.addEventListener('click',event=>{if(event.target.closest('[data-add]')){const bag=document.querySelector('.bag-button');bag.classList.remove('bag-pop');requestAnimationFrame(()=>bag.classList.add('bag-pop'));}});

  // Low-resolution turbulent vapour sprites, composited over the food photograph.
  // Cache the textures: the animation only draws and drifts translucent billows.
  const canvas=document.querySelector('#steam'),context=canvas.getContext('2d');
  let width=1,height=1,visible=true,frame=0,last=0;
  const sprites=[];
  function texture(){const size=128,c=document.createElement('canvas');c.width=c.height=size;const ctx=c.getContext('2d'),image=ctx.createImageData(size,size);const grids=[5,10,20].map(n=>({n,data:Float32Array.from({length:(n+1)*(n+1)},()=>Math.random())}));
    function noise(x,y,g){const gx=x*g.n,gy=y*g.n,ix=Math.floor(gx),iy=Math.floor(gy);let tx=gx-ix,ty=gy-iy;tx=tx*tx*(3-2*tx);ty=ty*ty*(3-2*ty);const a=g.data[iy*(g.n+1)+ix],b=g.data[iy*(g.n+1)+ix+1],d=g.data[(iy+1)*(g.n+1)+ix],e=g.data[(iy+1)*(g.n+1)+ix+1];return(a+(b-a)*tx)*(1-ty)+(d+(e-d)*tx)*ty;}
    for(let y=0;y<size;y++)for(let x=0;x<size;x++){const nx=x/size,ny=y/size;const radius=Math.hypot((nx-.5)*2,(ny-.5)*2);const envelope=Math.pow(Math.max(0,1-radius*radius),2);const n=noise(nx,ny,grids[0])*.55+noise(nx,ny,grids[1])*.3+noise(nx,ny,grids[2])*.15;const i=(y*size+x)*4;image.data[i]=255;image.data[i+1]=240;image.data[i+2]=219;image.data[i+3]=Math.max(0,n-.23)*envelope*185;}
    ctx.putImageData(image,0,0);return c;
  }
  for(let i=0;i<3;i++)sprites.push(texture());
  const particles=Array.from({length:27},(_,i)=>({age:Math.random()*7,life:5+Math.random()*4,x:.32+Math.random()*.32,y:.26+Math.random()*.16,phase:Math.random()*6.28,sprite:i%3,size:.07+Math.random()*.07}));
  function resize(){const bounds=canvas.getBoundingClientRect();width=bounds.width;height=bounds.height;const ratio=Math.min(devicePixelRatio||1,1.5);canvas.width=width*ratio;canvas.height=height*ratio;context?.setTransform(ratio,0,0,ratio,0,0);}
  function active(){return visible&&!document.hidden&&!userPaused&&!reduced.matches&&context;}
  function start(){if(active()&&!frame){last=0;frame=requestAnimationFrame(draw);}}
  function draw(time){frame=0;if(!active())return;if(last&&time-last<32){frame=requestAnimationFrame(draw);return;}const dt=last?Math.min((time-last)/1000,.06):.033;last=time;context.clearRect(0,0,width,height);
    for(const p of particles){p.age+=dt;if(p.age>p.life)p.age=0;const t=p.age/p.life;const drift=Math.sin(p.phase+t*5)*width*.035;const x=p.x*width+drift+t*width*.035;const y=p.y*height-t*height*.45;const size=width*p.size*(.6+t*2);context.save();context.translate(x,y);context.rotate(Math.sin(p.phase+t*3)*.4);context.globalAlpha=Math.sin(Math.PI*t)*.48;context.drawImage(sprites[p.sprite],-size/2,-size*.9,size,size*1.8);context.restore();}
    frame=requestAnimationFrame(draw);
  }
  new ResizeObserver(resize).observe(canvas);
  if('IntersectionObserver' in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;start();},{threshold:0}).observe(document.querySelector('.hero'));
  document.addEventListener('visibilitychange',start);
  resize();syncMotion();
})();
