import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useProductApi } from '../hooks/useProductApi';
import { useCategoryApi } from '../hooks/useCategoryApi';
import { 
  ShoppingCart, Store, Package, Star, ChevronRight, Tag, Zap, 
  Sparkles, ArrowRight, Heart, TrendingUp, Clock, Flame 
} from 'lucide-react';

// ============================================================================
// Constants
// ============================================================================

const COLORS = {
  white: '#FFFFFF',
  cream: '#FAF7F2',
  beige: '#F0EBE1',
  green: '#2D6A4F',
  greenLight: '#52B788',
  greenPale: '#D8F3DC',
  greenDark: '#1B4332',
  olive: '#74A57F',
  gold: '#E9C46A',
  text: '#1C1C1C',
  muted: '#6B7280',
  border: '#E5E0D8',
  sale: '#E63946',
  orange: '#F97316',
};

const CATEGORIES = [
  'All',
  'Stationery',
  'Food & Drinks',
  'Printing Services',
  'Electronics',
  'Dorm Supplies',
  'Books',
];

// ============================================================================
// Utility Functions
// ============================================================================

const getImageUrl = (image) => {
  if (!image) return null;

  const path = typeof image === 'string'
    ? image
    : image?.url || image?.path || '';

  if (!path) return null;
  if (path.startsWith('http')) return path;
  if (path.startsWith('/')) return `http://localhost:5000${path}`;
  return `http://localhost:5000/uploads/${path}`;
};

const formatPrice = (price) => {
  if (price === undefined || price === null || Number.isNaN(Number(price))) return '$0';
  return `$${Number(price).toFixed(2)}`;
};

// Helper to check if product is in stock
const isInStock = (product) => {
  const stock = product.inventory?.totalStock ?? product.inventory?.stock ?? product.stock ?? 1;
  return stock > 0;
};

// ============================================================================
// Countdown Timer Component
// ============================================================================

const CountdownTimer = ({ validUntil, variant = 'deal' }) => {
  const [timeLeft, setTimeLeft] = useState(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!validUntil) return;

    const calculateTimeLeft = () => {
      const now = new Date();
      const end = new Date(validUntil);
      const diffMs = end - now;

      if (diffMs <= 0) {
        setIsExpired(true);
        return null;
      }

      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs % (86400000)) / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (3600000)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (60000)) / 1000);

      return { days, hours, minutes, seconds };
    };

    const updateTimer = () => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [validUntil]);

  if (isExpired || !timeLeft) {
    return null;
  }

  // Weekly Deal Banner Style
  if (variant === 'weekly') {
    return (
      <div style={{
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(8px)',
        borderRadius: 12,
        padding: '10px 20px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 16,
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.gold }}>
          ⭐ WEEKLY FEATURE
        </span>
        <div style={{ display: 'flex', gap: 12 }}>
          {timeLeft.days > 0 && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.white }}>{timeLeft.days}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>DAYS</div>
            </div>
          )}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.white }}>{timeLeft.hours}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>HRS</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.white }}>{timeLeft.minutes}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>MINS</div>
          </div>
        </div>
      </div>
    );
  }

  // Deal of the Day Card Style
  return (
    <div style={{
      background: 'rgba(0,0,0,0.75)',
      borderRadius: 6,
      padding: '4px 10px',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
    }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: COLORS.gold }}>🔥</span>
      <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.white }}>
        {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
      </span>
    </div>
  );
};

// ============================================================================
// Discount Logic
// ============================================================================

const hasActiveDiscount = (product) => {
  // Check if out of stock FIRST
  if (!isInStock(product)) return false;
  
  if (!product.discount) return false;
  if (!product.discount.percentage || product.discount.percentage <= 0) return false;
  
  if (product.discount.validUntil) {
    const validUntil = new Date(product.discount.validUntil);
    const now = new Date();
    if (validUntil < now) return false;
  }
  
  return true;
};

const getDiscountPercent = (product) => {
  if (!hasActiveDiscount(product)) return 0;
  return product.discount.percentage || 0;
};

// ============================================================================
// Deals, Trending, Weekly Deal, New Arrivals Logic
// ============================================================================

const getDealsOfTheDay = (products, maxCount = 4) => {
  if (!products.length) return [];
  
  // Filter out out-of-stock products FIRST
  const inStockProducts = products.filter(p => isInStock(p));
  
  const discounted = inStockProducts.filter(p => hasActiveDiscount(p));
  const sortedDiscounted = [...discounted].sort((a, b) => {
    return getDiscountPercent(b) - getDiscountPercent(a);
  });
  
  if (sortedDiscounted.length >= maxCount) {
    return sortedDiscounted.slice(0, maxCount);
  }
  
  const nonDiscounted = inStockProducts.filter(p => !hasActiveDiscount(p));
  const remainingNeeded = maxCount - sortedDiscounted.length;
  const sortedByRating = [...nonDiscounted].sort((a, b) => {
    return (b.averageRating || 0) - (a.averageRating || 0);
  });
  
  return [...sortedDiscounted, ...sortedByRating.slice(0, remainingNeeded)];
};

const getTrendingProducts = (products, excludeProductIds = [], maxCount = 4) => {
  if (!products.length) return [];
  
  // Filter out out-of-stock products and excluded products
  let availableProducts = products.filter(p => {
    return isInStock(p) && !excludeProductIds.includes(p._id);
  });
  
  // First try: Products with purchases > 0
  let productsWithSales = availableProducts.filter(p => (p.purchases || 0) > 0);
  
  if (productsWithSales.length >= maxCount) {
    return productsWithSales
      .sort((a, b) => (b.purchases || 0) - (a.purchases || 0))
      .slice(0, maxCount);
  }
  
  // Second try: If not enough products with sales, add highest rated products
  if (productsWithSales.length > 0 && productsWithSales.length < maxCount) {
    const productsWithoutSales = availableProducts.filter(p => (p.purchases || 0) === 0);
    
    const sortedByRating = [...productsWithoutSales].sort((a, b) => 
      (b.averageRating || 0) - (a.averageRating || 0)
    );
    
    const remainingNeeded = maxCount - productsWithSales.length;
    const ratingFillers = sortedByRating.slice(0, remainingNeeded);
    const combined = [...productsWithSales, ...ratingFillers];
    
    return combined.sort((a, b) => {
      const aHasSales = (a.purchases || 0) > 0;
      const bHasSales = (b.purchases || 0) > 0;
      
      if (aHasSales && !bHasSales) return -1;
      if (!aHasSales && bHasSales) return 1;
      if (aHasSales && bHasSales) {
        return (b.purchases || 0) - (a.purchases || 0);
      }
      return (b.averageRating || 0) - (a.averageRating || 0);
    });
  }
  
  // Third: No products with sales at all - show highest rated products
  const sortedByRating = [...availableProducts].sort((a, b) => 
    (b.averageRating || 0) - (a.averageRating || 0)
  );
  
  return sortedByRating.slice(0, maxCount);
};

const getWeeklyDeal = (products) => {
  if (!products.length) return null;
  
  // Filter out out-of-stock products
  const inStockProducts = products.filter(p => isInStock(p));
  
  if (!inStockProducts.length) return null;
  
  const highQualityDeals = inStockProducts.filter(p => {
    return hasActiveDiscount(p) && (p.averageRating || 0) >= 4;
  });
  
  if (highQualityDeals.length) {
    return highQualityDeals.sort((a, b) => {
      const ratingDiff = (b.averageRating || 0) - (a.averageRating || 0);
      if (ratingDiff !== 0) return ratingDiff;
      return getDiscountPercent(b) - getDiscountPercent(a);
    })[0];
  }
  
  const anyDeal = inStockProducts.filter(p => hasActiveDiscount(p));
  if (anyDeal.length) {
    return anyDeal.sort((a, b) => getDiscountPercent(b) - getDiscountPercent(a))[0];
  }
  
  return [...inStockProducts].sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))[0];
};

const getNewArrivals = (products, excludeProductIds = [], maxCount = 8) => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const newProducts = products.filter(product => {
    // Check stock first
    if (!isInStock(product)) return false;
    
    if (!product.createdAt) return false;
    
    const createdDate = new Date(product.createdAt);
    if (isNaN(createdDate.getTime())) return false;
    
    if (createdDate < sevenDaysAgo) return false;
    if (excludeProductIds.includes(product._id)) return false;
    if (hasActiveDiscount(product)) return false;
    
    return true;
  });
  
  return [...newProducts]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, maxCount);
};

// ============================================================================
// Subcomponents
// ============================================================================

const Badge = ({ children, color = COLORS.green }) => (
  <span style={{
    background: color,
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 1,
    padding: '3px 8px',
    borderRadius: 4,
    textTransform: 'uppercase',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  }}>
    {children}
  </span>
);

const StarRating = ({ rating }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
    <div style={{ color: COLORS.gold, fontSize: 12, display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star}>
          {star <= Math.round(rating) ? '★' : '☆'}
        </span>
      ))}
    </div>
    <span style={{ color: COLORS.muted, fontSize: 11, fontWeight: 500 }}>
      {rating.toFixed(1)}
    </span>
  </div>
);

const SkeletonCard = () => (
  <div style={{
    background: COLORS.white,
    borderRadius: 14,
    overflow: 'hidden',
    border: `1px solid ${COLORS.border}`,
  }}>
    <div style={{
      aspectRatio: '1',
      background: `linear-gradient(90deg, ${COLORS.beige} 25%, ${COLORS.cream} 50%, ${COLORS.beige} 75%)`,
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
    }} />
    <div style={{ padding: 14 }}>
      <div style={{ height: 14, background: COLORS.beige, borderRadius: 6, marginBottom: 8 }} />
      <div style={{ height: 12, background: COLORS.beige, borderRadius: 6, width: '60%' }} />
      <div style={{ marginTop: 10, height: 16, background: COLORS.beige, borderRadius: 6, width: '40%' }} />
    </div>
  </div>
);

// ============================================================================
// Regular Product Card (for Deals and New Arrivals)
// ============================================================================

const ProductCard = ({ product, badge, badgeColor = COLORS.green }) => {
  const [imgError, setImgError] = useState(false);
  const imageUrl = !imgError ? getImageUrl(product.images?.[0]) : null;
  const displayPrice = product.basePrice ?? product.price ?? 0;

  return (
    <Link 
      to={`/products/${product._id}`} 
      style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
    >
      <div
        style={{
          background: COLORS.white,
          borderRadius: 16,
          overflow: 'hidden',
          border: `1px solid ${COLORS.border}`,
          transition: 'all 0.25s cubic-bezier(0.2, 0, 0, 1)',
          cursor: 'pointer',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-6px)';
          e.currentTarget.style.boxShadow = '0 16px 32px rgba(0,0,0,0.12)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <div style={{ position: 'relative', aspectRatio: '1', background: COLORS.beige }}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={() => setImgError(true)}
              loading="lazy"
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: COLORS.cream,
            }}>
              <Package size={40} color={COLORS.olive} />
            </div>
          )}
          
          {/* Badge and Countdown Timer */}
          <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {badge && <Badge color={badgeColor}>{badge}</Badge>}
            {hasActiveDiscount(product) && product.discount?.validUntil && (
              <CountdownTimer validUntil={product.discount.validUntil} variant="deal" />
            )}
          </div>
          
          <button 
            style={{
              position: 'absolute',
              bottom: 10,
              right: 10,
              background: COLORS.white,
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s',
            }}
            onClick={(e) => {
              e.preventDefault();
              console.log('Add to wishlist:', product._id);
            }}
          >
            <Heart size={16} color={COLORS.muted} />
          </button>
        </div>
        
        <div style={{ padding: '12px 14px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{
            margin: 0,
            fontWeight: 600,
            fontSize: 14,
            color: COLORS.text,
            lineHeight: 1.4,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            minHeight: 38,
          }}>
            {product.name}
          </h3>
          
          {product.averageRating > 0 && (
            <div style={{ marginTop: 6 }}>
              <StarRating rating={product.averageRating} />
            </div>
          )}
          
          <div style={{ 
            marginTop: 'auto', 
            paddingTop: 10,
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 4,
          }}>
            <span style={{ fontWeight: 700, fontSize: 16, color: COLORS.greenDark }}>
              {formatPrice(displayPrice)}
            </span>
            {hasActiveDiscount(product) && (
              <span style={{ fontSize: 12, color: COLORS.green, fontWeight: 600 }}>
                {getDiscountPercent(product)}% OFF
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

// ============================================================================
// Compact Product Card for Trending Now (Shorter height)
// ============================================================================

const CompactProductCard = ({ product, badge, badgeColor = COLORS.orange }) => {
  const [imgError, setImgError] = useState(false);
  const imageUrl = !imgError ? getImageUrl(product.images?.[0]) : null;
  const displayPrice = product.basePrice ?? product.price ?? 0;

  return (
    <Link 
      to={`/products/${product._id}`} 
      style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
    >
      <div
        style={{
          background: COLORS.white,
          borderRadius: 12,
          overflow: 'hidden',
          border: `1px solid ${COLORS.border}`,
          transition: 'all 0.25s cubic-bezier(0.2, 0, 0, 1)',
          cursor: 'pointer',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <div style={{ position: 'relative', aspectRatio: '1', background: COLORS.beige }}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={() => setImgError(true)}
              loading="lazy"
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: COLORS.cream,
            }}>
              <Package size={30} color={COLORS.olive} />
            </div>
          )}
          
          {/* Badge only - no countdown timer on compact cards */}
          <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 1 }}>
            {badge && <Badge color={badgeColor}>{badge}</Badge>}
          </div>
          
          <button 
            style={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              background: COLORS.white,
              border: 'none',
              borderRadius: '50%',
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            }}
            onClick={(e) => {
              e.preventDefault();
              console.log('Add to wishlist:', product._id);
            }}
          >
            <Heart size={14} color={COLORS.muted} />
          </button>
        </div>
        
        {/* COMPACT CONTENT - Less padding, smaller text */}
        <div style={{ padding: '8px 10px 10px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{
            margin: 0,
            fontWeight: 600,
            fontSize: 13,
            color: COLORS.text,
            lineHeight: 1.3,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            minHeight: 34,
          }}>
            {product.name}
          </h3>
          
          {/* Smaller rating section */}
          {product.averageRating > 0 && (
            <div style={{ marginTop: 4 }}>
              <StarRating rating={product.averageRating} />
            </div>
          )}
          
          <div style={{ 
            marginTop: 'auto', 
            paddingTop: 6,
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 4,
          }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: COLORS.greenDark }}>
              {formatPrice(displayPrice)}
            </span>
            {hasActiveDiscount(product) && (
              <span style={{ fontSize: 10, color: COLORS.green, fontWeight: 600 }}>
                {getDiscountPercent(product)}% OFF
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

// ============================================================================
// Main Component
// ============================================================================

const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const { theme, colors, isDark } = useTheme();
  const { getProducts } = useProductApi();
  const { getCategories } = useCategoryApi();
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState('All');
  const [categories, setCategories] = useState(CATEGORIES);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'All') return allProducts;
    return allProducts.filter(product => {
      if (!Array.isArray(product.categories)) return false;
      return product.categories.some(category => {
        const categoryName = typeof category === 'string'
          ? category
          : category?.name || category?.category || '';
        return categoryName === activeCategory;
      });
    });
  }, [allProducts, activeCategory]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const result = await getCategories();
        if (result.success && result.data) {
          const rawCategories = Array.isArray(result.data)
            ? result.data
            : result.data.data || [];
          const categoryNames = rawCategories
            .map(cat => (typeof cat === 'string' ? cat : cat?.name || cat?.category))
            .filter(Boolean);
          setCategories(['All', ...categoryNames]);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };

    loadCategories();
  }, [getCategories]);

  // Load products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await getProducts();
        
        if (result.success && result.data) {
          const raw = result.data;
          const list = Array.isArray(raw)
            ? raw
            : raw.products || raw.items || raw.data || [];
          setAllProducts(list);
        } else {
          setError('Unable to load products. Please try again later.');
        }
      } catch (err) {
        console.error('Failed to load products:', err);
        setError('Network error. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [getProducts]);

  // Deals, Trending, Weekly Deal, New Arrivals
  const dealsOfDay = useMemo(() => 
    getDealsOfTheDay(filteredProducts, 4),
    [filteredProducts]
  );

  const dealIds = useMemo(() => 
    dealsOfDay.map(p => p._id),
    [dealsOfDay]
  );

  const trendingProducts = useMemo(() => 
    getTrendingProducts(filteredProducts, dealIds, 4),
    [filteredProducts, dealIds]
  );

  const weeklyDeal = useMemo(() => 
    getWeeklyDeal(filteredProducts),
    [filteredProducts]
  );

  const excludeFromNewArrivals = useMemo(() => 
    [...dealIds, weeklyDeal?._id].filter(Boolean),
    [dealIds, weeklyDeal]
  );

  const newArrivals = useMemo(() => 
    getNewArrivals(filteredProducts, excludeFromNewArrivals, 8),
    [filteredProducts, excludeFromNewArrivals]
  );

  // Handlers
  const handleShopNow = useCallback(() => navigate('/products'), [navigate]);
  const handleBecomeVendor = useCallback(() => navigate('/vendor/apply'), [navigate]);
  const handleSignUp = useCallback(() => navigate('/register'), [navigate]);

  const renderProductGrid = (products, badge, badgeColor = COLORS.green) => (
    <div style={styles.productGrid}>
      {products.map(product => {
        if (!isInStock(product)) return null;
        return <ProductCard key={product._id} product={product} badge={badge} badgeColor={badgeColor} />;
      }).filter(Boolean)}
    </div>
  );

  return (
    <div style={styles.container}>
      {/* Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700;800&display=swap"
        rel="stylesheet"
      />

      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroDecoration1} />
        <div style={styles.heroDecoration2} />
        
        <div style={styles.heroContent}>
          <span style={styles.heroBadge}>Campus Marketplace</span>
          <h1 style={styles.heroTitle}>
            Everything Campus,<br />
            <span style={{ color: COLORS.gold }}>All in One Place</span>
          </h1>
          <p style={styles.heroSubtitle}>
            Shop from verified campus vendors — fast delivery, student prices.
          </p>

          <div style={styles.heroButtons}>
            <button onClick={handleShopNow} style={styles.btnPrimary}>
              <ShoppingCart size={16} /> Shop Now
            </button>

            {isAuthenticated && user?.role !== 'vendor' && (
              <button onClick={handleBecomeVendor} style={styles.btnSecondary}>
                <Store size={16} /> Become a Vendor
              </button>
            )}

            {isAuthenticated && user?.role === 'vendor' && (
              <Link to="/vendor/dashboard" style={styles.btnSecondaryLink}>
                <Store size={16} /> Vendor Dashboard
              </Link>
            )}

            {!isAuthenticated && (
              <button onClick={handleSignUp} style={styles.btnSecondary}>
                Sign Up Free
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Category Navigation */}
      <nav style={styles.categoryNav}>
        <div style={styles.categoryContainer}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                ...styles.categoryButton,
                color: activeCategory === cat ? COLORS.green : COLORS.muted,
                borderBottomColor: activeCategory === cat ? COLORS.green : 'transparent',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </nav>

      <main style={styles.mainContent}>
        {/* Error State */}
        {error && (
          <div style={styles.errorContainer}>
            <p style={styles.errorText}>{error}</p>
            <button onClick={() => window.location.reload()} style={styles.retryButton}>
              Try Again
            </button>
          </div>
        )}

        {/* Deals of the Day - Regular cards */}
        {dealsOfDay.length > 0 && (
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <div>
                <span style={styles.sectionBadge}>
                  <Clock size={12} /> Limited Time
                </span>
                <h2 style={styles.sectionTitle}>
                  Deals <span style={{ color: COLORS.green }}>of the Day</span>
                </h2>
              </div>
              <Link to="/products" style={styles.seeAllLink}>
                See All <ChevronRight size={15} />
              </Link>
            </div>

            {loading ? (
              <div style={styles.productGrid}>
                {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : (
              renderProductGrid(dealsOfDay, 'SALE', COLORS.sale)
            )}
          </section>
        )}

        {/* Trending Now - COMPACT cards (shorter height) */}
        {trendingProducts.length > 0 && (
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <div>
                <span style={styles.sectionBadge}>
                  <Flame size={12} /> Best Sellers
                </span>
                <h2 style={styles.sectionTitle}>
                  Trending <span style={{ color: COLORS.orange }}>Now</span>
                </h2>
              </div>
              <Link to="/products" style={styles.seeAllLink}>
                See All <ChevronRight size={15} />
              </Link>
            </div>

            {loading ? (
              <div style={styles.productGrid}>
                {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : (
              <div style={styles.productGrid}>
                {trendingProducts.map(product => (
                  <CompactProductCard key={product._id} product={product} badge="BEST SELLER" badgeColor={COLORS.orange} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Weekly Deals Banner */}
        {weeklyDeal && isInStock(weeklyDeal) && (
          <section style={styles.bannerSection}>
            <div style={styles.banner}>
              <div style={styles.bannerDecoration1} />
              <div style={styles.bannerDecoration2} />
              
              <div style={styles.bannerContent}>
                <div style={styles.bannerTag}>
                  <Zap size={14} fill={COLORS.gold} /> 
                  <span>Weekly Deals</span>
                </div>
                <h3 style={styles.bannerTitle}>
                  Amazing Savings:<br />
                  <span style={{ color: COLORS.gold }}>{weeklyDeal.name}</span>
                </h3>
                <p style={styles.bannerSubtitle}>
                  {getDiscountPercent(weeklyDeal)}% OFF - Limited time offer
                </p>
                
                {weeklyDeal.discount?.validUntil && (
                  <div style={{ marginTop: 20 }}>
                    <CountdownTimer validUntil={weeklyDeal.discount.validUntil} variant="weekly" />
                  </div>
                )}
              </div>

              <div style={styles.bannerButtons}>
                <Link
                  to={`/products/${weeklyDeal._id}`}
                  style={styles.bannerBtnPrimary}
                >
                  <Tag size={15} /> Shop Deal
                </Link>
                <Link to="/products" style={styles.bannerBtnSecondary}>
                  View All <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* New Arrivals - Regular cards */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <div>
              <span style={styles.sectionBadge}>
                <TrendingUp size={12} /> Just Listed
              </span>
              <h2 style={styles.sectionTitle}>
                New Arrival <span style={{ color: COLORS.green }}>Products</span>
              </h2>
            </div>
            <Link to="/products" style={styles.seeAllLink}>
              See All <ChevronRight size={15} />
            </Link>
          </div>

          {loading ? (
            <div style={styles.productGrid}>
              {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : newArrivals.length > 0 ? (
            renderProductGrid(newArrivals, 'NEW')
          ) : (
            <div style={styles.emptyState}>
              <Sparkles size={36} style={{ marginBottom: 12, opacity: 0.4 }} />
              <p>No new products yet. Check back soon!</p>
              {isAuthenticated && user?.role !== 'vendor' && (
                <button onClick={handleBecomeVendor} style={styles.emptyStateButton}>
                  Apply as Vendor
                </button>
              )}
            </div>
          )}
        </section>
      </main>

      {/* Footer CTA */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <span style={styles.footerBadge}>Ready?</span>
          <h2 style={styles.footerTitle}>Join CampusCart Today</h2>
          <p style={styles.footerText}>
            Thousands of students already shopping smarter on campus.
          </p>
          <div style={styles.footerButtons}>
            <button onClick={handleShopNow} style={styles.footerBtnPrimary}>
              <ShoppingCart size={16} /> Start Shopping
            </button>
            {!isAuthenticated && (
              <button onClick={handleSignUp} style={styles.footerBtnSecondary}>
                Sign Up Free
              </button>
            )}
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        ::-webkit-scrollbar {
          display: none;
        }
        * {
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = {
  container: {
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    background: COLORS.cream,
    minHeight: '100vh',
    color: COLORS.text,
  },
  hero: {
    background: `linear-gradient(135deg, ${COLORS.greenDark} 0%, ${COLORS.green} 60%, ${COLORS.greenLight} 100%)`,
    padding: '56px 24px 48px',
    position: 'relative',
    overflow: 'hidden',
  },
  heroDecoration1: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 260,
    height: 260,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.05)',
  },
  heroDecoration2: {
    position: 'absolute',
    bottom: -40,
    left: -40,
    width: 180,
    height: 180,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.05)',
  },
  heroContent: {
    position: 'relative',
    textAlign: 'center',
    maxWidth: 800,
    margin: '0 auto',
  },
  heroBadge: {
    color: COLORS.greenPale,
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 3,
    textTransform: 'uppercase',
    display: 'inline-block',
    marginBottom: 12,
  },
  heroTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 'clamp(32px, 6vw, 64px)',
    color: COLORS.white,
    margin: '0 0 16px',
    lineHeight: 1.15,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 16,
    maxWidth: 480,
    margin: '0 auto 32px',
  },
  heroButtons: {
    display: 'flex',
    gap: 12,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  btnPrimary: {
    background: COLORS.white,
    color: COLORS.greenDark,
    padding: '13px 28px',
    borderRadius: 50,
    fontWeight: 700,
    fontSize: 14,
    border: 'none',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    fontFamily: 'inherit',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  btnSecondary: {
    background: 'transparent',
    color: COLORS.white,
    border: `2px solid rgba(255,255,255,0.6)`,
    padding: '13px 28px',
    borderRadius: 50,
    fontWeight: 700,
    fontSize: 14,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    fontFamily: 'inherit',
    transition: 'background 0.2s',
  },
  btnSecondaryLink: {
    background: 'transparent',
    color: COLORS.white,
    border: `2px solid rgba(255,255,255,0.6)`,
    padding: '13px 28px',
    borderRadius: 50,
    fontWeight: 700,
    fontSize: 14,
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    fontFamily: 'inherit',
  },
  categoryNav: {
    background: COLORS.white,
    borderBottom: `1px solid ${COLORS.border}`,
    position: 'sticky',
    top: 0,
    zIndex: 100,
    padding: '0 24px',
  },
  categoryContainer: {
    maxWidth: 1200,
    margin: '0 auto',
    display: 'flex',
    overflowX: 'auto',
    scrollbarWidth: 'none',
    gap: 4,
  },
  categoryButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '16px 18px',
    fontSize: 13,
    fontWeight: 600,
    borderBottom: '2px solid transparent',
    whiteSpace: 'nowrap',
    transition: 'color 0.2s, border-bottom-color 0.2s',
    fontFamily: 'inherit',
  },
  mainContent: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '0 24px',
  },
  section: {
    padding: '48px 0 32px',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 24,
    flexWrap: 'wrap',
    gap: 12,
  },
  sectionBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    margin: 0,
    fontSize: 11,
    fontWeight: 700,
    color: COLORS.olive,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    margin: '4px 0 0',
    fontSize: 26,
    fontWeight: 700,
    fontFamily: "'Playfair Display', serif",
  },
  seeAllLink: {
    color: COLORS.green,
    fontSize: 13,
    fontWeight: 600,
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  productGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: 20,
  },
  bannerSection: {
    padding: '8px 0 48px',
  },
  banner: {
    background: `linear-gradient(120deg, ${COLORS.green} 0%, ${COLORS.greenDark} 100%)`,
    borderRadius: 24,
    padding: '36px 40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 24,
    flexWrap: 'wrap',
    position: 'relative',
    overflow: 'hidden',
  },
  bannerDecoration1: {
    position: 'absolute',
    right: -30,
    top: -30,
    width: 200,
    height: 200,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.06)',
  },
  bannerDecoration2: {
    position: 'absolute',
    right: 60,
    bottom: -50,
    width: 150,
    height: 150,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.04)',
  },
  bannerContent: {
    position: 'relative',
  },
  bannerTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  bannerTitle: {
    margin: '0 0 8px',
    fontFamily: "'Playfair Display', serif",
    fontSize: 28,
    color: COLORS.white,
    lineHeight: 1.2,
  },
  bannerSubtitle: {
    margin: 0,
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
  },
  bannerButtons: {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
    position: 'relative',
  },
  bannerBtnPrimary: {
    background: COLORS.white,
    color: COLORS.greenDark,
    padding: '12px 24px',
    borderRadius: 50,
    fontWeight: 700,
    fontSize: 14,
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
  },
  bannerBtnSecondary: {
    background: 'rgba(255,255,255,0.15)',
    color: COLORS.white,
    padding: '12px 24px',
    borderRadius: 50,
    fontWeight: 600,
    fontSize: 14,
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    border: '1px solid rgba(255,255,255,0.3)',
  },
  errorContainer: {
    textAlign: 'center',
    padding: '64px 20px',
    background: COLORS.white,
    borderRadius: 16,
    margin: '32px 0',
  },
  errorText: {
    color: COLORS.muted,
    marginBottom: 16,
  },
  retryButton: {
    background: COLORS.green,
    color: COLORS.white,
    border: 'none',
    padding: '10px 24px',
    borderRadius: 50,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  emptyState: {
    textAlign: 'center',
    padding: '64px 20px',
    background: COLORS.white,
    borderRadius: 16,
    color: COLORS.muted,
  },
  emptyStateButton: {
    marginTop: 16,
    background: COLORS.green,
    color: COLORS.white,
    border: 'none',
    padding: '10px 24px',
    borderRadius: 50,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  footer: {
    background: COLORS.greenDark,
    padding: '56px 24px',
    textAlign: 'center',
  },
  footerContent: {
    maxWidth: 600,
    margin: '0 auto',
  },
  footerBadge: {
    color: COLORS.greenPale,
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 3,
    textTransform: 'uppercase',
    display: 'inline-block',
    marginBottom: 12,
  },
  footerTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 'clamp(24px, 4vw, 40px)',
    color: COLORS.white,
    margin: '0 0 12px',
  },
  footerText: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 15,
    maxWidth: 400,
    margin: '0 auto 32px',
  },
  footerButtons: {
    display: 'flex',
    gap: 12,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  footerBtnPrimary: {
    background: COLORS.white,
    color: COLORS.greenDark,
    padding: '13px 28px',
    borderRadius: 50,
    fontWeight: 700,
    fontSize: 14,
    border: 'none',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    fontFamily: 'inherit',
  },
  footerBtnSecondary: {
    background: 'transparent',
    color: COLORS.white,
    border: `2px solid rgba(255,255,255,0.5)`,
    padding: '13px 28px',
    borderRadius: 50,
    fontWeight: 700,
    fontSize: 14,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
};

export default Home;