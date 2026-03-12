"use client";
import { useMemo } from "react";
import { useDesignStore, type Size } from "@/store/design-store";
import { MODEL_RULES } from "@/models/rules";
export function useModelProtector() {
  const model = useDesignStore((s) => s.model);
  const rule = useMemo(() => MODEL_RULES[model], [model]);
  const normalize = (size: Size): Size => {
    if (!rule?.normalize) return size;
    return rule.normalize(size);
  };
  const protect = (size: Size) => {
    if (!rule) return { size, valid: true };
    return {
      size: rule.normalize ? rule.normalize(size) : size,
      valid: false,
      message: rule.message,
    };
  };
  return {
    model,
    normalize,
    protect,
  };
}