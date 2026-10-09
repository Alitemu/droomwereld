#!/usr/bin/env python3
"""Schrijft AndroidManifest.xml in het binaire formaat (AXML) dat Android verwacht.

Normaal doet aapt2 dit, maar de Android SDK is in onze bouwomgeving niet te downloaden.
Het manifest is klein en vast, dus we coderen het hier zelf.
Gebruik: manifest.py <uitvoerbestand> <versionCode> <versionName>
"""
import struct
import sys

ANDROID_NS = 'http://schemas.android.com/apk/res/android'

# resource-id's van de framework-attributen (android.R.attr), vast sinds API 1-17
ATTR_IDS = {
    'label': 0x01010001, 'name': 0x01010003, 'exported': 0x01010010,
    'screenOrientation': 0x0101001e, 'configChanges': 0x0101001f,
    'minSdkVersion': 0x0101020c, 'versionCode': 0x0101021b, 'versionName': 0x0101021c,
    'targetSdkVersion': 0x01010270, 'allowBackup': 0x01010280, 'hardwareAccelerated': 0x010102d3,
}

STRING, INT_DEC, INT_HEX, BOOL = 0x03, 0x10, 0x11, 0x12
SENSOR_LANDSCAPE = 6
# orientation | screenSize | smallestScreenSize | keyboardHidden | keyboard | screenLayout | uiMode:
# het spel draait gewoon door bij draaien of uitklappen in plaats van opnieuw te starten
CONFIG_CHANGES = 0x80 | 0x400 | 0x800 | 0x20 | 0x10 | 0x100 | 0x200


def manifest_tree(version_code, version_name):
    A = lambda name, typ, val: ('android', name, typ, val)
    return ('manifest', [(None, 'package', STRING, 'nl.droomwereld.app'),
                         A('versionCode', INT_DEC, version_code), A('versionName', STRING, version_name)], [
        ('uses-sdk', [A('minSdkVersion', INT_DEC, 24), A('targetSdkVersion', INT_DEC, 34)], []),
        ('application', [A('label', STRING, 'De Droom Wereld'), A('allowBackup', BOOL, True),
                         A('hardwareAccelerated', BOOL, True)], [
            ('activity', [A('name', STRING, 'nl.droomwereld.app.MainActivity'), A('exported', BOOL, True),
                          A('screenOrientation', INT_DEC, SENSOR_LANDSCAPE),
                          A('configChanges', INT_HEX, CONFIG_CHANGES)], [
                ('intent-filter', [], [
                    ('action', [A('name', STRING, 'android.intent.action.MAIN')], []),
                    ('category', [A('name', STRING, 'android.intent.category.LAUNCHER')], []),
                ]),
            ]),
        ]),
    ])


def encode(tree):
    # stringpool: eerst de attribuutnamen met resource-id (in dezelfde volgorde als de resource map)
    attr_names, others = [], []

    def collect(node):
        tag, attrs, kids = node
        for ns, name, typ, val in attrs:
            if ns and name not in attr_names: attr_names.append(name)
            elif not ns and name not in others: others.append(name)
            if typ == STRING and val not in others: others.append(val)
        if tag not in others: others.append(tag)
        for k in kids: collect(k)
    collect(tree)
    for s in ('android', ANDROID_NS):
        if s not in others: others.append(s)
    strings = attr_names + [s for s in others if s not in attr_names]
    idx = {s: i for i, s in enumerate(strings)}

    # string pool chunk (UTF-16)
    data = b''; offsets = []
    for s in strings:
        offsets.append(len(data)); u = s.encode('utf-16-le')
        data += struct.pack('<H', len(s)) + u + b'\0\0'
    while len(data) % 4: data += b'\0'
    hdr = 28; start = hdr + 4 * len(strings)
    pool = struct.pack('<HHIIIIII', 0x0001, hdr, start + len(data), len(strings), 0, 0, start, 0)
    pool += b''.join(struct.pack('<I', o) for o in offsets) + data

    resmap = struct.pack('<HHI', 0x0180, 8, 8 + 4 * len(attr_names)) + b''.join(struct.pack('<I', ATTR_IDS[n]) for n in attr_names)

    NONE = 0xFFFFFFFF
    body = []; line = [1]

    def node_bytes(node):
        tag, attrs, kids = node
        # attributen zonder namespace eerst, daarna oplopend op resource-id (Android zoekt binair)
        attrs = sorted(attrs, key=lambda a: (a[0] is not None, ATTR_IDS.get(a[1], 0)))
        ab = b''
        for ns, name, typ, val in attrs:
            nsi = idx[ANDROID_NS] if ns else NONE
            if typ == STRING: raw, d = idx[val], idx[val]
            elif typ == BOOL: raw, d = NONE, 0xFFFFFFFF if val else 0
            else: raw, d = NONE, val
            ab += struct.pack('<IIIHBBI', nsi, idx[name], raw, 8, 0, typ, d)
        n = line[0]; line[0] += 1
        body.append(struct.pack('<HHIII', 0x0102, 16, 36 + len(ab), n, NONE) +
                    struct.pack('<IIHHHHHH', NONE, idx[tag], 20, 20, len(attrs), 0, 0, 0) + ab)
        for k in kids: node_bytes(k)
        body.append(struct.pack('<HHIIIII', 0x0103, 16, 24, line[0], NONE, NONE, idx[tag]))

    ns = struct.pack('<HHIIIII', 0x0100, 16, 24, 1, NONE, idx['android'], idx[ANDROID_NS])
    node_bytes(tree)
    ns_end = struct.pack('<HHIIIII', 0x0101, 16, 24, line[0], NONE, idx['android'], idx[ANDROID_NS])
    content = pool + resmap + ns + b''.join(body) + ns_end
    return struct.pack('<HHI', 0x0003, 8, 8 + len(content)) + content


if __name__ == '__main__':
    out, code, name = sys.argv[1], int(sys.argv[2]), sys.argv[3]
    with open(out, 'wb') as f: f.write(encode(manifest_tree(code, name)))
