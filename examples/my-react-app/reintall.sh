#!bash

SCRIPT_DIR=$(dirname "$(readlink -f "$0")")

echo $SCRIPT_DIR

npm i

cd ../..

npm pack

cd "$SCRIPT_DIR"

npm uninstall @pavelhudau/de-bouncer

PACKAGE_TARBALL=$(ls ../../pavelhudau-de-bouncer* | awk '{print $1}')

npm install "$PACKAGE_TARBALL"

npm run build