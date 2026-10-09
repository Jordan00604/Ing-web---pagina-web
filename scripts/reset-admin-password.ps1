param([switch]$Check)
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
Push-Location $root
try {
    # El archivo generado contiene únicamente rutas de dependencias, nunca secretos.
    & .\mvnw.cmd -q test-compile dependency:build-classpath '-Dmdep.outputFile=target/admin-reset-classpath.txt'
    if ($LASTEXITCODE -ne 0) { throw 'No se pudo preparar la herramienta local. No se modificó la cuenta.' }
    $dependencies = (Get-Content 'target/admin-reset-classpath.txt' -Raw).Trim()
    $classpath = (Join-Path $root 'target/classes') + ';' + (Join-Path $root 'target/test-classes') + ';' + $dependencies
    if ($Check) {
        & java -cp $classpath com.api.usuarios.maintenance.ResetAdminPassword --check
    } else {
        # Java Console.readPassword no hace eco. Nunca pasar la contraseña al script,
        # por argumentos, variables persistentes, tuberías, archivos ni este chat.
        & java -cp $classpath com.api.usuarios.maintenance.ResetAdminPassword
    }
    if ($LASTEXITCODE -ne 0) { throw 'Restablecimiento no confirmado; consulta el mensaje seguro anterior. No se declara éxito.' }
} finally { Pop-Location }
