// EvanFlow Keys – LOCAL-ONLY (with configurable SoundFont base path and detailed logging)
(function(){
  let ctx, mixBus, dryGain, sendGain, reverbIn, reverbOut, master, mediaDest, mediaRecorder, recordedChunks = [];
  const activeVoices = new Map();
  let sustainOn = false;
  let startedOnce = false;

  function ensureSoundfontLib(){
    if (!window.Soundfont) {
      const box = document.getElementById('ef-tests');
      if (box){
        const span = document.createElement('span');
        span.className = 'ef-test ef-fail';
        span.textContent = '✖ Local Soundfont library missing (place assets/js/soundfont-player.min.js)';
        box.appendChild(span);
      }
      throw new Error('Local Soundfont library missing. Place assets/js/soundfont-player.min.js');
    }
  }
  function ensureAudio(){
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    mixBus = new GainNode(ctx, { gain: 1 });
    dryGain = new GainNode(ctx, { gain: 1 });
    reverbIn = new GainNode(ctx, { gain: 0.3 });
    const delays = [0.0297, 0.0371, 0.0411, 0.0437].map(t => new DelayNode(ctx, { delayTime: t }));
    const fbs = delays.map(() => new GainNode(ctx, { gain: 0.78 }));
    const ap1 = new BiquadFilterNode(ctx, { type: 'allpass', Q: 0.5, frequency: 700 });
    const ap2 = new BiquadFilterNode(ctx, { type: 'allpass', Q: 0.5, frequency: 1800 });
    delays.forEach((d,i)=>{ reverbIn.connect(d); d.connect(fbs[i]); fbs[i].connect(d); d.connect(ap1); });
    ap1.connect(ap2); reverbOut = new GainNode(ctx, { gain: 1 }); ap2.connect(reverbOut);
    sendGain = new GainNode(ctx, { gain: parseFloat(document.getElementById('ef-reverb').value) || 0 });
    mixBus.connect(dryGain); mixBus.connect(sendGain).connect(reverbIn);
    const sum = new GainNode(ctx, { gain: 1 }); dryGain.connect(sum); reverbOut.connect(sum);
    const comp = new DynamicsCompressorNode(ctx, { threshold: -12, ratio: 12, attack: 0.003, release: 0.25, knee: 20 });
    master = new GainNode(ctx, { gain: 0.9 }); sum.connect(comp).connect(master).connect(ctx.destination);
    mediaDest = ctx.createMediaStreamDestination(); master.connect(mediaDest);
  }
  async function resumeOnGesture(){
    try{
      ensureAudio();
      if (ctx.state !== 'running') { await ctx.resume(); }
      if (!startedOnce){ startedOnce = true; const b=document.getElementById('ef-audioBtn'); if (b) b.textContent='Audio Ready'; }
    }catch(e){ console.warn('Could not resume AudioContext:', e); }
  }

  // ==== CONFIGURABLE SOUND FONT BASE PATH ====
  // Priority: window.EFK_SF_BASE -> <body data-sf-base="..."> -> default "/soundfonts"
  function getSfBase(){
    if (typeof window.EFK_SF_BASE === 'string' && window.EFK_SF_BASE.length) return window.EFK_SF_BASE.replace(/\/+$/,'');
    const bd = document.body && document.body.getAttribute('data-sf-base');
    if (bd) return bd.replace(/\/+$/,'');
    return '/soundfonts';
  }

  const MAP = {
    piano:'acoustic_grand_piano', harpsichord:'harpsichord', accordion:'accordion',
    guitar_acoustic:'acoustic_guitar_steel', guitar_electric:'electric_guitar_clean', bass_guitar:'electric_bass_finger',
    violin:'violin', viola:'viola', cello:'cello', double_bass:'contrabass', harp:'orchestral_harp',
    mandolin:'mandolin', ukulele:'ukulele', banjo:'banjo', sitar:'sitar',
    xylophone:'xylophone', glockenspiel:'glockenspiel', vibraphone:'vibraphone', timpani:'timpani',
    trumpet:'trumpet', trombone:'trombone', tuba:'tuba', french_horn:'french_horn',
    cornet:'trumpet', flugelhorn:'trumpet',
    flute:'flute', piccolo:'piccolo', clarinet:'clarinet', oboe:'oboe', bassoon:'bassoon', saxophone:'alto_sax', recorder:'recorder', harmonica:'harmonica',
    synth:null
  };
  const PERC='percussion';
  const PERC_MAP={0:36,1:38,2:42,3:46,4:41,5:45,6:48,7:49,8:51,9:39,10:70,11:56,12:36,13:38,14:42,15:46,16:43,17:47,18:50,19:55,20:52,21:37,22:54,23:75};
  const HAND_PERC={congas:[63,64], bongos:[60,61], djembe:[64,63], cajon:[41,43], tabla:[63,64], tambourine:[54], triangle:[80], maracas:[70]};
  const sfCache=new Map(); const SF=()=>window.Soundfont;

  function makeLocalUrl(n,sf,fmt){
    const base = getSfBase(); // e.g. "/soundfonts" or "./soundfonts"
    const url = `${base}/${sf}/${n}-${fmt}.js`;
    console.log('[SoundFont] Loading:', url);
    return url;
  }

  async function getPlayer(instKey){
    ensureAudio();
    ensureSoundfontLib();
    let name = MAP[instKey]; let isPerc=false;
    if (instKey==='drumkit' || instKey in HAND_PERC){ name=PERC; isPerc=true; }
    if (!name && instKey!=='synth') name='acoustic_grand_piano';
    // Special case for ukulele variants
    if (name==='ukulele' && !sfCache.has('ukulele')){
      // Use ukulele if present; otherwise try nylon guitar as a fallback (requires that file to exist).
      name='ukulele';
    }
    if (sfCache.has(name||instKey)) return { player: sfCache.get(name||instKey), isPerc };
    const player = await SF().instrument(ctx, name||'acoustic_grand_piano', { soundfont:'MusyngKite', destination: mixBus, nameToUrl: makeLocalUrl });
    sfCache.set(name||instKey, player); return { player, isPerc };
  }
  function midiToFreq(m){ return 440*Math.pow(2,(m-69)/12); }
  const BASE=60, OCTS=2; function keyToMidi(k){ return BASE+k; }

  function fallbackBeep(){
    const o=new OscillatorNode(ctx,{type:'sine',frequency:880});
    const g=new GainNode(ctx,{gain:0.15});
    o.connect(g).connect(master||ctx.destination);
    o.start(); setTimeout(()=>{ try{o.stop();}catch(e){} try{g.disconnect();}catch(e){} },120);
  }

  async function startVoice(midi, idx){
    const type = document.getElementById('ef-instrument').value;
    if (type==='synth') return synthVoice(midi);
    try{
      const { player, isPerc } = await getPlayer(type);
      if (type in HAND_PERC){ const n = HAND_PERC[type][idx%HAND_PERC[type].length]; const node=player.play(n,0,{gain:1}); return { stop:()=>{} }; }
      if (isPerc){ const gm = PERC_MAP[idx%24]||36; const node=player.play(gm,0,{gain:1}); return { stop:()=>{} }; }
      const node = player.play(midi,0,{gain:1}); return { stop:()=>{ try{ node.stop&&node.stop(); }catch(e){} } };
    }catch(e){
      console.error('Instrument failed to load. Check Network tab for 404/blocked file.');
      fallbackBeep();
      return { stop:()=>{} };
    }
  }
  function synthVoice(midi){
    const f=midiToFreq(midi); const o=new OscillatorNode(ctx,{type:'sawtooth',frequency:f}); const lp=new BiquadFilterNode(ctx,{type:'lowpass',frequency:4000});
    o.connect(lp).connect(mixBus||ctx.destination); o.start(); return { stop:()=>{ try{o.stop();}catch(e){} try{lp.disconnect();}catch(e){} } };
  }

  async function noteOnAsync(key){
    ensureAudio(); await resumeOnGesture();
    const octave = parseInt(document.getElementById('ef-octave').value,10)||0;
    const midi = keyToMidi(key)+(octave*12); if (activeVoices.has(key)) return;
    const v = await startVoice(midi, key); activeVoices.set(key, v);
  }
  function noteOn(k){ noteOnAsync(k); }
  function noteOff(k){ if (!ctx) return; if (sustainOn) return; const v=activeVoices.get(k); if (v){ try{v.stop();}catch(e){} activeVoices.delete(k); } }

  // UI Keyboard
  const NOTES=[{n:'C',i:0,w:true},{n:'C#',i:1,w:false},{n:'D',i:2,w:true},{n:'D#',i:3,w:false},{n:'E',i:4,w:true},{n:'F',i:5,w:true},{n:'F#',i:6,w:false},{n:'G',i:7,w:true},{n:'G#',i:8,w:false},{n:'A',i:9,w:true},{n:'A#',i:10,w:false},{n:'B',i:11,w:true}];
  const kbd=document.getElementById('ef-kbd');
  function renderKeyboard(){
    const whites=document.createElement('div'); whites.className='ef-white-keys';
    const blacks=document.createElement('div'); blacks.className='ef-black-keys';
    for (let o=0;o<OCTS;o++){
      NOTES.forEach(k=>{ const idx=o*12+k.i; if (k.w){ const el=document.createElement('div'); el.className='ef-key'; el.dataset.idx=idx; const lab=document.createElement('div'); lab.className='ef-note-label'; lab.textContent=k.n+(o+4); el.appendChild(lab); whites.appendChild(el);} });
      ['C#','D#','sp','F#','G#','A#','sp'].forEach(name=>{ if (name==='sp'){ const s=document.createElement('div'); s.className='ef-spacer'; blacks.appendChild(s); } else { const el=document.createElement('div'); el.className='ef-key ef-black'; el.dataset.name=name; el.dataset.oct=o; blacks.appendChild(el);} });
    }
    kbd.innerHTML=''; kbd.appendChild(whites); kbd.appendChild(blacks);
    blacks.childNodes.forEach(ch=>{ if (!ch.classList || !ch.classList.contains('ef-key')) return; const name=ch.dataset.name; const o=parseInt(ch.dataset.oct,10); const idx=NOTES.find(x=>x.n===name).i+(o*12); ch.dataset.idx=idx; });
    kbd.querySelectorAll('.ef-key').forEach(el=>{
      el.addEventListener('pointerdown', async e=>{ e.preventDefault(); await resumeOnGesture(); el.classList.add('active'); noteOn(parseInt(el.dataset.idx,10)); });
      el.addEventListener('pointerenter', e=>{ if (e.buttons===1){ el.classList.add('active'); noteOn(parseInt(el.dataset.idx,10)); } });
      el.addEventListener('pointerup', ()=>{ el.classList.remove('active'); noteOff(parseInt(el.dataset.idx,10)); });
      el.addEventListener('pointerleave', ()=>{ if (!sustainOn){ el.classList.remove('active'); noteOff(parseInt(el.dataset.idx,10)); } });
    });
  }
  renderKeyboard();

  // QWERTY
  const keyMap={'z':0,'s':1,'x':2,'d':3,'c':4,'v':5,'g':6,'b':7,'h':8,'n':9,'j':10,'m':11,'q':12,'2':13,'w':14,'3':15,'e':16,'r':17,'5':18,'t':19,'6':20,'y':21,'7':22,'u':23};
  const downKeys=new Set();
  window.addEventListener('keydown', async e=>{
    if (e.repeat) return;
    if (e.key==='Shift'){ sustainOn=true; document.getElementById('ef-sustainBtn').classList.add('active'); return; }
    const k=keyMap[e.key.toLowerCase()];
    if (k!=null){ await resumeOnGesture(); downKeys.add(k); noteOn(k); const el=kbd.querySelector(`.ef-key[data-idx="${k}"]`); if (el) el.classList.add('active'); }
  });
  window.addEventListener('keyup', e=>{ if (e.key==='Shift'){ sustainOn=false; document.getElementById('ef-sustainBtn').classList.remove('active'); releaseSustained(); return; } const k=keyMap[e.key.toLowerCase()]; if (k!=null){ downKeys.delete(k); noteOff(k); const el=kbd.querySelector(`.ef-key[data-idx="${k}"]`); if (el) el.classList.remove('active'); } });
  function releaseSustained(){ [...activeVoices.keys()].forEach(i=>{ if (![...downKeys].includes(i)){ const v=activeVoices.get(i); if (v){ try{v.stop();}catch(e){} activeVoices.delete(i); } } }); }

  // Controls
  const instEl=document.getElementById('ef-instrument');
  instEl.addEventListener('change', ()=>{ const v=instEl.value; const kit=document.getElementById('ef-kitMap'); if (kit) kit.style.display=(v==='drumkit')?'inline-flex':'none'; });
  document.getElementById('ef-audioBtn').addEventListener('click', async ()=>{ await resumeOnGesture(); });
  document.getElementById('ef-sustainBtn').addEventListener('click', ()=>{ sustainOn=!sustainOn; document.getElementById('ef-sustainBtn').classList.toggle('active', sustainOn); if (!sustainOn) releaseSustained(); });
  document.getElementById('ef-reverb').addEventListener('input', (e)=>{ if (sendGain) sendGain.gain.value=parseFloat(e.target.value)||0; });

  // Recording
  document.getElementById('ef-recordBtn').addEventListener('click', async ()=>{
    await resumeOnGesture();
    if (!mediaRecorder || mediaRecorder.state==='inactive'){
      recordedChunks=[];
      mediaRecorder=new MediaRecorder(mediaDest.stream);
      mediaRecorder.ondataavailable=e=>{ if (e.data.size>0) recordedChunks.push(e.data); };
      mediaRecorder.onstop=()=>{ const blob=new Blob(recordedChunks,{type:'audio/webm'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='evanflow-jam.webm'; const btn=document.getElementById('ef-downloadBtn'); btn.disabled=false; btn.onclick=()=>a.click(); };
      mediaRecorder.start(); document.getElementById('ef-recordBtn').classList.add('active'); document.getElementById('ef-recordBtn').textContent='Stop';
    }else{
      mediaRecorder.stop(); document.getElementById('ef-recordBtn').classList.remove('active'); document.getElementById('ef-recordBtn').textContent='Record';
    }
  });

  // MIDI
  document.getElementById('ef-midiBtn').addEventListener('click', async ()=>{
    try{
      await resumeOnGesture();
      const access=await navigator.requestMIDIAccess();
      access.inputs.forEach(input=>{ input.onmidimessage=(msg)=>{ const [status,d1,d2]=msg.data; const type=status&0xf0; if (type===0x90 && d2>0){ const key=d1-60; if (key>=0 && key<24) noteOn(key);} else if (type===0x80 || (type===0x90 && d2===0)){ const key=d1-60; if (key>=0 && key<24) noteOff(key);} else if (type===0xB0 && d1===64){ sustainOn=d2>=64; document.getElementById('ef-sustainBtn').classList.toggle('active',sustainOn); if (!sustainOn) releaseSustained(); } }; });
      document.getElementById('ef-midiBtn').textContent='MIDI Ready';
    }catch(e){ alert('MIDI not available in this browser.'); }
  });

  // Diagnostics
  function pill(box, name, pass, info=''){ const span=document.createElement('span'); span.className=`ef-test ${pass?'ef-pass':'ef-fail'}`; span.textContent=`${pass?'✔':'✖'} ${name}${info?' – '+info:''}`; box.appendChild(span); }
  (function runTests(){
    const box=document.getElementById('ef-tests'); if (!box) return;
    pill(box,'AudioContext API', !!window.AudioContext||!!window.webkitAudioContext);
    pill(box,'Soundfont lib present (local)', !!window.Soundfont, !!window.Soundfont?'':'missing');
    pill(box,'Instrument menu populated', document.querySelectorAll('#ef-instrument option').length>=25);
    const base = getSfBase();
    pill(box,'SF base path', !!base, base);
  })();
})();
