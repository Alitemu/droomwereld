#!/usr/bin/env bash
# Bouwt android/build/droomwereld.apk uit ../index.html, zonder Android SDK of Gradle.
# Nodig: Java 11+ (javac, keytool), python3, curl.
#
#   ./build.sh                    versie 2 / "1.1" (standaard)
#   VERSION_CODE=3 VERSION_NAME=1.2 ./build.sh
#
# Ondertekenen gebeurt met android/droomwereld.p12 (wordt eenmalig aangemaakt als hij ontbreekt).
# Bewaar die sleutel goed: een update van de app moet met DEZELFDE sleutel ondertekend zijn,
# anders moet de oude app eerst verwijderd worden (en is de bewaarde voortgang weg).
set -euo pipefail
cd "$(dirname "$0")"

VERSION_CODE="${VERSION_CODE:-2}"   # bij elke nieuwe versie ophogen
VERSION_NAME="${VERSION_NAME:-1.1}"
KEYSTORE="${KEYSTORE:-droomwereld.p12}"
KEYPASS="${KEYPASS:-droomwereld}"
TOOLS="${TOOLS:-build/tools}"
B=build

mkdir -p "$TOOLS" "$B"
fetch() { # url bestand: met een paar nieuwe pogingen, Maven Central kan even weigeren (429)
  [ -s "$2" ] && return 0
  for i in 1 2 3 4 5; do curl -sf --max-time 120 -o "$2" "$1" && return 0; sleep $((i * 3)); done
  echo "Kon $1 niet downloaden" >&2; return 1
}
M=https://repo.maven.apache.org/maven2
fetch "$M/com/jakewharton/android/repackaged/dalvik-dx/16.0.1/dalvik-dx-16.0.1.jar" "$TOOLS/dx.jar"
fetch "$M/com/android/tools/build/apksig/2.3.0/apksig-2.3.0.jar" "$TOOLS/apksig.jar"

rm -rf "$B/stubs" "$B/classes" "$B/apk" && mkdir -p "$B/stubs" "$B/classes" "$B/apk/assets" "$B/signer"
echo "1/5 compileren"
javac -nowarn --release 8 -d "$B/stubs" $(find stubs -name '*.java')
javac -nowarn --release 8 -cp "$B/stubs" -d "$B/classes" $(find src -name '*.java')
echo "2/5 omzetten naar dex"
java -cp "$TOOLS/dx.jar" com.android.dx.command.Main --dex --min-sdk-version=24 --output="$B/apk/classes.dex" "$B/classes"
echo "3/5 manifest (versie $VERSION_NAME, code $VERSION_CODE)"
python3 manifest.py "$B/apk/AndroidManifest.xml" "$VERSION_CODE" "$VERSION_NAME"
cp ../index.html "$B/apk/assets/index.html"
echo "   app-pictogram (resources.arsc + res/)"
python3 resources.py res "$B/apk" >/dev/null
echo "4/5 inpakken"
python3 package.py "$B/apk" "$B/unsigned.apk"
echo "5/5 ondertekenen"
if [ ! -f "$KEYSTORE" ]; then
  keytool -genkeypair -keystore "$KEYSTORE" -storetype PKCS12 -storepass "$KEYPASS" -keypass "$KEYPASS" \
    -alias droomwereld -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=De Droom Wereld" >/dev/null 2>&1
  echo "   nieuwe sleutel gemaakt: $KEYSTORE (bewaren!)"
fi
# apksig 2.3.0 raakt bij het laden interne JDK-klassen aan; die moeten expliciet opengezet worden
javac -nowarn -cp "$TOOLS/apksig.jar" -d "$B/signer" Sign.java
java --add-exports java.base/sun.security.x509=ALL-UNNAMED --add-exports java.base/sun.security.pkcs=ALL-UNNAMED --add-exports java.base/sun.security.util=ALL-UNNAMED -cp "$TOOLS/apksig.jar:$B/signer" Sign "$KEYSTORE" "$KEYPASS" "$B/unsigned.apk" "$B/droomwereld.apk"
echo "Klaar: $(pwd)/$B/droomwereld.apk ($(du -h "$B/droomwereld.apk" | cut -f1))"
