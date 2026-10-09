import { useState } from 'react'
import { useApi } from '../hooks/useApi'
import { useCart } from '../context/contexts'
import { Link, Feedback, ProductImage, Quantity, Badge, Icon } from '../components/UI'
import { ProductCard } from '../components/ProductCard'
import { money } from '../services/format'
import { navigate } from '../services/router'

const editorial = '/editorial/18b65bdffd4f4cb6a6bd9c5864568a4a-'
export function HomePage() {
  const [revision, setRevision] = useState(0)
  const products = useApi('/api/productos', null, revision)
  const categories = [...new Set((products.data || []).map(p => p.categoria).filter(Boolean))]
  return <div className="container"><section className="hero"><img src={`${editorial}0.jpg`} alt="Editorial Fashion World, silueta esmeralda en un patio luminoso" fetchPriority="high" /><div className="hero-copy"><span className="eyebrow pill">Fashion World · Editorial</span><h1>Tu estilo,<br />tu mundo</h1><p>Una mirada contemporánea a las siluetas, las texturas y la elegancia de lo esencial.</p><div className="actions"><Link href="/catalogo" className="button">Explorar colección <Icon name="arrow" /></Link><Link href="/#editorial" className="button secondary">Ver editorial</Link></div></div></section>
    <section className="section" id="colecciones"><div className="section-heading"><div><span className="eyebrow">Estructura & siluetas</span><h2>Categorías esenciales</h2></div><Link className="text-link" href="/catalogo">Ver catálogo completo →</Link></div><div className="category-grid">{categories.slice(0, 4).map((cat, i) => <CategoryCard key={cat} category={cat} index={i} />)}</div>{!products.loading && !products.error && !categories.length && <p className="muted">Las categorías aparecerán cuando haya prendas en el catálogo.</p>}</section>
    <section className="values"><div><Icon name="box" /><h3>Una mirada editorial</h3><p>Líneas limpias, texturas y siluetas como punto de partida.</p></div><div><Icon name="bag" /><h3>Tu selección personal</h3><p>Explora las prendas disponibles y reúne tus favoritas en la bolsa local.</p></div><div><Icon name="user" /><h3>Siempre a tu alcance</h3><p>Consulta tus pedidos y sus estados reales desde tu cuenta.</p></div></section>
    <section className="section"><div className="section-heading"><div><span className="eyebrow">Desde nuestro catálogo</span><h2>Descubre las prendas</h2></div><p className="muted">Disponibilidad y precios actualizados<br />directamente desde la tienda.</p></div><Feedback {...products} retry={() => setRevision(revision + 1)} empty={products.data?.length === 0 && 'El catálogo todavía está vacío'} /><div className="product-grid home-products">{products.data?.slice(0, 4).map(p => <ProductCard key={p.id} product={p} />)}</div></section>
    <section className="editorial section" id="editorial"><div><span className="eyebrow">Fashion World · Lookbook</span><h2>Siluetas<br />desestructuradas</h2><p>Un diálogo entre el espacio, el cuerpo y el textil. Explora la inspiración visual de Fashion World.</p><p className="muted small">Fotografía editorial del diseño Stitch. Las prendas disponibles se consultan en el catálogo.</p><Link href="/catalogo" className="button secondary">Descubrir el catálogo <Icon name="arrow" /></Link></div><img src={`${editorial}9.jpg`} alt="Lookbook editorial, prendas esmeralda y marfil" loading="lazy" /><img src={`${editorial}10.jpg`} alt="Detalle de texturas en el lookbook Fashion World" loading="lazy" /></section><section className="callout"><span className="eyebrow">Tu espacio Fashion World</span><h2>Un estilo que es solo tuyo</h2><p>Crea tu cuenta para realizar pedidos y consultar tu historial.</p><Link className="button light" href="/registro">Únete a Fashion World <Icon name="arrow" /></Link></section>
  </div>
}

function CategoryCard({ category, index }) {
  const photo = { camisetas: 1, pantalones: 2, chaquetas: 3, vestidos: 4 }[category.toLocaleLowerCase('es')] || index + 1
  return <Link href={`/catalogo?categoria=${encodeURIComponent(category)}`} className="category-card"><img src={`${editorial}${photo}.jpg`} alt="Inspiración editorial de colección" loading="lazy" /><div><span className="eyebrow">Explora la colección</span><h3>{category}</h3><span className="category-arrow">↗</span></div></Link>
}

export function CatalogPage({ search }) {
  const params = new URLSearchParams(search)
  const q = params.get('q') || '', category = params.get('categoria') || '', size = params.get('talla') || ''
  const [revision, setRevision] = useState(0)
  const all = useApi('/api/productos', null, revision)
  const path = q ? `/api/productos/buscar?q=${encodeURIComponent(q)}` : category ? `/api/productos/categoria/${encodeURIComponent(category)}` : size ? `/api/productos/talla/${encodeURIComponent(size)}` : '/api/productos'
  const result = useApi(path, null, revision)
  const [sort, setSort] = useState('nombre')
  const [stockOnly, setStockOnly] = useState(false)
  const [min, setMin] = useState(''), [max, setMax] = useState('')
  const categories = [...new Set((all.data || []).map(p => p.categoria).filter(Boolean))]
  const sizes = [...new Set((all.data || []).map(p => p.talla).filter(Boolean))]
  const list = (result.data || []).filter(p => (!category || p.categoria === category) && (!size || p.talla === size) && (!stockOnly || p.stock > 0) && (min === '' || p.precio >= Number(min)) && (max === '' || p.precio <= Number(max))).sort((a, b) => sort === 'menor' ? a.precio - b.precio : sort === 'mayor' ? b.precio - a.precio : a.nombre.localeCompare(b.nombre))
  function filter(name, value) { const next = new URLSearchParams(search); if (value) next.set(name, value); else next.delete(name); navigate(`/catalogo?${next}`) }
  return <div className="container page">
    <div className="breadcrumbs"><Link href="/">Inicio</Link> / Catálogo</div>
    <div className="page-heading"><span className="eyebrow">Colección Fashion World</span><h1>Catálogo general</h1><p>Encuentra tu próxima prenda entre las referencias disponibles de la tienda.</p></div>
    <div className="catalog-toolbar">
      <span>{result.loading ? 'Consultando prendas…' : `${list.length} prendas`}</span>
      <form className="search-field" onSubmit={event => { event.preventDefault(); filter('q', new FormData(event.currentTarget).get('q').trim()) }}><Icon name="search" /><input name="q" defaultValue={q} key={q} aria-label="Buscar en catálogo" placeholder="Buscar por nombre…" /><button type="submit">Buscar</button></form>
      <label>Ordenar por <select value={sort} onChange={e => setSort(e.target.value)}><option value="nombre">Nombre</option><option value="menor">Precio: menor a mayor</option><option value="mayor">Precio: mayor a menor</option></select></label>
    </div>
    <div className="catalog-layout">
      <aside className="filters panel">
        <div className="section-heading"><h3>Filtros</h3><button className="text-link" onClick={() => { navigate('/catalogo'); setStockOnly(false); setMin(''); setMax('') }}>Limpiar</button></div>
        <fieldset><legend>Categoría</legend><label className="choice"><input type="radio" name="category" checked={!category} onChange={() => filter('categoria', '')} />Todas las categorías</label>{categories.map(cat => <label className="choice" key={cat}><input type="radio" name="category" checked={category === cat} onChange={() => filter('categoria', cat)} />{cat}</label>)}</fieldset>
        <fieldset><legend>Talla</legend><div className="size-options"><button className={!size ? 'selected' : ''} onClick={() => filter('talla', '')}>Todas</button>{sizes.map(s => <button key={s} className={size === s ? 'selected' : ''} onClick={() => filter('talla', s)}>{s}</button>)}</div></fieldset>
        <fieldset><legend>Precio (USD)</legend><div className="range-fields"><input aria-label="Precio mínimo" placeholder="Mínimo" type="number" min="0" value={min} onChange={e => setMin(e.target.value)} /><span>—</span><input aria-label="Precio máximo" placeholder="Máximo" type="number" min="0" value={max} onChange={e => setMax(e.target.value)} /></div></fieldset>
        <fieldset><legend>Disponibilidad</legend><label className="choice"><input type="checkbox" checked={stockOnly} onChange={e => setStockOnly(e.target.checked)} />Solo prendas en stock</label></fieldset>
        <p className="small muted">Filtros combinados y orden aplicados sobre los resultados recibidos.</p>
      </aside>
      <section aria-label="Prendas del catálogo"><Feedback {...result} retry={() => setRevision(revision + 1)} empty={!result.loading && !result.error && !list.length && 'No hay prendas para estos filtros'} /><div className="product-grid">{list.map(p => <ProductCard key={p.id} product={p} />)}</div></section>
    </div>
  </div>
}

export function ProductPage({ id }) {
  const [revision, setRevision] = useState(0)
  const result = useApi(`/api/productos/${id}`, null, revision)
  const related = useApi('/api/productos')
  const [quantity, setQuantity] = useState(1)
  const cart = useCart(), product = result.data
  if (!product) return <div className="container page"><Feedback {...result} retry={() => setRevision(revision + 1)} /></div>
  return <div className="container page"><div className="breadcrumbs"><Link href="/">Inicio</Link> / <Link href="/catalogo">Catálogo</Link> / {product.nombre}</div><section className="product-detail"><div className="detail-image"><ProductImage src={product.imagenUrl} alt={product.nombre} /><Badge>{product.categoria || 'Fashion World'}</Badge></div><div className="detail-copy"><span className="eyebrow">{product.categoria || 'Colección Fashion World'}</span><h1>{product.nombre}</h1><p className="detail-price">{money(product.precio)} <small>USD</small></p><p className={product.stock > 0 ? 'stock-status' : 'error-text'}>● {product.stock > 0 ? `En stock (${product.stock} unidades disponibles)` : 'Prenda agotada'}</p><div className="detail-options"><p>Color: <strong>{product.color || 'No especificado'}</strong></p><p>Talla disponible:</p><span className="size-chip">{product.talla || 'No especificada'}</span></div><div className="add-to-cart"><Quantity value={quantity} max={Math.max(1, product.stock)} onChange={setQuantity} /><button className="button" disabled={product.stock < quantity} onClick={() => cart.add(product, quantity)}><Icon name="bag" /> Añadir al carrito</button></div><details open><summary>Descripción y corte</summary><p>{product.descripcion || 'Esta prenda no tiene descripción adicional.'}</p></details><details><summary>Información de tu pedido</summary><p>El precio y el stock se validan al crear el pedido. Esta tienda registra pedidos, sin procesar pagos ni envíos.</p></details><p className="small muted">Una talla y un color por referencia. No se ofrecen variantes que no existan en el catálogo.</p></div></section><section className="section"><div className="section-heading"><div><span className="eyebrow">Sigue explorando</span><h2>Completa tu estilo</h2></div><Link href="/catalogo" className="text-link">Ver catálogo →</Link></div><div className="product-grid home-products">{related.data?.filter(p => String(p.id) !== String(id)).slice(0, 4).map(p => <ProductCard key={p.id} product={p} />)}</div></section></div>
}
