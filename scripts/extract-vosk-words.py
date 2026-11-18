"""Extract Vosk's output vocabulary for the compact browser reading map."""
from pathlib import Path
import zipfile

ROOT = Path(__file__).resolve().parents[1]
archive_path = ROOT / '.cache' / 'ja-mirror.zip'
output = ROOT / '.cache' / 'hiragana' / 'vosk-words.txt'
output.parent.mkdir(parents=True, exist_ok=True)

with zipfile.ZipFile(archive_path) as archive:
    members = [name for name in archive.namelist() if name.endswith('/graph/words.txt')]
    if len(members) != 1:
        raise RuntimeError('Vosk words.txt was not found exactly once')
    output.write_bytes(archive.read(members[0]))

print(f'Extracted Vosk vocabulary to {output}.')
