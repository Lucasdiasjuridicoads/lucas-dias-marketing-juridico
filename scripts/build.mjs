/**
 * Construtor do blog Lucas Dias — sem React ou dependências npm.
 * O Sveltia CMS cria arquivos JSON em content/posts; este script gera
 * páginas HTML estáticas individuais para SEO, sitemap e RSS.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pub = path.join(root, 'public');
const out = path.join(root, 'dist');
const postFolder = path.join(root, 'content', 'posts');
const cfg = JSON.parse(fs.readFileSync(path.join(root,'site.config.json'),'utf8'));
const base = cfg.site_url.replace(/\/$/, '');
const wa = '5569984936584';
const h = (text='') => String(text ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
const attr = h;
const absolute = (p='') => p.startsWith('http') ? p : `${base}${p.startsWith('/')?'':'/'}${p}`;
const isSafeUrl = u => /^(https?:\/\/|\/|#|mailto:)/i.test(String(u||''));
const link = (u,txt) => isSafeUrl(u) ? `<a href="${attr(u)}"${/^https?:/.test(u)?' target="_blank" rel="noopener noreferrer"':''}>${txt}</a>` : txt;
const formatDate = d => { const s=String(d||'').slice(0,10); const [y,m,day]=s.split('-');return (y&&m&&day)?`${day}/${m}/${y}`:s; };
const safeDate = d => /^\d{4}-\d{2}-\d{2}/.test(String(d||''))?String(d).slice(0,10):new Date().toISOString().slice(0,10);
const slug = str => String(str||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9-]/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'').slice(0,90);
const imageOrFallback = p => p && isSafeUrl(p) ? p : '/assets/autoridade-digital.jpeg';

function inline(raw) {
  let s = h(raw);
  // Imagens e links Markdown. O conteúdo original é escapado para impedir HTML arbitrário.
  s = s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g,(_m,alt,url) => isSafeUrl(url) ? `<img src="${attr(url)}" alt="${attr(alt)}" loading="lazy">` : h(alt));
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g,(_m,text,url) => link(url,h(text)));
  s = s.replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>');
  s = s.replace(/__([^_]+)__/g,'<strong>$1</strong>');
  s = s.replace(/(^|[^*])\*([^*\n]+)\*/g,'$1<em>$2</em>');
  s = s.replace(/`([^`]+)`/g,'<code>$1</code>');
  return s;
}

function markdown(md='') {
  const lines=String(md).replace(/\r/g,'').split('\n');
  let blocks=[],paragraph=[],list=[],listType='',quote=[],code=[],fenced=false;
  const flushP=()=>{if(paragraph.length){blocks.push(`<p>${inline(paragraph.join(' '))}</p>`);paragraph=[];}};
  const flushL=()=>{if(list.length){blocks.push(`<${listType}>${list.map(x=>`<li>${inline(x)}</li>`).join('')}</${listType}>`);list=[];listType='';}};
  const flushQ=()=>{if(quote.length){blocks.push(`<blockquote>${inline(quote.join(' '))}</blockquote>`);quote=[];}};
  const close=()=>{flushP();flushL();flushQ();};
  for(const line of lines){
    if(/^\s*```/.test(line)){close();if(fenced){blocks.push(`<pre><code>${h(code.join('\n'))}</code></pre>`);code=[];fenced=false;}else fenced=true;continue;}
    if(fenced){code.push(line);continue;}
    if(!line.trim()){close();continue;}
    const head=line.match(/^(#{1,4})\s+(.+)$/);
    if(head){close();const n=Math.min(Math.max(head[1].length,2),6);blocks.push(`<h${n}>${inline(head[2])}</h${n}>`);continue;}
    if(/^([-*_])\1{2,}\s*$/.test(line)){close();blocks.push('<hr>');continue;}
    const ordered=line.match(/^\s*\d+\.\s+(.+)$/);
    const bullet=line.match(/^\s*[-*+]\s+(.+)$/);
    if(ordered||bullet){flushP();flushQ();const type=ordered?'ol':'ul';if(listType&&listType!==type)flushL();listType=type;list.push((ordered||bullet)[1]);continue;}
    if(/^\s*>\s?/.test(line)){flushP();flushL();quote.push(line.replace(/^\s*>\s?/,''));continue;}
    flushL();flushQ();paragraph.push(line.trim());
  }
  close();if(fenced)blocks.push(`<pre><code>${h(code.join('\n'))}</code></pre>`);
  return blocks.join('\n');
}

function copyDir(src,dst) { for(const item of fs.readdirSync(src,{withFileTypes:true})){
  const from=path.join(src,item.name),to=path.join(dst,item.name);
  if(item.isDirectory()){fs.mkdirSync(to,{recursive:true});copyDir(from,to);} else if(item.isFile()){fs.mkdirSync(path.dirname(to),{recursive:true});fs.copyFileSync(from,to);}
}}

function layout({title,description,canonical,image,body,ogType='website',jsonLd=null}){
 const seoTitle = `${title} | Lucas Dias — Marketing Jurídico`;
 return `<!DOCTYPE html>
<html lang="pt-BR"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#003366">
<title>${h(seoTitle)}</title><meta name="description" content="${attr(description)}"><meta name="robots" content="index,follow">
<link rel="canonical" href="${attr(absolute(canonical))}"><link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">
<meta property="og:locale" content="pt_BR"><meta property="og:type" content="${attr(ogType)}"><meta property="og:title" content="${attr(seoTitle)}"><meta property="og:description" content="${attr(description)}"><meta property="og:url" content="${attr(absolute(canonical))}"><meta property="og:image" content="${attr(absolute(imageOrFallback(image)))}">
<meta name="twitter:card" content="summary_large_image">
<link rel="stylesheet" href="/assets/blog.css">
${jsonLd?`<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g,'\\u003c')}</script>`:''}
</head><body>
<header class="site-header"><div class="wrap header-row">
<a href="/" class="brand" aria-label="Ir para a página inicial"><img src="/assets/lucas-dias-logo.jpeg" alt="Lucas Dias Marketing Jurídico" width="210" height="70"></a>
<button class="mobile-toggle" id="mobile-toggle" aria-controls="nav-links" aria-expanded="false" aria-label="Abrir menu">☰</button>
<nav id="nav-links" class="nav-links" aria-label="Menu principal">
<a href="/">Início</a><a href="/#servicos">Serviços</a><a href="/#sobre">Sobre mim</a><a href="/blog/" class="active" aria-current="page">Blog</a><a href="/#contato">Contato</a><a class="top-cta" target="_blank" rel="noopener noreferrer" href="https://wa.me/${wa}?text=${encodeURIComponent('Olá, Lucas! Vim pelo blog e gostaria de conversar sobre marketing jurídico para meu escritório.')}">Falar no WhatsApp ↗</a></nav>
</div></header>
${body}
<footer class="footer"><div class="wrap footer-grid"><div><a href="/"><img class="footer-logo" src="/assets/lucas-dias-logo.jpeg" alt="Lucas Dias Marketing Jurídico" loading="lazy"></a><p>Conteúdo sobre tráfego pago, marketing jurídico e estratégias comerciais para escritórios de advocacia.</p></div><div><h3>Explore</h3><a href="/">Página inicial</a><a href="/blog/">Todos os artigos</a><a href="/#contato">Fale comigo</a></div><div><h3>Redes e contato</h3><a href="https://www.instagram.com/juridico_ads/" rel="noopener noreferrer" target="_blank">Instagram @juridico_ads</a><a href="https://wa.me/${wa}" rel="noopener noreferrer" target="_blank">WhatsApp (69) 98493-6584</a></div></div><div class="wrap foot-bottom">© <span id="year"></span> Lucas Dias — Marketing Jurídico. Todos os direitos reservados.</div></footer>
<a class="float-wa" href="https://wa.me/${wa}?text=${encodeURIComponent('Olá, Lucas! Conheci seu blog e gostaria de conversar sobre marketing jurídico.') }" aria-label="Conversar pelo WhatsApp" target="_blank" rel="noopener noreferrer">✆</a>
<script>document.getElementById('year').textContent=new Date().getFullYear();const toggle=document.getElementById('mobile-toggle'),nav=document.getElementById('nav-links');toggle.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',open);toggle.textContent=open?'×':'☰';});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');toggle.setAttribute('aria-expanded','false');toggle.textContent='☰';}));</script>
</body></html>`;
}

function card(p) {return `<article class="article-card" data-category="${attr(p.category)}" data-search="${attr(`${p.title} ${p.description} ${p.category}`.toLowerCase())}">
<a class="cover-link" href="${p.url}" aria-label="Ler ${attr(p.title)}"><img class="card-img" src="${attr(imageOrFallback(p.image))}" alt="${attr(p.title)}" loading="lazy"></a>
<div class="article-card-body"><span class="eyebrow">${h(p.category)}</span><time datetime="${attr(p.date)}">${h(formatDate(p.date))}</time><h3><a href="${p.url}">${h(p.title)}</a></h3><p>${h(p.description)}</p><a class="read-more" href="${p.url}">Ler artigo <span aria-hidden="true">→</span></a></div></article>`;}

if(fs.existsSync(out)) fs.rmSync(out,{recursive:true,force:true});
fs.mkdirSync(out,{recursive:true});copyDir(pub,out);
let posts = fs.readdirSync(postFolder).filter(f=>f.endsWith('.json')).map(filename=>{
 const p = JSON.parse(fs.readFileSync(path.join(postFolder,filename),'utf8'));
 const s=slug(path.basename(filename,'.json'));
 if(!s) throw new Error(`Nome de artigo inválido: ${filename}`);
 if(!p.title || !p.description || !p.body) throw new Error(`Artigo ${filename} sem título, descrição ou conteúdo`);
 return {...p, slug:s, date:safeDate(p.date),category:p.category || 'Marketing Jurídico',author:p.author||'Lucas Dias',url:`/blog/${s}/`};
}).filter(p=>p.published!==false).sort((a,b)=>b.date.localeCompare(a.date)||a.title.localeCompare(b.title,'pt-BR'));
for(const p of posts){
 const related=posts.filter(x=>x.slug!==p.slug).slice(0,2);
 const content=`<div class="article-hero"><div class="wrap"><a class="crumb" href="/blog/">← Voltar ao blog</a><span class="pill">${h(p.category)}</span><h1>${h(p.title)}</h1><p class="article-subtitle">${h(p.description)}</p><div class="byline"><img src="/assets/lucas-dias-foto.jpeg" alt="Lucas Dias" loading="lazy"><div><strong>${h(p.author)}</strong><small>Publicado em <time datetime="${attr(p.date)}">${h(formatDate(p.date))}</time></small></div></div></div></div>
<main class="wrap article-main"><figure class="feature"><img src="${attr(imageOrFallback(p.image))}" alt="Imagem de destaque: ${attr(p.title)}"></figure>
<div class="article-layout"><article class="prose">${markdown(p.body)}<div class="article-after"><p>Quer entender como essas estratégias podem se aplicar ao seu escritório?</p><a class="btn-orange" href="https://wa.me/${wa}?text=${encodeURIComponent(`Olá, Lucas! Li seu artigo: ${p.title}. Gostaria de saber mais sobre seus serviços de marketing jurídico.`)}" target="_blank" rel="noopener noreferrer">Conversar sobre marketing jurídico ↗</a></div></article>
<aside class="sidebar"><div class="sidebar-box"><img src="/assets/lucas-dias-foto.jpeg" alt="Lucas Dias" loading="lazy"><div><strong>Lucas Dias</strong><span>Gestor de tráfego pago e especialista em marketing jurídico.</span></div><a href="/#sobre">Conheça meu trabalho ↗</a></div><div class="sidebar-box"><h3>Continue aprendendo</h3>${related.map(r=>`<a class="aside-article" href="${r.url}">${h(r.title)} →</a>`).join('')}</div></aside></div></main>
<section class="article-end"><div class="wrap"><h2>Mais conteúdos para seu escritório</h2><div class="article-grid">${related.map(card).join('')}</div><a class="all-link" href="/blog/">Ver todos os artigos →</a></div></section>`;
 const schema={'@context':'https://schema.org','@type':'BlogPosting',headline:p.title,description:p.description,datePublished:p.date,dateModified:p.date,author:{'@type':'Person',name:p.author},publisher:{'@type':'Organization',name:'Lucas Dias Marketing Jurídico'},image:absolute(imageOrFallback(p.image)),mainEntityOfPage:absolute(p.url),inLanguage:'pt-BR'};
 const page=layout({title:p.title,description:p.description,canonical:p.url,image:p.image,ogType:'article',jsonLd:schema,body:content});
 const dest=path.join(out,'blog',p.slug,'index.html');fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,page);
}
const categories=[...new Set(posts.map(p=>p.category))];
const grid=posts.map(card).join('\n');
const listBody=`<main><section class="blog-hero"><div class="wrap"><span class="top-tag">Conteúdo &amp; estratégia</span><h1>Blog de Marketing <em>Jurídico.</em></h1><p>Artigos e orientações sobre tráfego pago, posicionamento digital e inteligência comercial para escritórios de advocacia.</p><a class="btn-orange" href="/#contato">Solicitar análise estratégica ↗</a></div></section>
<section class="listing wrap"><div class="listing-title"><div><span class="section-tag">Aprendizado contínuo</span><h2>Artigos e estratégias</h2><p>Informações úteis para apoiar suas decisões de marketing.</p></div><span class="counter">${posts.length} ${posts.length===1?'artigo publicado':'artigos publicados'}</span></div>
<div class="filters"><label for="search">Pesquisar artigos</label><input id="search" type="search" placeholder="Digite um tema, como Google Ads ou tráfego pago..." autocomplete="off"><div class="filter-buttons"><button type="button" class="filter active" data-category="all">Todos</button>${categories.map(c=>`<button type="button" class="filter" data-category="${attr(c)}">${h(c)}</button>`).join('')}</div></div>
<div class="article-grid" id="article-grid">${grid}</div><p id="empty" hidden>Nenhum artigo encontrado. Tente outra palavra ou categoria.</p></section>
<section class="cta-stripe"><div class="wrap"><div><h2>Seu escritório precisa de estratégia, não apenas de anúncios.</h2><p>Descubra como unir campanhas, posicionamento e atendimento comercial.</p></div><a class="btn-orange" href="https://wa.me/${wa}" rel="noopener noreferrer" target="_blank">Falar com Lucas Dias ↗</a></div></section></main>
<script>(()=>{const search=document.getElementById('search'),cards=[...document.querySelectorAll('#article-grid .article-card')],buttons=[...document.querySelectorAll('.filter')],empty=document.getElementById('empty');let cat='all';function apply(){let count=0;for(const c of cards){const match=(cat==='all'||c.dataset.category===cat)&&c.dataset.search.includes(search.value.trim().toLocaleLowerCase('pt-BR'));c.hidden=!match;if(match)count++;}empty.hidden=count!==0;}search.addEventListener('input',apply);buttons.forEach(b=>b.addEventListener('click',()=>{cat=b.dataset.category;buttons.forEach(x=>x.classList.toggle('active',x===b));apply();}));})();</script>`;
const indexSchema={'@context':'https://schema.org','@type':'Blog',name:'Blog de Marketing Jurídico — Lucas Dias',url:absolute('/blog/'),inLanguage:'pt-BR',publisher:{'@type':'Person',name:'Lucas Dias'}};
const indexPage=layout({title:'Blog de Marketing Jurídico',description:'Artigos sobre tráfego pago para advogados, marketing jurídico em Rondônia e estratégias de crescimento para escritórios de advocacia.',canonical:'/blog/',image:'/assets/autoridade-digital.jpeg',jsonLd:indexSchema,body:listBody});
fs.mkdirSync(path.join(out,'blog'),{recursive:true});fs.writeFileSync(path.join(out,'blog','index.html'),indexPage);
// Home original: substituir apenas a área entre marcadores para mostrar os artigos mais recentes.
const homePath=path.join(out,'index.html');let homepage=fs.readFileSync(homePath,'utf8');
const latest=`<!-- BLOG_LATEST_START --><div class="home-blog-grid">${posts.slice(0,3).map(p=>`<article class="home-blog-item"><a href="${p.url}"><img loading="lazy" src="${attr(imageOrFallback(p.image))}" alt="${attr(p.title)}"></a><div class="home-blog-item-body"><span class="home-category">${h(p.category)}</span><h3><a href="${p.url}">${h(p.title)}</a></h3><p>${h(p.description)}</p><a href="${p.url}">Ler artigo →</a></div></article>`).join('')}</div><!-- BLOG_LATEST_END -->`;
homepage=homepage.replace(/<!-- BLOG_LATEST_START -->[\s\S]*?<!-- BLOG_LATEST_END -->/, latest);fs.writeFileSync(homePath,homepage);
// Sitemap com URLs canônicas: facilita descoberta, mas não garante indexação.
const sitemap=[{url:'/',date:safeDate(new Date().toISOString())},{url:'/blog/',date:safeDate(new Date().toISOString())},...posts.map(p=>({url:p.url,date:p.date}))];
fs.writeFileSync(path.join(out,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+sitemap.map(p=>`  <url><loc>${h(absolute(p.url))}</loc><lastmod>${p.date}</lastmod></url>`).join('\n')+'\n</urlset>\n');
fs.writeFileSync(path.join(out,'robots.txt'),`User-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: ${base}/sitemap.xml\n`);
const rssText=posts.slice(0,20).map(p=>`<item><title>${h(p.title)}</title><link>${h(absolute(p.url))}</link><guid>${h(absolute(p.url))}</guid><description>${h(p.description)}</description><pubDate>${new Date(p.date+'T12:00:00Z').toUTCString()}</pubDate></item>`).join('');
fs.writeFileSync(path.join(out,'feed.xml'),`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Blog Lucas Dias Marketing Jurídico</title><link>${base}/blog/</link><description>Marketing jurídico, tráfego pago e gestão comercial para advogados.</description><language>pt-BR</language>${rssText}</channel></rss>`);
console.log(`✓ Site gerado em dist/ com ${posts.length} artigos, blog, sitemap e RSS.`);
