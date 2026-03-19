// src/domains/storeSeller/products/screens/SellerCreateProductScreen.tsx
// 🔒 SELLER CREATE PRODUCT – STABLE / UI ONLY

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
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

export default function SellerCreateProductScreen() {
  const T = useAppTheme();
  const nav = useNavigation<Nav>();

  /** UI ONLY */
  const sellerId = "mockSeller";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");

  /* ------------------------------------------------------------------ */
  /* CREATE PRODUCT                                                     */
  /* ------------------------------------------------------------------ */

  async function createProduct() {
    if (!title.trim()) {
      Alert.alert("Eksik bilgi", "Ürün adı gerekli.");
      return;
    }

    const parsedPrice = Number(price);
    const parsedStock = Number(stock);

    if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      Alert.alert("Hata", "Geçerli bir fiyat gir.");
      return;
    }

    if (Number.isNaN(parsedStock) || parsedStock < 0) {
      Alert.alert("Hata", "Geçerli bir stok gir.");
      return;
    }

    try {
      await sellerProductService.createProduct({
        sellerId,
        title: title.trim(),
        description: description.trim(),
        price: parsedPrice,
        currency: "TRY",
        categoryId: "general",
        stock: parsedStock,
        status: parsedStock > 0 ? "active" : "out_of_stock",
        images: [],
      });

      Alert.alert("Başarılı", "Ürün oluşturuldu.");
      nav.goBack();
    } catch {
      Alert.alert("Hata", "Ürün oluşturulamadı.");
    }
  }

  /* ------------------------------------------------------------------ */
  /* RENDER                                                             */
  /* ------------------------------------------------------------------ */

  return (
    <ScrollView
      style={{ backgroundColor: T.backgroundColor }}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.title, { color: T.textColor }]}>
        Yeni Ürün
      </Text>

      <Input
        label="Ürün Adı"
        placeholder="Ürün adını gir"
        value={title}
        onChangeText={setTitle}
      />

      <Input
        label="Açıklama"
        placeholder="Ürün açıklaması"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Input
        label="Fiyat"
        placeholder="Örn: 199.90"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />

      <Input
        label="Stok"
        placeholder="Stok adedi"
        value={stock}
        onChangeText={setStock}
        keyboardType="numeric"
      />

      <TouchableOpacity
        style={[styles.createBtn, { backgroundColor: T.accent }]}
        onPress={createProduct}
        activeOpacity={0.9}
      >
        <Ionicons name="checkmark" size={18} color="#fff" />
        <Text style={styles.createText}>Ürünü Oluştur</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  /* ------------------------------------------------------------------ */
  /* INPUT COMPONENT                                                    */
  /* ------------------------------------------------------------------ */

  function Input({
    label,
    value,
    onChangeText,
    placeholder,
    multiline,
    keyboardType,
  }: {
    label: string;
    value: string;
    placeholder?: string;
    onChangeText: (t: string) => void;
    multiline?: boolean;
    keyboardType?: "default" | "numeric";
  }) {
    return (
      <View style={{ marginBottom: 14 }}>
        <Text style={[styles.label, { color: T.textColor }]}>
          {label}
        </Text>

        <TextInput
          value={value}
          placeholder={placeholder}
          placeholderTextColor={T.mutedText}
          onChangeText={onChangeText}
          multiline={multiline}
          keyboardType={keyboardType}
          style={[
            styles.input,
            multiline && styles.multiline,
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

/* ------------------------------------------------------------------ */
/* STYLES                                                             */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  container: {
    padding: 16,
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

  multiline: {
    minHeight: 90,
    textAlignVertical: "top",
  },

  createBtn: {
    marginTop: 10,
    padding: 14,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  createText: {
    color: "#fff",
    fontWeight: "900",
  },
});