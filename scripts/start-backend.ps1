param([switch]$IsolatedE2E)
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
Push-Location $root
try {
    if ($IsolatedE2E) {
        if (-not $env:FW_TEST_ADMIN_EMAIL -or -not $env:FW_TEST_ADMIN_PASSWORD) {
            throw 'El entorno de pruebas requiere credenciales efímeras en memoria.'
        }
        & .\mvnw.cmd spring-boot:test-run '-Dspring-boot.run.main-class=com.api.usuarios.FrontendTestApplication'
    } else {
        foreach ($name in 'SPRING_DATASOURCE_URL','SPRING_DATASOURCE_USERNAME','SPRING_DATASOURCE_PASSWORD') {
            if ([string]::IsNullOrWhiteSpace([Environment]::GetEnvironmentVariable($name, 'Process'))) {
                throw "Falta $name en el entorno del proceso. Consulta README.md; no escribas credenciales en archivos."
            }
        }
        if ([string]::IsNullOrWhiteSpace($env:JWT_SECRET)) {
            $bytes = New-Object byte[] 32
            $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
            $rng.GetBytes($bytes)
            $rng.Dispose()
            $env:JWT_SECRET = [Convert]::ToBase64String($bytes)
        }
        if ([Convert]::FromBase64String($env:JWT_SECRET).Length -lt 32) { throw 'JWT_SECRET debe contener al menos 32 bytes Base64.' }
        $env:SPRING_JPA_HIBERNATE_DDL_AUTO = 'validate'
        $env:SPRING_JPA_OPEN_IN_VIEW = 'false'
        $env:SPRING_JPA_SHOW_SQL = 'false'
        & .\mvnw.cmd spring-boot:run
    }
    if ($LASTEXITCODE -ne 0) { throw 'El backend no pudo iniciarse.' }
} finally { Pop-Location }
