// pages/CartPage.jsx — Shopping cart and checkout

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import api from '../api/axios'
import { useCart, formatCurrency } from '../utils/helpers'
import toast from 'react-hot-toast'
import { ShoppingCart, Trash2, Plus, Minus, CheckCircle, Phone, MapPin } from 'lucide-react'

const CartPage = () => {
    const {
        cart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
    } = useCart()

    const navigate = useNavigate()
    const [notes, setNotes] = useState('')
    const [deliveryPhone, setDeliveryPhone] = useState('')
    const [deliveryLocation, setDeliveryLocation] = useState('')
    const [placing, setPlacing] = useState(false)

    const handlePlaceOrder = async () => {
        if (cart.length === 0) return

        if (!deliveryPhone.trim()) {
            toast.error('Please enter your phone number')
            return
        }
        if (!deliveryLocation.trim()) {
            toast.error('Please enter your delivery location')
            return
        }

        setPlacing(true)
        try {
            const orderData = {
                restaurant: cart[0].restaurant_id,
                notes,
                delivery_phone: deliveryPhone,
                delivery_location: deliveryLocation,
                items: cart.map((item) => ({
                    menu_item: item.id,
                    quantity: item.quantity,
                })),
            }

            await api.post('/orders/place/', orderData)
            
            setNotes('')
            setDeliveryPhone('')
            setDeliveryLocation('')
            
            // ✅ Clear the cart
            clearCart()
            
            // ✅ Also directly remove from localStorage as backup
            localStorage.removeItem('foodcourt_cart')
            
            toast.success('🎉 Order placed successfully!')
            
            // ✅ Navigate after a small delay to ensure state updates
            setTimeout(() => {
                navigate('/orders')
            }, 100)

        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to place order. Please try again.')
        } finally {
            setPlacing(false)
        }
    }

    return (
        <div className="min-h-screen bg-brand-white-soft">
            <Navbar cartCount={cartCount} />

            <div className="container-main py-8">
                <h1 className="text-2xl font-black text-brand-black mb-6 flex items-center gap-2">
                    <ShoppingCart size={24} />
                    Your Cart
                    {cartCount > 0 && (
                        <span className="badge-gray">{cartCount} item{cartCount !== 1 ? 's' : ''}</span>
                    )}
                </h1>

                {cart.length === 0 ? (
                    <div className="text-center py-24">
                        <img
                            src="/src/assets/empty-plate.png"
                            alt="Empty cart"
                            className="w-36 h-36 object-contain mx-auto mb-4 opacity-60"
                        />
                        <h2 className="text-xl font-bold text-brand-black">Your cart is empty</h2>
                        <p className="text-brand-gray mt-1">Browse restaurants and add some food!</p>
                        <button onClick={() => navigate('/')} className="btn-primary mt-6">
                            Browse Restaurants
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Cart items list */}
                        <div className="lg:col-span-2 space-y-3">

                            {/* Restaurant name banner */}
                            <div className="card p-4 bg-brand-black text-white">
                                <p className="text-sm font-medium opacity-75">Ordering from</p>
                                <p className="font-bold text-lg">{cart[0].restaurant_name}</p>
                            </div>

                            {/* Each cart item row */}
                            {cart.map((item) => (
                                <div key={item.id} className="card p-4 flex items-center gap-4">

                                    {/* Food image */}
                                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                                        {item.image_url ? (
                                            <img
                                                src={item.image_url}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-2xl">
                                                🍴
                                            </div>
                                        )}
                                    </div>

                                    {/* Item name and price */}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-brand-black truncate">{item.name}</p>
                                        <p className="text-brand-accent font-bold text-sm">
                                            {formatCurrency(item.price)} each
                                        </p>
                                    </div>

                                    {/* Quantity controls */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200
                                 flex items-center justify-center transition-colors">
                                            <Minus size={14} />
                                        </button>
                                        <span className="w-8 text-center font-bold text-brand-black">
                                            {item.quantity}
                                        </span>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            className="w-8 h-8 rounded-lg bg-brand-black text-white
                                 hover:bg-brand-black-light flex items-center justify-center transition-colors">
                                            <Plus size={14} />
                                        </button>
                                    </div>

                                    {/* Line subtotal */}
                                    <p className="font-bold text-brand-black w-24 text-right hidden sm:block">
                                        {formatCurrency(item.price * item.quantity)}
                                    </p>

                                    {/* Remove button */}
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="p-2 hover:bg-red-50 rounded-lg text-gray-400
                               hover:text-red-500 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Order summary panel */}
                        <div className="space-y-4">
                            <div className="card p-6 space-y-4">
                                <h2 className="font-bold text-brand-black text-lg">Order Summary</h2>

                                {/* Line items summary */}
                                <div className="space-y-2 text-sm">
                                    {cart.map((item) => (
                                        <div key={item.id} className="flex justify-between text-brand-gray">
                                            <span className="truncate pr-2">
                                                {item.name} × {item.quantity}
                                            </span>
                                            <span className="flex-shrink-0">
                                                {formatCurrency(item.price * item.quantity)}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Total */}
                                <div className="border-t pt-3 flex justify-between font-black text-brand-black text-lg">
                                    <span>Total</span>
                                    <span>{formatCurrency(cartTotal)}</span>
                                </div>

                                {/* Delivery details — required */}
                                <div className="border-t pt-4 space-y-3">
                                    <p className="text-xs font-semibold text-brand-gray uppercase tracking-wider">
                                        Delivery Details
                                    </p>

                                    <div>
                                        <label className="flex items-center gap-1.5 text-sm font-semibold text-brand-black mb-1.5">
                                            <Phone size={14} /> Phone Number *
                                        </label>
                                        <input
                                            type="tel"
                                            value={deliveryPhone}
                                            onChange={(e) => setDeliveryPhone(e.target.value)}
                                            placeholder="+254 700 000 000"
                                            required
                                            className="input-field text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="flex items-center gap-1.5 text-sm font-semibold text-brand-black mb-1.5">
                                            <MapPin size={14} /> Delivery Location *
                                        </label>
                                        <input
                                            type="text"
                                            value={deliveryLocation}
                                            onChange={(e) => setDeliveryLocation(e.target.value)}
                                            placeholder="e.g. Hostel B, Room 12"
                                            required
                                            className="input-field text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Special instructions — optional */}
                                <div>
                                    <label className="block text-sm font-semibold text-brand-black mb-1.5">
                                        Special Instructions (optional)
                                    </label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Any special requests for the restaurant..."
                                        rows={3}
                                        className="input-field resize-none text-sm"
                                    />
                                </div>

                                {/* Place order button */}
                                <button
                                    onClick={() => {
                                        handlePlaceOrder()
                                        

                                    }
                                        
                                    }
                                    disabled={placing}
                                    className="btn-primary w-full flex items-center justify-center gap-2 py-3">
                                    {placing ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <><CheckCircle size={18} /> Place Order</>
                                    )}
                                </button>

                                {/* Clear cart link */}
                                <button
                                    onClick={clearCart}
                                    className="w-full text-sm text-gray-400 hover:text-red-500 transition-colors py-1">
                                    Clear cart
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default CartPage