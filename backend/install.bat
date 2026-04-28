@echo off
echo Installing backend dependencies...
cd /d "%~dp0"

echo Checking if backend is running...
tasklist | findstr "node.exe" > nul
if %errorlevel% equ 0 (
    echo WARNING: Node processes are running. Please stop them first (Ctrl+C in terminal).
    echo Press any key to continue anyway...
    pause > nul
)

echo Installing packages (skipping scripts)...
yarn install --ignore-scripts

echo Building better-sqlite3 manually...
cd node_modules\better-sqlite3
npx node-gyp rebuild --release
if %errorlevel% neq 0 (
    echo ERROR: Failed to build better-sqlite3
    cd ..\..
    exit /b 1
)
cd ..\..

echo Creating database directory...
if not exist "data" mkdir data

echo Running database migrations...
yarn db:push

echo.
echo ============================================
echo Installation complete!
echo To start the server, run: yarn dev
echo ============================================
echo.
