import { useCart } from "./useCart";
import { useAuthStore } from "../store/authStore";
import { cartService } from "../services/cart";
import { useUIStore } from "../store/uiStore";

export const useCartCount = () => {
  const { isAuthenticated } = useAuthStore();
  const { data: cartData } = useCart();
  // Subscribe to cartUpdated to force re-render when guest cart changes
  const cartUpdated = useUIStore((state) => state.cartUpdated);
  // Subscribe to cartMutationVersion to force re-render when authenticated cart changes
  const cartMutationVersion = useUIStore((state) => state.cartMutationVersion);

  // For authenticated users, calculate count directly (no useMemo to avoid stale closures)
  let authenticatedCount = 0;
  if (isAuthenticated && cartData?.cart?.items) {
    authenticatedCount = cartData.cart.items.reduce(
      (count, item) => count + (item.quantity || 0),
      0
    );
  }
  // Force dependency on cartMutationVersion by using it (prevents tree-shaking)
  if (cartMutationVersion < 0) authenticatedCount = 0;

  // For guest users, calculate count directly from localStorage (no React Query)
  // This ensures immediate updates when triggerCartUpdate() is called
  let guestCount = 0;
  if (!isAuthenticated) {
    const guestCart = cartService.getGuestCart();
    guestCount = guestCart.reduce((count, item) => count + (item.quantity || 0), 0);
  }
  // Force dependency on cartUpdated by using it (prevents tree-shaking)
  if (cartUpdated < 0) guestCount = 0;

  return isAuthenticated ? authenticatedCount : guestCount;
};
