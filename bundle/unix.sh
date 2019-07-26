#!/bin/bash
echo "Ensure dependencies are up to date"
npm i

echo "Cleanup existing build dir"
rm -rf build

echo "Make build dir"
mkdir -p "build/$(uname)"

echo "Copying deps"
cp -r node_modules/puppeteer/.local-chromium "build/$(uname)/.local-chromium"
cp node_modules/scrypt/build/Release/scrypt.node "build/$(uname)/scrypt.node"
cp node_modules/websocket/build/Release/bufferutil.node "build/$(uname)/bufferutil.node"
cp node_modules/websocket/build/Release/validation.node "build/$(uname)/validation.node"

echo "Creating build"
npm run build

if [ "$(uname)" == "Linux" ]
then
  echo "Creating Linux executable"
  npx pkg -t node10-linux dist/single_process.js
else
  echo "Creating macOS executable"
  npx pkg -t node10-macos dist/single_process.js
fi

mv single_process "build/$(uname)"