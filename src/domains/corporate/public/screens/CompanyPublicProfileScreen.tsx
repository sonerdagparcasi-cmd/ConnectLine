// src/domains/corporate/public/screens/CompanyPublicProfileScreen.tsx

import { useEffect, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { companyPublicService } from "../services/companyPublicService";
import { CompanyPublicProfile } from "../types/public.types";

type Props = { companyId: string };

export default function CompanyPublicProfileScreen({ companyId }: Props) {
  const [data, setData] = useState<CompanyPublicProfile | null>(null);

  useEffect(() => {
    let mounted = true;

    companyPublicService.getProfile(companyId).then((profile) => {
      if (mounted) setData(profile);
    });

    return () => {
      mounted = false;
    };
  }, [companyId]);

  /* -------------------------------------------------- */
  /* SAFE ACTIONS                                       */
  /* -------------------------------------------------- */

  async function toggleFollow() {
    setData((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        isFollowing: !prev.isFollowing,
        followerCount: Math.max(
          0,
          prev.followerCount + (prev.isFollowing ? -1 : 1)
        ),
      };
    });

    // servis çağrısı UI’dan sonra (optimistic update)
    if (!data) return;

    if (data.isFollowing) {
      await companyPublicService.unfollow(data.id);
    } else {
      await companyPublicService.follow(data.id);
    }
  }

  /* -------------------------------------------------- */
  /* RENDER GUARD                                       */
  /* -------------------------------------------------- */

  if (!data) return null;

  return (
    <FlatList
      data={[]}
      renderItem={null}
      ListHeaderComponent={
        <View style={{ padding: 20, gap: 12 }}>
          <Text style={{ fontSize: 24, fontWeight: "800" }}>
            {data.name}
          </Text>

          <Text style={{ color: "#666" }}>{data.title}</Text>

          {data.about ? <Text>{data.about}</Text> : null}

          <TouchableOpacity
            onPress={toggleFollow}
            activeOpacity={0.85}
            style={{
              padding: 10,
              borderRadius: 8,
              backgroundColor: data.isFollowing ? "#ddd" : "#007AFF",
              alignSelf: "flex-start",
            }}
          >
            <Text style={{ color: data.isFollowing ? "#000" : "#fff" }}>
              {data.isFollowing ? "Takiptesin" : "Takip Et"}
            </Text>
          </TouchableOpacity>

          <Text>{data.followerCount} takipçi</Text>

          {data.activeJobs.length > 0 && (
            <Section title="Aktif İlanlar">
              {data.activeJobs.map((j) => (
                <Text key={j.id}>• {j.title}</Text>
              ))}
            </Section>
          )}

          {data.announcements.length > 0 && (
            <Section title="Duyurular">
              {data.announcements.map((a) => (
                <Text key={a.id}>• {a.text}</Text>
              ))}
            </Section>
          )}
        </View>
      }
    />
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontWeight: "700", fontSize: 16 }}>{title}</Text>
      {children}
    </View>
  );
}