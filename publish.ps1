<#
.SYNOPSIS
  Build & publish Blinker extension — auto-bump version, ZIP, CRX.
.DESCRIPTION
  Bumps version in manifest.json, commits & pushes to git, then produces:
    ready_use/blinker v{version}.zip
    ready_use/blinker v{version}.crx

  Bump types:
    Patch  — x.y.z+1  (minor fix, default)
    Minor  — x.y+1.0  (new features, moderate changes)
    Major  — x+1.0.0  (big breaking changes)

  First run auto-generates blinker.pem (private key) so all future CRX
  files share the same extension ID.
.PARAMETER Bump
  Version bump type: Patch, Minor, or Major. Defaults to Patch.
.PARAMETER NoGit
  Skip git commit & push (just build files).
.EXAMPLE
  ./publish.ps1                  # patch bump, full pipeline
  ./publish.ps1 -Bump Minor      # minor bump
  ./publish.ps1 -Bump Major -NoGit  # major bump, skip git
#>

param(
    [ValidateSet("Patch", "Minor", "Major")]
    [string]$Bump = "Patch",
    [switch]$NoGit
)

$ErrorActionPreference = "Stop"

# ── Detect root (script location) ───────────────────────────
$Root = Split-Path -Parent $PSCommandPath
$Manifest  = Join-Path $Root "manifest.json"
$ReadyDir  = Join-Path $Root "ready_use"
$KeyFile   = Join-Path $Root "blinker.pem"

# Chrome — common install paths
$ChromeCandidates = @(
    "C:\Program Files\Google\Chrome\Application\chrome.exe"
    "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
    "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"
    "$env:ProgramFiles\Google\Chrome\Application\chrome.exe"
    "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe"
)
$Chrome = $ChromeCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1

# ── Helper ──────────────────────────────────────────────────
function Write-Step {
    param([string]$Color, [string]$Label, [string]$Msg)
    $icon = @{ Green = "✅"; Yellow = "⚡"; Red = "❌"; Cyan = "🔧"; Magenta = "🔑"; Blue = "ℹ️" }
    Write-Host ("{0} {1} {2}" -f $icon[$Color], $Label, $Msg) -ForegroundColor $Color
}

# ═══════════════════════════════════════════════════════════
#  1.  Read & bump version
# ═══════════════════════════════════════════════════════════
if (-not (Test-Path $Manifest)) {
    Write-Step Red "ERROR" "manifest.json not found at $Manifest"
    exit 1
}

$manifest = Get-Content $Manifest -Raw -Encoding UTF8 | ConvertFrom-Json
$major, $minor, $patch = $manifest.version -split '\.' | ForEach-Object { [int]$_ }

switch ($Bump) {
    "Major" { $major++; $minor = 0; $patch = 0 }
    "Minor" { $minor++; $patch = 0 }
    "Patch" { $patch++ }
}
$newVer = "$major.$minor.$patch"

Write-Host "`n🔧 Blinker Build & Publish" -ForegroundColor Cyan
Write-Host "   Repo : $Root" -ForegroundColor DarkGray
Write-Host "   Bump : $Bump" -ForegroundColor DarkGray
Write-Step Yellow "VERSION" "$($manifest.version) → $newVer"

# ═══════════════════════════════════════════════════════════
#  2.  Update manifest.json
# ═══════════════════════════════════════════════════════════
$manifest.version = $newVer
# ConvertTo-Json escapes non-ASCII, so re-save by hand
$jsonRaw = Get-Content $Manifest -Raw -Encoding UTF8
$jsonRaw = $jsonRaw -replace '"version":\s*"[^"]+"', "`"version`": `"$newVer`""
Set-Content -Path $Manifest -Value $jsonRaw -Encoding UTF8
Write-Step Green "MANIFEST" "version → $newVer"

# ═══════════════════════════════════════════════════════════
#  3.  Git commit & push
# ═══════════════════════════════════════════════════════════
if (-not $NoGit) {
    Push-Location $Root
    try {
        git add manifest.json
        $status = git status --porcelain
        if ($status) {
            git commit -m "chore: bump version to $newVer"
            git push
            Write-Step Green "GIT" "committed & pushed v$newVer"
        } else {
            Write-Step Blue "GIT" "no changes to commit"
        }
    } finally {
        Pop-Location
    }
} else {
    Write-Step Blue "GIT" "skipped (--NoGit)"
}

# ═══════════════════════════════════════════════════════════
#  4.  Ensure ready_use/
# ═══════════════════════════════════════════════════════════
if (-not (Test-Path $ReadyDir)) {
    New-Item -ItemType Directory -Path $ReadyDir | Out-Null
    Write-Step Blue "DIR" "created ready_use/"
}

# ═══════════════════════════════════════════════════════════
#  5.  Prepare clean build directory
# ═══════════════════════════════════════════════════════════
$BuildDir = Join-Path $env:TEMP "blinker-build-$([System.IO.Path]::GetRandomFileName())"
New-Item -ItemType Directory -Path $BuildDir | Out-Null

# Files needed for the extension (not docs/, .git/, etc.)
$ExtensionFiles = @(
    "manifest.json"
    "popup.html"
    "popup.js"
    "content.js"
)

foreach ($f in $ExtensionFiles) {
    Copy-Item (Join-Path $Root $f) (Join-Path $BuildDir $f) -Force
}
# Icons — full folder
Copy-Item (Join-Path $Root "icons") (Join-Path $BuildDir "icons") -Recurse -Force

Write-Step Cyan "BUILD" "clean copy prepared"

# ═══════════════════════════════════════════════════════════
#  6.  Build ZIP
# ═══════════════════════════════════════════════════════════
$ZipFile = Join-Path $ReadyDir "blinker v$newVer.zip"
Compress-Archive -Path "$BuildDir\*" -DestinationPath $ZipFile -Force
Write-Step Green "ZIP" "blinker v$newVer.zip  ($((Get-Item $ZipFile).Length / 1KB -as [int]) KB)"

# ═══════════════════════════════════════════════════════════
#  7.  Build CRX (via Chrome --pack-extension)
# ═══════════════════════════════════════════════════════════
$CrxFile = Join-Path $ReadyDir "blinker v$newVer.crx"
$CrxBuilt = $false

if ($Chrome) {
    Write-Step Yellow "CRX" "packing via Chrome..."

    $chromeArgs = @(
        "--pack-extension=`"$BuildDir`""
        "--no-first-run"
        "--disable-gpu"
        "--no-mach-port"
        "--user-data-dir=`"$env:TEMP\blinker-chrome-profile`""
    )

    if (Test-Path $KeyFile) {
        $chromeArgs += "--pack-extension-key=`"$KeyFile`""
    } else {
        Write-Step Magenta "CRX" "no key found — auto-generating blinker.pem (first run)"
    }

    # Chrome --pack-extension exits after packing; supress all output
    $crxOut = "$BuildDir.crx"
    $pemOut = "$BuildDir.pem"

    try {
        $proc = Start-Process -FilePath $Chrome -ArgumentList $chromeArgs -Wait -PassThru -NoNewWindow
    } catch {
        # Chrome may fail in NoNewWindow mode — try different approach
        $psi = New-Object System.Diagnostics.ProcessStartInfo
        $psi.FileName = $Chrome
        $psi.Arguments = $chromeArgs -join ' '
        $psi.UseShellExecute = $false
        $psi.CreateNoWindow = $true
        $psi.RedirectStandardOutput = $true
        $psi.RedirectStandardError = $true
        $p = [System.Diagnostics.Process]::Start($psi)
        $p.WaitForExit(30000) | Out-Null
    }

    # Collect key if first run
    if (Test-Path $pemOut) {
        Move-Item $pemOut $KeyFile -Force
        Write-Step Green "KEY" "saved blinker.pem"
    }

    # Move CRX
    if (Test-Path $crxOut) {
        Move-Item $crxOut $CrxFile -Force
        Write-Step Green "CRX" "blinker v$newVer.crx  ($((Get-Item $CrxFile).Length / 1KB -as [int]) KB)"
        $CrxBuilt = $true
    } else {
        Write-Step Red "CRX" "Chrome did not produce $crxOut — CRX skipped (ZIP is ready)"
    }
} else {
    Write-Step Red "CRX" "Chrome not found — CRX skipped (ZIP is ready)"
    Write-Host "        Install Chrome, or manually create .crx via:" -ForegroundColor DarkGray
    Write-Host "        chrome --pack-extension=`"$Root`"" -ForegroundColor DarkGray
}

# ═══════════════════════════════════════════════════════════
#  8.  Cleanup temp build
# ═══════════════════════════════════════════════════════════
Remove-Item -Recurse -Force $BuildDir -ErrorAction SilentlyContinue
$chromeProfile = "$env:TEMP\blinker-chrome-profile"
if (Test-Path $chromeProfile) {
    Remove-Item -Recurse -Force $chromeProfile -ErrorAction SilentlyContinue
}

# ═══════════════════════════════════════════════════════════
#  Done
# ═══════════════════════════════════════════════════════════
Write-Host "`n✨ Done! Files in: $ReadyDir" -ForegroundColor Cyan
Write-Host "   $(Get-ChildItem $ReadyDir | ForEach-Object { $_.Name })`n"
