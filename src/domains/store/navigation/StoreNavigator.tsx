// src/domains/store/navigation/StoreNavigator.tsx
// 🔒 STORE NAVIGATOR — DOMAIN STACK (STABLE / SELLER READY)
// FIX:
// - FloatingCart navigation stabil hale getirildi
// - Dokunma alanı korunur
// - Cart / Checkout ekranlarında gizlenir
// - Mimari korunur

import { useNavigation, useNavigationState } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useAppTheme } from "../../../shared/theme/appTheme";
import { useStoreState } from "../hooks/useStoreState";
import { StoreProvider } from "../state/storeState";

/* ------------------------------------------------------------------ */
/* PROFILE CONTAINER                                                  */
/* ------------------------------------------------------------------ */

import StoreProfileContainerScreen from "../screens/StoreProfileContainerScreen";

/* ------------------------------------------------------------------ */
/* B — ALIŞVERİŞ                                                      */
/* ------------------------------------------------------------------ */

import StoreCatalogScreen from "../screens/StoreCatalogScreen";
import StoreHomeScreen from "../screens/StoreHomeScreen";
import StoreProductDetailScreen from "../screens/StoreProductDetailScreen";
import StoreSavedScreen from "../screens/StoreSavedScreen";
import StoreSellerProfileScreen from "../screens/StoreSellerProfileScreen";

/* ------------------------------------------------------------------ */
/* C — KAMPANYALAR                                                    */
/* ------------------------------------------------------------------ */

import StoreCampaignCreateEventScreen from "../screens/StoreCampaignCreateEventScreen";
import StoreCampaignDetailScreen from "../screens/StoreCampaignDetailScreen";
import StoreCampaignNotificationsScreen from "../screens/storeCampaignNotificationsScreen";
import StoreCampaignsScreen from "../screens/StoreCampaignsScreen";
import StoreEventPageScreen from "../screens/StoreEventPageScreen";

/* ------------------------------------------------------------------ */
/* D — SEPET / SİPARİŞ                                                */
/* ------------------------------------------------------------------ */

import StoreCartScreen from "../screens/StoreCartScreen";
import StoreCheckoutScreen from "../screens/StoreCheckoutScreen";
import StoreOrderDetailScreen from "../screens/StoreOrderDetailScreen";
import StoreOrdersScreen from "../screens/StoreOrdersScreen";
import StoreOrderSuccessScreen from "../screens/StoreOrderSuccessScreen";

/* ------------------------------------------------------------------ */
/* E — YORUMLAR                                                       */
/* ------------------------------------------------------------------ */

import StoreProductReviewsScreen from "../screens/StoreProductReviewsScreen";
import StoreSellerReplyScreen from "../screens/StoreSellerReplyScreen";
import StoreWriteReviewScreen from "../screens/StoreWriteReviewScreen";

/* ------------------------------------------------------------------ */
/* G — RAPORLAR                                                       */
/* ------------------------------------------------------------------ */

import StoreReportsScreen from "../screens/StoreReportsScreen";

/* ------------------------------------------------------------------ */
/* TYPES                                                              */
/* ------------------------------------------------------------------ */

export type StoreStackParamList = {
  StoreProfileContainer: undefined;

  StoreHome: undefined;
  StoreCatalog: undefined;
  StoreProductDetail: { productId: string };
  StoreSaved: undefined;
  StoreSellerProfile: { sellerId: string };

  StoreCampaigns: undefined;
  StoreCampaignDetail: { campaignId: string };
  StoreCampaignNotifications: undefined;
  StoreCampaignCreateEvent: undefined;
  StoreEventPage: { campaignId: string };

  StoreCart: undefined;
  StoreCheckout: undefined;
  StoreOrderSuccess: { orderId: string };
  StoreOrders: undefined;
  StoreOrderDetail: { orderId: string };

  StoreProductReviews: { productId: string; sellerId: string };
  StoreWriteReview: { productId: string; sellerId: string };
  StoreSellerReply: { reviewId: string; productId: string };

  StoreReports: undefined;
};

const Stack = createNativeStackNavigator<StoreStackParamList>();

/* ------------------------------------------------------------------ */
/* GLOBAL FLOATING CART                                               */
/* ------------------------------------------------------------------ */

function FloatingCart() {

  const T = useAppTheme();
  const navigation = useNavigation<any>();
  const { cart } = useStoreState();

  const cartCount = cart.reduce((s, c) => s + c.qty, 0);

  const routeName = useNavigationState(
    (state) => state.routes[state.index].name
  );

  /* cart ekranlarında gizle */

  if (
    routeName === "StoreCart" ||
    routeName === "StoreCheckout" ||
    routeName === "StoreOrderSuccess"
  ) {
    return null;
  }

  if (cartCount === 0) return null;

  function openCart() {

    /* normal navigation */

    try {
      navigation.navigate("StoreCart");
    } catch {
      /* fallback */

      navigation.getParent()?.navigate("StoreCart");
    }

  }

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      hitSlop={20}
      onPress={openCart}
      style={[styles.cartButton, { backgroundColor: T.accent }]}
    >

      <Text style={styles.cartIcon}>🛒</Text>

      <View style={styles.badge}>
        <Text style={styles.badgeText}>
          {cartCount > 99 ? "99+" : cartCount}
        </Text>
      </View>

    </TouchableOpacity>
  );
}

/* ------------------------------------------------------------------ */
/* NAVIGATOR                                                          */
/* ------------------------------------------------------------------ */

export default function StoreNavigator() {

  return (

    <StoreProvider>

      <View style={{ flex: 1 }}>

        <Stack.Navigator
          initialRouteName="StoreCatalog"
          screenOptions={{
            headerShown: false,
            animation: "slide_from_right",
          }}
        >

          <Stack.Screen name="StoreProfileContainer" component={StoreProfileContainerScreen} />

          <Stack.Screen name="StoreCatalog" component={StoreCatalogScreen} />
          <Stack.Screen name="StoreHome" component={StoreHomeScreen} />
          <Stack.Screen name="StoreProductDetail" component={StoreProductDetailScreen} />
          <Stack.Screen name="StoreSaved" component={StoreSavedScreen} />
          <Stack.Screen name="StoreSellerProfile" component={StoreSellerProfileScreen} />

          <Stack.Screen name="StoreCampaigns" component={StoreCampaignsScreen} />
          <Stack.Screen name="StoreCampaignDetail" component={StoreCampaignDetailScreen} />
          <Stack.Screen name="StoreCampaignNotifications" component={StoreCampaignNotificationsScreen} />
          <Stack.Screen name="StoreCampaignCreateEvent" component={StoreCampaignCreateEventScreen} />
          <Stack.Screen name="StoreEventPage" component={StoreEventPageScreen} />

          <Stack.Screen name="StoreCart" component={StoreCartScreen} />
          <Stack.Screen name="StoreCheckout" component={StoreCheckoutScreen} />
          <Stack.Screen name="StoreOrderSuccess" component={StoreOrderSuccessScreen} />
          <Stack.Screen name="StoreOrders" component={StoreOrdersScreen} />
          <Stack.Screen name="StoreOrderDetail" component={StoreOrderDetailScreen} />

          <Stack.Screen name="StoreProductReviews" component={StoreProductReviewsScreen} />
          <Stack.Screen name="StoreWriteReview" component={StoreWriteReviewScreen} />
          <Stack.Screen name="StoreSellerReply" component={StoreSellerReplyScreen} />

          <Stack.Screen name="StoreReports" component={StoreReportsScreen} />

        </Stack.Navigator>

        {/* GLOBAL FLOATING CART */}

        <FloatingCart />

      </View>

    </StoreProvider>

  );
}

/* ------------------------------------------------------------------ */
/* STYLES                                                             */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({

  cartButton: {
    position: "absolute",
    right: 20,
    bottom: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },

  cartIcon: {
    fontSize: 24,
  },

  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#ff3b30",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },

  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "900",
  },

});