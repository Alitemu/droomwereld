#!/usr/bin/env python3
"""Maakt resources.arsc en het adaptieve pictogram (binaire XML) voor het app-pictogram.

Normaal doet aapt2 dit; die is hier niet beschikbaar, dus we schrijven het kleine bestand zelf.
Resources (pakket 0x7f):
  0x7f010000 @drawable/ic_bg        achtergrondlaag adaptief pictogram  (5 dichtheden)
  0x7f010001 @drawable/ic_fg        voorgrondlaag adaptief pictogram    (5 dichtheden)
  0x7f020000 @mipmap/ic_launcher    klassiek pictogram (5 dichtheden) + adaptief (anydpi-v26)
Gebruik: resources.py <res-bronmap> <apk-map>   (schrijft <apk-map>/resources.arsc en kopieert de PNG's)
"""
import os
import shutil
import struct
import sys

from manifest import ANDROID_NS, REF, encode, string_pool

DENSITIES = [('mdpi', 160), ('hdpi', 240), ('xhdpi', 320), ('xxhdpi', 480), ('xxxhdpi', 640)]
ANYDPI = 0xFFFE
CONFIG_DENSITY, CONFIG_VERSION = 0x0100, 0x0400
TYPE_STRING = 0x03
NO_ENTRY = 0xFFFFFFFF

# type -> [(entry, {config: pad in de APK})]
TYPES = [
    ('drawable', ['ic_bg', 'ic_fg']),
    ('mipmap', ['ic_launcher']),
]


def config(density=0, sdk=0):
    """ResTable_config van 64 bytes; alleen dichtheid en sdkVersion gebruikt."""
    c = bytearray(64)
    struct.pack_into('<I', c, 0, 64)
    struct.pack_into('<H', c, 14, density)
    struct.pack_into('<H', c, 24, sdk)
    return bytes(c)


def adaptive_icon_xml():
    A = lambda name, val: ('android', name, REF, val)
    return encode(('adaptive-icon', [], [
        ('background', [A('drawable', 0x7f010000)], []),
        ('foreground', [A('drawable', 0x7f010001)], []),
    ]))


def build(res_src, apk_dir):
    files = {}       # pad in apk -> bronbestand of bytes
    values = []      # globale stringpool: paden
    # (type_index, config_bytes) -> {entry_index: value_string_index}
    table = {}

    def add(ti, ei, cfg, apk_path, src):
        if apk_path not in values: values.append(apk_path)
        table.setdefault((ti, cfg), {})[ei] = values.index(apk_path)
        files[apk_path] = src

    for name, dpi in DENSITIES:
        cfg = config(dpi)
        add(0, 0, cfg, f'res/drawable-{name}-v4/ic_bg.png', os.path.join(res_src, f'drawable-{name}', 'ic_bg.png'))
        add(0, 1, cfg, f'res/drawable-{name}-v4/ic_fg.png', os.path.join(res_src, f'drawable-{name}', 'ic_fg.png'))
        add(1, 0, cfg, f'res/mipmap-{name}-v4/ic_launcher.png', os.path.join(res_src, f'mipmap-{name}', 'ic_launcher.png'))
    add(1, 0, config(ANYDPI, 26), 'res/mipmap-anydpi-v26/ic_launcher.xml', adaptive_icon_xml())

    # pakket-chunk
    type_pool = string_pool([t for t, _ in TYPES])
    key_names = [k for _, ks in TYPES for k in ks]
    key_pool = string_pool(key_names)
    body = b''
    for ti, (tname, entries) in enumerate(TYPES):
        tid = ti + 1
        flags = [CONFIG_DENSITY | (CONFIG_VERSION if tname == 'mipmap' else 0)] * len(entries)
        body += struct.pack('<HHIBBHI', 0x0202, 16, 16 + 4 * len(entries), tid, 0, 0, len(entries)) + b''.join(struct.pack('<I', f) for f in flags)
        for (t2, cfg), ents in table.items():
            if t2 != ti: continue
            offs, data = [], b''
            for ei, key in enumerate(entries):
                if ei not in ents: offs.append(NO_ENTRY); continue
                offs.append(len(data))
                data += struct.pack('<HHI', 8, 0, key_names.index(key)) + struct.pack('<HBBI', 8, 0, TYPE_STRING, ents[ei])
            hdr = 20 + len(cfg); start = hdr + 4 * len(entries)
            body += struct.pack('<HHIBBHII', 0x0201, hdr, start + len(data), tid, 0, 0, len(entries), start) + cfg
            body += b''.join(struct.pack('<I', o) for o in offs) + data
    name = 'nl.droomwereld.app'.encode('utf-16-le').ljust(256, b'\0')
    phdr = 288
    pkg = struct.pack('<HHII', 0x0200, phdr, phdr + len(type_pool) + len(key_pool) + len(body), 0x7f) + name
    pkg += struct.pack('<IIIII', phdr, len(TYPES), phdr + len(type_pool), len(key_names), 0)
    pkg += type_pool + key_pool + body

    vpool = string_pool(values)
    arsc = struct.pack('<HHII', 0x0002, 12, 12 + len(vpool) + len(pkg), 1) + vpool + pkg

    with open(os.path.join(apk_dir, 'resources.arsc'), 'wb') as f: f.write(arsc)
    for path, src in files.items():
        dest = os.path.join(apk_dir, path); os.makedirs(os.path.dirname(dest), exist_ok=True)
        if isinstance(src, bytes):
            with open(dest, 'wb') as f: f.write(src)
        else: shutil.copyfile(src, dest)
    return sorted(files)


if __name__ == '__main__':
    for p in build(sys.argv[1], sys.argv[2]): print('  ', p)
