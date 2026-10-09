# Stitch → Fashion World

Fuente: MCP `get_project` y `list_screens`, proyecto **15956695953242065641**, título remoto **Fashion World Tienda Web**, consultas exitosas el 2026-10-09. Diez pantallas DESKTOP; no se recibió variante MOBILE. Se descargaron los 10 HTML/capturas y 57 imágenes de sus etiquetas img. No se modificó ningún recurso de Stitch.

## Matriz de implementación

| Pantalla / ID Stitch | Ruta React | Componentes / API real | Adaptación y diferencias |
| --- | --- | --- | --- |
| Inicio `18b65bdffd4f4cb6a6bd9c5864568a4a` | `/` | HomePage, ProductCard, Layout; GET productos | Hero, categorías, editorial y llamada a registro. Sin newsletter, descuentos ni promesas de envío. |
| Catálogo `28ee11b91b0e4c1c8dec9f3b2ebb3b9d` | `/catalogo` | CatalogPage; GET lista/buscar/categoría/talla | Sidebar de filtros y 3 columnas; móvil filtros en rejilla y 2 columnas. Combinación/orden/precio locales, sin popularidad/paginación inventada. |
| Detalle `74504331edcf4733874e866bfd6b2ce5` | `/productos/:id` | ProductPage, Quantity; GET por ID | Imagen + ficha apiladas en móvil; talla/color únicos. Sin galería, wishlist, reseñas ni composición no registrada. |
| Login `3475e579618449a189b32e5970cd6fea` | `/login` | AuthPage, PasswordField; POST login y GET me | Editorial y formulario; sesión solo memoria. Sin recordar sesión, recuperación ni afirmaciones falsas sobre HTTPS local. |
| Registro `30351c724f4e4e4b8b405de30e1713e9` | `/registro` | AuthPage; POST register | Validación mínima 8 caracteres/confirmación. No acepta ADMIN. Sin suscripción ni aceptación legal ficticia; después de éxito ofrece login, no simula sesión automática. |
| Carrito `064c6f515b384ee9a2d8a526c450735c` | `/carrito` | CartPage, Quantity, ConfirmDialog; GET productos/IDs y POST pedidos | Bolsa local + resumen; móvil una columna. Total estimado sin envío/impuestos. Precio/stock del servidor. |
| Pedido realizado `1d9aac3c93b64f7595b731032c59c7e5` | `/confirmacion/:id` | OrderPage, OrderDetails; GET pedido autorizado | Confirmación solo con pedido real; sin total pagado, PDF, email enviado, dirección ni plazos ficticios. |
| Mi cuenta/pedidos `0dab7db694a1437a946bd030e6660281` | `/mis-pedidos`, `/mis-pedidos/:id` | OrdersPage/OrderPage; GET me/mis-pedidos/ID | Historial y perfil; móvil una columna. Sin VIP, direcciones, seguimiento courier o concierge inexistentes. |
| Panel ADMIN `c7f21179787e4f57a1b87d6e339583bc` | `/admin/productos`, `/admin/productos/nuevo`, `/admin/productos/:id/editar` | AdminProductsPage/ProductForm; CRUD productos | Sidebar, métricas calculadas y tabla con scroll interno en móvil; formulario URL, una talla/color. Sin SKU, CSV ni admin ficticio. |
| Pedidos ADMIN `419adc8a1441411daaae68a63393bff5` | `/admin/pedidos`, `/admin/pedidos/:id` | AdminOrdersPage/OrderDetails; GET todos/ID, PUT estado | Tabla y panel detalle; móvil apilado. Estados reales de API, sin facturación/cobros, pedido manual, etiquetas ni notificaciones. |

## Diseño y recursos

- Tema remoto en `get_project.designTheme`: Playfair Display (títulos), Plus Jakarta Sans (texto/controles); primario #064e3b, primario oscuro #003527, fondo #fbf8fc, superficie #fff, superficie baja #f6f2f7, borde #bfc9c3, texto #1b1b1e.
- Títulos 56/40/28 px, móvil 36/28; separaciones y márgenes amplios, imágenes 3:4, líneas finas y radios pequeños. Implementación en `src/index.css` y `src/App.css`, sin ejecutar el Tailwind/script de los prototipos.
- HTML/capturas: `docs/stitch/{id}.html` / `{id}.png`. `manifest.json` usa rutas relativas a esa carpeta; `assets.json` mapea URL de origen → recurso local.
- Imágenes descargadas: `fronted-app-ing-web/public/editorial/{id}-{índice}.jpg`. Solo usadas como editorial de marca; los productos comerciales usan su imagenUrl real o placeholder rotulado.
- Google Fonts carga las fuentes; ante fallo se usan sans-serif/Georgia. Pendiente empaquetado local/licencias para operación totalmente offline.
- No se atribuye un inventario de sistema formal consultado por `list_design_systems`: los tokens utilizados proceden del tema devuelto por `get_project` y de los HTML verificados.

## Verificación visual

Las diez capturas Stitch se inspeccionaron. Inicio implementado inspeccionado en captura headless a 1440 px; comparación de estructura/colores/tipografías, no equivalencia pixel-perfect. Se verifican anchos 360/390/768/1280/1440 sin desbordamiento de página; las tablas ADMIN conservan scroll dentro de su contenedor.

El prototipo contiene datos ficticios y prestaciones no respaldadas por la API; se conservan su lenguaje visual y jerarquía, no sus operaciones comerciales inexistentes. Pendiente revisión visual manual exhaustiva de cada pantalla con datos definitivos y accesibilidad asistida.
