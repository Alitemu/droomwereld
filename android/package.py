#!/usr/bin/env python3
"""Pakt de app-map in tot een (nog niet ondertekende) APK.
Gebruik: package.py <apk-map> <uit.apk>
"""
import os
import sys
import zipfile

src, out = sys.argv[1], sys.argv[2]
names = ['AndroidManifest.xml', 'classes.dex', 'resources.arsc']
for d, _, fs in sorted(os.walk(os.path.join(src, 'res'))):
    names += sorted(os.path.relpath(os.path.join(d, f), src).replace(os.sep, '/') for f in fs)
names.append('assets/index.html')

with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    for name in names:
        with open(os.path.join(src, name), 'rb') as f: data = f.read()
        info = zipfile.ZipInfo(name, date_time=(2026, 1, 1, 0, 0, 0))
        info.compress_type = zipfile.ZIP_DEFLATED
        if name == 'resources.arsc':
            # Android 11+ eist: resources.arsc ongecomprimeerd en op een veelvoud van 4 bytes (zoals zipalign)
            info.compress_type = zipfile.ZIP_STORED
            info.extra = b'\0' * ((4 - (z.fp.tell() + 30 + len(name)) % 4) % 4)
        z.writestr(info, data)
