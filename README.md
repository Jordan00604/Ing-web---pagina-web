# Fashion World

React/JSX + Vite en `fronted-app-ing-web`, Spring Boot/Java 21 y PostgreSQL. Implementación basada en las 10 pantallas del proyecto Stitch `15956695953242065641`. Sin commits ni push.

## Configurar y arrancar en Windows / PowerShell

### 1. Requisitos

- Java **21** (JDK y `JAVA_HOME`), Bun y PostgreSQL con servicio activo en `localhost:5432`. Node/Chrome solo son necesarios para las comprobaciones headless.
- Maven se descarga con el wrapper incluido; no se requiere instalación global. Internet para descargar dependencias y, en la interfaz, fuentes/imágenes externas que no estén en los recursos locales.
- Abrir la terminal en la raíz (donde está `pom.xml`). Comprobar herramientas:

```powershell
java -version
bun --version
.\mvnw.cmd -version
psql --version
```

Si `psql` no está en PATH, añadir el directorio `bin` de tu instalación, por ejemplo `$env:Path = "C:\Program Files\PostgreSQL\18\bin;$env:Path"` (adaptar versión). Iniciar el servicio PostgreSQL desde Servicios de Windows si está detenido. Los puertos 8081 y 5173 deben estar libres antes de arrancar.

### 2. PostgreSQL: base existente o nueva

**Base existente:** conservarla y usar su usuario autorizado. Omitir creación de rol/base e inicialización de tablas. El entorno previamente verificado usa `tienda_usuarios`; nunca ejecutar `update`/`create` sobre sus datos para esta entrega.

**Instalación desde cero:** crear una base académica vacía y separada. Entrar como administrador PostgreSQL (la contraseña se solicita oculta):

```powershell
psql -h localhost -p 5432 -U postgres -d postgres -W
```

Dentro de `psql`, ejecutar una sola vez (los nombres siguientes son ejemplos, no credenciales reales):

```text
CREATE ROLE fashion_world_app LOGIN;
\password fashion_world_app
CREATE DATABASE tienda_usuarios_academica OWNER fashion_world_app;
\q
```

`\password` pide y confirma una contraseña sin mostrarla; no escribirla en SQL ni en archivos. Si rol/base ya existen, no recrearlos ni alterar permisos sin revisar su propietario. El propietario crea las tablas en el esquema `public` de su base nueva; no dar permisos de superusuario a la aplicación.

### 3. Variables de entorno del backend

En **la misma terminal** que ejecutará backend y, si corresponde, restablecimiento ADMIN:

```powershell
# Para una base nueva de la sección anterior. Para la existente, cambiar solo
# el nombre de la base en esta URL a tienda_usuarios y usar su usuario autorizado.
$env:SPRING_DATASOURCE_URL = 'jdbc:postgresql://localhost:5432/tienda_usuarios_academica'
$env:SPRING_DATASOURCE_USERNAME = Read-Host 'Usuario PostgreSQL autorizado'

# Contraseña solo en memoria del proceso; no eco ni literal en el historial.
$secure = Read-Host 'Contraseña PostgreSQL' -AsSecureString
$pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
try {
    $env:SPRING_DATASOURCE_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
} finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
    $secure.Dispose()
    Remove-Variable secure,pointer
}
```

`SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME` y `SPRING_DATASOURCE_PASSWORD` son obligatorias; el script falla antes de arrancar si falta una. No hay credencial de respaldo en `application.properties`. Evitar credenciales en la URL JDBC. No usar `setx`, transcripciones, comandos que impriman el entorno ni ficheros `.env` con secretos.

`JWT_SECRET` debe ser Base64 de al menos 32 bytes aleatorios. Si falta, `start-backend.ps1` lo genera criptográficamente solo en el entorno del proceso, sin mostrarlo ni escribirlo. Para la inicialización manual del siguiente paso, generarlo antes:

```powershell
if ([string]::IsNullOrWhiteSpace($env:JWT_SECRET)) {
    $bytes = New-Object byte[] 32
    $rng = [Security.Cryptography.RandomNumberGenerator]::Create()
    try { $rng.GetBytes($bytes); $env:JWT_SECRET = [Convert]::ToBase64String($bytes) }
    finally { $rng.Dispose(); [Array]::Clear($bytes, 0, $bytes.Length) }
}
```

Conservar la misma terminal mantiene la clave entre arranques; si se genera otra, los tokens anteriores dejan de valer. Para una clave duradera, inyectarla desde un gestor de secretos externo, nunca desde el repositorio.

### 4. Inicializar tablas SOLO en una base nueva y vacía

No hay migraciones SQL versionadas. Hibernate puede generar el esquema desde las entidades existentes. **Solo después de confirmar que la URL apunta a la base académica vacía**, en la terminal con las variables anteriores:

```powershell
$env:SPRING_JPA_HIBERNATE_DDL_AUTO = 'update'
try { .\mvnw.cmd spring-boot:run }
finally { Remove-Item Env:SPRING_JPA_HIBERNATE_DDL_AUTO -ErrorAction SilentlyContinue }
```

Esperar `Started UsuariosApplication` y detener con **Ctrl+C**. Esto crea `usuarios`, `productos`, `pedidos` y `detalles_pedido`, pero no inserta cuentas ni catálogo. No usar el script normal para inicializar: fuerza `validate`. No usar este paso sobre una base con información existente.

### 5. Levantar backend

```powershell
.\scripts\start-backend.ps1
```

- Backend: **http://localhost:8081**. Comprobación pública: `Invoke-WebRequest -UseBasicParsing http://localhost:8081/api/productos` (200; `[]` es correcto en una base vacía).
- Por defecto, incluso sin script: `ddl-auto=validate`, Open Session in View y SQL en consola desactivados. No modifica el esquema existente. Los pedidos se convierten en DTO dentro de la transacción.
- Un error de validación de esquema requiere revisar base/tablas; no cambiar a `update` sobre datos importantes. Un error de autenticación PostgreSQL requiere reintroducir la variable de contraseña, no editar el código.

### 6. Levantar frontend

En **otra terminal**, desde la raíz:

```powershell
Set-Location .\fronted-app-ing-web
bun install --frozen-lockfile  # Solo si faltan las dependencias
$env:VITE_API_URL = 'http://localhost:8081'
$env:VITE_CURRENCY = 'USD'
bun run dev --host 127.0.0.1 --port 5173 --strictPort
```

Frontend: **http://127.0.0.1:5173/**. Abrir `/catalogo` para consultar la API. Cambiar `VITE_*` requiere reiniciar Vite (o recompilar en producción). Son valores **públicos**; nunca poner contraseñas, JWT_SECRET o claves API en ellos. La moneda no convierte importes.

La sesión/JWT se mantiene solo en memoria: al recargar, iniciar sesión de nuevo. El carrito local guarda únicamente IDs/cantidades. Cerrar sesión no revoca el JWT en el servidor (vence a una hora).

### 7. Datos, cuenta ADMIN y parada

El registro público crea exclusivamente CLIENTE. En la base existente se identificó y autorizó el ADMIN ID 2; el titular debe ejecutar el mecanismo oculto explicado abajo si aún no restableció su contraseña. **Una base nueva no tiene ADMIN**: su aprovisionamiento autorizado y el catálogo para la demostración quedan a cargo del responsable de esa base; no se incluye seed ni endpoint que promueva usuarios. La herramienta del ID 2 no debe usarse para provisionar otras bases/cuentas.

Detener cada servidor con Ctrl+C. Después, en la terminal backend:

```powershell
Remove-Item Env:SPRING_DATASOURCE_PASSWORD,Env:JWT_SECRET -ErrorAction SilentlyContinue
```

Cerrar la terminal elimina también sus variables de proceso; no ejecutar limpiezas de datos ni eliminar la base existente.

## Secretos y ejemplos seguros

| Variable | Consumidor | Tratamiento |
| --- | --- | --- |
| `SPRING_DATASOURCE_URL` / `SPRING_DATASOURCE_USERNAME` | Spring y mantenimiento local | Entorno del proceso; URL sin contraseña |
| `SPRING_DATASOURCE_PASSWORD` | Spring y mantenimiento local | Prompt oculto → entorno, nunca archivos |
| `JWT_SECRET` | Backend | Entorno o generación local de 32 bytes |
| `STITCH_API_KEY` | MCP de diseño en `opencode.json` | Ya usa `{env:STITCH_API_KEY}`; opcional para el desarrollo, no necesario para levantar la aplicación |
| `VITE_API_URL` / `VITE_CURRENCY` | Vite/navegador | Configuración pública; ningún secreto |

`.env.example` y `fronted-app-ing-web/.env.example` contienen únicamente marcadores/valores públicos. Son plantillas, **no** cargadores de secretos: Spring/PowerShell no importan `.env` automáticamente; Vite sí puede cargar sus propios `.env`, pero aquí se recomiendan variables de proceso. `.gitignore` excluye entornos locales, certificados, dependencias, compilaciones, logs y salidas privadas de pruebas. No protege archivos ya versionados: revisar antes de cualquier `git add`.

## Funcionalidades

- Inicio editorial, categorías del catálogo, búsqueda, filtros combinados locales y detalle con precio/stock/talla/color reales.
- Registro, login, perfil, expiración/401 y navegación por rol. El registro siempre crea CLIENTE.
- Bolsa, revalidación de precio/stock, pedido, confirmación y consulta del historial propio.
- ADMIN: creación/edición/eliminación de productos y gestión de todos los pedidos/estados. Se requiere una cuenta ADMIN ya autorizada en la base local; no se promueve ningún usuario existente ni se publica un endpoint de alta ADMIN.
- Estado textual no vacío, máximo 50 caracteres. No se inventa una política de transiciones: un cambio de estado no cobra, despacha ni devuelve stock.
- Errores HTTP/red visibles. La bolsa se vacía solo tras un POST exitoso. Ante una respuesta de POST perdida, consultar historial antes de reenviar: la API no ofrece idempotencia.

Seguridad corregida: pedido por ID solo para propietario o ADMIN; respuesta con usuario reducido y sin hash, defensa `JsonIgnore` en contraseña; bloqueo de stock transaccional e IDs duplicados consolidados; issuer/expiración JWT; conflicto FK 409 y error 500 genérico.

No hay procesamiento de pagos/envíos/impuestos, direcciones, recuperación de contraseña, newsletter, favoritos, facturas/PDF, notificaciones, upload ni variantes múltiples. Los elementos del prototipo que requieren esas prestaciones se omiten, no se simulan. Ver matriz en `docs/STITCH_IMPLEMENTACION.md`.

## Comprobaciones reproducibles

### Restablecer únicamente la contraseña del ADMIN autorizado

Mecanismo local restringido al usuario ID 2 y al correo confirmado por su titular. No es un endpoint público ni una herramienta de cambios masivos; vive solo en el classpath de test.

Desde la raíz, en **una terminal PowerShell local interactiva**, con el backend activo:

```powershell
# Opcional: validar identidad/rol y disponibilidad, sin cambiar la cuenta
.\scripts\reset-admin-password.ps1 -Check

# Pedir y repetir la nueva contraseña con entrada oculta
.\scripts\reset-admin-password.ps1
```

- Introducirla solo en los dos prompts ocultos de Java Console. No pasarla por argumentos, tuberías, chat, variables persistentes ni archivos. La herramienta rechaza entrada redirigida y registro HTTP del JVM.
- Mínimo 8 caracteres y máximo 72 bytes UTF-8 (límite BCrypt). No se muestra la contraseña, hash ni JWT. Los secretos y la copia del hash anterior se manejan únicamente en memoria; los buffers editables se limpian al terminar.
- Usa `PasswordConfig.passwordEncoder()` del backend. Comprueba ID/correo/rol con bloqueo de fila y actualiza únicamente `password`; compara las demás columnas antes del commit.
- Después verifica POST login y GET perfil con el JWT en memoria. Solo informa éxito si ID/correo/rol coinciden. Si falla, intenta restaurar el hash anterior sin sobrescribir cambios concurrentes; una interrupción o pérdida de conexión después de guardar requiere comprobar el acceso antes de repetir.
- No modifica roles ni los demás usuarios; no crea ficheros de credenciales. El fichero de classpath en `target` contiene solo rutas de dependencias. Usar las mismas tres variables PostgreSQL del backend en la terminal del script; ya no existe respaldo de credenciales en archivos.
- El restablecimiento **no revoca JWT anteriores**: siguen vigentes hasta su expiración. No se rota la clave global ni se cambia ese comportamiento sin una solicitud separada.

### Pruebas de la aplicación

```powershell
# Desde la raíz: HTTP real sobre H2 en memoria, nunca sobre la base existente
.\mvnw.cmd test

# Desde fronted-app-ing-web
bun run test
bun run lint
bun run build

# Desde la raíz: Chrome headless, backend y frontend reales aislados
.\scripts\check-browser.ps1
```

La prueba E2E usa puertos **8082/5174**, H2 en memoria y fixtures TEST. Genera credenciales efímeras en el entorno, instala Playwright en `%LOCALAPPDATA%\Temp\opencode\fashion-world-browser-tools`, no en el proyecto; requiere Chrome instalado. Cierra los servidores de prueba al terminar. No escribe PostgreSQL, tokens, contraseñas, storageState, HAR ni traces. Solo guarda capturas públicas del inicio en el temporal. No ejecutar Maven y E2E simultáneamente: comparten `target`.

Prueba adicional de solo lectura contra los servidores habituales:

```powershell
$env:FW_PLAYWRIGHT_MODULE = Join-Path $env:LOCALAPPDATA 'Temp\opencode\fashion-world-browser-tools\node_modules\playwright\index.mjs'
node .\scripts\smoke-public.mjs
```

## Antes de desplegar

- Los secretos ya se obtienen del entorno. Antes de producción, rotar la contraseña de BD anteriormente presente en la configuración (requiere autorización del responsable), usar gestor de secretos y limitar CORS a los orígenes del despliegue. No exponer el entorno local por Internet.
- Servir frontend y API por HTTPS. Publicar `dist` con fallback a `index.html` para enlaces directos; configurar VITE_API_URL al compilar.
- Disponer de cuenta ADMIN autorizada, datos comerciales/imágenes definitivos y política de estados/moneda aprobada.
- Completar pruebas de escritura en PostgreSQL de staging y revisión manual de accesibilidad/visual; H2 no sustituye la certificación del despliegue.

`PLAN_TRABAJO.md` contiene alcance/contratos y `ESTADO_PROYECTO.md` evidencias, avances y pendientes. El respaldo de fuentes está fuera del proyecto en el temporal aprobado; la plantilla original también se conserva en `docs/baseline`.

## Archivos para la entrega académica

Inventario y exclusiones: [`docs/ENTREGA_ACADEMICA.md`](docs/ENTREGA_ACADEMICA.md), **165 archivos candidatos**. Esta carpeta no tiene `.git`: no es posible informar cambios staged/unstaged ni un diff histórico. No se inicializó Git en el proyecto ni se hizo commit/push. Las exclusiones se probaron con metadatos Git temporales fuera del proyecto. No entregar la carpeta completa sin filtrar: excluir `target`, `node_modules`, `dist`, caches, logs, dumps y secretos; conservar fuentes, recursos, pruebas, documentación, wrapper, manifests y lockfile.
