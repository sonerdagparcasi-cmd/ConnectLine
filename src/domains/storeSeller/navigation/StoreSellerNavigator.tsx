// src/domains/storeSeller/navigation/StoreSellerNavigator.tsx
// 🔒 STORE SELLER NAVIGATOR — SATICI YÖNETİM DÜNYASI (GUARDED / STABLE)

import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { useSellerAccess } from "../hooks/useSellerAccess";

/* ------------------------------------------------------------------ */
/* SCREENS                                                            */
/* ------------------------------------------------------------------ */

import SellerCampaignsScreen from "../screens/SellerCampaignsScreen";
import SellerDashboardScreen from "../screens/SellerDashboardScreen";

/* mevcut seller screens */
import SellerOrdersScreen from "../SellerOrdersScreen";
import SellerProductsScreen from "../SellerProductsScreen";
import SellerReportsScreen from "../SellerReportsScreen";

/* PRODUCT MANAGEMENT */
import SellerCreateProductScreen from "../products/screens/SellerCreateProductScreen";
import SellerEditProductScreen from "../products/screens/SellerEditProductScreen";

/* ORDER DETAIL */
import SellerOrderDetailScreen from "../orders/SellerOrderDetailScreen";

/* ------------------------------------------------------------------ */
/* ROUTE TYPES (🔒 KİLİTLİ)                                           */
/* ------------------------------------------------------------------ */

export type StoreSellerStackParamList = {
  SellerDashboard: undefined;

  SellerProducts: undefined;
  SellerCreateProduct: undefined;
  SellerEditProduct: { productId: string };

  SellerOrders: undefined;
  SellerOrderDetail: { orderId: string };

  SellerCampaigns: undefined;
  SellerReports: undefined;
};

/* ------------------------------------------------------------------ */
/* STACK                                                              */
/* ------------------------------------------------------------------ */

const Stack = createNativeStackNavigator<StoreSellerStackParamList>();

/**
 * 🔒 StoreSellerNavigator
 *
 * Satıcı yönetim paneli.
 *
 * KURALLAR:
 * - Store (müşteri) domain’i ile ASLA karışmaz
 * - Owner-only erişim
 * - Header AppShell’dan gelir
 * - Navigator içinde header yok
 * - Domain izolasyonu korunur
 */

export default function StoreSellerNavigator() {
  const { canAccessSellerPanel } = useSellerAccess();

  /**
   * 🔒 SELLER GUARD
   *
   * Satıcı değilse navigator render edilmez.
   * Bu sayede seller panel güvenli kalır.
   */

  if (!canAccessSellerPanel) {
    return null;
  }

  return (
    <Stack.Navigator
      initialRouteName="SellerDashboard"
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      {/* DASHBOARD */}
      <Stack.Screen
        name="SellerDashboard"
        component={SellerDashboardScreen}
      />

      {/* PRODUCTS */}
      <Stack.Screen
        name="SellerProducts"
        component={SellerProductsScreen}
      />

      <Stack.Screen
        name="SellerCreateProduct"
        component={SellerCreateProductScreen}
      />

      <Stack.Screen
        name="SellerEditProduct"
        component={SellerEditProductScreen}
      />

      {/* ORDERS */}
      <Stack.Screen
        name="SellerOrders"
        component={SellerOrdersScreen}
      />

      <Stack.Screen
        name="SellerOrderDetail"
        component={SellerOrderDetailScreen}
      />

      {/* CAMPAIGNS */}
      <Stack.Screen
        name="SellerCampaigns"
        component={SellerCampaignsScreen}
      />

      {/* REPORTS */}
      <Stack.Screen
        name="SellerReports"
        component={SellerReportsScreen}
      />
    </Stack.Navigator>
  );
}