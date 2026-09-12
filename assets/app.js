/* ================= Prism AI — app.js =================
   Free multi-assistant AI platform. No API keys.
   Backend : Puter.js  (puter.ai.chat / puter.ai.txt2img)
             keyless, browser-side, free "user-pays" model.
====================================================== */
(() => {
'use strict';

const LS_KEY   = 'prismai.v1';
const IMG_MODEL = 'gpt-image-1';   // Vision studio image model

// Curated, currently-valid Puter model catalogue (fast/free-friendly first)
const MODELS = [
  { id:'openai:openai/gpt-4.1-mini',            label:'GPT-4.1 mini · fast' },
  { id:'openai:openai/gpt-5-nano',              label:'GPT-5 nano · quick' },
  { id:'openai:openai/gpt-4o-mini',             label:'GPT-4o mini' },
  { id:'openai:openai/gpt-5-mini',              label:'GPT-5 mini · smart' },
  { id:'anthropic:anthropic/claude-haiku-4-5',  label:'Claude Haiku 4.5' },
  { id:'anthropic:anthropic/claude-sonnet-4-5', label:'Claude Sonnet 4.5' },
  { id:'google:google/gemini-2.5-flash',        label:'Gemini 2.5 Flash' },
  { id:'google:google/gemini-3.5-flash',        label:'Gemini 3.5 Flash' },
  { id:'alibaba:deepseek/deepseek-v3.2',        label:'DeepSeek V3.2' },
  { id:'z-ai:z-ai/glm-4.6',                     label:'GLM-4.6' }
];
const DEFAULT_MODEL = MODELS[0].id;
const puterReady = () => typeof window.puter !== 'undefined' && puter.ai && puter.ai.chat;

/* ---------------- Assistants ---------------- */
const ASSISTANTS = [
  {
    id:'prism', name:'Prism', tag:'General assistant', emoji:'✦',
    color:'linear-gradient(135deg,#7c5cff,#00d4ff)',
    desc:'A sharp, friendly all-rounder for everyday questions, explanations, brainstorming, and getting things done.',
    system:'You are Prism, a helpful, knowledgeable and friendly general-purpose AI assistant. Give clear, well-structured answers. Use Markdown, headings, lists and code blocks when they help. Be concise but complete, and honest about uncertainty.',
    suggestions:[
      {t:'Explain a concept',p:'Explain how large language models work, in simple terms with an analogy.'},
      {t:'Plan my week',p:'Help me plan a productive but balanced work week. Ask me 3 quick questions first.'},
      {t:'Brainstorm',p:'Give me 10 creative names for a free AI tools startup, with a one-line rationale each.'},
      {t:'Summarize',p:'Summarize the pros and cons of remote work in a clear table.'}
    ]
  },
  {
    id:'forge', name:'Forge', tag:'Code & debugging', emoji:'⚡',
    color:'linear-gradient(135deg,#ffb454,#ff5c72)',
    desc:'A senior software engineer for writing, refactoring, explaining, and debugging code in any language.',
    system:'You are Forge, an expert senior software engineer. Write clean, correct, production-quality code with brief explanations. Prefer modern idioms and best practices. Always use fenced code blocks with the correct language tag. When debugging, reason step by step and point out the root cause. Ask for clarification only when truly necessary.',
    suggestions:[
      {t:'Debug this',p:'Here is a bug I keep hitting. Ask me to paste the code and error, then help me fix it.'},
      {t:'Write a function',p:'Write a well-documented Python function that deduplicates a list of dicts by a chosen key.'},
      {t:'Explain code',p:'Explain what a JavaScript Promise is and show a clean async/await example.'},
      {t:'Refactor',p:'Show me before/after of refactoring a long nested if-else into cleaner code.'}
    ]
  },
  {
    id:'sentinel', name:'Sentinel', tag:'Defensive security', emoji:'🛡️',
    color:'linear-gradient(135deg,#22c98a,#00d4ff)',
    desc:'A cybersecurity mentor for defense, secure coding, hardening, and understanding threats — educational and blue-team focused.',
    system:'You are Sentinel, a cybersecurity expert focused strictly on DEFENSIVE security, secure development, and education. You help with secure code review, hardening, threat modeling, detection, incident response, explaining vulnerabilities conceptually so they can be defended, CTF/learning guidance, and best practices (OWASP, CIS, etc.). You do NOT provide working exploits, malware, intrusion instructions, or anything intended to attack systems without authorization. If a request looks offensive/malicious, briefly redirect to the defensive equivalent. Be practical and precise, cite standards where useful.',
    suggestions:[
      {t:'Secure my code',p:'Review a login form for security issues and show me how to harden it against common attacks.'},
      {t:'Explain a vuln',p:'Explain what SQL injection is and, most importantly, how to prevent it. Show safe vs unsafe code.'},
      {t:'Threat model',p:'Walk me through building a simple threat model for a small web app.'},
      {t:'Harden a server',p:'Give me a practical checklist to harden a fresh Linux web server.'}
    ]
  },
  {
    id:'scout', name:'Scout', tag:'Research & analysis', emoji:'🔎',
    color:'linear-gradient(135deg,#00d4ff,#7c5cff)',
    desc:'A meticulous research analyst for synthesizing information, comparing options, and structuring findings ethically.',
    system:'You are Scout, a rigorous research and analysis assistant. You help users understand topics, compare options, weigh evidence, and structure findings. Present balanced, well-organized analysis with clear structure (tables, pros/cons, key takeaways). Distinguish fact from inference, note uncertainty, and never fabricate sources or private personal data. Keep research ethical and based on general/public knowledge.',
    suggestions:[
      {t:'Compare options',p:'Compare three popular JavaScript frameworks for a new project, in a decision table.'},
      {t:'Break it down',p:'Break down the key factors I should consider before buying an electric car.'},
      {t:'Deep dive',p:'Give me a structured briefing on how solid-state batteries work and why they matter.'},
      {t:'Fact vs myth',p:'Separate common myths from facts about nutrition and metabolism.'}
    ]
  },
  {
    id:'sage', name:'Sage', tag:'Writing & content', emoji:'✍️',
    color:'linear-gradient(135deg,#ff5c72,#7c5cff)',
    desc:'A versatile writer and editor for emails, essays, posts, marketing copy, and polishing your drafts.',
    system:'You are Sage, an expert writer and editor. You craft clear, engaging, well-toned writing and improve drafts for clarity, flow and impact. Adapt to the requested tone, audience and format. Offer options when useful, and explain notable edits briefly. Keep the user\'s voice intact.',
    suggestions:[
      {t:'Write an email',p:'Write a polite, professional email asking for a deadline extension of three days.'},
      {t:'Polish my draft',p:'Ask me to paste a paragraph, then tighten it and make it more engaging.'},
      {t:'Social post',p:'Write 3 punchy LinkedIn post options announcing a free AI tools platform.'},
      {t:'Rewrite tone',p:'Rewrite "we cannot help you with that" to sound friendly and helpful.'}
    ]
  },
  {
    id:'vision', name:'Vision', tag:'Image generation', emoji:'🎨',
    color:'linear-gradient(135deg,#7c5cff,#ff5c72)',
    desc:'An AI image studio. Describe anything and Vision paints it — art, logos, scenes, concepts.',
    mode:'image',
    system:'',
    suggestions:[
      {t:'Fantasy scene',p:'a lone astronaut watching two moons rise over a neon desert, cinematic, highly detailed'},
      {t:'Logo concept',p:'minimalist geometric fox logo, gradient purple to cyan, flat vector, clean'},
      {t:'Product shot',p:'a sleek wireless headphone on a marble surface, studio lighting, product photography'},
      {t:'Dreamy art',p:'a cozy bookshop inside a giant tree, warm light, ghibli-style illustration'}
    ]
  }
];
const byId = id => ASSISTANTS.find(a => a.id === id) || ASSISTANTS[0];

/* ---------------- State ---------------- */
let state = load();
let controller = null;        // reserved
let streaming = false;
let stopRequested = false;    // set by Stop button to break the stream loop

function load(){
  try{
    const s = JSON.parse(localStorage.getItem(LS_KEY));
    if(s && s.chats){
      if(!MODELS.some(m=>m.id===s.model)) s.model = DEFAULT_MODEL; // normalise legacy ids
      return s;
    }
  }catch(e){}
  return { chats:[], activeId:null, assistantId:'prism', model:DEFAULT_MODEL };
}
// Persist; if quota is hit, shed cached image data (keep prompts) and retry.
function save(){
  try{ localStorage.setItem(LS_KEY, JSON.stringify(state)); }
  catch(e){
    try{
      const imgs=[];
      state.chats.forEach(c=>c.messages.forEach(m=>{ if(m.image&&m.image.dataUrl) imgs.push(m.image); }));
      imgs.slice(0,Math.max(0,imgs.length-2)).forEach(i=>delete i.dataUrl); // keep only 2 newest cached
      localStorage.setItem(LS_KEY, JSON.stringify(state));
    }catch(_){}
  }
}
const uid = () => Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const activeChat = () => state.chats.find(c => c.id === state.activeId) || null;

/* ---------------- DOM ---------------- */
const $ = s => document.querySelector(s);
const el = (t,c,h) => { const n=document.createElement(t); if(c)n.className=c; if(h!=null)n.innerHTML=h; return n; };

const app        = $('#app');
const landing    = $('#landing');
const messagesEl = $('#messages');
const scrollEl   = $('#chat-scroll');
const emptyEl    = $('#empty-state');
const inputEl    = $('#input');
const sendBtn    = $('#send-btn');
const stopBtn    = $('#stop-btn');
const chatListEl = $('#chat-list');
const modelSel   = $('#model-select');

/* ---------------- Markdown ---------------- */
if(window.marked){
  marked.setOptions({ breaks:true, gfm:true });
}
function renderMarkdown(text){
  let html;
  try{
    html = window.marked ? marked.parse(text||'') : escapeHtml(text||'').replace(/\n/g,'<br>');
  }catch(e){ html = escapeHtml(text||'').replace(/\n/g,'<br>'); }
  if(window.DOMPurify) html = DOMPurify.sanitize(html,{ADD_ATTR:['target']});
  return html;
}
function escapeHtml(s){ return (s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

// Turn <pre><code> into rich blocks with header + copy + highlight
function enhanceCode(container){
  container.querySelectorAll('pre > code').forEach(code => {
    const pre = code.parentElement;
    if(pre.parentElement.classList.contains('code-wrap')) return;
    let lang = (code.className.match(/language-([\w+#-]+)/)||[])[1] || 'text';
    if(window.hljs){
      try{ window.hljs.highlightElement(code); }catch(e){}
    }
    const wrap = el('div','code-wrap');
    const head = el('div','code-head',
      `<span class="code-lang">${escapeHtml(lang)}</span>
       <button class="code-copy" type="button">${copySvg()} Copy</button>`);
    pre.replaceWith(wrap);
    wrap.appendChild(head);
    wrap.appendChild(pre);
    head.querySelector('.code-copy').addEventListener('click', e=>{
      navigator.clipboard.writeText(code.innerText).then(()=>{
        e.currentTarget.innerHTML = '✓ Copied';
        setTimeout(()=>{ e.currentTarget.innerHTML = copySvg()+' Copy'; },1400);
      });
    });
  });
  // open external links safely
  container.querySelectorAll('a[href]').forEach(a=>{ a.target='_blank'; a.rel='noopener noreferrer'; });
}
const copySvg = () => '<svg viewBox="0 0 24 24" width="13" height="13" style="vertical-align:-2px"><path fill="currentColor" d="M16 1H4a2 2 0 00-2 2v12h2V3h12V1zm3 4H8a2 2 0 00-2 2v14a2 2 0 002 2h11a2 2 0 002-2V7a2 2 0 00-2-2zm0 16H8V7h11v14z"/></svg>';

/* ================= View switching ================= */
function enterApp(assistantId){
  if(assistantId) state.assistantId = assistantId;
  landing.classList.add('hidden');
  app.classList.remove('hidden');
  save();
  renderSidebar();
  renderAssistantHeader();
  populateModels();
  if(!activeChat()) newChat(false);
  else renderChat();
  setTimeout(()=>inputEl.focus(),50);
  location.hash = '#app';
}
function goLanding(){
  app.classList.add('hidden');
  landing.classList.remove('hidden');
  window.scrollTo(0,0);
  if(location.hash==='#app') history.replaceState(null,'',location.pathname);
}

/* ================= Chats ================= */
function newChat(focus=true){
  // reuse an existing empty chat for this assistant instead of piling up blanks
  const existing = state.chats.find(c=>c.assistantId===state.assistantId && c.messages.length===0);
  const chat = existing || { id:uid(), assistantId:state.assistantId, title:'New chat', createdAt:Date.now(), messages:[] };
  if(!existing) state.chats.unshift(chat);
  state.activeId = chat.id;
  save(); renderSidebar(); renderAssistantHeader(); renderChat();
  closeSidebarMobile();
  if(focus) setTimeout(()=>inputEl.focus(),30);
}
function deleteChat(id){
  state.chats = state.chats.filter(c=>c.id!==id);
  if(state.activeId===id) state.activeId = state.chats[0]?.id || null;
  save();
  if(!state.activeId) newChat(false); else { renderSidebar(); renderAssistantHeader(); renderChat(); }
}
function clearAll(){
  if(!state.chats.length) return;
  if(!confirm('Delete ALL conversations? This cannot be undone.')) return;
  state.chats=[]; state.activeId=null; save(); newChat(false); toast('All conversations cleared');
}

/* ================= Rendering: sidebar ================= */
function renderSidebar(){
  // current assistant mini card
  const a = byId(state.assistantId);
  $('#assistant-mini').innerHTML =
    `<div class="am-emoji" style="background:${a.color}">${a.emoji}</div>
     <div><div class="am-name">${a.name}</div><div class="am-tag">${a.tag}</div></div>`;

  // chat list
  chatListEl.innerHTML='';
  if(!state.chats.length){ chatListEl.appendChild(el('div','chat-empty','No conversations yet')); return; }
  state.chats.forEach(c=>{
    const a2 = byId(c.assistantId);
    const item = el('div','chat-item'+(c.id===state.activeId?' active':''));
    item.innerHTML = `<span class="ci-emoji">${a2.emoji}</span>
      <span class="ci-title">${escapeHtml(c.title||'New chat')}</span>
      <button class="ci-del" title="Delete">✕</button>`;
    item.addEventListener('click', e=>{
      if(e.target.classList.contains('ci-del')){ deleteChat(c.id); return; }
      state.activeId=c.id; state.assistantId=c.assistantId; save();
      renderSidebar(); renderAssistantHeader(); renderChat(); closeSidebarMobile();
    });
    chatListEl.appendChild(item);
  });
}

function renderAssistantHeader(){
  const a = byId(state.assistantId);
  $('#topbar-assistant').innerHTML =
    `<div class="ta-emoji" style="background:${a.color}">${a.emoji}</div>
     <div><div>${a.name}</div><div class="ta-tag">${a.tag}</div></div>`;
  // empty state
  $('#empty-avatar').style.background = a.color;
  $('#empty-avatar').textContent = a.emoji;
  $('#empty-title').textContent = a.mode==='image' ? `Describe an image` : `Chat with ${a.name}`;
  $('#empty-desc').textContent = a.desc;
  const sg = $('#suggestions'); sg.innerHTML='';
  a.suggestions.forEach(s=>{
    const b = el('button','sugg',`<b>${escapeHtml(s.t)}</b>${escapeHtml(s.p.length>64?s.p.slice(0,64)+'…':s.p)}`);
    b.addEventListener('click',()=>{ inputEl.value=s.p; autosize(); send(); });
    sg.appendChild(b);
  });
  modelSel.style.display = a.mode==='image' ? 'none' : '';
}

/* ================= Rendering: messages ================= */
function renderChat(){
  const chat = activeChat();
  messagesEl.innerHTML='';
  const has = chat && chat.messages.length;
  emptyEl.classList.toggle('hide', !!has);
  if(!has) return;
  chat.messages.forEach((m,i)=> messagesEl.appendChild(buildMessage(m,i)));
  requestAnimationFrame(()=>scrollBottom(true));
}

function buildMessage(m, index){
  const a = byId(activeChat()?.assistantId || state.assistantId);
  const row = el('div','msg '+m.role);
  const avatar = el('div','avatar');
  if(m.role==='user'){ avatar.textContent='🙂'; }
  else{ avatar.textContent=a.emoji; avatar.style.background=a.color; }
  const body = el('div','body');
  const who = el('div','who', m.role==='user'?'You':a.name);
  body.appendChild(who);

  if(m.reasoning){
    const d = el('details','think');
    d.innerHTML = `<summary>Thoughts</summary><div class="think-body">${escapeHtml(m.reasoning)}</div>`;
    body.appendChild(d);
  }

  const bubble = el('div','bubble');
  if(m.image){
    bubble.appendChild(buildImage(m.image, m));
  }else{
    bubble.innerHTML = renderMarkdown(m.content);
    enhanceCode(bubble);
  }
  body.appendChild(bubble);

  // actions (assistant text only)
  if(m.role==='assistant' && !m.image){
    const acts = el('div','msg-actions');
    const copy = el('button',null,copySvg()+' Copy');
    copy.addEventListener('click',()=>{ navigator.clipboard.writeText(m.content||''); toast('Copied to clipboard'); });
    acts.appendChild(copy);
    if(index === (activeChat().messages.length-1)){
      const regen = el('button',null,'↻ Regenerate');
      regen.addEventListener('click',()=>regenerate());
      acts.appendChild(regen);
    }
    body.appendChild(acts);
  }
  row.appendChild(avatar); row.appendChild(body);
  return row;
}

// Render (and, if needed, generate) an image message via puter.ai.txt2img
function buildImage(img, msg){
  const wrap = el('div','gen-img');
  const finish = (src)=>{
    wrap.classList.remove('loading'); wrap.innerHTML='';
    const image = new Image(); image.alt = img.prompt||'Generated image'; image.src = src;
    wrap.appendChild(image); wrap.appendChild(imgBar(img, src)); scrollBottomIfNear();
  };
  if(img.dataUrl){ finish(img.dataUrl); return wrap; }

  wrap.classList.add('loading'); wrap.textContent='\u{1F3A8} Painting your image\u2026';
  (async()=>{
    try{
      if(!puterReady()) throw new Error('AI engine still loading \u2014 try again in a second.');
      const res = await puter.ai.txt2img(img.prompt, { model: img.model || IMG_MODEL });
      const src = (res && res.src) ? res.src : (typeof res==='string'? res : (res && res.toString ? res.toString() : ''));
      if(!src || src.length<10) throw new Error('no image returned');
      img.dataUrl = src;
      if(msg){ msg.image = img; save(); }
      finish(src);
    }catch(e){
      wrap.classList.remove('loading'); wrap.innerHTML='';
      const box = el('div',null,'<div style="padding:16px;color:var(--muted);font-size:14px">\u26A0 Could not create the image.<br><span style="color:var(--muted2)">'+escapeHtml(String(e.message||e)).slice(0,140)+'</span></div>');
      const retry = el('button','sugg','\u21BB Try again'); retry.style.pointerEvents='auto'; retry.style.margin='0 16px 14px';
      retry.onclick = ()=>{ delete img.dataUrl; wrap.replaceWith(buildImage(img, msg)); };
      wrap.appendChild(box); wrap.appendChild(retry);
    }
  })();
  return wrap;
}
function imgBar(img, src){
  const bar = el('div','gen-bar');
  bar.innerHTML =
    '<a href="'+src+'" target="_blank" rel="noopener" download="prism-image.png">\u2B07 Download</a>'+
    '<button type="button" class="gb-regen">\u21BB Regenerate</button>'+
    '<button type="button" class="gb-copy">\u29C9 Copy prompt</button>';
  bar.querySelector('.gb-regen').onclick = e=>{
    const w = e.target.closest('.gen-img');
    delete img.dataUrl;
    w.replaceWith(buildImage(img, findImageMsg(img)));
  };
  bar.querySelector('.gb-copy').onclick = ()=>{ navigator.clipboard.writeText(img.prompt||''); toast('Prompt copied'); };
  return bar;
}
function findImageMsg(img){
  const chat = activeChat(); if(!chat) return null;
  return chat.messages.find(m=>m.image===img) || null;
}

/* ================= Sending / streaming ================= */
function autosize(){ inputEl.style.height='auto'; inputEl.style.height=Math.min(inputEl.scrollHeight,200)+'px'; }

async function send(){
  if(streaming) return;
  const text = inputEl.value.trim();
  if(!text) return;
  let chat = activeChat();
  if(!chat){ newChat(false); chat = activeChat(); }
  const a = byId(chat.assistantId);

  inputEl.value=''; autosize();
  emptyEl.classList.add('hide');

  // slash command: /image works from any assistant
  const imgCmd = text.match(/^\/(?:image|img|imagine)\s+([\s\S]+)/i);
  if(a.mode==='image' || imgCmd){
    const prompt = imgCmd ? imgCmd[1].trim() : text;
    pushMessage(chat,{role:'user',content: imgCmd?('/image '+prompt):prompt});
    const imgMsg = {role:'assistant', content:'', image:{prompt, model:IMG_MODEL}};
    pushMessage(chat,imgMsg);
    if(chat.title==='New chat'){ chat.title = prompt.slice(0,42); }
    save(); renderSidebar(); renderChat();
    return;
  }

  pushMessage(chat,{role:'user',content:text});
  if(chat.title==='New chat'){ chat.title = text.slice(0,42); }
  const assistantMsg = {role:'assistant',content:'',reasoning:''};
  pushMessage(chat,assistantMsg);
  save(); renderSidebar();
  renderChat();

  await streamCompletion(chat, a, assistantMsg);
}

function pushMessage(chat,m){ chat.messages.push(m); }

async function streamCompletion(chat, assistant, target){
  streaming=true; setSending(true); stopRequested=false;

  // build messages (exclude the empty target + any image messages)
  const history = chat.messages.filter(m=>m!==target && !m.image)
    .map(m=>({role:m.role, content:m.content}));
  const messages = [];
  if(assistant.system) messages.push({role:'system', content:assistant.system});
  messages.push(...history);

  const row = messagesEl.lastElementChild;
  const bubble = row && row.querySelector('.bubble');
  if(bubble) bubble.innerHTML = '<span class="dots"><i></i><i></i><i></i></span>';

  let content='', reasoning='', gotFirst=false, rafPending=false;
  const paint = ()=>{
    rafPending=false;
    if(!bubble) return;
    if(reasoning && !row.querySelector('.think')){
      const d = el('details','think');
      d.setAttribute('open','');
      d.innerHTML='<summary>Thoughts</summary><div class="think-body"></div>';
      row.querySelector('.body').insertBefore(d, bubble);
    }
    const tb = row.querySelector('.think .think-body');
    if(tb) tb.textContent = reasoning;
    bubble.innerHTML = renderMarkdown(content) + (streaming?'<span class="caret"></span>':'');
  };
  const schedule = ()=>{ if(!rafPending){ rafPending=true; requestAnimationFrame(paint); } };

  try{
    if(!puterReady()){
      await new Promise(r=>{ let n=0; const t=setInterval(()=>{ if(puterReady()||n++>40){clearInterval(t);r();} },100); });
      if(!puterReady()) throw new Error('AI engine failed to load — check your connection and refresh.');
    }
    const resp = await puter.ai.chat(messages, { model: state.model || DEFAULT_MODEL, stream:true });
    if(resp && typeof resp[Symbol.asyncIterator]==='function'){
      for await (const part of resp){
        if(stopRequested) break;
        const d = extractDelta(part);
        if(d.text){ content += d.text; gotFirst=true; }
        if(d.reasoning){ reasoning += d.reasoning; }
        schedule();
        if(gotFirst) scrollBottomIfNear();
      }
    }else{
      content = extractFull(resp); gotFirst = !!content; schedule();
    }
    if(!content && !reasoning) throw new Error('The model returned an empty response — try another model.');
  }catch(err){
    if(!stopRequested){
      const raw = String((err && (err.message || (err.error && (err.error.message||err.error)))) || err || 'error');
      content = content || ('⚠️ **Could not get a response.** ' + friendlyErr(raw) + '\n\n`' + escapeHtml(raw).slice(0,180) + '`');
    }
  }finally{
    streaming=false; setSending(false); stopRequested=false;
    target.content = content; target.reasoning = reasoning;
    if(!reasoning) delete target.reasoning;
    save();
    renderChat();
    scrollBottomIfNear(true);
    autoTitle(chat, content);
  }
}

// --- Puter response helpers ---
function extractDelta(part){
  if(part==null) return {};
  if(typeof part==='string') return {text:part};
  if(part.type==='reasoning') return {reasoning: part.text || part.reasoning || ''};
  let text = (typeof part.text==='string') ? part.text : '';
  let reasoning = (typeof part.reasoning==='string') ? part.reasoning : '';
  if(!text && part.delta && typeof part.delta.content==='string') text = part.delta.content;
  if(!text && part.message && typeof part.message.content==='string') text = part.message.content;
  return {text, reasoning};
}
function extractFull(resp){
  if(resp==null) return '';
  if(typeof resp==='string') return resp;
  const c = resp.message && resp.message.content;
  if(typeof c==='string') return c;
  if(Array.isArray(c)) return c.map(b=> (typeof b==='string'?b:(b && b.text)||'')).join('');
  if(typeof resp.text==='string') return resp.text;
  return (resp.toString && resp.toString()!=='[object Object]') ? resp.toString() : '';
}
function friendlyErr(m){
  m=(m||'').toLowerCase();
  if(m.includes('usage')||m.includes('credit')||m.includes('quota')||m.includes('insufficient')||m.includes('402')||m.includes('permission'))
    return 'That model may need Puter credits — pick a lighter model near the top of the list and retry.';
  if(m.includes('auth')||m.includes('sign')||m.includes('login')||m.includes('token'))
    return 'Please complete the one-tap Puter access prompt, then send again.';
  if(m.includes('rate')||m.includes('429')||m.includes('busy'))
    return 'The free service is busy right now — wait a moment and retry.';
  return 'The free service may be busy — try again, or switch models.';
}

function regenerate(){
  const chat = activeChat();
  if(!chat || streaming) return;
  // drop trailing assistant messages, keep last user
  while(chat.messages.length && chat.messages[chat.messages.length-1].role==='assistant') chat.messages.pop();
  const lastUser = [...chat.messages].reverse().find(m=>m.role==='user');
  if(!lastUser) return;
  const a = byId(chat.assistantId);
  if(a.mode==='image' || (lastUser.content||'').match(/^\/(?:image|img|imagine)\s+/i)){
    const prompt = (lastUser.content||'').replace(/^\/(?:image|img|imagine)\s+/i,'');
    const imgMsg = {role:'assistant',content:'',image:{prompt,model:IMG_MODEL}};
    pushMessage(chat,imgMsg); save(); renderChat(); return;
  }
  const assistantMsg={role:'assistant',content:'',reasoning:''};
  pushMessage(chat,assistantMsg); save(); renderChat();
  streamCompletion(chat,a,assistantMsg);
}

function stop(){ stopRequested = true; try{ controller && controller.abort(); }catch(e){} setSending(false); streaming=false; }

function setSending(on){
  sendBtn.hidden = on; stopBtn.hidden = !on;
  inputEl.disabled = false;
}

/* auto-title from first exchange (kept short) */
function autoTitle(chat, content){
  if(chat._titled || !content) return;
  const firstUser = chat.messages.find(m=>m.role==='user');
  if(firstUser){ chat.title = firstUser.content.slice(0,42); chat._titled=true; save(); renderSidebar(); }
}

/* ================= Scroll helpers ================= */
function nearBottom(){ return scrollEl.scrollHeight - scrollEl.scrollTop - scrollEl.clientHeight < 140; }
function scrollBottom(force){ if(force||nearBottom()) scrollEl.scrollTop = scrollEl.scrollHeight; }
let wasNear = true;
function scrollBottomIfNear(force){ if(force||wasNear) scrollEl.scrollTop = scrollEl.scrollHeight; }
scrollEl?.addEventListener('scroll',()=>{ wasNear = nearBottom(); },{passive:true});

/* ================= Models ================= */
function populateModels(){
  if(modelSel.dataset.loaded) return;
  modelSel.innerHTML='';
  MODELS.forEach(m=>addModel(m.id,m.label));
  if(!MODELS.some(m=>m.id===state.model)) state.model = DEFAULT_MODEL;
  modelSel.value = state.model;
  modelSel.dataset.loaded='1';
}
function addModel(id,label){ const o=document.createElement('option'); o.value=id; o.textContent=label; modelSel.appendChild(o); }

/* ================= Export ================= */
function exportChat(){
  const chat = activeChat();
  if(!chat || !chat.messages.length){ toast('Nothing to export'); return; }
  const a = byId(chat.assistantId);
  let md = `# ${chat.title}\n\n> Prism AI · ${a.name} (${a.tag}) · ${new Date(chat.createdAt).toLocaleString()}\n\n---\n\n`;
  chat.messages.forEach(m=>{
    md += `**${m.role==='user'?'You':a.name}:**\n\n`;
    md += m.image ? `🎨 *Image generated from prompt:* "${m.image.prompt}"\n\n` : (m.content+'\n\n');
    md += `---\n\n`;
  });
  const blob = new Blob([md],{type:'text/markdown'});
  const url = URL.createObjectURL(blob);
  const link = el('a'); link.href=url; link.download=`${chat.title.replace(/[^\w-]+/g,'_')}.md`;
  document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
  toast('Conversation exported');
}

/* ================= Assistant picker ================= */
function openPicker(){
  const grid = $('#picker-grid'); grid.innerHTML='';
  ASSISTANTS.forEach(a=>{
    const card = el('button','picker-card'+(a.id===state.assistantId?' active':''));
    card.innerHTML=`<div class="pc-emoji" style="background:${a.color}">${a.emoji}</div>
      <div class="pc-tag">${a.tag}</div><h4>${a.name}</h4><p>${a.desc}</p>`;
    card.addEventListener('click',()=>{ chooseAssistant(a.id); closePicker(); });
    grid.appendChild(card);
  });
  $('#picker-backdrop').classList.remove('hidden');
}
function closePicker(){ $('#picker-backdrop').classList.add('hidden'); }
function chooseAssistant(id){
  state.assistantId=id;
  const chat=activeChat();
  // if current chat is empty, adopt this assistant; else start a fresh chat
  if(chat && chat.messages.length===0){ chat.assistantId=id; }
  else{ newChat(false); }
  save(); renderSidebar(); renderAssistantHeader();
  modelSel.dataset.loaded=''; populateModels();
  renderChat();
  toast(`Switched to ${byId(id).name}`);
}

/* ================= Landing assistant grid ================= */
function renderLandingAssistants(){
  const grid = $('#assistant-grid'); if(!grid) return;
  grid.innerHTML='';
  ASSISTANTS.forEach(a=>{
    const card = el('article','a-card');
    card.innerHTML =
      `<div class="a-emoji" style="background:${a.color}">${a.emoji}</div>
       <div class="a-tag">${a.tag}</div>
       <h3>${a.name}</h3>
       <p>${a.desc}</p>
       <div class="a-try">Try ${a.name} →</div>`;
    card.addEventListener('click',()=>enterApp(a.id));
    grid.appendChild(card);
  });
  $('#stat-assistants').textContent = ASSISTANTS.length;
}

/* ================= Toast ================= */
let toastT;
function toast(msg){
  const t=$('#toast'); t.textContent=msg; t.classList.add('show');
  clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove('show'),2200);
}

/* ================= Sidebar mobile ================= */
function openSidebarMobile(){ app.classList.add('sb-open'); }
function closeSidebarMobile(){ app.classList.remove('sb-open'); }

/* ================= Events ================= */
function bind(){
  document.querySelectorAll('[data-enter-app]').forEach(b=>b.addEventListener('click',()=>enterApp()));
  document.querySelectorAll('[data-home]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();goLanding();}));

  $('#new-chat').addEventListener('click',()=>newChat());
  $('#assistant-switch').addEventListener('click',openPicker);
  $('#picker-close').addEventListener('click',closePicker);
  $('#picker-backdrop').addEventListener('click',e=>{ if(e.target.id==='picker-backdrop') closePicker(); });
  $('#clear-all').addEventListener('click',clearAll);
  $('#export-chat').addEventListener('click',exportChat);
  $('#sb-open').addEventListener('click',openSidebarMobile);
  $('#sb-close').addEventListener('click',closeSidebarMobile);
  $('#sb-backdrop').addEventListener('click',closeSidebarMobile);

  sendBtn.addEventListener('click',send);
  stopBtn.addEventListener('click',stop);
  modelSel.addEventListener('change',e=>{ state.model=e.target.value; save(); });

  inputEl.addEventListener('input',autosize);
  inputEl.addEventListener('keydown',e=>{
    if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); send(); }
  });

  window.addEventListener('keydown',e=>{ if(e.key==='Escape'){ closePicker(); } });
  // fix GitHub link if repo known via meta (updated post-deploy); else point to generic
}

/* ================= Init ================= */
function init(){
  renderLandingAssistants();
  bind();
  // restore session if user was in the app
  if(location.hash==='#app'){ enterApp(); }
}
document.addEventListener('DOMContentLoaded',init);
})();
