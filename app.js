const STUDENT_NAMES = [
  'Төлеубек Жанболат','Ағзам Қазбек','Аймуханбет Толқын','Айтжан Медина','Алтайбекқызы Альбина','Алтынбек Айша','Аманбай Кәусар','Анарбай Диана','Аппаз Аяулым','Арманқызы Айдана','Арынова Кәусар','Әбдіқалық Дания','Әділнұр Елсая','Байзақ Мирас','Бақыт Абдуллах','Бақытжанқызы Тамила','Балкыбек Нұрбақыт','Бейсеханова Ақбота','Бұлғын Елина','Доғдырхан Айша','Дуйсенбек Маргулан','Елемес Шұғыла','Ерболатұлы Исмаил','Еренбек Аяулым','Еркін Жалын','Ертай Аружан','Есіркеп Бейбарыс','Ешенова Айзере','Жұмали Арыс','Жұман Мансұр','Исақай Мақсат','Қадірберген Әлішер','Қайрат Аңсар','Қалибай Жәңгір','Қойшыбаев Ілияс','Қуанышқали Рауан','Құдайберген Айкүміс','Құлданбек Нұрай','Құрышбек Шұғыла','Қыдыр Ақбота','Мейрамбек Камилла','Мусаев Саид','Назаров Бекарыс','Нурпейіс Нурали','Нүсіпхан Жансая','Нұрғалиқызы Ақнұр','Омархан Жансая','Оразалы Бекарыс','Оразғали Мадина','Орынбасарова Рахима','Оспан Фариза','Сагатов Мирас','Сапах Гүлназ','Сарсенгалиева Айдана','Сембай Сымбат','Серік Аяулым','Серікбек Ғазиза','Сисенбаев Нұрым','Таңатарова Ару','Тәліпжан Төре','Абюр Алихан','Тұрғанбаева Назерке','Халдар Сабира','Шарахмед Бақдаулет','Шәкім Бекзат','Шәкім Гүлзат','Шынберген Дильназ'
];
const TOTAL = STUDENT_NAMES.length;
const CURATORS = new Set();
const defaults = Array.from({length: TOTAL}, (_, i) => ({
  name: STUDENT_NAMES[i],
  about: '', memory: '', quote: '', insta: '', photo: '', curator: CURATORS.has(i+1)
}));
let memories = JSON.parse(localStorage.getItem('juz40-memories') || 'null') || defaults;
memories = defaults.map((x,i)=>{const old=memories[i]||{};const isOldPlaceholder=/^(Куратор|Оқушы) \d+$/.test(String(old.name||''));return {...x,...old,curator:false,name:isOldPlaceholder?x.name:(old.name||x.name)}});
let current = Math.min(TOTAL-1, Number(localStorage.getItem('juz40-current') || 0));
let founder = JSON.parse(localStorage.getItem('juz40-founder') || 'null') || {name:'',quote:'',photo:'',song:''};
let playlists = JSON.parse(localStorage.getItem('juz40-playlists') || 'null') || {covers:['','',''],goldMusic:''};
let cloud = null;
const $ = s => document.querySelector(s);
const tabs = $('#tabs'), card = $('#card'), label = $('#pageLabel');

function save(){try{localStorage.setItem('juz40-memories', JSON.stringify(memories));localStorage.setItem('juz40-current', current);localStorage.setItem('juz40-founder', JSON.stringify(founder));localStorage.setItem('juz40-playlists',JSON.stringify(playlists));}catch(e){alert('Сақтау орындалмады: браузер жады толып қалды. Кішірек фото таңдаңыз немесе ескі фотоларды азайтыңыз.');return false}if(cloud)cloud.save(memories,founder);return true}
function esc(s=''){return s.replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]));}
function blank(text){return text ? esc(text) : '<span class="empty-copy">Бұл жерді өз сөзіңмен толтыр...</span>'}
function drawTabs(){ tabs.innerHTML = memories.map((m,i)=>`<button class="tab ${i===current?'active':''} ${m.curator?'curator':''}" data-i="${i}" title="${esc(m.name)}">${i+1}</button>`).join(''); tabs.querySelector('.active')?.scrollIntoView({block:'nearest',inline:'center'}); }
function renderFounder(){const photo=$('#founderPhoto');$('#founderName').textContent=founder.name||'Аты-жөнің';$('#founderQuote').textContent=founder.quote?`«${founder.quote}»`:'«Осы жерге өзіңнің жүрекке жақын цитатаңды жаз.»';$('#founderSong').textContent=founder.song?`♫ ${founder.song}`:'';photo.className='founder-photo '+(founder.photo?'':'empty');photo.innerHTML=founder.photo?`<img src="${founder.photo}" alt="${esc(founder.name)} фотосы">`:'<span>＋</span><small>Фото қосу</small>';}
function render(){const m=memories[current], rev=current%2===1; card.className='memory-card '+(rev?'reverse ':'');
 const songCoverMarkup=m.songCover?'<img src="'+m.songCover+'" alt="Ән мұқабасы">':'<span>♫</span>';
 const songInfo=(m.songTitle||m.songArtist||m.songCover)?'<div class="profile-track">'+songCoverMarkup+'<div><b>'+esc(m.songTitle||'Сүйікті әнім')+'</b><small>'+esc(m.songArtist||'Авторын жаз')+'</small></div></div>':'';
 card.innerHTML=`<div class="photo-block ${m.photo?'':'empty'}">${m.photo?`<img src="${m.photo}" alt="${esc(m.name)} фотосы">`:''}</div><div class="words"><p class="number">${String(current+1).padStart(2,'0')} / ${TOTAL}</p><h4>${esc(m.name||'Аты-жөнің')}</h4><p class="section-label">СҮЙІКТІ ӘНІМ</p>${songInfo}${m.audio?`<audio class="music-player" controls src="${m.audio}"></audio>`:'<p class="copy empty-copy">Әніңді жүктеп, сыныптастарыңмен бөліс...</p>'}<p class="section-label">JUZ40 ЕСТЕЛІГІМ</p><p class="copy">${blank(m.memory)}</p><p class="quote">${m.quote ? '«'+esc(m.quote)+'»':''}</p><div class="bottom"><a class="insta" ${m.insta?`href="https://instagram.com/${esc(m.insta.replace('@',''))}" target="_blank" rel="noreferrer"`:''}>${m.insta?esc(m.insta):'@instagram'}</a><button class="btn ghost edit" id="edit">Өзгерту ✎</button></div></div>`;
 label.textContent=`${current+1}-парақ / ${TOTAL}`; drawTabs(); localStorage.setItem('juz40-current', current); }
function showEditor(){const m=memories[current]; $('#editorType').textContent='ОҚУШЫНЫҢ ЕСТЕЛІГІ'; $('#editorTitle').textContent=`${current+1}-парақты толтыру`; $('#nameInput').value=m.name; $('#memoryInput').value=m.memory; $('#quoteInput').value=m.quote; $('#instaInput').value=m.insta;$('#songTitleInput').value=m.songTitle||'';$('#songArtistInput').value=m.songArtist||''; const p=$('#photoPreview');p.src=m.photo;p.style.display=m.photo?'block':'none';const s=$('#songCoverPreview');s.src=m.songCover||'';s.style.display=m.songCover?'block':'none';const a=$('#audioPreview');a.src=m.audio||'';a.style.display=m.audio?'block':'none';$('#photoInput').value='';$('#audioInput').value='';$('#songCoverInput').value='';$('#editor').showModal();}
tabs.addEventListener('click', e=>{let i=e.target.dataset.i;if(i!==undefined){current=+i;render();}});
$('#prev').onclick=()=>{current=(current+TOTAL-1)%TOTAL;render()}; $('#next').onclick=()=>{current=(current+1)%TOTAL;render()};
card.addEventListener('click',e=>{if(e.target.closest('#edit')){showEditor();return}if(e.target.closest('.photo-block')){$('#quickPhotoInput').click()}}); $('#openGuide').onclick=()=>$('#guide').showModal();
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>b.closest('dialog').close());
async function smallImage(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>{const img=new Image();img.onload=()=>{const max=640,scale=Math.min(1,max/Math.max(img.width,img.height)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(img.width*scale));c.height=Math.max(1,Math.round(img.height*scale));c.getContext('2d').drawImage(img,0,0,c.width,c.height);resolve(c.toDataURL('image/jpeg',.72));};img.onerror=reject;img.src=r.result};r.onerror=reject;r.readAsDataURL(file)})}
$('#photoInput').onchange=async e=>{const f=e.target.files[0];if(!f)return;const p=$('#photoPreview');p.src=await smallImage(f);p.style.display='block'};
$('#audioInput').onchange=e=>{const f=e.target.files[0];if(!f)return;const a=$('#audioPreview');a.src=URL.createObjectURL(f);a.style.display='block'};
$('#songCoverInput').onchange=async e=>{const f=e.target.files[0];if(!f)return;const p=$('#songCoverPreview');p.src=await smallImage(f);p.style.display='block'};
$('#quickPhotoInput').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{const photo=cloud?await cloud.upload(file,current):await smallImage(file);memories[current].photo=photo;if(save())render()}catch(err){alert('Фото жүктелмеді. Басқа фотоны байқап көріңіз.')}finally{e.target.value=''}};
$('#editForm').onsubmit=async e=>{e.preventDefault();const m=memories[current];m.name=$('#nameInput').value.trim() || STUDENT_NAMES[current];m.memory=$('#memoryInput').value.trim();m.quote=$('#quoteInput').value.trim();m.insta=$('#instaInput').value.trim();m.songTitle=$('#songTitleInput').value.trim();m.songArtist=$('#songArtistInput').value.trim();const file=$('#photoInput').files[0],audioFile=$('#audioInput').files[0],preview=$('#photoPreview'),songPreview=$('#songCoverPreview');try{if(file&&cloud)m.photo=await cloud.upload(file,current);else if(preview.style.display!=='none')m.photo=preview.src;if(songPreview.style.display!=='none')m.songCover=songPreview.src;if(audioFile){if(cloud)m.audio=await cloud.upload(audioFile,`audio-${current}`);else if(audioFile.size<3000000)m.audio=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(audioFile)});else{alert('Үлкен музыканы сақтау үшін Firebase қосыңыз. Қазір 3 МБ-тан кіші файл таңдаңыз.');return}}}catch(err){alert('Файл жүктелмеді. Интернетті не Firebase Storage ережесін тексеріңіз.');return}if(save()){$('#editor').close();render()}};
$('#editFounder').onclick=()=>{const p=$('#founderPreview');$('#founderNameInput').value=founder.name;$('#founderQuoteInput').value=founder.quote;$('#founderSongInput').value=founder.song||'';p.src=founder.photo;p.style.display=founder.photo?'block':'none';$('#founderPhotoInput').value='';$('#founderEditor').showModal()};
$('#founderPhotoInput').onchange=async e=>{const f=e.target.files[0];if(!f)return;const p=$('#founderPreview');p.src=await smallImage(f);p.style.display='block'};
$('#founderPhoto').onclick=()=>$('#quickFounderPhotoInput').click();
$('#quickFounderPhotoInput').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{founder.photo=cloud?await cloud.upload(file,'founder'):await smallImage(file);if(save())renderFounder()}catch(err){alert('Фото жүктелмеді. Басқа фотоны байқап көріңіз.')}finally{e.target.value=''}};
$('#founderForm').onsubmit=async e=>{e.preventDefault();founder.name=$('#founderNameInput').value.trim();founder.quote=$('#founderQuoteInput').value.trim();founder.song=$('#founderSongInput').value.trim();const file=$('#founderPhotoInput').files[0],p=$('#founderPreview');if(file&&cloud){try{founder.photo=await cloud.upload(file,'founder')}catch(err){alert('Фото онлайн жүктелмеді. Firebase Storage ережесін тексеріңіз.');return}}else if(p.style.display!=='none')founder.photo=p.src;if(save()){renderFounder();$('#founderEditor').close()}};

function renderPlaylists(){
  playlists.covers.forEach((cover,index)=>{if(!cover)return;const target=$(`#playlistCover${index}`);if(target.tagName==='IMG')target.src=cover;else target.outerHTML=`<img id="playlistCover${index}" src="${cover}" alt="Плейлист мұқабасы">`;});
}
document.querySelectorAll('[data-cover]').forEach(button=>button.onclick=()=>{$('#playlistPhotoInput').dataset.cover=button.dataset.cover;$('#playlistPhotoInput').click()});
$('#playlistPhotoInput').onchange=async e=>{const file=e.target.files[0],index=Number(e.target.dataset.cover);if(!file||Number.isNaN(index))return;try{playlists.covers[index]=await smallImage(file);save();renderPlaylists()}catch(err){alert('Фото жүктелмеді. Басқа фотоны байқап көріңіз.')}finally{e.target.value=''}};
renderFounder();render();renderPlaylists();

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
   onSnapshot(album,snap=>{if(snap.exists()&&Array.isArray(snap.data().memories)){memories=defaults.map((x,i)=>{const old=snap.data().memories[i]||{};const isOldPlaceholder=/^(Куратор|Оқушы) \d+$/.test(String(old.name||''));return {...x,...old,curator:false,name:isOldPlaceholder?x.name:(old.name||x.name)}});founder={...founder,...(snap.data().founder||{})};renderFounder();render();}else cloud.save(memories,founder)});
 } catch(err){ console.warn('Firebase байланысы орнатылмады:',err); }
})();
