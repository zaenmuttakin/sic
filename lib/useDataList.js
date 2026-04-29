"use client";
import { useEffect, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useInView } from "react-intersection-observer";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

export const calculateTotalStock = (item) => {
  const fields = ["actual", "gt01", "g002", "g003", "g004"];
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

  // Initialize states from localStorage if available, otherwise use defaults
  const getInitial = (key, defaultValue) => {
    if (typeof window === "undefined") return defaultValue;
    return localStorage.getItem(`datalist_${key}`) || defaultValue;
  };

  const [searchTerm, setSearchTerm] = useState(
    () => searchParams.get("q") || getInitial("searchTerm", "")
  );
  const [searchQuery, setSearchQuery] = useState(
    () => searchParams.get("q") || getInitial("searchQuery", "")
  );
  const [sortBy, setSortBy] = useState(() =>
    getInitial("sortBy", "last_sheet_update")
  );
  const [sortOrder, setSortOrder] = useState(() =>
    getInitial("sortOrder", "desc")
  );
  const [onlyOnStock, setOnlyOnStock] = useState(
    () => getInitial("onlyOnStock", "false") === "true"
  );
  const [sortControl, setSortControl] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Persistence effects
  useEffect(() => {
    localStorage.setItem("datalist_sortBy", sortBy);
    localStorage.setItem("datalist_sortOrder", sortOrder);
    localStorage.setItem("datalist_onlyOnStock", onlyOnStock.toString());
    localStorage.setItem("datalist_searchTerm", searchTerm);
    localStorage.setItem("datalist_searchQuery", searchQuery);
  }, [sortBy, sortOrder, onlyOnStock, searchTerm, searchQuery]);

  const activeFiltersCount = [
    sortBy !== "last_sheet_update",
    sortOrder !== "desc",
    onlyOnStock === true,
  ].filter(Boolean).length;

  const updateUrl = (term) => {
    const params = new URLSearchParams(searchParams);
    if (term) params.set("q", term);
    else params.delete("q");
    replace(`${pathname}?${params.toString()}`);
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    setSearchQuery(searchTerm);
    updateUrl(searchTerm);
  };

  const handleClear = () => {
    setSearchTerm("");
    setSearchQuery("");
    updateUrl("");
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: [
        "material_master_view",
        searchQuery,
        sortBy,
        sortOrder,
        onlyOnStock,
      ],
      queryFn: async ({ pageParam = 0 }) => {
        if (!searchQuery) return [];

        const isNumber = /^\d+$/.test(searchQuery);
        let query = supabase
          .from("material_master_view")
          .select("*")
          .or(
            isNumber
              ? `mid.eq.${searchQuery},material_name.ilike.%${searchQuery}%`
              : `material_name.ilike.%${searchQuery}%`
          );

        if (onlyOnStock) {
          query = query.or(
            "draft.gt.0,project.gt.0,actual.gt.0,gt01.gt.0,g002.gt.0,g003.gt.0,g004.gt.0"
          );
        }

        const { data, error } = await query
          .range(pageParam, pageParam + 24)
          .order(sortBy, { ascending: sortOrder === "asc" });

        if (error) throw error;

        return Object.values(
          data.reduce((acc, row) => {
            if (!acc[row.mid]) {
              acc[row.mid] = {
                ...row,
                desc: row.material_name,
                update_at: row.last_sheet_update,
                bins: [],
              };
            }
            if (row.bin_location) {
              acc[row.mid].bins.push({
                bin: row.bin_location,
                type: row.bin_type,
                detail: row.bin_detail,
              });
            }
            return acc;
          }, {})
        );
      },
      getNextPageParam: (lastPage, allPages) =>
        lastPage.length > 0 ? allPages.length * 25 : undefined,
      initialPageParam: 0,
      staleTime: 1000 * 60 * 5,
      enabled: !!searchQuery,
    });

  useEffect(() => {
    if (inView && hasNextPage) fetchNextPage();
  }, [inView, hasNextPage, fetchNextPage]);

  const handleBinClick = async (binName, mid, desc) => {
    const trimmedBin = binName?.trim();
    if (!trimmedBin)
      return push(
        `/private/bin/adding/${mid}?desc=${encodeURIComponent(desc)}`
      );

    try {
      const { data: bins } = await supabase
        .from("bins")
        .select("bin")
        .eq("mid", mid)
        .or(`bin.ilike.${trimmedBin},bin.neq.${trimmedBin}`)
        .limit(2);

      if (bins?.length > 0) {
        const target =
          bins.find((b) => b.bin.toLowerCase() === trimmedBin.toLowerCase()) ||
          bins[0];
        return push(
          `/private/bin/detail/${encodeURIComponent(target.bin)}?from=${mid}`
        );
      }

      const isPlaceholder = ["-", "n/a", "none"].includes(
        trimmedBin.toLowerCase()
      );
      const url = `/private/bin/adding/${mid}?desc=${encodeURIComponent(desc)}${isPlaceholder ? "" : `&targetBin=${encodeURIComponent(trimmedBin.toUpperCase())}`}`;
      push(url);
    } catch {
      push(`/private/bin/adding/${mid}?desc=${encodeURIComponent(desc)}`);
    }
  };

  const handleReset = () => {
    setSortBy("last_sheet_update");
    setSortOrder("desc");
    setOnlyOnStock(false);
  };

  const handleCopy = (item) => {
    navigator.clipboard.writeText(`${item.mid}\n${item.desc}\n${item.uom}`);
    setCopiedId(item.mid);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return {
    ref,
    searchTerm,
    setSearchTerm,
    searchQuery,
    handleSearch,
    handleClear,
    handleReset,
    sortControl,
    setSortControl,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    onlyOnStock,
    setOnlyOnStock,
    activeFiltersCount,
    expandedId,
    setExpandedId,
    copiedId,
    isLoading,
    data,
    hasNextPage,
    isFetchingNextPage,
    handleBinClick,
    handleCopy,
    toggleExpand: (mid) => setExpandedId((prev) => (prev === mid ? null : mid)),
    push,
  };
}
