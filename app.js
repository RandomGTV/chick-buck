const menu = [
  {id:'classic',name:'The Classic Buck',category:'burgers',image:'burger',price:199,description:'Crispy chicken, fresh lettuce & our signature sauce. The OG.',badge:'FAN FAVOURITE'},
  {id:'chicken',name:'Golden Crunch Duo',category:'chicken',image:'chicken',price:249,description:'Two golden chicken pieces. Big crunch, juicy all the way.',badge:'THE ORIGINAL',yellow:true},
  {id:'wrap',name:'The Buck Wrap',category:'wraps',image:'wrap',price:179,description:'Crispy chicken, crunchy greens & a little kick, all wrapped up.'},
  {id:'fries',name:'Golden Fries',category:'sides',image:'fries',price:99,description:'Golden, lightly salted and made for one more handful.',badge:'SIDEKICK',yellow:true},
  {id:'squad',name:'Buck Squad Bucket',category:'combos',image:'bucket',price:799,description:'8 crispy chicken pieces and 2 regular fries. Bring your people.',badge:'SQUAD GOALS'},
];
const money = value => new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(value);
let bag = {};
try {const saved=JSON.parse(localStorage.getItem('chickbuck-bag')||'{}');for(const item of menu) if(Number.isInteger(saved[item.id])&&saved[item.id]>0&&saved[item.id]<=99)bag[item.id]=saved[item.id];} catch {}
const products=document.querySelector('#products');
function renderMenu(category='all'){
  products.innerHTML=menu.filter(item=>category==='all'?item.id!=='squad':item.category===category).map(item=>`<article class="product">${item.badge?`<span class="product-badge ${item.yellow?'yellow-badge':''}">${item.badge}</span>`:''}<div class="food-image image-${item.image}" role="img" aria-label="${item.name}"></div><div class="product-info"><h3>${item.name}</h3><p>${item.description}</p><div class="product-bottom"><span class="product-price">${money(item.price)}</span><button data-add="${item.id}" aria-label="Add ${item.name} to bag">+</button></div></div></article>`).join('');
}
let toastTimer;
function toast(message){const element=document.querySelector('#toast');element.textContent=message;element.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>element.classList.remove('show'),2600);}
function saveBag(){try{localStorage.setItem('chickbuck-bag',JSON.stringify(bag));}catch{} renderBag();}
function renderBag(){
  const entries=menu.filter(item=>bag[item.id]);
  const count=entries.reduce((sum,item)=>sum+bag[item.id],0);
  document.querySelector('#bag-count').textContent=count;
  document.querySelector('#open-bag').setAttribute('aria-label',`Open shopping bag, ${count} items`);
  document.querySelector('#bag-items').innerHTML=entries.length?entries.map(item=>`<div class="bag-item"><div class="food-image image-${item.image}" role="img" aria-label="${item.name}"></div><div><h3>${item.name}</h3><p>${money(item.price)}</p><div class="quantity"><button data-quantity="${item.id}" data-change="-1" aria-label="Decrease ${item.name} quantity">−</button><span>${bag[item.id]}</span><button data-quantity="${item.id}" data-change="1" aria-label="Increase ${item.name} quantity" ${bag[item.id]>=99?'disabled':''}>+</button></div></div><button class="remove-item" data-remove="${item.id}" aria-label="Remove ${item.name}">Remove</button></div>`).join(''):'<div class="empty-bag">Your bag is waiting for a little crunch.<br>Pick a favourite to get started.</div>';
  document.querySelector('#subtotal').textContent=money(entries.reduce((sum,item)=>sum+item.price*bag[item.id],0));
  document.querySelector('#review-order').disabled=!entries.length;
}
const bagDialog=document.querySelector('#bag-dialog'),infoDialog=document.querySelector('#info-dialog');
function openDialog(dialog){dialog.showModal();document.body.style.overflow='hidden';}
function closeDialog(dialog){dialog.close();document.body.style.overflow='';}
document.querySelector('#open-bag').addEventListener('click',()=>openDialog(bagDialog));
document.addEventListener('click',event=>{
  const add=event.target.closest('[data-add]');if(add){const item=menu.find(item=>item.id===add.dataset.add);if(!item)return;bag[item.id]=Math.min(99,(bag[item.id]||0)+1);saveBag();toast(`${item.name} added to your bag`);}
  const tab=event.target.closest('[data-category]');if(tab){document.querySelectorAll('[data-category]').forEach(button=>{button.classList.toggle('active',button===tab);button.setAttribute('aria-pressed',String(button===tab));});renderMenu(tab.dataset.category);}
  const quantity=event.target.closest('[data-quantity]');if(quantity){const id=quantity.dataset.quantity;bag[id]=Math.min(99,bag[id]+Number(quantity.dataset.change));if(bag[id]<=0)delete bag[id];saveBag();const next=bagDialog.querySelector(`[data-quantity="${id}"][data-change="${quantity.dataset.change}"]`)||bagDialog.querySelector('[data-close]');next.focus();}
  const remove=event.target.closest('[data-remove]');if(remove){delete bag[remove.dataset.remove];saveBag();bagDialog.querySelector('[data-close]').focus();}
  const close=event.target.closest('[data-close]');if(close)closeDialog(close.closest('dialog'));
  if(event.target.closest('[data-location]')){document.querySelector('#info-content').innerHTML='<p class="eyebrow red">YOUR NEXT BUCK STOP</p><h2>GOOD THINGS<br>ARE COMING<span>.</span></h2><p>Chick Buck’s store locations haven’t been published yet. This brand concept is ready for real restaurant addresses, opening hours, and delivery zones.</p><a class="button yellow" href="#menu" id="browse-from-info">Explore the menu <span>→</span></a>';openDialog(infoDialog);document.querySelector('#browse-from-info').onclick=()=>closeDialog(infoDialog);}
});
document.querySelector('#review-order').addEventListener('click',()=>{
  const entries=menu.filter(item=>bag[item.id]);if(!entries.length)return;
  const count=entries.reduce((sum,item)=>sum+bag[item.id],0),total=entries.reduce((sum,item)=>sum+item.price*bag[item.id],0);
  closeDialog(bagDialog);document.querySelector('#info-content').innerHTML=`<p class="eyebrow red">LOOKING TASTY</p><h2>THAT’S A<br>GREAT PICK<span>.</span></h2><p>Your demo bag has <strong>${count} ${count===1?'item':'items'}</strong> totalling <strong>${money(total)}</strong>.</p><p>This is a website preview. No order has been placed, and no payment is required. Your bag is saved on this browser.</p><button class="button yellow" id="return-bag">Back to your bag <span>→</span></button>`;openDialog(infoDialog);document.querySelector('#return-bag').onclick=()=>{closeDialog(infoDialog);openDialog(bagDialog);};
});
for(const dialog of document.querySelectorAll('dialog')){dialog.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)closeDialog(dialog);}});dialog.addEventListener('close',()=>document.body.style.overflow='');}
const toggle=document.querySelector('.mobile-toggle'),navigation=document.querySelector('#navigation');
toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));navigation.classList.toggle('open',open);toggle.textContent=open?'×':'☰';});
navigation.addEventListener('click',event=>{if(event.target.closest('a,button')){navigation.classList.remove('open');toggle.setAttribute('aria-expanded','false');toggle.textContent='☰';}});
document.querySelector('#year').textContent=new Date().getFullYear();
renderMenu();renderBag();
