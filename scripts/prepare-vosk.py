"""Build self-hosted Vosk runtime/model for local preview and GitHub Pages."""
from pathlib import Path
import hashlib, io, shutil, tarfile, urllib.request, zipfile

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / '.cache'
CACHE.mkdir(exist_ok=True)

def obtain(name, urls, digest):
    target = CACHE / name
    def valid():
        return target.exists() and hashlib.sha256(target.read_bytes()).hexdigest() == digest
    if not valid():
        for url in urls:
            try:
                with urllib.request.urlopen(url, timeout=60) as source, target.open('wb') as output:
                    shutil.copyfileobj(source, output)
                if valid(): break
            except Exception as error:
                print(f'Download retry: {error}', flush=True)
        else: raise RuntimeError(f'Cannot download verified asset: {name}')
    return target

model = obtain('ja-mirror.zip', [
    'https://alphacephei.com/vosk/models/vosk-model-small-ja-0.22.zip',
    'https://huggingface.co/rhasspy/vosk-models/resolve/main/ja/vosk-model-small-ja-0.22.zip',
], 'efa092d280153a77615e9e0c7d7283e93e600de3d19d3bec686c57ef19d52eac')
runtime = obtain('vosk-0.0.8.js', ['https://cdn.jsdelivr.net/npm/vosk-browser@0.0.8/dist/vosk.js'],
    '29504515526e974f4cb053cf08811c4de5fb2a74007c0a5a957db50eaa8d5d0c')
out = ROOT / 'vosk'
(out / 'vendor').mkdir(exist_ok=True)
(out / 'models').mkdir(exist_ok=True)
shutil.copyfile(runtime, out / 'vendor/vosk.js')
with zipfile.ZipFile(model) as archive, tarfile.open(out / 'models/ja-fast-0.22-v1.tar.gz', 'w:gz', format=tarfile.USTAR_FORMAT) as tar:
    for member in archive.infolist():
        path = Path(member.filename)
        if path.is_absolute() or '..' in path.parts: raise ValueError('Invalid archive path')
        data = b"" if member.is_dir() else archive.read(member)
        if member.filename.endswith('/conf/model.conf'):
            config = data.decode('utf-8')
            for old, new in [('--max-active=7000', '--max-active=3000'), ('--beam=13.0', '--beam=10.0'), ('--lattice-beam=4.0', '--lattice-beam=3.0'), ('--endpoint.rule2.min-trailing-silence=0.5', '--endpoint.rule2.min-trailing-silence=0.25'), ('--endpoint.rule3.min-trailing-silence=1.0', '--endpoint.rule3.min-trailing-silence=0.5'), ('--endpoint.rule4.min-trailing-silence=2.0', '--endpoint.rule4.min-trailing-silence=1.0')]:
                config = config.replace(old, new)
            data = config.encode('utf-8')
        info = tarfile.TarInfo(member.filename)
        if member.is_dir(): info.type = tarfile.DIRTYPE
        info.size = len(data)
        info.mode = 0o755 if member.is_dir() else 0o644
        info.mtime = 0
        tar.addfile(info, io.BytesIO(data))
print('Verified Vosk runtime and Japanese model prepared.', flush=True)

