import { memo } from 'react'
import { X, Package, Minus, Plus, Trash2, ShoppingBag, MessageCircle, Truck, ShieldCheck } from 'lucide-react'
import { getButtonClasses, getContrastText } from './themeUtils'

/**
 * CartDrawer - Premium cart drawer/bottom-sheet component
 * Features: Responsive (drawer on desktop, bottom-sheet on mobile), safe-area support,
 * premium item cards, WhatsApp checkout
 */
const CartDrawer = memo(function CartDrawer({
  cart,
  store,
  theme,
  primaryColor,
  formatPrice,
  cartTotal,
  updateQuantity,
  removeFromCart,
  onClose,
  onCheckout,
  isPreview = false,
}) {
  const buttonClasses = getButtonClasses(theme?.buttonsStyle)
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer - Bottom sheet on mobile, side drawer on desktop */}
      <div 
        className="absolute inset-x-0 bottom-0 sm:inset-y-0 sm:left-auto sm:right-0 
                   w-full sm:w-full sm:max-w-md 
                   max-h-[92vh] sm:max-h-none 
                   bg-white shadow-2xl flex flex-col
                   rounded-t-[28px] sm:rounded-none
                   animate-slide-up sm:animate-slide-left"
      >
        {/* Drag handle - Mobile only */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Tu carrito</h2>
            {itemCount > 0 && (
              <p className="text-sm text-gray-500">
                {itemCount} {itemCount === 1 ? 'producto' : 'productos'}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
            aria-label="Cerrar carrito"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-8">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Tu carrito está vacío</h3>
              <p className="text-gray-500 text-sm max-w-xs">
                Explora nuestros productos y agrega tus favoritos al carrito
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map(item => (
                <CartItem
                  key={item.cartItemId}
                  item={item}
                  primaryColor={primaryColor}
                  formatPrice={formatPrice}
                  onUpdateQuantity={(delta) => updateQuantity(item.cartItemId, delta)}
                  onRemove={() => removeFromCart(item.cartItemId)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer - Only show when cart has items */}
        {cart.length > 0 && (
          <div className="border-t border-gray-100 bg-gray-50/50 shrink-0">
            {/* Summary */}
            <div className="px-4 sm:px-5 py-4 space-y-2">
              {/* Subtotal */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium text-gray-700">{formatPrice(cartTotal)}</span>
              </div>
              
              {/* Total */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <span className="font-semibold text-gray-900">Total</span>
                <span 
                  className="text-2xl font-bold"
                  style={{ color: primaryColor }}
                >
                  {formatPrice(cartTotal)}
                </span>
              </div>
            </div>

            {/* Checkout button */}
            <div className="px-4 sm:px-5 pb-4 space-y-3">
              <button
                onClick={onCheckout}
                disabled={isPreview}
                className={`
                  w-full py-4 flex items-center justify-center gap-3 font-semibold text-white
                  transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.98]
                  ${buttonClasses}
                  ${isPreview ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                style={{ backgroundColor: '#25D366' }}
              >
                <MessageCircle className="w-5 h-5" />
                <span>Finalizar por WhatsApp</span>
              </button>
              
              {/* Info text */}
              <p className="text-xs text-center text-gray-500">
                Coordina el pago y entrega directamente con la tienda
              </p>
            </div>

            {/* Trust badges */}
            <div className="px-4 sm:px-5 pb-4">
              <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Compra segura
                </span>
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5" />
                  Envío coordinado
                </span>
              </div>
            </div>

            {/* Safe area padding for iOS */}
            <div className="h-[env(safe-area-inset-bottom)]" />
          </div>
        )}
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes slide-left {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        .animate-slide-left {
          animation: slide-left 0.3s ease-out;
        }
      `}</style>
    </div>
  )
})

/**
 * CartItem - Individual cart item component
 */
const CartItem = memo(function CartItem({
  item,
  primaryColor,
  formatPrice,
  onUpdateQuantity,
  onRemove,
}) {
  return (
    <div className="flex gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
        {item.main_image_url ? (
          <img 
            src={item.main_image_url} 
            alt={item.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-8 h-8 text-gray-300" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Product name */}
        <h4 className="font-medium text-gray-900 text-sm line-clamp-2">{item.name}</h4>
        
        {/* Variant */}
        {item.variant_title && (
          <p className="text-xs text-gray-500 mt-0.5 truncate">
            {item.variant_title}
          </p>
        )}
        
        {/* Price */}
        <p 
          className="text-sm font-bold mt-1"
          style={{ color: primaryColor }}
        >
          {formatPrice(item.price)}
        </p>
        
        {/* Quantity controls & subtotal */}
        <div className="flex items-center justify-between mt-auto pt-2">
          {/* Quantity stepper */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onUpdateQuantity(-1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 active:scale-95 transition-all"
              aria-label="Reducir cantidad"
            >
              <Minus className="w-4 h-4 text-gray-600" />
            </button>
            <span className="w-10 text-center font-semibold text-sm text-gray-900">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 active:scale-95 transition-all"
              aria-label="Aumentar cantidad"
            >
              <Plus className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Subtotal */}
          <span className="text-sm font-bold text-gray-900">
            {formatPrice(item.price * item.quantity)}
          </span>
        </div>
      </div>

      {/* Remove button */}
      <button
        onClick={onRemove}
        className="self-start p-2 -mr-1 -mt-1 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
        aria-label="Eliminar producto"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
})

export default CartDrawer
