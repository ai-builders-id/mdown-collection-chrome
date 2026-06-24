@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

title Blinker Build & Publish

rem ============================================================
rem  Arg: bump type
rem ============================================================
set "BUMP=patch"
if /i "%~1"=="patch" set "BUMP=patch"
if /i "%~1"=="minor" set "BUMP=minor"
if /i "%~1"=="major" set "BUMP=major"
if /i "%~1"=="/?" goto :help
if /i "%~1"=="-?" goto :help
if /i "%~1"=="help" goto :help

echo.
echo === Blinker Build ^& Publish ===
echo.

rem ============================================================
rem  1. Read & bump version
rem ============================================================
if not exist manifest.json (
    echo [ERROR] manifest.json not found
    pause
    exit /b 1
)

for /f "tokens=2 delims=:" %%a in ('findstr /c:""version"" manifest.json') do set "VER_RAW=%%a"
set "VER_RAW=%VER_RAW:"=%"
set "VER_RAW=%VER_RAW:,=%"
set "VER_RAW=%VER_RAW: =%"

for /f "tokens=1-3 delims=." %%a in ("%VER_RAW%") do set "MAJOR=%%a" & set "MINOR=%%b" & set "PATCH=%%c"

set "OLD_VER=%MAJOR%.%MINOR%.%PATCH%"
echo [VERSION] %OLD_VER%

if /i "%BUMP%"=="patch" set /a PATCH+=1
if /i "%BUMP%"=="minor" set /a MINOR+=1 & set PATCH=0
if /i "%BUMP%"=="major" set /a MAJOR+=1 & set MINOR=0 & set PATCH=0

set "NEW_VER=%MAJOR%.%MINOR%.%PATCH%"
echo [BUMP] %BUMP%: %OLD_VER% -^> %NEW_VER%

rem ============================================================
rem  2. Update manifest.json
rem ============================================================
powershell -NoProfile -Command "(Get-Content manifest.json -Raw) -replace '\"version\":\s*\"[\d.]+\"', '\"version\": \"%NEW_VER%\"' | Set-Content manifest.json -Encoding UTF8"
echo [MANIFEST] version ^> %NEW_VER%

rem ============================================================
rem  3. Git commit & push
rem ============================================================
git rev-parse --git-dir >nul 2>&1
if errorlevel 1 (
    echo [GIT] not a git repo -- skipping
) else (
    git add manifest.json
    git diff --cached --quiet 2>nul
    if errorlevel 1 (
        git commit -m "chore: bump version to %NEW_VER%"
        git push
        echo [GIT] committed ^& pushed v%NEW_VER%
    ) else (
        echo [GIT] no changes to commit
    )
)

rem ============================================================
rem  4. Ensure ready_use/
rem ============================================================
if not exist ready_use mkdir ready_use

rem ============================================================
rem  5. Prepare clean build directory
rem ============================================================
set "BUILD_DIR=%TEMP%\blinker-build-%RANDOM%"
mkdir "%BUILD_DIR%" 2>nul

copy manifest.json "%BUILD_DIR%\" >nul
copy popup.html "%BUILD_DIR%\" >nul
copy popup.js "%BUILD_DIR%\" >nul
copy content.js "%BUILD_DIR%\" >nul
if exist icons (
    xcopy /E /I /Y icons "%BUILD_DIR%\icons\" >nul
)
echo [BUILD] ready

rem ============================================================
rem  6. Build ZIP
rem ============================================================
set "ZIP_FILE=%CD%\ready_use\blinker v%NEW_VER%.zip"
if exist "%ZIP_FILE%" del /f "%ZIP_FILE%"
powershell -NoProfile -Command "Compress-Archive -Path '%BUILD_DIR%\*' -DestinationPath '%ZIP_FILE%' -Force"
for %%f in ("%ZIP_FILE%") do set /a ZIP_KB=%%~zf / 1024
echo [ZIP] blinker v%NEW_VER%.zip (%ZIP_KB% KB)

rem ============================================================
rem  7. Build CRX (via Chrome --pack-extension)
rem ============================================================
set "CRX_FILE=%CD%\ready_use\blinker v%NEW_VER%.crx"

rem Try to find Chrome
set "CHROME="
where chrome 2>nul >nul
if not errorlevel 1 set "CHROME=chrome"
if not defined CHROME (
    if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" set "CHROME=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
)
if not defined CHROME (
    if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" set "CHROME=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
)
if not defined CHROME (
    if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" set "CHROME=%LocalAppData%\Google\Chrome\Application\chrome.exe"
)

if not defined CHROME (
    echo [CRX] Chrome not found -- CRX skipped (ZIP is ready)
    goto :cleanup
)

echo [CRX] packing via Chrome...

set "CRX_OUT=%BUILD_DIR%.crx"
set "PEM_OUT=%BUILD_DIR%.pem"

if exist "blinker.pem" (
    start /b /wait "" "%CHROME%" --pack-extension="%BUILD_DIR%" --pack-extension-key="%CD%\blinker.pem" --no-first-run --disable-gpu --user-data-dir="%TEMP%\blinker-chrome-profile" >nul 2>&1
) else (
    echo [CRX] no key found -- auto-generating blinker.pem (first run)
    start /b /wait "" "%CHROME%" --pack-extension="%BUILD_DIR%" --no-first-run --disable-gpu --user-data-dir="%TEMP%\blinker-chrome-profile" >nul 2>&1
)

if exist "%PEM_OUT%" (
    move /Y "%PEM_OUT%" "blinker.pem" >nul
    echo [KEY] saved blinker.pem
)

if exist "%CRX_OUT%" (
    move /Y "%CRX_OUT%" "%CRX_FILE%" >nul
    for %%f in ("%CRX_FILE%") do set /a CRX_KB=%%~zf / 1024
    echo [CRX] blinker v%NEW_VER%.crx (!CRX_KB! KB)
) else (
    echo [CRX] Chrome did not produce CRX (ZIP is ready)
)

rem ============================================================
rem  8. Cleanup
rem ============================================================
:cleanup
rd /s /q "%BUILD_DIR%" 2>nul
rd /s /q "%TEMP%\blinker-chrome-profile" 2>nul

rem ============================================================
rem  Done
rem ============================================================
echo.
echo Done! Files in ready_use:
dir /b "%CD%\ready_use\"
echo.
pause
exit /b 0

rem ============================================================
rem  Help
rem ============================================================
:help
echo Usage: publish [patch^|minor^|major]
echo.
echo   patch  - bump patch (default, small fix)    2.0.0 -^> 2.0.1
echo   minor  - bump minor (new features)          2.0.0 -^> 2.1.0
echo   major  - bump major (big changes)           2.0.0 -^> 3.0.0
echo.
echo   Examples:
echo     publish          -- patch bump + ZIP + CRX + git
echo     publish minor    -- minor bump
echo     publish major    -- major bump
echo.
echo   First run: auto-generates blinker.pem for CRX signing.
pause
exit /b 0
