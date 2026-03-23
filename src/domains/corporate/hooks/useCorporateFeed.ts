// src/domains/corporate/hooks/useCorporateFeed.ts

import { useCallback, useEffect, useState } from "react";
import {
  addCorporatePost,
  getCompanyPosts,
  hydrateCorporateFeedForCompany,
  subscribeCorporateFeed,
  toggleLike,
} from "../services/corporateFeedStateService";
import type { CorporatePost } from "../types/feed.types";

/**
 * 🔒 CORPORATE FEED HOOK — tek kaynak: corporateFeedStateService
 */

export function useCorporateFeed(companyId: string) {
  const [posts, setPosts] = useState<CorporatePost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      await hydrateCorporateFeedForCompany(companyId);
      if (!mounted) return;
      setPosts(getCompanyPosts(companyId));
      setLoading(false);
    })();

    const unsub = subscribeCorporateFeed(() => {
      setPosts(getCompanyPosts(companyId));
    });

    return () => {
      mounted = false;
      unsub();
    };
  }, [companyId]);

  const onToggleLike = useCallback((postId: string) => {
    toggleLike(postId);
  }, []);

  const addPost = useCallback((post: CorporatePost) => {
    addCorporatePost(post);
  }, []);

  return {
    posts,
    loading,
    toggleLike: onToggleLike,
    addPost,
  };
}
