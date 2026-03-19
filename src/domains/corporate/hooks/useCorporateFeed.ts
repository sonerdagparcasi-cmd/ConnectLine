// src/domains/corporate/hooks/useCorporateFeed.ts

import { useCallback, useEffect, useState } from "react";
import { corporateFeedService } from "../services/corporateFeedService";
import { CorporateFeedPost } from "../types/feed.types";

/**
 * 🔒 CORPORATE FEED HOOK
 *
 * ADIM 11:
 * - Screen saf UI
 *
 * ADIM 12:
 * - Optimistic + sync tamamen service’te
 * - Hook sadece state bağlar
 * - API DEĞİŞMEZ
 */

export function useCorporateFeed(companyId: string) {
  const [posts, setPosts] = useState<CorporateFeedPost[]>([]);
  const [loading, setLoading] = useState(true);

  /* -------------------------------------------------------------- */
  /* INITIAL FETCH                                                  */
  /* -------------------------------------------------------------- */
  useEffect(() => {
    let mounted = true;

    setLoading(true);

    corporateFeedService.getFeed(companyId).then((data) => {
      if (!mounted) return;
      setPosts(data);
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, [companyId]);

  /* -------------------------------------------------------------- */
  /* LIKE                                                           */
  /* -------------------------------------------------------------- */
  const toggleLike = useCallback(async (postId: string) => {
    await corporateFeedService.toggleLike(postId);

    // service authoritative → yeniden oku
    const updated = await corporateFeedService.getFeed(companyId);
    setPosts(updated);
  }, [companyId]);

  /* -------------------------------------------------------------- */
  /* ADD POST                                                       */
  /* -------------------------------------------------------------- */
  const addPost = useCallback(async (post: CorporateFeedPost) => {
    await corporateFeedService.addPost(post);

    // optimistic zaten service’te → local refresh
    const updated = await corporateFeedService.getFeed(companyId);
    setPosts(updated);
  }, [companyId]);

  return {
    posts,
    loading,
    toggleLike,
    addPost,
  };
}