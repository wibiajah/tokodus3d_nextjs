import type { Size, ModelType } from "@/store/design-store";
import { getFixedByWidth } from "./shopping/model";
export type SizeRule = {
  validate: (s: Size) => boolean;
  normalize?: (s: Size) => Size;
  message?: string;
};
export const MODEL_RULES: Record<ModelType, SizeRule> = {
  shipping: {
    validate: ({ length, width, height }) => length >= width && width >= height,
    normalize: (s) => {
      const arr = [s.length, s.width, s.height].sort((a, b) => b - a);
      return { ...s, length: arr[0], width: arr[1], height: arr[2] };
    },
    message: "Shipping box: panjang ≥ lebar ≥ tinggi",
  },
  shopping: {
    validate: ({ height, length, width }) => length <= width,
    normalize: (s) => {
      let w = Math.max(s.width, 2);
      let l = Math.max(s.length, 4);
      let h = Math.max(s.height, 4);
      // hitung hl setelah width valid
      const hl = w / 2 + getFixedByWidth(w);
      // pastikan l/2 >= hl
      if (l / 2 < hl) {
        l = +(hl * 2).toFixed(2);
      }
      return {
        ...s,
        width: w,
        length: l,
        height: h,
      };
    },
    message: "Shopping box: panjang harus lebih besar dari lebar",
  },
  mailer: {
    validate: ({ length, width, height }) => length >= width && width >= height,
    normalize: (s) => {
      let w = Math.max(s.width, 2.06);
      let l = Math.max(s.length, 2.06);
      let h = Math.max(s.height, 2.06);
      return {
        ...s,
        width: w,
        length: l,
        height: h,
      };
    },
  },
  tuckend: {
    validate: ({ length, width, height }) =>
      length > 0 && width > 0 && height > 0,
  },
  shoe: {
    validate: ({ length, width, height }) =>
      length > 0 && width > 0 && height > 0,
  },
  sleeve: {
    validate: ({ length, width }) => length >= width,
    normalize: (s) => ({
      ...s,
      length: Math.max(s.length, s.width),
    }),
    message: "Sleeve box: panjang harus ≥ lebar",
  },
};
