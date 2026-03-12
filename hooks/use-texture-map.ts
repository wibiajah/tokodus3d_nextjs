import { useMemo } from "react";
import { TextureItem } from "@/store/design-store";
export function useTextureMap(textures: TextureItem[]) {
  return useMemo(() => {
    const map: Record<string, TextureItem[]> = {};
    textures.forEach((t) => {
      if (!map[t.id]) {
        map[t.id] = [];
      }
      map[t.id].push(t);
    });
    return map;
  }, [textures]);
}
