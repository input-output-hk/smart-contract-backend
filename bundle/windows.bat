ECHO "Install dependencies for building"
CALL npm i

ECHO "Cleanup existing build dir"
CALL npx rimraf build

ECHO "Creating dist"
CALL npm run build

ECHO "Make build dir"
MKDIR "build"
MKDIR "build\Windows"

ECHO "Copying deps"
XCOPY node_modules\puppeteer\.local-chromium build\Windows\puppeteer /s/i

ECHO "Creating Windows64 executable"
CALL npx pkg -t node10-win .

MOVE smart-contract-backend.exe build\Windows\smart-contract-backend.exe