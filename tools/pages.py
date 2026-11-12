# Writes index.html and the two project pages from shared parts, so rail, contact and footer never drift.
# Run: py -I tools/pages.py   (from the site folder)
import re, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
TEMPLATE = ROOT.parent / 'src' / 'template.html'

def hero_parts():
    t = TEMPLATE.read_text(encoding='utf8')
    f = dict(BG='#FBF8F6', INK='#2C1412', SOFT='#7a5a5c', RULE='rgba(44,20,18,.24)', CHIP='rgba(250,246,244,.6)', NUM='', NAME='',
             STAGE0='', R1='', R2='', R3='', HERO_CLASS='direct oceanic warm', TAGLINE='<h2 class="tagline">Boil the Ocean.</h2>')
    t = t.replace("url(data:font/woff2;base64,{{FONT_SANS}})", "url(/fonts/inter-tight.woff2)")
    t = t.replace("url(data:font/woff2;base64,{{FONT_MONO}})", "url(/fonts/jetbrains-mono-500.woff2)")
    t = t.replace('src="data:image/png;base64,{{LOGO_FLAT}}"', 'src="/logo_flat.png"')
    style = re.search(r'<style>(.*?)</style>', t, re.S).group(1)
    hero = re.search(r'(<main class="hero.*?</main>)', t, re.S).group(1)
    hero = re.sub(r'\s*<header class="top">.*?</header>', '', hero, flags=re.S)
    hero = hero.replace('<div class="copy" id="approach">', '<div class="copy">')
    hero = re.sub(r'\{\{(\w+)\}\}', lambda m: f[m.group(1)], style + '\0' + hero)
    style, hero = hero.split('\0')
    hero = hero.replace('<main class="hero', '<section class="hero').replace('</main>', '</section>').replace('aria-label="Vimaksh studio introduction"', 'aria-label="Vimaksh — Boil the Ocean." data-theme="hero"')
    return style, hero

MARK = '<svg class="mark" viewBox="0 0 8 24" aria-hidden="true"><path d="M4 0 C 1.5 4 1.5 8 4 12 S 6.5 20 4 24"/></svg>'

def head(title, desc, style):
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#FBF8F6">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="icon" href="/marks/vimaksh-mark.svg">
<link rel="preload" href="/fonts/inter-tight.woff2" as="font" type="font/woff2" crossorigin>
<style>{style}</style>
<link rel="stylesheet" href="/src/site.css">
</head>
'''

def chrome(base):
    return f'''<a class="skip" href="#main">Skip to content</a>
<div class="rail"><nav aria-label="Main"><a href="{base}#work" data-nav="work">Work{MARK}</a><a href="{base}#approach" data-nav="approach">Approach{MARK}</a><a class="pill" href="{base}#contact" data-nav="contact">Let's talk</a></nav></div>
<a class="mini" href="{base or '#top'}" aria-label="Vimaksh, back to top">Vimaksh</a>
<header class="bar"><a class="bar-mark" href="{base or '#top'}">Vimaksh</a><nav aria-label="Main, compact"><a href="{base}#work" data-nav="work">Work</a><a href="{base}#approach" data-nav="approach">Approach</a><a href="{base}#contact" data-nav="contact">Let's talk</a></nav></header>
'''

def contact(base, condensed=False):
    return f'''<section class="contact{' contact--condensed' if condensed else ''}" id="contact" data-theme="coral" data-nav="contact" aria-labelledby="contact-h">
  <div class="wrap">
    <h2 id="contact-h" class="t-statement">Come build what<br>should exist.</h2>
    <p class="label t-mono">Let's talk</p>
    <a class="email wlink" href="mailto:hq@vimaksh.in">hq@vimaksh.in</a>
  </div>
  <footer class="wrap foot t-cap">
    <div class="brand"><a class="word" href="{base or '#top'}">Vimaksh</a><p>Built from first principles</p></div>
    <ul class="c1"><li><a href="{base}#work">Work</a></li><li><a href="{base}#approach">Approach</a></li><li><a href="{base}#studio">Studio</a></li><li><a href="#top">Back to top</a></li></ul>
    <ul class="c2"><li><a href="https://vimaksh.in/join">Join</a></li><li><a href="https://vimaksh.in/thoughts">Thoughts / Notes</a></li><li><a href="https://vimaksh.in/events">Events</a></li></ul>
    <p class="c3">12.9716° N /<br>77.5946° E</p>
  </footer>
  <div class="fineprint"></div>
</section>
'''

def entry(side, slug, status, live, title, summary, tags, sheet):
    tag_li = ''.join(f'<li>{t}</li>' for t in tags)
    return f'''  <article class="wrap entry entry--{side}">
    <div class="media"><div class="frame">{sheet}</div><div class="wave wave--crimson img-frame" data-wave="frame"></div></div>
    <div class="meta">
      <p class="t-mono status{' status--live' if live else ''}">{status}</p>
      <h3 class="t-title">{title}</h3>
      <p class="t-body">{summary}</p>
      <ul class="tags t-mono" aria-label="Focus">{tag_li}</ul>
      <a class="wlink cover-link" href="/work/{slug}/">Read project<span class="sr"> — {title}</span></a>
    </div>
    <div class="divider wave wave--quiet" data-wave="divider"></div>
  </article>
'''

PARY_SHEET = '<div class="sheet ph-box"><img src="/marks/paryatech-wordmark.svg" alt="" width="276" height="63"><span class="ph">[PLACEHOLDER: real Paryatech product capture]</span></div>'
WING_SHEET = '<div class="sheet" style="background:#F4F0EC"><img src="/marks/wingman-mark.svg" alt="" width="520" height="96"><span class="ph" style="position:absolute;left:24px;bottom:20px">In research / early development.</span></div>'

def home(style, hero):
    return head('Vimaksh — Boil the Ocean.', 'Vimaksh: independent products and open questions, built from first principles and tested in the world.', style) + f'''<body id="top">
{chrome('')}
<main id="main">
{hero}
<div class="horizon" data-theme="ground"><div class="wave wave--crimson" data-wave="horizon"></div></div>

<section class="intro" data-theme="ground" aria-labelledby="intro-h">
  <div class="wrap">
    <h2 id="intro-h" class="t-statement">Ideas made<br>real enough<br>to test.</h2>
    <p class="t-lead">Independent products and open questions, built from first principles and tested in the world.</p>
  </div>
</section>

<section class="work" id="work" data-theme="ground" data-nav="work" aria-labelledby="work-h">
  <div class="wrap work-head"><h2 id="work-h" class="t-index">Selected work</h2><p class="t-mono">Independent experiments</p></div>
{entry('a', 'paryatech', 'Live', True, 'Paryatech', 'From first enquiry to booked trip—one workspace for modern Indian travel agencies.', ['Travel SaaS', 'India-first', 'Operations'], PARY_SHEET)}
{entry('b', 'wingman', 'Exploring', False, 'Wingman', 'An open engineering system for reliable software with AI agents—in research / early development.', ['AI agents', 'Engineering', 'Open system'], WING_SHEET)}
</section>

<div class="chapter" aria-hidden="true"><div class="wave wave--ink" data-wave="chapter"></div></div>

<section class="approach" id="approach" data-theme="foam" data-nav="approach" aria-labelledby="approach-h">
  <div class="wrap">
    <h2 id="approach-h" class="t-section">Built from first principles.</h2>
    <p class="t-lead">Independent products and open questions, built from first principles and tested in the world.</p>
  </div>
  <div class="wrap what">
    <h3 class="t-lead">What we do</h3>
    <ul class="rows">
      <li><span class="ph">[PLACEHOLDER: confirmed service name 1]</span><span class="ph">[PLACEHOLDER: one sentence describing its real deliverables]</span></li>
      <li><span class="ph">[PLACEHOLDER: confirmed service name 2]</span><span class="ph">[PLACEHOLDER: one sentence describing its real deliverables]</span></li>
      <li><span class="ph">[PLACEHOLDER: confirmed service name 3]</span><span class="ph">[PLACEHOLDER: one sentence describing its real deliverables]</span></li>
    </ul>
  </div>
</section>

<section class="studio" id="studio" data-theme="ink" aria-labelledby="studio-h">
  <div class="wrap">
    <h2 id="studio-h" class="t-section">Small party.<br>Large quests.</h2>
    <div class="copy-col t-body">
      <p>Builders, researchers, and relentless question-askers. Different crafts, one shared map, and a stubborn appetite for the unexplored.</p>
      <p>We are a small, exacting team. Join through a role, a shared experiment, or a clear reason to make something together.</p>
      <div><a class="wlink t-mono" href="https://vimaksh.in/join/collaborate" style="text-transform:uppercase;font-size:12px">Collaborate with us</a></div>
    </div>
    <div class="photo ph-box"><span class="ph">[PLACEHOLDER: authentic Vimaksh team at work, supplied with publication permission]</span></div>
    <div class="side">
      <p class="ph">[PLACEHOLDER: factual names, place and activity in this photograph]</p>
      <div class="wave wave--tide" data-wave="studio"></div>
    </div>
  </div>
</section>

{contact('')}
</main>
<script type="module" src="/src/hero/ocean.js"></script>
<script type="module" src="/src/site.js"></script>
</body>
</html>
'''

def project(style, p):
    ev = ''.join(p['evidence'])
    return head(f"{p['title']} — Vimaksh", p['summary'], style) + f'''<body id="top" class="solid-bar">
{chrome('/')}
<a class="ptop" href="/">Vimaksh</a>
<main id="main">
<section data-theme="ground" aria-labelledby="p-h">
  <div class="wrap phead">
    <a class="back wlink" href="/#work">← Back to work</a>
    <p class="t-mono status{' status--live' if p['live'] else ''}">{p['status']} · Published 12 Sep 2026</p>
    <h1 id="p-h" class="t-h1">{p['title']}</h1>
    <p class="summary t-lead">{p['summary']}</p>
    <dl class="pmeta"><div><dt>Type</dt><dd>Independent experiment</dd></div><div><dt>Status</dt><dd>{p['status']}</dd></div><div><dt>Focus</dt><dd>{' / '.join(p['tags'])}</dd></div></dl>
    <div class="pcover frame">{p['cover']}</div>
  </div>
  <div class="wrap pblock"><h2>Overview</h2><div class="text t-body"><p>{p['overview']}</p></div></div>
  <div class="wrap pevidence">{ev}</div>
  <div class="wrap pblock"><h2>Scope and decisions</h2><div class="text t-body"><p class="ph">{p['scope']}</p></div></div>
  <div class="wrap pblock pstatus"><h2>Current status</h2><div class="text t-body"><p>{p['status_text']}</p><p class="t-cap" style="opacity:.75">No published updates yet.</p>{p['action']}</div><div class="divider wave wave--quiet" data-wave="divider"></div></div>
  <div class="wrap pnext entry">
    <div class="name"><p class="t-mono">Next project</p><h2 class="t-title" style="margin-top:12px">{p['next']}</h2><p class="t-mono status{' status--live' if p['next_live'] else ''}" style="margin-top:12px">{p['next_status']}</p><a class="wlink cover-link t-mono" href="/work/{p['next'].lower()}/" style="text-transform:uppercase;font-size:12px;margin-top:16px">Read project<span class="sr"> — {p['next']}</span></a></div>
    <div class="media"><div class="frame">{p['next_sheet']}</div><div class="wave wave--crimson img-frame" data-wave="frame"></div></div>
  </div>
</section>
{contact('/', condensed=True)}
</main>
<script type="module" src="/src/site.js"></script>
</body>
</html>
'''

def ph_fig(cls, label, cap):
    return f'<figure class="{cls}-fig"><div class="{cls} ph-box"><span class="ph">{label}</span></div><figcaption class="t-cap ph">{cap}</figcaption></figure>'

def evidence(label):
    return [ph_fig('full', label, '[PLACEHOLDER: factual caption]'), '</div><div class="wrap pevidence">',
            ph_fig('half', label, '[PLACEHOLDER: factual caption]'), ph_fig('half', label, '[PLACEHOLDER: factual caption]')]

style, hero = hero_parts()
(ROOT / 'index.html').write_text(home(style, hero), encoding='utf8')
PARY = dict(slug='paryatech', title='Paryatech', status='Live', live=True, tags=['Travel SaaS', 'India-first', 'Operations'],
    summary='From first enquiry to booked trip—one workspace for modern Indian travel agencies.',
    overview='Paryatech brings enquiries, client communication, itineraries, proposals, bookings, and follow-ups into one India-first workspace.',
    cover='<div class="sheet ph-box"><img src="/marks/paryatech-wordmark.svg" alt="" width="276" height="63"><span class="ph">[PLACEHOLDER: approved real Paryatech product capture]</span></div>',
    evidence=evidence('[PLACEHOLDER: real product screens approved by Vimaksh]'),
    scope="[PLACEHOLDER: Vimaksh's verified role, challenge, decisions and contribution; the source does not publish these]",
    status_text='Live.', action='<div><a class="wlink t-mono" href="https://www.paryatech.in/" style="text-transform:uppercase;font-size:12px">Visit live project<span class="sr"> (paryatech.in, external site)</span> ↗</a></div>',
    next='Wingman', next_status='Exploring', next_live=False, next_sheet=WING_SHEET)
WING = dict(slug='wingman', title='Wingman', status='Exploring', live=False, tags=['AI agents', 'Engineering', 'Open system'],
    summary='An open engineering system for reliable software with AI agents—in research / early development.',
    overview='Wingman is an open engineering system being researched for designing, building, shipping, and improving reliable software with AI agents.',
    cover=WING_SHEET, evidence=evidence('[PLACEHOLDER: approved research artifact, diagram or prototype capture]'),
    scope='[PLACEHOLDER: verified research question, Vimaksh contribution and documented decisions]',
    status_text='In research / early development.', action='',
    next='Paryatech', next_status='Live', next_live=True, next_sheet=PARY_SHEET)
for p in (PARY, WING):
    (ROOT / 'work' / p['slug'] / 'index.html').write_text(project(style, p), encoding='utf8')
print('written: index.html, work/paryatech/index.html, work/wingman/index.html')
