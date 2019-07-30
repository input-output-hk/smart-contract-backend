#!/bin/bash
echo "Install dependencies for building"
npm i

echo "Cleanup existing build dir"
rm -rf build

echo "Creating dist"
npm run build

echo "Make build dir"
mkdir -p "build/$(uname)"

echo "Copying deps"
cp -r node_modules/puppeteer/.local-chromium "build/$(uname)/puppeteer"

if [ "$(uname)" == "Linux" ]
then
  echo "Creating Linux executable"
  npx pkg -t node10-linux .
else
  echo "Creating macOS executable"
  npx pkg -t node10-macos .
fi

mv smart-contract-backend "build/$(uname)"