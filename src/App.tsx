import React, { useState } from 'react';
import { useAppStore, formatBHD } from './lib/store';
import { Product, PlantedElement, Order, OrderStatus, GarmentSide } from './types';
import { HomeView } from './components/HomeView';
import { ProductCatalogue } from './components/ProductCatalogue';
import { ProductDetail } from './components/ProductDetail';
import { PlacementEditor } from './components/PlacementEditor';
import { GraphicsLibrary } from './components/GraphicsLibrary';
import { CartView } from './components/CartView';
import { CheckoutView } from './components/CheckoutView';
import { OrderConfirmation } from './components/OrderConfirmation';
import { OrderTracker } from './components/OrderTracker';
import { AdminPortal } from './components/admin/AdminPortal';
import { GarmentSelectionModal } from './components/GarmentSelectionModal';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import {
  ShoppingBag,
  Sparkles,
  Compass,
  Search,
  Lock,
  LogIn,
  Home,
  Layers,
} from 'lucide-react';

export default function App() {
  const store = useAppStore();

  // Navigation screen
  const [currentScreen, setCurrentScreen] = useState<
    | 'home'
    | 'catalogue'
    | 'product-detail'
    | 'customize'
    | 'library'
    | 'cart'
    | 'checkout'
    | 'confirmation'
    | 'tracker'
    | 'admin'
  >('home');

  // Currently customized product & attributes
  const [activeProduct, setActiveProduct] = useState<Product>(store.products[0]);
  const [selectedColor, setSelectedColor] = useState<string>(activeProduct?.colors[0] || 'Navy');
  const [selectedSize, setSelectedSize] = useState<string>(activeProduct?.sizes[2] || 'M');

  // Placed print elements on the active custom garment (starts clean)
  const [placedElements, setPlacedElements] = useState<PlantedElement[]>([]);
  const [activeCustomizingSide, setActiveCustomizingSide] = useState<GarmentSide>('front');
  const [activeCustomizingZone, setActiveCustomizingZone] = useState<string>('Centre Chest');

  // Mandatory garment configuration modal
  const [isGarmentModalOpen, setIsGarmentModalOpen] = useState(false);

  // Last confirmed order
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);
  const [trackedOrderId, setTrackedOrderId] = useState<string>('');

  // Cart count
  const cartCount = store.cart.reduce((acc, it) => acc + it.qty, 0);

  // Navigation handlers
  const handleStartCustomizing = (prod?: Product, color?: string) => {
    setPlacedElements([]); // Always start with a completely blank design
    if (prod && color) {
      setActiveProduct(prod);
      setSelectedColor(color);
      setSelectedSize(prod.sizes[0] || 'M');
      setCurrentScreen('customize');
    } else {
      // User must explicitly pick type, age, and color via modal
      setIsGarmentModalOpen(true);
    }
  };

  const handleConfirmGarmentSelection = (product: Product, color: string, size: string) => {
    setActiveProduct(product);
    setSelectedColor(color);
    setSelectedSize(size);
    setPlacedElements([]); // Start with completely blank canvas
    setIsGarmentModalOpen(false);
    setCurrentScreen('customize');
  };

  const handleSelectProduct = (prod: Product) => {
    setActiveProduct(prod);
    setSelectedColor(prod.colors[0] || 'Black');
    setSelectedSize(prod.sizes[0] || 'M');
    setCurrentScreen('product-detail');
  };

  const handleApproveDesign = () => {
    // Add customized item to cart
    const placementsSummary = placedElements
      .map(
        (el) =>
          `${el.side.toUpperCase()}: ${el.zone} (${
            el.type === 'text' ? `"${el.textContent}"` : el.graphicName || 'Artwork'
          })`
      )
      .join(' · ');

    store.addToCart({
      productId: activeProduct.id,
      productName: activeProduct.name,
      productDesc: activeProduct.desc,
      imageType: activeProduct.imageType,
      color: selectedColor,
      size: selectedSize,
      basePrice: activeProduct.basePrice,
      printFee: store.config.printFee,
      unitPrice: activeProduct.basePrice + store.config.printFee,
      qty: 1,
      placements: [...placedElements],
      summary: placementsSummary,
    });

    // Reset design elements for the next garment so it starts completely blank!
    setPlacedElements([]);
    setCurrentScreen('cart');
  };

  const handlePlaceOrder = (orderData: {
    customerName: string;
    customerEmail?: string;
    customerPhone: string;
    customerAddress: string;
    paymentMethod: 'BenefitPay' | 'Benefit Transfer';
    notes?: string;
  }) => {
    const newOrder = store.createOrder({
      customerName: orderData.customerName,
      customerEmail: orderData.customerEmail,
      customerPhone: orderData.customerPhone,
      customerAddress: orderData.customerAddress,
      paymentMethod: orderData.paymentMethod,
      notes: orderData.notes,
    });

    setLastPlacedOrder(newOrder);
    setTrackedOrderId(newOrder.id);
    setCurrentScreen('confirmation');
  };

  return (
    <div className="min-h-screen bg-[#0a0c0f] text-neutral-100 flex flex-col font-sans selection:bg-[#39FF14] selection:text-black">
      {/* Network Offline Indicator */}
      <OfflineIndicator />

      {/* Top Brand Navigation Header */}
      <header className="sticky top-0 z-40 bg-[#0d0f14]/90 backdrop-blur-md border-b border-neutral-800/80">
        <div
          className={`mx-auto px-4 py-3 flex items-center justify-between gap-3 ${
            currentScreen === 'home' ? 'max-w-6xl' : 'max-w-4xl'
          }`}
        >
          {/* Logo & Brand Title */}
          <div
            onClick={() => setCurrentScreen('home')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-lg bg-black border border-[#39FF14]/50 p-1 flex items-center justify-center group-hover:border-[#39FF14] transition shadow-[0_0_10px_rgba(57,255,20,0.2)] overflow-hidden">
              <img
                src="/salapeed-logo.jpeg"
                alt="Salapeed"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-base font-heading font-black tracking-wider text-white uppercase group-hover:text-[#39FF14] transition">
                  SALAPEED
                </span>
                <span className="text-[9px] font-mono px-1 rounded bg-[#39FF14] text-black font-extrabold uppercase">
                  BH
                </span>
              </div>
              <span className="text-[10px] font-mono text-neutral-400 block tracking-tight">
                Custom Print Hoodies
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden sm:flex items-center gap-4 text-xs font-semibold">
            <button
              onClick={() => setCurrentScreen('catalogue')}
              className={`hover:text-[#39FF14] transition cursor-pointer ${
                currentScreen === 'catalogue' ? 'text-[#39FF14]' : 'text-neutral-300'
              }`}
            >
              Catalogue
            </button>
            <button
              onClick={() => handleStartCustomizing()}
              className={`hover:text-[#39FF14] transition cursor-pointer ${
                currentScreen === 'customize' ? 'text-[#39FF14]' : 'text-neutral-300'
              }`}
            >
              Design Studio
            </button>
            <button
              onClick={() => setCurrentScreen('tracker')}
              className={`hover:text-[#39FF14] transition cursor-pointer ${
                currentScreen === 'tracker' ? 'text-[#39FF14]' : 'text-neutral-300'
              }`}
            >
              Track Order
            </button>
          </nav>

          {/* Right Header CTAs: PWA Install + Cart + Login */}
          <div className="flex items-center gap-2">
            <PWAInstallButton compact />

            {/* Cart Icon Button */}
            <button
              onClick={() => setCurrentScreen('cart')}
              className="relative p-2 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-[#39FF14]/50 transition cursor-pointer text-white"
              title="View Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#39FF14] text-black font-mono font-bold text-[10px] flex items-center justify-center shadow-md animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Login Button (Right to Cart Icon) */}
            <button
              onClick={() => setCurrentScreen('admin')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                currentScreen === 'admin'
                  ? 'bg-[#39FF14]/15 border-[#39FF14] text-[#39FF14]'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700'
              }`}
              title="Login"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main
        className={`flex-1 w-full mx-auto px-4 pt-4 sm:pt-6 pb-20 sm:pb-8 ${
          currentScreen === 'home' ? 'max-w-6xl' : 'max-w-4xl'
        }`}
      >
        {/* 1. HOME SCREEN */}
        {currentScreen === 'home' && (
          <HomeView
            products={store.products}
            graphics={store.graphics}
            onStartCustomizing={handleStartCustomizing}
            onBrowseCatalogue={() => setCurrentScreen('catalogue')}
            onOpenTracker={() => setCurrentScreen('tracker')}
            onSelectProduct={handleSelectProduct}
            faqs={store.faqs}
            deliveryFee={store.config.deliveryFee}
          />
        )}

        {/* 2. CATALOGUE SCREEN */}
        {currentScreen === 'catalogue' && (
          <ProductCatalogue
            products={store.products}
            onSelectProduct={handleSelectProduct}
            onBack={() => setCurrentScreen('home')}
            onCustomizeDirect={(product, color) => {
              setActiveProduct(product);
              setSelectedColor(color);
              setSelectedSize(product.sizes[0] || 'M');
              setPlacedElements([]); // Start with clean canvas
              setCurrentScreen('customize');
            }}
          />
        )}

        {/* 3. PRODUCT DETAIL SCREEN */}
        {currentScreen === 'product-detail' && (
          <ProductDetail
            product={activeProduct}
            selectedColor={selectedColor}
            selectedSize={selectedSize}
            onSelectColor={setSelectedColor}
            onSelectSize={setSelectedSize}
            onContinueToDesign={() => setCurrentScreen('customize')}
            onBack={() => setCurrentScreen('catalogue')}
            printFee={store.config.printFee}
          />
        )}

        {/* 4. CUSTOMIZE & PLACEMENT ENGINE */}
        {currentScreen === 'customize' && (
          <PlacementEditor
            product={activeProduct}
            colorName={selectedColor}
            sizeName={selectedSize}
            elements={placedElements}
            allProducts={store.products}
            onSelectProduct={setActiveProduct}
            onSelectColor={setSelectedColor}
            onSelectSize={setSelectedSize}
            onUpdateElements={setPlacedElements}
            onOpenLibrary={(side, zone) => {
              if (side) setActiveCustomizingSide(side);
              if (zone) setActiveCustomizingZone(zone);
              setCurrentScreen('library');
            }}
            onOpenGarmentModal={() => setIsGarmentModalOpen(true)}
            onApproveDesign={handleApproveDesign}
            onBack={() => setCurrentScreen('product-detail')}
            printFee={store.config.printFee}
          />
        )}

        {/* 5. GRAPHICS LIBRARY MODAL SCREEN */}
        {currentScreen === 'library' && (
          <GraphicsLibrary
            graphics={store.graphics}
            categories={store.categories}
            onSelectGraphic={(g) => {
              const newElem: PlantedElement = {
                id: `elem-graphic-${Date.now()}`,
                side: activeCustomizingSide,
                zone: activeCustomizingZone,
                type: 'graphic',
                graphicId: g.id,
                graphicName: g.name,
                svgContent: g.svgContent,
                imageUrl: g.previewUrl,
                x: 50,
                y: 50,
                scale: 1.0,
                rotation: 0,
              };
              setPlacedElements([...placedElements, newElem]);
              setCurrentScreen('customize');
            }}
            onSelectUpload={(imageUrl, fileName, isLowRes) => {
              const newElem: PlantedElement = {
                id: `elem-upload-${Date.now()}`,
                side: activeCustomizingSide,
                zone: activeCustomizingZone,
                type: 'upload',
                imageUrl,
                graphicName: fileName,
                isLowRes,
                x: 50,
                y: 50,
                scale: 1.0,
                rotation: 0,
              };
              setPlacedElements([...placedElements, newElem]);
              setCurrentScreen('customize');
            }}
            onSelectText={() => {
              const newElem: PlantedElement = {
                id: `elem-text-${Date.now()}`,
                side: activeCustomizingSide,
                zone: activeCustomizingZone,
                type: 'text',
                textContent: 'SALAPEED',
                textFont: 'condensed',
                textColor: '#39FF14',
                textCurve: true,
                x: 50,
                y: 50,
                scale: 1.0,
                rotation: 0,
              };
              setPlacedElements([...placedElements, newElem]);
              setCurrentScreen('customize');
            }}
            onBack={() => setCurrentScreen('customize')}
          />
        )}

        {/* 6. CART SCREEN */}
        {currentScreen === 'cart' && (
          <CartView
            cart={store.cart}
            deliveryFee={store.config.deliveryFee}
            onUpdateQty={store.updateCartQty}
            onRemoveItem={store.removeFromCart}
            onProceedCheckout={() => setCurrentScreen('checkout')}
            onContinueShopping={() => setCurrentScreen('catalogue')}
          />
        )}

        {/* 7. CHECKOUT SCREEN */}
        {currentScreen === 'checkout' && (
          <CheckoutView
            cart={store.cart}
            deliveryFee={store.config.deliveryFee}
            config={store.config}
            onPlaceOrder={handlePlaceOrder}
            onBack={() => setCurrentScreen('cart')}
          />
        )}

        {/* 8. ORDER CONFIRMATION SCREEN */}
        {currentScreen === 'confirmation' && lastPlacedOrder && (
          <OrderConfirmation
            order={lastPlacedOrder}
            config={store.config}
            onTrackOrder={(id) => {
              setTrackedOrderId(id);
              setCurrentScreen('tracker');
            }}
            onGoHome={() => setCurrentScreen('home')}
          />
        )}

        {/* 9. ORDER TRACKER SCREEN */}
        {currentScreen === 'tracker' && (
          <OrderTracker
            initialOrderId={trackedOrderId}
            onFindOrder={store.getOrderById}
            config={store.config}
            onBack={() => setCurrentScreen('home')}
          />
        )}

        {/* 10. ADMIN PORTAL SCREEN */}
        {currentScreen === 'admin' && (
          <AdminPortal
            isAdmin={store.isAdmin}
            onLogin={store.loginAdmin}
            onLogout={store.logoutAdmin}
            orders={store.orders}
            products={store.products}
            graphics={store.graphics}
            categories={store.categories}
            config={store.config}
            faqs={store.faqs}
            onUpdateOrderStatus={store.updateOrderStatus}
            onUpdateConfig={store.updateConfig}
            onUpdateProduct={store.updateProduct}
            onAddGraphic={store.addGraphic}
            onBulkAddGraphics={store.bulkAddGraphics}
            onDeleteGraphic={store.deleteGraphic}
            onAddCategory={store.addCategory}
            onAddFaq={store.addFaq}
            onUpdateFaq={store.updateFaq}
            onDeleteFaq={store.deleteFaq}
            onExitAdmin={() => setCurrentScreen('home')}
          />
        )}
      </main>

      {/* Mobile Sticky Bottom Navigation Bar (Thumb Friendly) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0d0f14]/95 backdrop-blur-md border-t border-neutral-800/80 px-2 py-1.5 flex items-center justify-around">
        <button
          onClick={() => setCurrentScreen('home')}
          className={`flex flex-col items-center gap-1 p-1 text-[10px] font-semibold transition cursor-pointer ${
            currentScreen === 'home' ? 'text-[#39FF14]' : 'text-neutral-400'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </button>

        <button
          onClick={() => setCurrentScreen('catalogue')}
          className={`flex flex-col items-center gap-1 p-1 text-[10px] font-semibold transition cursor-pointer ${
            currentScreen === 'catalogue' ? 'text-[#39FF14]' : 'text-neutral-400'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Garments</span>
        </button>

        <button
          onClick={() => handleStartCustomizing()}
          className={`flex flex-col items-center gap-1 p-1 text-[10px] font-semibold transition cursor-pointer ${
            currentScreen === 'customize' ? 'text-[#39FF14]' : 'text-neutral-400'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Design</span>
        </button>

        <button
          onClick={() => setCurrentScreen('tracker')}
          className={`flex flex-col items-center gap-1 p-1 text-[10px] font-semibold transition cursor-pointer ${
            currentScreen === 'tracker' ? 'text-[#39FF14]' : 'text-neutral-400'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Track</span>
        </button>

        <button
          onClick={() => setCurrentScreen('cart')}
          className={`flex flex-col items-center gap-1 p-1 text-[10px] font-semibold transition cursor-pointer relative ${
            currentScreen === 'cart' ? 'text-[#39FF14]' : 'text-neutral-400'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Cart</span>
          {cartCount > 0 && (
            <span className="absolute top-0 right-1 w-4 h-4 rounded-full bg-[#39FF14] text-black font-mono font-bold text-[9px] flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
      </nav>

      {/* Footer */}
      <footer className="hidden sm:block border-t border-neutral-800/80 bg-[#08090b] text-neutral-500 text-xs py-6">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-heading font-black text-white">SALAPEED</span>
            <span>· Custom Print Hoodie App v1.0 (Bahrain)</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>Fulfillment: Workshop in Seef</span>
            <span>Currency: BHD</span>
            <button
              onClick={() => setCurrentScreen('admin')}
              className="text-neutral-400 hover:text-[#39FF14] cursor-pointer"
            >
              Login
            </button>
          </div>
        </div>
      </footer>

      {/* Mandatory Garment Selection Modal (Requires User Input for Type, Age & Color) */}
      <GarmentSelectionModal
        isOpen={isGarmentModalOpen}
        products={store.products}
        onClose={() => setIsGarmentModalOpen(false)}
        onConfirmSelection={handleConfirmGarmentSelection}
      />
    </div>
  );
}
