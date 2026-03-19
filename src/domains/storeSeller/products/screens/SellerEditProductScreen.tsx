// src/domains/storeSeller/products/screens/SellerEditProductScreen.tsx
// 🔒 SELLER EDIT PRODUCT – STABLE / UI ONLY

import { Ionicons } from "@expo/vector-icons";
import type { RouteProp } from "@react-navigation/native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { useAppTheme } from "../../../../shared/theme/appTheme";
import type { StoreSellerStackParamList } from "../../navigation/StoreSellerNavigator";
import { sellerProductService } from "../services/sellerProductService";

type Nav = NativeStackNavigationProp<StoreSellerStackParamList>;

type RouteProps = RouteProp<
  StoreSellerStackParamList,
  "SellerEditProduct"
>;

export default function SellerEditProductScreen() {
  const T = useAppTheme();
  const nav = useNavigation<Nav>();
  const { params } = useRoute<RouteProps>();

  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");

  /* --------------------------------------------------------------- */
  /* LOAD PRODUCT                                                    */
  /* --------------------------------------------------------------- */

  useEffect(() => {
    loadProduct();
  }, []);

  async function loadProduct() {
    const p = await sellerProductService.getProductById(params.productId);

    if (!p) {
      Alert.alert("Hata", "Ürün bulunamadı.");
      nav.goBack();
      return;
    }

    setTitle(p.title);
    setDescription(p.description ?? "");
    setPrice(String(p.price));
    setStock(String(p.stock));

    setLoading(false);
  }

  /* --------------------------------------------------------------- */
  /* SAVE                                                            */
  /* --------------------------------------------------------------- */

  async function save() {
    if (!title.trim()) {
      Alert.alert("Eksik bilgi", "Ürün adı gerekli.");
      return;
    }

    const p = Number(price);
    const s = Number(stock);

    if (isNaN(p) || p <= 0) {
      Alert.alert("Hata", "Geçerli bir fiyat gir.");
      return;
    }

    if (isNaN(s) || s < 0) {
      Alert.alert("Hata", "Geçerli bir stok gir.");
      return;
    }

    await sellerProductService.updateProduct(params.productId, {
      title,
      description,
      price: p,
      stock: s,
      status: s > 0 ? "active" : "out_of_stock",
    });

    Alert.alert("Kaydedildi", "Ürün güncellendi.");

    nav.goBack();
  }

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: T.backgroundColor }]}>
        <Text style={{ color: T.mutedText }}>Yükleniyor…</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: T.backgroundColor }}
      contentContainerStyle={styles.container}
    >
      <Text style={[styles.title, { color: T.textColor }]}>
        Ürünü Düzenle
      </Text>

      <Input label="Ürün Adı" value={title} onChangeText={setTitle} />

      <Input
        label="Açıklama"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Input
        label="Fiyat"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />

      <Input
        label="Stok"
        value={stock}
        onChangeText={setStock}
        keyboardType="numeric"
      />

      <TouchableOpacity
        style={[styles.saveBtn, { backgroundColor: T.accent }]}
        onPress={save}
      >
        <Ionicons name="checkmark" size={18} color="#fff" />
        <Text style={styles.saveText}>Kaydet</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  function Input({
    label,
    value,
    onChangeText,
    multiline,
    keyboardType,
  }: {
    label: string;
    value: string;
    onChangeText: (t: string) => void;
    multiline?: boolean;
    keyboardType?: "default" | "numeric";
  }) {
    return (
      <View style={{ marginBottom: 14 }}>
        <Text style={[styles.label, { color: T.textColor }]}>{label}</Text>

        <TextInput
          value={value}
          onChangeText={onChangeText}
          multiline={multiline}
          keyboardType={keyboardType}
          style={[
            styles.input,
            {
              backgroundColor: T.cardBg,
              borderColor: T.border,
              color: T.textColor,
            },
          ]}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 16,
  },

  label: {
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 6,
  },

  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
  },

  saveBtn: {
    marginTop: 10,
    padding: 14,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  saveText: {
    color: "#fff",
    fontWeight: "900",
  },
});