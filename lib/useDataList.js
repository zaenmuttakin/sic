"use client";
import { useEffect, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useInView } from "react-intersection-observer";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

export const calculateTotalStock = (item) => {
  const fields = ["draft", "project", "actual", "gt01", "g002", "g003", "g004"];
  return fields.reduce((sum, field) => sum + (Number(item[field]) || 0), 0);
};

export const calculateOtherStock = (item) => {
  const fields = ["g002", "g003", "g004", "gt01"];
  return fields.reduce((sum, field) => sum + (Number(item[field]) || 0), 0);
};

export function useDataList() {
  const { ref, inView } = useInView();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace, push } = useRouter();

  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  const [sortBy, setSortBy] = useState("desc");
  const [sortOrder, setSortOrder] = useState("asc");
  const [sortControl, setSortControl] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [binCache, setBinCache] = useState({}); // { [mid]: { loading, items } }
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      const params = new URLSearchParams(searchParams);
      if (searchTerm) params.set("q", searchTerm);
      else params.delete("q");
      replace(`${pathname}?${params.toString()}`);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, pathname, replace, searchParams]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["from_sheets", debouncedSearch, sortBy, sortOrder],
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabase.from("from_sheets").select("*");

      if (debouncedSearch) {
        const isNumber = /^\d+$/.test(debouncedSearch);
        if (isNumber) {
          query = query.or(
            `mid.eq.${debouncedSearch},"desc".ilike.%${debouncedSearch}%`
          );
        } else {
          query = query.ilike("desc", `%${debouncedSearch}%`);
        }
      }

      const { data, error } = await query
        .range(pageParam, pageParam + 19)
        .order(sortBy, { ascending: sortOrder === "asc" });

      if (error) throw error;
      return data;
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < 20) return undefined;
      return allPages.length * 20;
    },
    initialPageParam: 0,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (inView && hasNextPage) fetchNextPage();
  }, [inView, hasNextPage, fetchNextPage]);

  const fetchBinData = async (mid) => {
    if (binCache[mid]) return;
    setBinCache((prev) => ({ ...prev, [mid]: { loading: true, items: [] } }));
    try {
      const { data, error } = await supabase
        .from("bins")
        .select("bin, detail, type")
        .eq("mid", mid);
      if (error) throw error;
      setBinCache((prev) => ({
        ...prev,
        [mid]: { loading: false, items: data || [] },
      }));
    } catch {
      setBinCache((prev) => ({
        ...prev,
        [mid]: { loading: false, items: [] },
      }));
    }
  };

  const handleBinClick = async (binName, mid, desc) => {
    try {
      // 1. Check if the material is already in THIS specific bin in SIC
      const { data: specificBin } = await supabase
        .from("bins")
        .select("bin")
        .eq("mid", mid)
        .ilike("bin", binName.trim())
        .limit(1);

      if (specificBin && specificBin.length > 0) {
        push(
          `/private/bin/detail/${encodeURIComponent(specificBin[0].bin)}?from=${mid}`
        );
        return;
      }

      // 2. Check if the material is in ANY other bin in SIC
      const { data: anyBin } = await supabase
        .from("bins")
        .select("bin")
        .eq("mid", mid)
        .limit(1);

      if (anyBin && anyBin.length > 0) {
        push(
          `/private/bin/detail/${encodeURIComponent(anyBin[0].bin)}?from=${mid}`
        );
        return;
      }

      // 3. If not in any bin, handle the suggested bin name (usually from SAP)
      const trimmedBin = binName.trim();
      const isPlaceholder =
        !trimmedBin ||
        trimmedBin === "-" ||
        trimmedBin.toLowerCase() === "n/a" ||
        trimmedBin.toLowerCase() === "none";

      let url = `/private/bin/adding/${mid}?desc=${encodeURIComponent(desc)}`;
      if (!isPlaceholder) {
        url += `&targetBin=${encodeURIComponent(trimmedBin.toUpperCase())}`;
      }
      push(url);
    } catch {
      push(`/private/bin/adding/${mid}?desc=${encodeURIComponent(desc)}`);
    }
  };

  const handleCopy = (item) => {
    const text = `${item.mid}\n${item.desc}\n${item.uom}`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.mid);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleExpand = (mid) => {
    const isExpanded = expandedId === mid;
    const newId = isExpanded ? null : mid;
    setExpandedId(newId);
    if (!isExpanded) fetchBinData(mid);
  };

  return {
    ref,
    searchTerm,
    setSearchTerm,
    sortControl,
    setSortControl,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    expandedId,
    binCache,
    copiedId,
    isLoading,
    data,
    hasNextPage,
    isFetchingNextPage,
    handleBinClick,
    handleCopy,
    toggleExpand,
    push,
  };
}
