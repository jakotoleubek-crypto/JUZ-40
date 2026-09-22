const TOTAL = 84;
const CURATORS = new Set([1,2,3,4,5,6,7,8,9,10]);
const defaults = Array.from({length: TOTAL}, (_, i) => ({
  name: CURATORS.has(i+1) ? `Куратор ${i+1}` : `Оқушы ${i+1}`,
  about: '', memory: '', quote: '', insta: '', photo: '', curator: CURATORS.has(i+1)
}));
let memories = JSON.parse(localStorage.getItem('juz40-memories') || 'null') || defaults;
memories = defaults.map((x,i)=>({...x,...(memories[i]||{})}));
let current = Number(localStorage.getItem('juz40-current') || 0);
let founder = JSON.parse(localStorage.getItem('juz40-founder') || 'null') || {name:'',quote:'',photo:''};
let cloud = null;
const $ = s => document.querySelector(s);
const tabs = $('#tabs'), card = $('#card'), label = $('#pageLabel');

function save(){try{localStorage.setItem('juz40-memories', JSON.stringify(memories));localStorage.setItem('juz40-current', current);localStorage.setItem('juz40-founder', JSON.stringify(founder));}catch(e){alert('Фото тым үлкен. Кішірек фото таңдаңыз.')}if(cloud)cloud.save(memories,founder);}
function esc(s=''){return s.replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]));}
function blank(text){return text ? esc(text) : '<span class="empty-copy">Бұл жерді өз сөзіңмен толтыр...</span>'}
function drawTabs(){ tabs.innerHTML = memories.map((m,i)=>`<button class="tab ${i===current?'active':''} ${m.curator?'curator':''}" data-i="${i}" title="${esc(m.name)}">${i+1}</button>`).join(''); tabs.querySelector('.active')?.scrollIntoView({block:'nearest',inline:'center'}); }
function renderFounder(){const photo=$('#founderPhoto');$('#founderName').textContent=founder.name||'Аты-жөнің';$('#founderQuote').textContent=founder.quote?`«${founder.quote}»`:'«Осы жерге өзіңнің жүрекке жақын цитатаңды жаз.»';photo.className='founder-photo '+(founder.photo?'':'empty');photo.innerHTML=founder.photo?`<img src="${founder.photo}" alt="${esc(founder.name)} фотосы">`:'<span>＋</span><small>Фото қосу</small>';}
function render(){const m=memories[current], rev=current%2===1; card.className='memory-card '+(rev?'reverse ':'')+(m.curator?'curator-card':'');
 card.innerHTML=`<div class="photo-block ${m.photo?'':'empty'}">${m.photo?`<img src="${m.photo}" alt="${esc(m.name)} фотосы">`:''}${m.curator?'<span class="curator-badge">КУРАТОР</span>':''}</div><div class="words"><p class="number">${String(current+1).padStart(2,'0')} / ${TOTAL}${m.curator?' · АРНАЙЫ БӨЛІМ':''}</p><h4>${esc(m.name||'Аты-жөнің')}</h4><p class="section-label">МЕН ТУРАЛЫ</p><p class="copy">${blank(m.about)}</p><p class="section-label">JUZ40 ЕСТЕЛІГІМ</p><p class="copy">${blank(m.memory)}</p><p class="quote">${m.quote ? '«'+esc(m.quote)+'»':''}</p><div class="bottom"><a class="insta" ${m.insta?`href="https://instagram.com/${esc(m.insta.replace('@',''))}" target="_blank" rel="noreferrer"`:''}>${m.insta?esc(m.insta):'@instagram'}</a><button class="btn ghost edit" id="edit">Өзгерту ✎</button></div></div>`;
 label.textContent=`${current+1}-парақ / ${TOTAL}`; drawTabs(); localStorage.setItem('juz40-current', current); }
function showEditor(){const m=memories[current]; $('#editorType').textContent=m.curator?'КУРАТОРДЫҢ АРНАЙЫ ПАРАҒЫ':'ОҚУШЫНЫҢ ЕСТЕЛІГІ'; $('#editorTitle').textContent=`${current+1}-парақты толтыру`; $('#nameInput').value=m.name.startsWith('Оқушы ')||m.name.startsWith('Куратор ')?'':m.name; $('#aboutInput').value=m.about; $('#memoryInput').value=m.memory; $('#quoteInput').value=m.quote; $('#instaInput').value=m.insta; const p=$('#photoPreview');p.src=m.photo;p.style.display=m.photo?'block':'none';$('#photoInput').value='';$('#editor').showModal();}
tabs.addEventListener('click', e=>{let i=e.target.dataset.i;if(i!==undefined){current=+i;render();}});
$('#prev').onclick=()=>{current=(current+TOTAL-1)%TOTAL;render()}; $('#next').onclick=()=>{current=(current+1)%TOTAL;render()};
card.addEventListener('click',e=>{if(e.target.closest('#edit')){showEditor();return}if(e.target.closest('.photo-block')){$('#quickPhotoInput').click()}}); $('#openGuide').onclick=()=>$('#guide').showModal();
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>b.closest('dialog').close());
async function smallImage(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>{const img=new Image();img.onload=()=>{const max=1200,scale=Math.min(1,max/Math.max(img.width,img.height)),c=document.createElement('canvas');c.width=Math.round(img.width*scale);c.height=Math.round(img.height*scale);c.getContext('2d').drawImage(img,0,0,c.width,c.height);resolve(c.toDataURL('image/jpeg',.8));};img.onerror=reject;img.src=r.result};r.onerror=reject;r.readAsDataURL(file)})}
$('#photoInput').onchange=async e=>{const f=e.target.files[0];if(!f)return;const p=$('#photoPreview');p.src=await smallImage(f);p.style.display='block'};
$('#quickPhotoInput').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{memories[current].photo=cloud?await cloud.upload(file,current):await smallImage(file);save();render()}catch(err){alert('Фото жүктелмеді. Басқа фотоны байқап көріңіз.')}finally{e.target.value=''}};
$('#editForm').onsubmit=async e=>{e.preventDefault();const m=memories[current];m.name=$('#nameInput').value.trim() || (m.curator?`Куратор ${current+1}`:`Оқушы ${current+1}`);m.about=$('#aboutInput').value.trim();m.memory=$('#memoryInput').value.trim();m.quote=$('#quoteInput').value.trim();m.insta=$('#instaInput').value.trim();const file=$('#photoInput').files[0],preview=$('#photoPreview');if(file&&cloud){try{m.photo=await cloud.upload(file,current)}catch(err){alert('Фото онлайн жүктелмеді. Интернетті және Firebase Storage ережесін тексеріңіз.');return}}else if(preview.style.display!=='none')m.photo=preview.src;save();$('#editor').close();render();};
$('#editFounder').onclick=()=>{const p=$('#founderPreview');$('#founderNameInput').value=founder.name;$('#founderQuoteInput').value=founder.quote;p.src=founder.photo;p.style.display=founder.photo?'block':'none';$('#founderPhotoInput').value='';$('#founderEditor').showModal()};
$('#founderPhotoInput').onchange=async e=>{const f=e.target.files[0];if(!f)return;const p=$('#founderPreview');p.src=await smallImage(f);p.style.display='block'};
$('#founderPhoto').onclick=()=>$('#quickFounderPhotoInput').click();
$('#quickFounderPhotoInput').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{founder.photo=cloud?await cloud.upload(file,'founder'):await smallImage(file);save();renderFounder()}catch(err){alert('Фото жүктелмеді. Басқа фотоны байқап көріңіз.')}finally{e.target.value=''}};
$('#founderForm').onsubmit=async e=>{e.preventDefault();founder.name=$('#founderNameInput').value.trim();founder.quote=$('#founderQuoteInput').value.trim();const file=$('#founderPhotoInput').files[0],p=$('#founderPreview');if(file&&cloud){try{founder.photo=await cloud.upload(file,'founder')}catch(err){alert('Фото онлайн жүктелмеді. Firebase Storage ережесін тексеріңіз.');return}}else if(p.style.display!=='none')founder.photo=p.src;save();renderFounder();$('#founderEditor').close()};
renderFounder();render();

// Firebase бапталған кезде бұл блок барлық өзгерісті бір ортақ альбомға синхрондайды.
(async function connectCloud(){
 if(!window.firebaseConfig) return;
 try {
   const [{initializeApp},{getFirestore,doc,onSnapshot,setDoc},{getStorage,ref,uploadBytes,getDownloadURL}] = await Promise.all([
     import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js'),
     import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js'),
     import('https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js')
   ]);
   const app=initializeApp(window.firebaseConfig), db=getFirestore(app), storage=getStorage(app), album=doc(db,'albums','juz40');
   cloud={save:(data,owner)=>setDoc(album,{memories:data,founder:owner,updatedAt:Date.now()},{merge:true}),upload:async(file,index)=>{const path=`juz40/page-${index+1}-${Date.now()}-${file.name.replace(/[^a-z0-9._-]/gi,'_')}`;const result=await uploadBytes(ref(storage,path),file);return getDownloadURL(result.ref)}};
   onSnapshot(album,snap=>{if(snap.exists()&&Array.isArray(snap.data().memories)){memories=defaults.map((x,i)=>({...x,...(snap.data().memories[i]||{})}));founder={...founder,...(snap.data().founder||{})};renderFounder();render();}else cloud.save(memories,founder)});
 } catch(err){ console.warn('Firebase байланысы орнатылмады:',err); }
})();
