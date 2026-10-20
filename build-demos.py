"""Build the offline, single-file Shape Efficiency Lab.

Sources: es192-8a-shape-demos.src.html (markup + CSS) and js/*.js (joined in name order into one script).
Inlines vendor/three-r128.min.js and vendor/OrbitControls-r128.js (three.js r128, MIT licence).

Writes
  es192-8a-shape-demos.html   page body only (for embedding in another page)
  site/index.html             complete HTML document (open locally, or push to GitHub)

Run:  python3 -I build-demos.py                 (from this folder)
      python3 -I build-demos.py --copy-to DIR   (also copies site/index.html to DIR/index.html)
"""
import os, sys, shutil, glob
here = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(here, 'es192-8a-shape-demos.src.html'), encoding='utf-8').read()
libs = ''
for name in ('three-r128.min.js', 'OrbitControls-r128.js'):
    js = open(os.path.join(here, 'vendor', name), encoding='utf-8').read()
    assert '</script' not in js.lower(), name
    libs += '<script>\n' + js + '\n</script>\n'
app = ''
for path in sorted(glob.glob(os.path.join(here, 'js', '*.js'))):
    js = open(path, encoding='utf-8').read()
    assert '</script' not in js.lower(), path
    app += '/* ---- ' + os.path.basename(path) + ' ---- */\n' + js + '\n'
app = '<script>\n(function(){\n"use strict";\n' + app + '})();\n</script>\n'
assert src.count('<!--THREE-->') == 1 and src.count('<!--APP-->') == 1
body = src.replace('<!--THREE-->', libs).replace('<!--APP-->', app)
open(os.path.join(here, 'es192-8a-shape-demos.html'), 'w', encoding='utf-8').write(body)

# full document: everything before the app shell goes in <head>
cut = body.index('<div class="app">')
doc = ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
       '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
       '<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 32 32%27%3E%3Crect width=%2732%27 height=%2732%27 rx=%276%27 fill=%27%23a51c30%27/%3E%3Ccircle cx=%2716%27 cy=%2716%27 r=%279%27 fill=%27none%27 stroke=%27white%27 stroke-width=%273%27/%3E%3C/svg%3E">\n'
       '<meta name="description" content="ES 192 interactive: how shape (tubes, walls, cells, lattices, corrugation) and the microstructure inside decide stiffness, strength and failure.">\n'
       + body[:cut] + '</head>\n<body>\n' + body[cut:] + '</body>\n</html>\n')
os.makedirs(os.path.join(here, 'site'), exist_ok=True)
out = os.path.join(here, 'site', 'index.html')
open(out, 'w', encoding='utf-8').write(doc)
print('wrote es192-8a-shape-demos.html and site/index.html,', len(doc.encode()) // 1024, 'KB')
if '--copy-to' in sys.argv:
    dest = sys.argv[sys.argv.index('--copy-to') + 1]
    os.makedirs(dest, exist_ok=True)
    shutil.copyfile(out, os.path.join(dest, 'index.html'))
    print('copied to', os.path.join(dest, 'index.html'))
