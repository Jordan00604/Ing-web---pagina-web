# Plan de trabajo — Fashion World

Fecha de revisión: 2026-10-09.

## Estado vigente de la implementación

La autorización de implementación está recibida; la conexión Stitch funciona. Los inventarios y checklists iniciales inferiores se conservan como historial. El contrato actualizado y la guía de arranque están en `README.md`, la matriz de las diez pantallas en `docs/STITCH_IMPLEMENTACION.md` y las evidencias en `ESTADO_PROYECTO.md`.

- [x] Fase 1: backend PostgreSQL:8081 y Vite:5173, secreto aleatorio en memoria, DDL validate; GET/preflight y CORS desde navegador headless verificados; pruebas de escritura aisladas H2.
- [x] Fase 2: recursos de las diez pantallas, tema, componentes/layout, navegación/guards y adaptación responsive; sin dependencias frontend nuevas.
- [x] Fase 3: inicio/catálogo/detalle con endpoints reales, filtros combinados locales, datos vacíos/error/stock y placeholder.
- [x] Fase 4: registro/login/JWT/perfil/rol, sesión en memoria, expiración y logout local; CLIENTE no accede a ADMIN.
- [x] Fase 5: bolsa, creación real, confirmación/historial; autorización propietario/ADMIN y DTO sin contraseña corregidos y probados.
- [x] Fase 6: CRUD productos y gestión de pedidos ADMIN; conflicto FK visible; estado textual validado sin inventar transiciones.
- [x] Fase 7 (base): Maven/Bun, lint/build y flujo E2E real H2/headless; JWT expirado/emisor incorrecto, POST fallido conserva bolsa, recarga sin token y diez pantallas en 360/390/768/1280/1440; documentación y URLs finales verificadas. Evidencia final: avance 13 de ESTADO_PROYECTO.md.
- [x] Configuración de entrega académica: PostgreSQL/JWT desde variables de entorno, clave Stitch ya desde entorno, ejemplos sin secretos, exclusiones Git y guía de instalación/arranque. Sin funciones nuevas.
- [x] Verificación puntual e inventario: contexto Spring/H2 con entorno efímero, rechazo de 3 variables ausentes, sintaxis y reglas Git (24 exclusiones/16 inclusiones); revisión heurística sin coincidencias sensibles y 165 candidatos de entrega. Evidencia en avance 17; no se repiten suites aprobadas.
- [ ] Demostración local: definir variables PostgreSQL y reiniciar con la configuración nueva; titular introduce contraseña oculta para ADMIN ID 2 confirmado y verifica login real. Una base nueva requiere ADMIN autorizado y catálogo, no se incluye seed y no se ejecutó aprovisionamiento desde cero.
- [ ] Cierre de despliegue (no bloquea el alcance académico local documentado): pruebas de escritura específicas PostgreSQL staging, estados/transiciones comerciales definitivos, rotación de credencial antes en archivos/CORS/HTTPS/fallback, revisión manual visual/accesibilidad exhaustiva. No crear ni promover cuentas existentes sin autorización específica.

Contrato cambiado: `/api/usuarios/me` añade rol; todas las respuestas de pedidos usan DTO con usuario `{id,nombre,email}`; GET por ID deniega acceso cruzado; estado no vacío máximo 50; DELETE vinculado responde 409; JWT verifica issuer y expiración; stock bloqueado y cantidades repetidas consolidadas.

Mantenimiento local autorizado posteriormente: preparado `scripts/reset-admin-password.ps1`, exclusivo para la cuenta ADMIN ID 2 confirmada por su titular, con entrada oculta y BCrypt del backend, verificación de login y protección de demás columnas. Modo `-Check` de solo lectura comprobado; el cambio real espera la entrada privada del titular en su terminal. Ver avance 14 del estado y README. No se añade recuperación pública ni se revocan JWT existentes.

## Alcance y condiciones

- Integrar el frontend existente en `fronted-app-ing-web` con el backend real, conservando carpetas, JavaScript/JSX, React, Vite y CSS. Mantener los paquetes Spring actuales: `config`, `controller`, `dto`, `model`, `repository`, `service`.
- Implementación por fases autorizada por el usuario el 2026-10-09. No hacer commit/push ni almacenar credenciales. Conservar el código existente mediante respaldo de fuentes sin configuraciones secretas.
- No sustituir cambios existentes ni actualizar tecnologías/dependencias por iniciativa propia. No hay repositorio Git en este directorio; antes de implementar se debe acordar una copia de seguridad o mecanismo de seguimiento.
- No inventar endpoints, datos comerciales, moneda, estados de pedido ni prestaciones. Las rutas de interfaz propuestas abajo no son endpoints del backend ni pantallas verificadas de Stitch.
- Solo marcar tareas completadas con evidencia. Una lectura del código verifica el contrato declarado, no su comportamiento HTTP.
- Actualizar este plan y `ESTADO_PROYECTO.md` después de cada avance: tareas, archivos, comandos/resultados y bloqueos. Si una fase tiene pendientes, no declararla completa.

## 1. Inventario de la revisión inicial (historial)

### Backend

- `pom.xml`: Spring Boot 4.1.1, Java 21, Maven; Web MVC, JPA, Validation, Security, OAuth2 Resource Server y PostgreSQL.
- Maven Wrapper 3.3.4; distribución Maven 3.9.16. Se comprobó el wrapper y la compilación sin ejecutar tests.
- Configuración: `src/main/resources/application.properties`; puerto **8081**; base PostgreSQL `tienda_usuarios` en `localhost:5432`.
- `spring.jpa.hibernate.ddl-auto=update`: el arranque puede modificar el esquema. No ejecutar sobre datos importantes sin confirmación y respaldo.
- La contraseña de base está en la configuración existente; no se copia a esta documentación. Proponer su externalización, sin cambiarla en esta revisión.
- `app.jwt.secret=${JWT_SECRET}`. El secreto debe ser Base64 y decodificar a al menos 32 bytes; no está disponible en ámbitos Process/User/Machine. No existe archivo `.env` encontrado; Spring no carga uno automáticamente con la configuración actual.
- PostgreSQL responde y la base contiene `usuarios`, `productos`, `pedidos` y `detalles_pedido`, verificado mediante transacción de solo lectura.
- Único test existente: `UsuariosApplicationTests.contextLoads`, sin perfil aislado. No ejecutado: requiere contexto/secret/base y puede activar el DDL existente.

### Frontend

- React 19, React DOM, Vite 8 y ESLint 10; JavaScript ESM y JSX, sin TypeScript, Tailwind, router ni librería HTTP instalados como dependencias del proyecto.
- `src/main.jsx`, `src/App.jsx`, `src/App.css`, `src/index.css`, `src/assets`; `public`; lockfile `bun.lock`; `node_modules` ya presente.
- `App.jsx` sigue siendo la plantilla React/Vite con contador. No tiene páginas comerciales, llamadas API, autenticación ni carrito.
- Scripts revisados: `dev` = `vite`, `build` = `vite build`, `lint` = `eslint .`, `preview` = `vite preview`. No hay script de tests.
- `vite.config.js` solo configura React; no existe proxy ni URL de API configurada.
- Se utilizaron las dependencias existentes y Bun, sin instalar ni regenerar el lockfile. Versiones del entorno registradas en `ESTADO_PROYECTO.md`.

### Stitch — conexión verificada

Proyecto solicitado: **15956695953242065641**, nombre indicado por el usuario: **Fashion World Tienda Web**.

Actualización 2026-10-09: `get_project` y `list_screens` responden correctamente por MCP. Título remoto confirmado, proyecto privado, 10 pantallas DESKTOP: inicio, catálogo, detalle, login, registro, carrito, pedido realizado, mi cuenta/pedidos, panel administrador y gestión de pedidos. Tema remoto: Playfair Display / Plus Jakarta Sans, verde #064e3b y superficies #fbf8fc. Se recuperan HTML, capturas y recursos como referencia; las variantes móviles serán adaptaciones. Los intentos fallidos siguientes se conservan como historial, ya resuelto.

Se invocaron por MCP `get_project`, `list_screens` y `list_design_systems`. Las tres consultas devolvieron falta de credencial de autenticación. Por tanto:

- No están verificados el título remoto, el inventario de pantallas, sus variantes ni sus recursos.
- No están verificados colores, tipografías, espaciados, radios o sistema de diseño. Los estilos de la plantilla Vite **no son** los de Stitch.
- No se generó, editó ni eliminó ningún recurso remoto.
- Antes de implementar estilos: restablecer acceso al MCP y repetir consultas; inspeccionar cada pantalla, su HTML y captura, y el sistema de diseño disponible. Si no hay sistema formal, documentar tokens extraídos de las pantallas sin atribuirlos a uno inexistente.
- Crear entonces una matriz pantalla Stitch → ruta frontend → componentes → endpoints → diferencias de soporte. Si no hay variante móvil, documentar su adaptación desde el diseño verificado.

Reintento solicitado por el usuario el 2026-10-09: `get_project` y `list_screens` volvieron a fallar por falta de credencial. El usuario informa que `opencode mcp list` muestra `stitch connected`; ese estado no demuestra que las operaciones remotas estén autenticadas. No se levantó el bloqueo ni se verificó ninguna pantalla.

## 2. Contrato API en la revisión inicial (historial; cambios vigentes arriba)

URL base configurada: `http://localhost:8081`. JSON en cuerpos de solicitud. Para recursos privados: `Authorization: Bearer <accessToken>`; nunca registrar el token.

| Método | Endpoint real | Acceso actual | Entrada / salida declarada |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Público | `RegistroRequest` → 201 `{id,nombre,email}`; 409 `{mensaje}` si email duplicado |
| POST | `/api/auth/login` | Público | `LoginRequest` → 200 `{accessToken,tokenType,expiresIn,nombre}`; 401 `{mensaje}` |
| GET | `/api/usuarios/me` | Autenticado | `{id,nombre,email}`; no devuelve rol |
| GET | `/api/productos` | Público | Lista de entidades `Producto` |
| GET | `/api/productos/{id}` | Público | `Producto`; 404 si no existe |
| GET | `/api/productos/buscar?q=...` | Público | Búsqueda por nombre, sin distinguir mayúsculas; lista |
| GET | `/api/productos/categoria/{cat}` | Público | Coincidencia de categoría; lista |
| GET | `/api/productos/talla/{talla}` | Público | Coincidencia de talla; lista |
| POST | `/api/productos` | ADMIN | `ProductoRequest` → 201 `Producto` |
| PUT | `/api/productos/{id}` | ADMIN | `ProductoRequest` completo → `Producto` |
| DELETE | `/api/productos/{id}` | ADMIN | 204; comprobar restricciones por pedidos relacionados |
| POST | `/api/pedidos` | Autenticado (también ADMIN) | `CrearPedidoRequest` → 201 `Pedido`; usuario obtenido del JWT |
| GET | `/api/pedidos/mis-pedidos` | Autenticado | Pedidos del usuario del JWT, fecha descendente |
| GET | `/api/pedidos` | ADMIN, comprobado en controlador | Todos los pedidos, fecha descendente; 403 para no ADMIN |
| GET | `/api/pedidos/{id}` | Cualquier autenticado actualmente | `Pedido`; **no comprueba propietario** |
| PUT | `/api/pedidos/{id}/estado` | ADMIN, comprobado en controlador | Mapa `{estado: string}` → `Pedido`; sin validación de estados |

No hay endpoint de filtro combinado, categorías, subida de imágenes, carrito, pagos, envíos, refresh token, recuperación de contraseña, cierre de sesión remoto ni creación pública de administradores. `findByCategoriaAndTalla` existe en el repositorio pero no está expuesto por controlador.

### DTOs y respuestas

- `RegistroRequest`: `nombre` no vacío; `email` no vacío y válido; `password` no vacío, mínimo 8 caracteres. Registro normaliza email y fuerza rol `CLIENTE`.
- `LoginRequest`: `email` válido/no vacío y `password` no vacío.
- `ProductoRequest`: `nombre` no vacío, `precio` obligatorio y ≥ 0.01, `stock` obligatorio y ≥ 0; opcionales `descripcion`, `categoria`, `talla`, `color`, `imagenUrl`.
- `CrearPedidoRequest`: `items` obligatorio/no vacío, validación anidada. `ItemPedidoRequest`: `productoId` obligatorio y `cantidad` obligatoria ≥ 1. No enviar usuario, precios ni total como si el backend los aceptara.
- `Producto`: `id`, `nombre`, `descripcion`, `precio`, `stock`, `categoria`, `talla`, `color`, `imagenUrl`. Una talla, un color y una URL por registro; no hay modelo de variantes, galería, descuento o rating.
- `Pedido`: entidad con `id`, `usuario`, `detalles`, `total`, `estado`, `fechaCreacion`. `DetallePedido`: `id`, `producto`, `cantidad`, `precioUnitario`, `subtotal`; referencia inversa a pedido ignorada para JSON. **La respuesta efectiva y la serialización lazy deben probarse.**
- Pedido inicial `PENDIENTE`; el servicio calcula precios/totales reales y reduce stock en transacción. No calcula impuestos, descuentos o envío; crear pedido no equivale a cobrarlo.
- Errores heterogéneos: validación devuelve mapa campo → mensaje; auth devuelve `{mensaje}`; `ResponseStatusException` devuelve texto; otros errores devuelven 500 con texto y mensaje de excepción. El cliente debe normalizar sin asumir un único esquema.

### JWT y roles

- BCrypt para contraseñas; JWT HS256 con `iss=tienda-usuarios`, `sub=id de usuario`, `iat`, `exp` a 3600 segundos, `email` y `rol` (`ADMIN` o `CLIENTE`).
- `SecurityConfig` convierte claim `rol` en autoridad con prefijo `ROLE_`; API stateless y CSRF desactivado.
- CORS acepta patrones de origen `*`, métodos GET/POST/PUT/DELETE/OPTIONS/PATCH y todos los headers; credenciales desactivadas. La prueba real de preflight sigue pendiente.
- El frontend puede leer rol/exp para navegación, pero esa lectura no valida la firma ni sustituye la autorización del servidor. Perfil mediante `/api/usuarios/me`; manejar expiración y 401 limpiando sesión local.
- No hay refresh ni revocación/logout remoto. Logout previsto exclusivamente local. Mantener token preferentemente en memoria; si se requiere persistencia al recargar, acordar almacenamiento y documentar el riesgo XSS antes de implementarla. Nunca poner secretos en variables `VITE_*`.
- No se verificó una cuenta ADMIN utilizable. Solicitar una cuenta de prueba o un procedimiento de aprovisionamiento autorizado; no permitir elegir ADMIN en registro.

## 3. Brechas propuestas en la revisión inicial (historial)

| Prioridad | Hallazgo en código / falta | Ajuste mínimo propuesto |
| --- | --- | --- |
| Bloqueante | Stitch sin autenticación | Restablecer credencial MCP y verificar pantallas/tokens antes de implementar su diseño |
| Bloqueante | `JWT_SECRET` ausente | Proporcionarlo por mecanismo seguro al proceso de backend; verificar solo presencia/Base64/longitud, no mostrarlo ni generar uno sin autorización |
| Alta | `/api/pedidos/{id}` sin control de propietario | En el endpoint existente comprobar `usuario.id == JWT.sub` o rol ADMIN; denegar a otro cliente; añadir test con dos clientes |
| Alta | `Pedido.usuario` puede serializar `Usuario.getPassword()` | Excluir contraseña de JSON como mínimo, preferiblemente respuesta DTO de pedido con usuario reducido. No exponer hashes; verificar serialización real |
| Alta | Cambios de estado arbitrarios, incluso null | DTO validado en el PUT existente y lista/transiciones acordadas. Solo `PENDIENTE` está documentado por el código; no inventar los demás ni reponer stock automáticamente |
| Alta | Stock sin bloqueo/versionado ante pedidos concurrentes | Comprobar con test de concurrencia; proponer bloqueo transaccional de productos o control optimista con manejo de conflicto, sin cambiar el endpoint |
| Media | Mensaje de excepción interno devuelto al cliente | Mensaje 500 genérico y diagnóstico seguro solo en servidor |
| Media | Credencial de base dentro de properties y CORS amplio | Externalizar contraseña y limitar orígenes del despliegue con aprobación, manteniendo entorno local funcional |
| Media | Borrado de producto usado en pedidos puede violar FK | Verificar; responder conflicto comprensible en el DELETE existente en vez de inventar borrado lógico |
| Alcance | Sin pago/envío/cupones/favoritos/reseñas/recuperación de clave | Si aparecen en Stitch, documentar incompatibilidad; omitir acción comercial no soportada. Cualquier ampliación requiere aprobación separada |
| Alcance | Sin galería, variantes, filtros combinados ni paginación API | Mostrar datos reales. Filtros combinados/orden local, si se acuerdan, sobre la lista recibida sin presentarlos como operaciones del backend |

No bloquea el frontend la ausencia de endpoint de carrito: proponer estado local por `productoId`/cantidad, sin prometer sincronización remota. No enviar dinero, dirección ni método de pago a la creación actual de pedidos. Definir moneda con el usuario, ya que no existe en el contrato.

## 4. Checklist inicial por fases (historial; estado vigente arriba)

### Fase 1 — Revisión y preparación del entorno (parcial)

- [x] Inventariar código, dependencias, scripts, configuración, DTOs, endpoints, JWT y roles.
- [x] Comprobar disponibilidad de Java/Node/Bun, wrapper Maven y PostgreSQL sin divulgar secretos.
- [x] Compilar backend sin tests; ejecutar lint/build del frontend; levantar frontend y verificar HTTP 200.
- [x] Consultar MCP de Stitch y registrar su bloqueo (no equivale a revisar pantallas).
- [ ] Obtener acceso a Stitch; revisar todas sus pantallas/sistema y completar matriz visual.
- [ ] Resolver JWT_SECRET y acordar base segura/respaldo por `ddl-auto=update`.
- [ ] Acordar respaldo del código existente y cuentas CLIENTE/ADMIN de prueba.
- [ ] Arrancar backend, comprobar URL y comunicación real frontend → backend con preflight CORS.

**Salida verificada exigida:** ambos servidores disponibles, GET público desde navegador, preflight correcto, entorno de prueba sin riesgo sobre datos existentes, inventario Stitch y contrato efectivo documentados.

### Fase 2 — Componentes compartidos, estilos y navegación

- [ ] Una vez autorizado, ampliar dentro de `fronted-app-ing-web/src`: `components`, `pages`, `services`, `context`, `hooks`, `styles`, manteniendo `assets`, `App.jsx` y `main.jsx`.
- [ ] Tokens CSS de Stitch: colores, tipografía, escala espacial, bordes, estados y contenedores; no añadir Tailwind/TypeScript ni copiar HTML de prototipo como aplicación final.
- [ ] Componentes reutilizables: cabecera/menú móvil, pie, contenedor, botón, campo con error, tarjeta de producto, selector de cantidad, badge de estado, carga/vacío/error y confirmación de acciones.
- [ ] Cliente HTTP con `fetch`, URL pública de API configurable, JSON/texto, errores, aborto de peticiones y Bearer solo cuando corresponda.
- [ ] Navegación accesible; rutas propuestas `/`, `/catalogo`, `/productos/:id`, `/registro`, `/login`, `/carrito`, `/confirmacion/:id`, `/mis-pedidos`, `/mis-pedidos/:id`, `/admin/productos`, `/admin/productos/nuevo`, `/admin/productos/:id/editar`, `/admin/pedidos`, `/admin/pedidos/:id`, y no encontrado/acceso denegado.
- [ ] Evaluar React Router para rutas/guards como dependencia mínima nueva y documentar decisión antes de instalar; no está instalado actualmente.

**Salida:** navegación/enlaces directos y componentes comprobados con teclado, móvil y escritorio; estilos comparados con Stitch; sin desbordamiento horizontal ni acciones sin soporte.

### Fase 3 — Inicio, catálogo y detalle del producto

- [ ] Inicio según Stitch, con contenido editorial identificado y productos reales obtenidos por GET `/api/productos`; no inventar destacados/descuentos del backend.
- [ ] Catálogo, búsqueda y filtros existentes por categoría/talla; definir comportamiento de filtros simultáneos sin inventar endpoint.
- [ ] Detalle por GET `/api/productos/{id}`, imagen URL existente/fallback, precio/stock, talla y color reales, cantidad y añadir al carrito.
- [ ] Manejar lista vacía, imagen fallida, error de red, carga, 404 y stock cero; no presentar variantes inexistentes como seleccionables.

**Salida:** lista/búsqueda/filtros/detalle contrastados con API real y diseño móvil/escritorio.

### Fase 4 — Registro, login, sesión y acceso por roles

- [ ] Formularios de registro/login con validaciones de DTO y errores reales; registro no inicia sesión por sí mismo.
- [ ] Contexto de sesión, Bearer, perfil `/api/usuarios/me`, expiración, logout local y política de persistencia acordada.
- [ ] Guards de sesión/ADMIN, navegación por rol y retorno a destino seguro después de login. Registro nunca envía rol.
- [ ] Probar duplicado 409, validación 400, credenciales 401, token inválido/expirado y autorización 403 con cuentas de prueba.

**Salida:** registro/login/perfil reales, sesión y denegaciones verificadas tanto en interfaz como en API.

### Fase 5 — Carrito, pedidos, confirmación y área del cliente

- [ ] Carrito local reutilizable: añadir/unificar por producto, modificar cantidades, eliminar/vaciar y persistencia de artículos si se acuerda; nunca guardar JWT como parte del carrito.
- [ ] Revalidar productos/stock antes de enviar; consolidar IDs repetidos; el servidor sigue siendo autoridad de stock/precio.
- [ ] Crear con POST `/api/pedidos` y únicamente `{items:[{productoId,cantidad}]}`; impedir doble envío mientras está pendiente, sin prometer idempotencia inexistente.
- [ ] Confirmar con respuesta real y total del servidor, vaciando carrito solo tras éxito. No mostrar pago aprobado ni prometer envío.
- [ ] Listar `/api/pedidos/mis-pedidos`; integrar detalle `/api/pedidos/{id}` solo tras corregir autorización y exposición de datos.
- [ ] Probar compra con stock insuficiente, pedido válido, historial propio y acceso cruzado denegado en base aislada/autorizada.

**Salida:** flujo carrito → pedido → confirmación → historial realmente persistido, stock coherente y datos privados protegidos.

### Fase 6 — Administración de productos y pedidos

- [ ] Layout ADMIN reutilizando estilos/componentes; no inventar estadísticas/dashboard API.
- [ ] Listar/crear/editar/eliminar productos con GET/POST/PUT/DELETE existentes, validación y confirmación; imágenes mediante URL, no upload ficticio.
- [ ] Listar todos los pedidos, ver detalle autorizado y editar estado mediante PUT existente una vez acordada/validada la política de estados.
- [ ] Verificar rechazo desde API para CLIENTE, errores de validación/FK, actualización real y ausencia de contraseñas en respuestas.

**Salida:** operaciones ADMIN reales y restricciones comprobadas con CLIENTE/ADMIN; datos de prueba identificados y sin borrar productos existentes.

### Fase 7 — Integración y revisión final

- [ ] Añadir pruebas backend de contratos, validación, JWT/roles, propiedad de pedidos, serialización y stock en contexto de base aislado; no basta `contextLoads`.
- [ ] Proponer infraestructura mínima frontend de tests de componentes/servicios y pruebas E2E; actualmente no existe, requiere documentar dependencias antes de incorporarlas.
- [ ] Ejecutar pruebas de flujos público/CLIENTE/ADMIN contra backend real; documentar comandos, fixture y limpieza autorizada limitada a datos de prueba.
- [ ] Revisar pantallas a 360/390 px, tablet y 1280/1440 px, teclado, foco, contraste, mensajes y ausencia de errores de consola.
- [ ] Ejecutar lint/build/test y comparar cada pantalla con Stitch; comprobar enlace directo/recarga y configuración de producción.
- [ ] Actualizar guía de arranque, variables sin secretos, URLs, matriz final y limitaciones; cerrar solo verificaciones con evidencia.

**Salida:** criterios de todas las fases satisfechos o bloqueos explicitados; no declarar integración terminada con mocks o compilación solamente.

## 5. Protocolo inicial de comprobación (historial; guía vigente en README.md)

Scripts/configuración ya revisados. Comandos desde la raíz para backend y desde `fronted-app-ing-web` para frontend:

```powershell
# Backend: no arranca el contexto ni modifica la base
.\mvnw.cmd -version
.\mvnw.cmd -DskipTests compile

# Solo después de disponer de JWT_SECRET válido y base/respaldo autorizado
.\mvnw.cmd spring-boot:run

# Frontend: usar bun.lock y las dependencias existentes
bun run lint
bun run build
bun run dev --host 127.0.0.1 --port 5173 --strictPort
```

- Backend esperado: `http://localhost:8081`; recurso público de comprobación `/api/productos` (no hay health endpoint declarado).
- Frontend verificado: `http://127.0.0.1:5173/`; preview tiene su propio servidor, no sustituye el backend.
- Proponer configuración frontend `VITE_API_URL=http://localhost:8081` (todavía no existe). Solo URL pública, jamás JWT_SECRET o contraseña.
- Al arrancar backend, verificar primero GET catálogo con código/respuesta, 401 sin token en `/api/usuarios/me` y preflight con origen exacto `http://127.0.0.1:5173` y headers `Authorization,Content-Type`.
- Desde navegador en el frontend, ejecutar GET a la API para probar CORS realmente; después repetir mediante el cliente HTTP integrado y rutas funcionales. Un GET exitoso por PowerShell no prueba CORS.
- Probar register/login/roles y escritura de productos/pedidos solamente sobre datos de prueba autorizados; no cambiar stock real durante la revisión.
- No ejecutar `mvn test` con la configuración actual como si fuera aislada. Preparar antes un entorno/perfil de tests y JWT_SECRET válido.
- El navegador de escritorio no está conectado en esta sesión; la revisión visual y prueba browser-CORS no se realizaron.

## Próximo punto de decisión

Entrega académica: no añadir funciones ni repetir verificaciones aprobadas salvo por cambios de configuración. Conservar evidencias y distinguir pendientes. Fuentes/documentación/configuración sin secretos preparadas; no existe repositorio Git, por lo que el inventario en `docs/ENTREGA_ACADEMICA.md` no es un diff. No hacer commit/push.

Continuar sin confirmaciones entre fases (autorización recibida). Arranque local con JWT aleatorio de 32 bytes en memoria y `ddl-auto=validate`; pruebas de escritura aisladas. No atribuir operaciones exitosas a errores del backend. Moneda USD tomada explícitamente de las pantallas Stitch, configurable para el despliegue; no existen pagos ni envíos en esta API. JWT solo en memoria; carrito local sin credenciales. No añadir router externo: navegación History API mínima con enlaces directos y guards. Estados del pedido conservados como texto del contrato existente, validando no vacío/longitud; no inventar transiciones ni efectos de envío/pago.
