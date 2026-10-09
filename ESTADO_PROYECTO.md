# Estado del proyecto — Fashion World

Última actualización: 2026-10-09. Estado: **implementación de las diez pantallas y preparación académica documentadas; integración/E2E aprobados previamente, configuración externalizada verificada puntualmente sobre H2; reinicio PostgreSQL con entorno privado y login ADMIN real pendientes. Sin commit/push**. Los apartados de revisión inicial se conservan como historial, no como estado vigente.

## Resumen por fases

| Fase | Estado | Pendiente para completarla |
| --- | --- | --- |
| 1. Entorno | Verificado | Escrituras PostgreSQL de staging (actualmente aisladas H2) |
| 2. Compartidos/diseño | Implementado y responsive probado | Revisión manual exhaustiva con datos definitivos |
| 3. Inicio/catálogo/detalle | Verificado con API real | Contenido comercial definitivo |
| 4. Autenticación/roles | Verificado HTTP y E2E | Restablecimiento/login del ADMIN local confirmado; HTTPS en producción |
| 5. Carrito/pedidos | Verificado HTTP y E2E | Idempotencia de POST no existe en la API |
| 6. Administración | Verificado HTTP y E2E | Política comercial de transiciones, sin efectos inventados |
| 7. Pruebas/documentación | Verificado; regresión ampliada correcta | Revisión manual/accesibilidad y preparación de despliegue |

### URLs locales y verificaciones previas

- Backend PostgreSQL **http://localhost:8081**, frontend **http://127.0.0.1:5173/**. Verificados antes del cierre académico; no se reiniciaron tras externalizar la conexión. El próximo arranque requiere definir las tres variables de BD en la terminal del titular. JWT solo en memoria y esquema validate.
- Smoke headless: comunicación navegador→PostgreSQL 200, seis rutas públicas sin desbordamiento a 360/390/768/1280/1440; sin escribir datos existentes.
- E2E aislado: puertos 8082/5174, H2 real en memoria, registro/login/pedido/historial/roles/CRUD ADMIN/estado/FK y fallo de catálogo probados. Los servidores de prueba se cierran al finalizar.
- Última regresión Maven: 7 pruebas (2 de aplicación y 5 de restablecimiento), 0 fallos; Bun 6 pruebas, lint/build y E2E aprobados previamente. Navegador MCP desconectado; headless con Chrome local no equivale a revisión manual.
- Documentación vigente: `README.md`, `docs/STITCH_IMPLEMENTACION.md`, scripts de arranque/checks. Plantilla conservada en `docs/baseline`. Sin commit/push.

### Pendientes reales

1. Para la demostración: definir variables de BD y reiniciar el backend conectado a PostgreSQL con la configuración nueva. ADMIN local ID 2 identificado y autorizado por su titular; restablecimiento/login real pendientes de introducir contraseña oculta localmente. Una base nueva requiere aprovisionamiento ADMIN autorizado y datos; creación desde cero documentada pero no ejecutada. Escrituras PostgreSQL staging aún no verificadas.
2. Política definitiva de estados/transiciones/moneda y datos/imágenes comerciales; USD procede de Stitch, no de un campo de moneda del backend.
3. Secretos externalizados a variables de entorno para la entrega. Antes de producción: rotar la contraseña de BD que estuvo en archivos (no rotada), limitar CORS, HTTPS, fallback SPA y fuentes offline si se requiere.
4. Revisión visual manual completa y accesibilidad asistida. No hay pagos/envíos/newsletter/favoritos/recuperación/PDF en la API, por lo que no se anuncian como implementados.

## Revisión inicial — historial conservado

## Completado y verificado en esta revisión

- [x] Inspección del backend: controladores, DTOs, entidades, servicios, repositorios, seguridad JWT/roles y manejador de errores.
- [x] Inspección del frontend: plantilla React/Vite, estructura, CSS, dependencias, lockfile, scripts y configuración ESLint/Vite.
- [x] Inventario del contrato declarado y brechas en `PLAN_TRABAJO.md`. No confundirlo con respuestas verificadas en ejecución.
- [x] Revisión previa de scripts/configuración antes de ejecutar comandos.
- [x] Comprobación de JWT_SECRET sin mostrar su contenido: ausente en Process/User/Machine. No encontrado archivo `.env`.
- [x] Maven Wrapper funcionando y backend compilando con Java 21, sin arrancar Spring ni ejecutar tests.
- [x] Lint/build frontend correctos, con dependencias existentes y sin instalación.
- [x] Frontend levantado y URL comprobada mediante HTTP 200.
- [x] PostgreSQL accesible; consulta en transacción READ ONLY confirma base/tablas existentes.
- [x] Intentos MCP de proyecto/pantallas/sistemas de diseño documentados; autenticación rechazada.
- [x] Documentos de plan/estado creados y revisados tras las comprobaciones.

## Pruebas y comprobaciones realizadas

| Comprobación | Resultado y alcance |
| --- | --- |
| Herramientas | Java Temurin 21.0.12.1, Node 24.21.0, npm 11.19.0, Bun 1.4.2; Maven global no disponible, wrapper sí; psql disponible |
| `.\mvnw.cmd -version` | Correcto: Maven 3.9.16 con Java 21 |
| `.\mvnw.cmd -DskipTests compile` | BUILD SUCCESS, 23 fuentes compiladas; **no** verifica contexto/API ni tests |
| `bun run lint` | Correcto, sin diagnósticos ESLint |
| `bun run build` | Correcto con Vite 8.3.1 instalado; generó `fronted-app-ing-web/dist` |
| Puertos antes del arranque | 8081 y 5173 sin listener; 5432 escuchando |
| `bun run dev --host 127.0.0.1 --port 5173 --strictPort` | Iniciado en segundo plano; HTTP confirma que sirve el frontend |
| GET `http://127.0.0.1:5173/` por PowerShell | HTTP 200; HTML contiene entrada `/src/main.jsx`; no equivale a prueba visual/funcional |
| GET `http://localhost:8081/api/productos` por PowerShell | Sin conexión; backend no está arrancado |
| PostgreSQL | Conexión a `tienda_usuarios` con credencial existente manejada sin imprimir; `BEGIN READ ONLY`, consulta de base/tablas y `COMMIT` correctos |
| Tablas PostgreSQL | `detalles_pedido`, `pedidos`, `productos`, `usuarios`; no se consultaron datos personales ni se modificaron registros |
| JWT_SECRET | Ausente en Process/User/Machine; no se generó ni almacenó secreto nuevo |
| Stitch MCP | `get_project`, `list_screens`, `list_design_systems`: falta credencial; no se obtuvieron pantallas/tokens |
| Navegador | `browser.tabs.open` falló: no hay navegador de escritorio conectado; no se repitió mientras estaba desconectado |

### No realizado / no verificado

- Arranque del backend: bloqueado por secreto ausente; evitado además el DDL automático sobre la base existente.
- Tests Maven: no ejecutados; único test inicia el contexto sin aislamiento de base/secret.
- Integración frontend/backend: no existe cliente API ni servidor backend disponible; CORS/preflight y peticiones desde navegador pendientes.
- Registro, login, sesión, roles, catálogo real, pedidos y administración en ejecución: pendientes.
- Cuenta ADMIN y datos comerciales/stock/moneda: no verificados.
- Pantallas y sistema de diseño de Stitch: pendientes, no completados.
- Revisión visual móvil/escritorio, consola del navegador y E2E: pendientes.

## Archivos creados/modificados y efectos

Documentación creada:

- `PLAN_TRABAJO.md`: revisión técnica, contrato API, JWT/roles, brechas, siete fases y criterios de verificación/arranque.
- `ESTADO_PROYECTO.md`: estado, evidencias, pendientes, bloqueos y registro de avances.

No se modificaron fuentes backend/frontend, configuraciones, dependencias ni `bun.lock`. Se conservaron los archivos existentes; no se eliminó contenido.

Artefactos derivados de comprobaciones:

- `target/`: recursos copiados y clases generadas por compilación.
- `fronted-app-ing-web/dist/`: salida del build frontend.
- Maven Wrapper usa su distribución en la caché del usuario. No se modificó su script ni properties.

Servidor de desarrollo iniciado por esta revisión:

- URL: `http://127.0.0.1:5173/`.
- Shell en segundo plano: `sh_122413986001MCwZGUw0o7h94K`.
- Sirve todavía la plantilla existente, no una tienda implementada. Se dejó iniciado tras comprobar HTTP; no se levantó backend.
- Actualización posterior: **este proceso terminó con código 1**, por `EBUSY` al vigilar `fronted-app-ing-web/public/stitch/28ee11b91b0e4c1c8dec9f3b2ebb3b9d.html`. El HTTP 200 anterior es evidencia histórica, no garantía de disponibilidad actual. No se comprobó si otro proceso sirve el puerto 5173.

## Bloqueos y decisiones en la revisión inicial — historial

1. **Autorización de implementación pendiente:** respetar la solicitud de detenerse tras revisión/plan.
2. **Stitch sin autenticación:** configurar acceso al MCP y repetir consultas del proyecto `15956695953242065641`. No elegir estilos alternativos por suposición.
3. **JWT_SECRET ausente:** proporcionar por canal/mecanismo seguro al proceso, no pegarlo en documentación/chat ni incorporarlo al frontend.
4. **Base existente con `ddl-auto=update`:** confirmar entorno de trabajo y respaldo antes del arranque; usar base de prueba autorizada para escrituras/tests.
5. **Seguridad de pedidos:** corregir control de propietario en GET por ID y evitar serializar contraseña de usuario antes de habilitar detalles/pedidos. Son hallazgos del código, aún no reproducidos por HTTP.
6. **Estados sin validación y concurrencia de stock:** definir reglas reales y aprobar ajustes mínimos en endpoints existentes, con pruebas.
7. **Cuenta ADMIN de prueba:** no hay creación pública ni se verificó disponibilidad; solicitar cuenta/procedimiento autorizado.
8. **Navegador desconectado:** necesario para comprobación visual y CORS real.
9. **Directorio sin Git:** no se puede verificar diff histórico; acordar respaldo/seguimiento antes de implementar y no sobrescribir trabajo ajeno.
10. **Alcance comercial:** confirmar moneda y cualquier diferencia Stitch/API. No inventar pagos, envíos, descuentos, recuperación de clave o variantes.

## Registro de avances

### Avance 17 — Cierre académico y evidencia puntual de configuración

- Diez archivos preparados en este cierre: modificados `README.md`, `ESTADO_PROYECTO.md`, `PLAN_TRABAJO.md`, ambos `.gitignore`, `src/main/resources/application.properties`, `scripts/start-backend.ps1`; creados ambos `.env.example` y `docs/ENTREGA_ACADEMICA.md`. No se cambian páginas, endpoints, modelos, funciones comerciales ni dependencias.
- Pruebas nuevas limitadas al cambio: rechazo seguro por ausencia de cada variable PostgreSQL (3 casos, antes de Maven/conexión), sintaxis PowerShell correcta; contexto Spring real con BD/JWT desde entorno y H2 efímera en 8083, catálogo 200/`[]` y perfil sin token 401. `create-drop` exclusivamente H2 para esta comprobación; no certifica `validate` sobre PostgreSQL. Servidor temporal cerrado.
- La comprobación PostgreSQL con configuración nueva no pudo iniciarse: la copia compilada ya está sanitizada y no hay credenciales en variables de esta sesión. No se intentó recuperar contraseñas ni reutilizar valores desde otros archivos. `target/classes/application.properties` coincide con la fuente sin credenciales; servidores previos no se detienen/reinician ni cuentan como prueba de la nueva configuración.
- Git: metadatos temporales fuera del proyecto permitieron probar `check-ignore --no-index`: 24 exclusiones y 16 inclusiones representativas correctas. No se creó `.git` en el proyecto ni se añadieron archivos al índice. Inventario filtrado: **165 archivos candidatos**, detallados por grupos en `docs/ENTREGA_ACADEMICA.md`; no hay diff histórico disponible.
- Revisión heurística de todos los candidatos para credenciales JDBC, claves API conocidas, claves privadas, JWT y BCrypt: sin coincidencias sensibles. Revisión específica: BD/JWT por entorno y Stitch con `{env:STITCH_API_KEY}`. No sustituye auditoría exhaustiva; las credenciales antes presentes requieren rotación autorizada antes de producción.
- Confirmados los reportes previos Maven: 1 contexto + 1 integración + 5 mantenimiento = 7 pruebas, 0 fallos/errores. Bun 6, lint/build y E2E ya aprobados no se repiten. No se cambian contraseñas reales, roles o datos PostgreSQL. Sin commit/push.
- Pendientes para la demostración separados de producción en el resumen vigente y en el inventario. La entrega de fuentes/documentación está preparada; no se declara verificado el login real ADMIN ni el arranque PostgreSQL posterior a esta configuración.

### Avance 16 — Preparación de entrega académica (configuración/documentación)

- Sin funciones nuevas: `application.properties` exige variables PostgreSQL/JWT y pasa a validate/OSIV false/SQL false como valores seguros también sin script. `start-backend.ps1` comprueba las tres variables de BD antes de iniciar.
- README ampliado con PostgreSQL existente/nuevo, rol sin superusuario y contraseña oculta, variables del proceso, generación JWT, inicialización solo en base vacía y arranque backend/frontend. El procedimiento de base nueva está documentado; no se ha ejecutado sobre la base del titular.
- Clave de Stitch ya referenciada como `{env:STITCH_API_KEY}`; no se cambió `opencode.json`. Plantillas `.env.example` sin valores reales y reglas de exclusión añadidas a ambos `.gitignore`.
- `git rev-parse --show-toplevel`: no hay repositorio en este directorio ni ancestros. Se prepara inventario de entrega, no diff/staging. No se inicializa Git, no hay commit/push.
- Pruebas anteriores conservadas, no repetidas por documentación: Maven 7, Bun 6, lint/build, E2E real y responsive. Comprobaciones específicas de la configuración nueva y revisión final de secretos/exclusiones pendientes de resultado; no marcar como verificadas hasta completarlas.

### Avance 15 — Validación final del mecanismo local

- `mvnw.cmd test`: BUILD SUCCESS, 7 pruebas, 0 fallos (5 específicas del restablecimiento y 2 de regresión). Verificado también rechazo por correo incorrecto, sin afectar al otro ADMIN de prueba; login/perfil reales sobre H2 tras actualizar solo password.
- Preparación y `-Check` probados contra el backend PostgreSQL activo sin restablecer la contraseña real. El titular debe ejecutar `scripts/reset-admin-password.ps1` en una terminal interactiva y proporcionar allí la nueva contraseña, nunca en el chat.
- Si la verificación falla, el script no informa éxito e intenta restaurar la contraseña anterior únicamente si no hubo cambio concurrente. Roles/demás columnas protegidos; no revoca tokens preexistentes.
- Documentos actualizados; sin archivos de secretos, hash/JWT impresos, commit ni push. Cambio real y comprobación de su nuevo login pendientes de la entrada privada del titular.

### Avance 14 — Mecanismo local de restablecimiento ADMIN autorizado

- Titular confirmó la cuenta y autorizó únicamente cambiar `password` del ID 2/correo confirmado; rol ADMIN y demás columnas deben conservarse.
- Archivos: `scripts/reset-admin-password.ps1`, `src/test/java/com/api/usuarios/maintenance/ResetAdminPassword.java` y `ResetAdminPasswordTests.java`; guía agregada a README. Sin endpoint nuevo ni código de mantenimiento en el JAR de producción.
- Entrada mediante Java Console.readPassword y confirmación oculta; rechaza argumentos con secretos y entrada redirigida. BCrypt del PasswordConfig existente; límites 8 caracteres/72 bytes UTF-8. SQL preparado, bloqueo de fila, comprobación de identidad/rol y comparación de demás columnas.
- Verificación POST login + GET me con contraseña/JWT solo en memoria, sin imprimir cuerpos. Si falla tras commit, compensación condicionada al hash/identidad para no sobrescribir cambios concurrentes. No revoca JWT existentes.
- `mvnw.cmd -Dtest=ResetAdminPasswordTests test`: 5 pruebas correctas sobre H2 aislada, incluida actualización y login/perfil HTTP reales, preservación de otro ADMIN, rechazo de rol incorrecto, límites y recuperación/concurrencia; ampliación adicional de rechazo por correo pendiente de regresión.
- `scripts/reset-admin-password.ps1 -Check`: cuenta objetivo y backend disponibles, comprobación PostgreSQL de solo lectura, sin cambios ni hashes mostrados.
- **La contraseña real aún no se restableció**: el titular debe ejecutar el script en su terminal e introducirla allí. No se pidió ni se recibió una contraseña por chat; no se guardaron credenciales ni se hicieron commits/push.

### Avance 13 — Cierre y verificaciones finales

- Regresión Maven ampliada: BUILD SUCCESS, 2 tests, 0 fallos; verifica también JWT expirado/emisor incorrecto 401 y exclusión de password al serializar Usuario directamente. Advertencias no bloqueantes: agente Mockito y anotación de validación anidada heredada (validación efectiva comprobada).
- Bun: 6 tests, 0 fallos. Lint final sin diagnósticos; build final correcto, 32 módulos, JS 273.49 kB (82.33 gzip), CSS 30 kB.
- E2E ampliado completo: POST abortado conserva bolsa y no presenta confirmación; después POST real crea pedido/historial; ADMIN CRUD/FK/estado; recargar elimina sesión y protege pedidos; error/reintento catálogo. Geometría de las 10 pantallas principales probada en 360/390/768/1280/1440, sin desbordamiento de página ni excepciones JavaScript.
- Capturas públicas inicio escritorio/móvil inspeccionadas; ajuste de fotografía editorial de categorías para corresponder a camisetas/pantalones/chaquetas/vestidos. No se guardaron capturas privadas, HAR, traces, JWT ni contraseñas.
- Comprobación final: GET backend:8081 y ruta directa frontend:5173/catalogo responden 200; puertos de prueba 8082/5174 cerrados. Diez pares HTML/captura y 57 imágenes locales presentes; manifest corregido a rutas relativas y UTF-8.
- Guía final en `README.md` y README frontend; matriz en `docs/STITCH_IMPLEMENTACION.md`; plan/estado actualizados. Backend vivo: shell `sh_1226da192001i567wVU7YpQU3E`; Vite vivo: `sh_1226ee812001dNNMwo6Yoo6rIb`.
- Pendientes: los cuatro del apartado vigente (ADMIN/validación PostgreSQL staging, política comercial, endurecimiento de despliegue y revisión manual). Sin escrituras de prueba sobre PostgreSQL ni cambios en credenciales preexistentes, sin commit/push.

### Avance 12 — E2E completo y guía de arranque

- Repetición completa E2E correcta después de corregir selector y CSS: navegación/catalogo/talla/registro/login/carrito/pedido/confirmación/historial/roles/ADMIN CRUD/FK/estado, fallo de red sin catálogo falso, reintento, sin excepciones JavaScript.
- Responsive probado a 360/390/768/1280/1440 para inicio, catálogo, detalle, login, registro, bolsa, historial, confirmación y pedidos ADMIN. Smoke PostgreSQL también correcto para seis rutas públicas.
- `README.md` y `docs/STITCH_IMPLEMENTACION.md` documentan matriz, recursos, diferencias API, arranque con secreto en memoria, pruebas aisladas, URLs y límites. Plan/estado vigentes separados de la revisión histórica.
- Pendiente antes de cierre: última ejecución con test de JWT expirado/emisor incorrecto y POST fallido que conserva bolsa; comprobar ADMIN productos en los cinco anchos y recarga sin sesión. No se alteraron registros PostgreSQL ni se hicieron commits.

### Avance 11 — Flujos E2E reales y corrección móvil

- E2E ejecutó con éxito registro/login/bolsa/pedido/confirmación/historial, permisos CLIENTE, CRUD ADMIN, rechazo FK visible, cambio de estado persistido y lectura posterior por cliente. Primer intento se detuvo por selector de test ambiguo; corregido sin alterar la aplicación para simular resultados.
- Segundo intento detectó desbordamiento real en filtros de catálogo a 360 px. Diagnóstico geométrico: legend flotante dejaba ancho cero al selector de talla; se elimina el float y se fijan columnas móviles con minmax(0,1fr). Repetición completa pendiente.
- Smoke headless verificó navegador Vite:5173 → backend PostgreSQL:8081 por CORS, HTTP 200, sin escrituras; inicio cabe en 360/390/768/1280/1440. Servidores de desarrollo reiniciados con código actualizado.
- Unitarias Bun: 6 correctas; regresión Maven: 2 tests correctos. Captura de inicio 1440 inspeccionada frente a Stitch y las 10 capturas de referencia revisadas.

### Avance 10 — Infraestructura E2E sin credenciales persistidas

- Playwright instalado únicamente en el temporal aprobado (no modifica dependencias/lock del frontend), Chrome local disponible. Se inicia prueba headless al estar desconectado el navegador MCP.
- `scripts/check-browser.ps1` genera cuentas efímeras en el entorno, arranca backend test real H2:8082 y Vite:5174; prueba UI contra endpoints reales, sin mocks exitosos ni escritura de datos existentes. Sin traces, storageState ni capturas de credenciales.
- `FrontendTestApplication` vive solo en classpath test, fuerza H2 en memoria y fixtures identificados TEST. Servidores de prueba se cierran al terminar.
- Se añaden unitarias Bun del cliente API y script seguro de arranque PostgreSQL con JWT en memoria / DDL validate. E2E y regresión final aún en ejecución/pendientes de resultado.

### Avance 9 — Montaje, responsive y compilación frontend

- `App.jsx` monta las 10 pantallas funcionales, rutas directas, guards CLIENTE/ADMIN, páginas de error y retorno a destino seguro. CSS propio sin Tailwind: tema Stitch, hero/editorial, tarjetas, paneles, tablas y adaptación móvil/tablet.
- Base de plantilla conservada en `docs/baseline` además del respaldo externo. Recursos editoriales solo para presentación de marca, no atribuidos a productos sin imagen.
- `bun run lint`: sin diagnósticos. `bun run build`: correcto, 32 módulos; JavaScript 272.79 kB (82.12 gzip), CSS 30 kB.
- Pendiente: E2E/UI y comprobación de medidas reales, actualizar backend activo con las correcciones y documentar arranque final.

### Avance 8 — Fases 5 y 6 implementadas

- Bolsa local solo con IDs/cantidades, unión por producto, edición/eliminación/vaciado confirmado; GET real de disponibilidad/precio, revalidación previa, POST con items únicamente. Bloqueo de doble envío en curso; bolsa vaciada solo tras respuesta exitosa y confirmación por GET. Error de red después del POST advierte consultar historial por posible respuesta perdida.
- Historial propio y detalle/confirmación con DTOs reales, perfil/logout local. Sin inventar cobros, impuestos, dirección, email enviado o entregas.
- Panel ADMIN: estadísticas calculadas sobre datos recibidos (no facturación), filtros locales, CRUD real de productos y conflicto de registros asociados; imagen URL y talla/color únicos. Gestión de todos los pedidos/detalle/cambio de estado textual, sin transiciones ficticias.
- Archivos: `pages/CartPage.jsx`, `pages/OrderPages.jsx`, `pages/AdminPages.jsx`, `components/OrderDetails.jsx`.
- Pendiente: montaje final y CSS, comprobaciones frontend y regresión final backend. UI escrita no equivale a flujo E2E verificado.

### Avance 7 — Fases 2, 3 y 4 implementadas / tests de seguridad

- Estructura React ampliada con `components`, `pages`, `services`, `context`, `hooks`; fetch real, enlaces History API, layout compartido, campos/contraseña, imágenes/placeholder, carga/error/vacío, cantidades y diálogo.
- Inicio/editorial y categorías derivados de catálogo, búsqueda/endpoints existentes y filtros combinados locales, detalle con stock/talla/color reales. Registro/login/perfil; sesión y expiración solo en memoria; rol real añadido a `/api/usuarios/me`.
- `mvnw.cmd test`: BUILD SUCCESS, 2 tests (contexto y flujo HTTP integrado con numerosas aserciones), BD H2 efímera, sin escribir PostgreSQL. Verificado registro/duplicado/validación/login/JWT inválido, CRUD ADMIN/rechazo CLIENTE, pedido/precio/stock/historial, acceso cruzado 403 y ausencia de password/hash; FK 409 y concurrencia de última unidad.
- Dependencia nueva únicamente H2, scope test; sin dependencias nuevas frontend ni actualización de lockfile.
- Pendiente: estilos finales, guards/rutas de App, carrito/pedidos/admin UI, lint/build y pruebas del frontend. La UI todavía no se declara verificada.

### Avance 6 — Fase 1 HTTP y recursos / seguridad implementada

- Backend levantado en http://localhost:8081 con esquema validado (sin DDL). GET productos 200; perfil sin token 401. Preflight solicitado con origen Vite. Prueba browser-CORS pendiente: navegador MCP desconectado.
- Diseños: 10 HTML y capturas en `docs/stitch`; 57 imágenes recuperadas en `fronted-app-ing-web/public/editorial`. Inspección de textos/estructuras de las 10 pantallas y capturas de inicio/admin.
- Seguridad confirmada por código y corregida: GET pedido requiere propietario o ADMIN; `PedidoResponse` solo incluye usuario reducido, detalles sin proxies; `Usuario.password` ignorado en JSON como defensa adicional.
- Bloqueo transaccional de productos, cantidades consolidadas/ordenadas; estado no vacío/máximo 50; 500 genérico y conflicto FK 409; validación de issuer JWT.
- Pendiente: compilar/probar correcciones, sesión/API/componentes y flujos de escritura aislados. No se declara aún la corrección verificada por HTTP.

### Avance 5 — Autorización y Stitch conectado

- MCP: `get_project` y `list_screens` exitosos para 15956695953242065641; título Fashion World Tienda Web y 10 pantallas DESKTOP verificados. Recuperación HTTP de los 10 HTML con respuesta 200.
- Respaldo externo de fuentes Java/React y documentos en el directorio temporal aprobado, excluyendo configuración con credenciales. Sin Git ni commits.
- Backend iniciándose con JWT_SECRET aleatorio (32 bytes Base64) solo en memoria y DDL `validate`, sin alterar el esquema existente. Vite ya escucha en 5173.
- Decisiones: USD del diseño Stitch, sesión solo en memoria, carrito local, navegación History API sin dependencia nueva. No incorporar pago/envío/newsletter ficticios.
- Pendiente: comprobar HTTP/CORS, inspeccionar recursos, implementar componentes y corregir seguridad antes de habilitar pedidos.

### Avance 1 — Revisión estática

- Completado: inventario de stack/carpeta/contratos y scripts; identificación JWT, roles y riesgos.
- Evidencia: archivos fuente leídos; detalles y rutas en el plan.
- Pendiente: respuestas reales de API y revisión visual Stitch.
- Archivos fuente modificados: ninguno.
- Bloqueos: MCP sin credencial y JWT_SECRET ausente.

### Avance 2 — Comprobaciones de entorno sin implementación

- Completado: versiones/wrapper, compile backend, lint/build frontend, servidor frontend HTTP 200, conexión de base READ ONLY.
- Evidencia: comandos y resultados en la tabla anterior.
- Pendiente: backend arrancado, tests, CORS y flujos; no se declara integración completada.
- Efectos: artefactos `target/`, `dist/` y servidor Vite; sin cambios de datos o fuentes.
- Bloqueos adicionales: navegador desconectado y DDL sobre base existente.

### Avance 3 — Plan y estado inicial

- Completado: creación de ambos documentos y revisión de su contenido frente a las evidencias.
- Archivos: `PLAN_TRABAJO.md`, `ESTADO_PROYECTO.md`.
- Pendiente: aprobación del usuario, desbloqueo de fase 1 y luego implementación por fases.
- Pruebas: inspección final de documentos; no se añadieron tests ni funcionalidades.

### Avance 4 — Reintento MCP de Stitch (2026-10-09)

- Solicitud: repetir consulta del proyecto `15956695953242065641` y listado de pantallas; no implementar.
- Pruebas: `get_project({name: "projects/15956695953242065641"})` y `list_screens({projectId: "15956695953242065641"})`, mediante MCP.
- Resultado: ambas devolvieron `Error POSTing to endpoint`, respuesta JSON-RPC con `isError: true` (IDs 14 y 15). Mensaje exacto común, sin claves ni tokens:

```text
Request is missing required authentication credential. Expected OAuth 2 access token, login cookie or other valid authentication credential. See https://developers.google.com/identity/sign-in/web/devconsole-project.
```

- El usuario informa `stitch connected` en `opencode mcp list`; las operaciones remotas siguen rechazando autenticación. No se verificaron pantallas ni sistema de diseño.
- Archivos modificados: `PLAN_TRABAJO.md`, `ESTADO_PROYECTO.md`, únicamente para registrar el reintento y mantener el bloqueo.
- Pendiente: acceso autenticado efectivo. Implementación no iniciada; sin cambios de código, configuración o recursos remotos.

### Incidencia — Finalización del servidor Vite de la revisión

- Evidencia: notificación de finalización del shell `sh_122413986001MCwZGUw0o7h94K`; `Error: EBUSY: resource busy or locked, watch` sobre el HTML Stitch señalado arriba; salida 1.
- Alcance: falló el watcher de archivos; la notificación no demuestra un problema de API o de credenciales MCP.
- Archivo modificado en este seguimiento: únicamente `ESTADO_PROYECTO.md`, para registrar el fallo del proceso iniciado por esta revisión.
- Pendiente: comprobar disponibilidad actual y, si se autoriza, investigar el bloqueo del archivo o evaluar vigilancia por polling como alternativa. No se cambió Vite ni se reinició el servidor.
- Se detectaron anotaciones nuevas de otro avance en este documento; se conservaron sin asumir que autorizan implementación en esta conversación.

## Protocolo para próximos avances

Registrar fecha, fase/tarea, archivos exactos, pruebas con comando/resultado, pendientes y bloqueos. Marcar `[x]` solo tras cumplir el criterio verificable del plan; una tarea parcialmente desarrollada permanece pendiente. No publicar secretos, JWT, hashes de contraseña ni datos personales en evidencias.
