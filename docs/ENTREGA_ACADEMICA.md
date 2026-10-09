# Entrega académica — Fashion World

Revisión: 2026-10-09. Alcance: frontend React/Vite integrado con API Spring Boot y diez referencias Stitch, sin funciones adicionales de pago/envío ni commit/push.

## Situación de Git

`git rev-parse --show-toplevel` devuelve «not a git repository». Esta carpeta y sus ancestros no contienen un repositorio disponible; no hay lista staged/unstaged ni diff histórico que pueda verificarse. No se inicializó Git en el proyecto, no se añadió nada al índice ni se subió ningún archivo. El siguiente es un **inventario propuesto para entregar/versionar**, no una lista de archivos ya subidos.

## Incluir

Inventario filtrado comprobado con las reglas de Git: **165 archivos candidatos** (25 Java backend, 5 Java test, 22 fuentes/assets frontend, 57 imágenes editoriales, 22 referencias Stitch, 5 scripts y 29 archivos restantes de configuración/documentación/recursos). Nada se ha añadido al índice.

| Archivos / directorios | Contenido |
| --- | --- |
| `src/main/java/com/api/usuarios/` | Aplicación, configuración, controllers, DTOs, modelos, repositorios y servicios (25 fuentes Java) |
| `src/main/resources/application.properties` | Configuración con referencias al entorno, sin credenciales literales |
| `src/test/java/com/api/usuarios/` | 5 fuentes Java: contexto, integración HTTP, servidor E2E y herramienta/pruebas de restablecimiento restringido |
| `pom.xml`, `mvnw`, `mvnw.cmd`, `.mvn/wrapper/maven-wrapper.properties` | Dependencias y Maven Wrapper; sin distribución/caché Maven ni wrapper JAR |
| `fronted-app-ing-web/src/` | JSX/CSS, componentes, contextos, hooks, páginas, servicios y assets existentes |
| `fronted-app-ing-web/public/` | Iconos/placeholder y 57 fotografías editoriales locales |
| `fronted-app-ing-web/tests/api.test.js` | 6 pruebas Bun del cliente HTTP |
| `fronted-app-ing-web/package.json`, `bun.lock`, `index.html`, `vite.config.js`, `eslint.config.js` | Manifest, lockfile y configuración del frontend; el lockfile sí se entrega |
| `scripts/start-backend.ps1`, `reset-admin-password.ps1`, `check-browser.ps1`, `browser-check.mjs`, `smoke-public.mjs` | Arranque y comprobaciones reproducibles; sin resultados privados |
| `README.md`, `ESTADO_PROYECTO.md`, `PLAN_TRABAJO.md`, `fronted-app-ing-web/README.md` | Configuración, alcance, pruebas aprobadas y pendientes diferenciados |
| `docs/STITCH_IMPLEMENTACION.md`, `docs/ENTREGA_ACADEMICA.md` | Matriz de pantallas y este inventario |
| `docs/stitch/` | 10 pares HTML/captura de prototipo y `manifest.json`/`assets.json` (22 archivos); son referencias, no evidencias de datos de usuarios |
| `docs/baseline/` | 3 fuentes de plantilla conservadas como historial |
| `.gitignore`, `.gitattributes`, `fronted-app-ing-web/.gitignore` | Reglas de exclusión y atributos |
| `.env.example`, `fronted-app-ing-web/.env.example` | Únicamente marcadores y configuración pública, no valores secretos |
| `opencode.json` | Opcional para reproducir la herramienta de diseño; referencia `{env:STITCH_API_KEY}`, sin clave incorporada. No es necesario para ejecutar la tienda |

Los assets/plantilla existentes se conservan; no se borran archivos ajenos. `HELP.md` es ayuda generada por Spring y ya está excluido, no es documentación de entrega.

## Excluir

- Dependencias/cachés: `**/node_modules/`, `.vite/`, `.cache/`, distribución Maven y instalación temporal de Playwright.
- Compilaciones: `target/` (incluye clases, copia de configuración, classpath y reports Maven), `**/dist/`, `dist-ssr/`, `build/`, `*.class`, `*.jar`, `*.war`, `*.tsbuildinfo`.
- Logs y resultados privados: `logs/`, `*.log`, `*.out`, `*.err`, `coverage/`, `test-results/`, `playwright-report/`, `screenshots/`, HAR, dumps JVM y traces privados. Las capturas originales de diseño en `docs/stitch` sí se conservan.
- Secretos/configuración local: `.env`, `.env.*` **salvo `.env.example`**, `*.local`, `application-local.*`, `secrets/`, `credentials/`, certificados/keystores y archivos `pgpass`.
- Datos/respaldo: `*.dump`, `*.backup`, `dumps/`, `backups/`, archivos ZIP/7z y cualquier exportación PostgreSQL que contenga usuarios/hashes. No se entrega una copia de la BD del titular.
- Temporales, IDE y sistema: `.idea/`, `.vscode/`, `*.tmp`, `*.bak`, `Thumbs.db`, `.DS_Store` y respaldo externo en el temporal aprobado.

Las reglas se comprobaron mediante `git check-ignore --no-index` con metadatos temporales fuera del proyecto: 24 casos excluidos y 16 permitidos correctos, incluidas las dos plantillas `.env.example`. La revisión heurística de los candidatos no detectó credenciales/JWT/hashes literales; no es una garantía de auditoría exhaustiva.

Las reglas no eliminan archivos locales ni sacan del índice secretos ya versionados. Al trasladar a un repositorio autorizado, revisar primero `git status --short` y `git diff --cached --stat`; no hacer `git add .` a ciegas. Si el repositorio destino tiene historial con la antigua credencial de BD, requiere revisión/rotación y tratamiento de ese historial por su responsable; aquí no hay historial Git para inspeccionar.

## Evidencia y límites

- **Aprobado previamente:** 7 pruebas Maven (H2), 6 Bun, lint/build, E2E con backend real H2, responsive de diez pantallas en cinco anchos y smoke público navegador→PostgreSQL. No se repiten por cambios documentales.
- **Revisión de entrega aprobada:** externalización de credenciales y ejemplos; rechazo de arranque por cada una de las 3 variables PostgreSQL ausentes; sintaxis PowerShell y reglas Git; nueva configuración mediante contexto Spring/H2 con entorno efímero (catálogo 200/`[]`, perfil sin token 401, servidor temporal cerrado). No equivale a reinicio PostgreSQL. Resultados detallados en `ESTADO_PROYECTO.md`.
- **Pendiente de ejecución local:** definir las tres variables PostgreSQL en la terminal del titular y reiniciar con la configuración nueva; la sesión de revisión no dispone de esas credenciales en el entorno. El servidor activo anterior no demuestra ese reinicio.
- **ADMIN:** cuenta ID 2 confirmada/autorizada, mecanismo oculto preparado y probado; restablecimiento y login PostgreSQL real pendientes de entrada privada del titular. No se cambiaron roles ni contraseñas por esta preparación de entrega.
- **Desde cero:** procedimiento de creación de base/tablas documentado; no hay migraciones ni seeds. Nueva base requiere datos y ADMIN autorizados para demostrar administración; no se afirma haber ejecutado ese aprovisionamiento.
- **No certificado para producción:** escritura en PostgreSQL staging, revisión manual visual/accesibilidad, decisiones comerciales de estados/datos/moneda, rotación de contraseña antes almacenada, CORS restringido, HTTPS y fallback SPA.

No hay funciones nuevas ni credenciales de entrega publicadas. Nada se ha commiteado o subido.
