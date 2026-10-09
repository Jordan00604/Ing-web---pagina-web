import { Link, ProductImage, Badge, Icon } from './UI'
import { money } from '../services/format'
import { useCart } from '../context/contexts'
export function ProductCard({ product }) {
  const cart = useCart()
  return <article className="product-card"><div className="product-visual"><Link href={`/productos/${product.id}`}><ProductImage src={product.imagenUrl} alt={product.nombre} /></Link><Badge>{product.stock > 0 ? `${product.stock} disponibles` : 'Agotado'}</Badge><button className="quick-add" disabled={product.stock <= 0} onClick={() => cart.add(product)}><Icon name="bag" size={16} /> Añadir a la bolsa</button></div><p className="eyebrow">{product.categoria || 'Colección'}</p><Link href={`/productos/${product.id}`} className="product-name">{product.nombre}</Link><p className="product-price">{money(product.precio)} <small>USD</small></p></article>
}
