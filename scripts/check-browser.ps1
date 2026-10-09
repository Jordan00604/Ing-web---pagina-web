$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$temp = Join-Path $env:LOCALAPPDATA 'Temp\opencode\fashion-world-browser-tools'
if (-not (Test-Path (Join-Path $temp 'node_modules\playwright\index.mjs'))) {
    New-Item -ItemType Directory -Path $temp -Force | Out-Null
    & bun add --cwd $temp playwright
    if ($LASTEXITCODE -ne 0) { throw 'No se pudo instalar Playwright en el directorio temporal.' }
}
$env:FW_PLAYWRIGHT_MODULE = Join-Path $temp 'node_modules\playwright\index.mjs'
$env:FW_BROWSER_EXECUTABLE = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
if (-not (Test-Path $env:FW_BROWSER_EXECUTABLE)) { throw 'Chrome no está instalado. Ajusta la ruta del navegador en el script.' }
foreach ($port in 8082,5174) {
    if (Get-NetTCPConnection -State Listen -LocalPort $port -ErrorAction SilentlyContinue) { throw "El puerto de prueba $port está ocupado." }
}
$env:FW_TEST_ADMIN_EMAIL = ([guid]::NewGuid().ToString() + '@example.test')
$env:FW_TEST_ADMIN_PASSWORD = [guid]::NewGuid().ToString()
$env:FW_SCREENSHOTS = Join-Path $temp 'screenshots'
$env:VITE_API_URL = 'http://localhost:8082'
$backend = $null
$frontend = $null
try {
    $backend = Start-Process powershell.exe -ArgumentList '-NoProfile','-ExecutionPolicy','Bypass','-File',('"'+(Join-Path $PSScriptRoot 'start-backend.ps1')+'"'),'-IsolatedE2E' -PassThru -RedirectStandardOutput (Join-Path $temp 'backend.out') -RedirectStandardError (Join-Path $temp 'backend.err')
    $frontend = Start-Process bun -WorkingDirectory (Join-Path $root 'fronted-app-ing-web') -ArgumentList 'run','dev','--host','127.0.0.1','--port','5174','--strictPort' -PassThru -RedirectStandardOutput (Join-Path $temp 'frontend.out') -RedirectStandardError (Join-Path $temp 'frontend.err')
    $ready = $false
    for ($attempt=0; $attempt -lt 90; $attempt++) {
        try {
            $b = Invoke-WebRequest -UseBasicParsing -TimeoutSec 2 'http://localhost:8082/api/productos'
            $f = Invoke-WebRequest -UseBasicParsing -TimeoutSec 2 'http://127.0.0.1:5174/'
            if ($b.StatusCode -eq 200 -and $f.StatusCode -eq 200) { $ready=$true; break }
        } catch { Start-Sleep -Seconds 1 }
    }
    if (-not $ready) { throw 'Los servidores aislados de prueba no arrancaron; revisar logs sin credenciales en el directorio temporal.' }
    & node (Join-Path $PSScriptRoot 'browser-check.mjs')
    if ($LASTEXITCODE -ne 0) { throw 'Fallaron las comprobaciones de navegador.' }
} finally {
    if ($backend -and -not $backend.HasExited) { & taskkill.exe /PID $backend.Id /T /F | Out-Null }
    if ($frontend -and -not $frontend.HasExited) { & taskkill.exe /PID $frontend.Id /T /F | Out-Null }
    Remove-Item Env:FW_TEST_ADMIN_EMAIL,Env:FW_TEST_ADMIN_PASSWORD -ErrorAction SilentlyContinue
    Remove-Item Env:VITE_API_URL -ErrorAction SilentlyContinue
}
