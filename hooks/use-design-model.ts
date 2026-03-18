"use client";
import createMailerBoxModel from "@/models/mailer/model";
import createShippingBoxModel from "@/models/shipping/model";
import createShoeBoxModel from "@/models/shoe/model";
import createShoppingBoxModel from "@/models/shopping/model";
import createGableBoxModel from "@/models/gable/model";
import { useDesignStore } from "@/store/design-store";
import { useMemo } from "react";
const MODELS: Record<string, (params: any) => any> = {
  shipping: createShippingBoxModel,
  shopping: createShoppingBoxModel,
  mailer:   createMailerBoxModel,
  shoe:     createShoeBoxModel,
  gable:    createGableBoxModel,
};
export function useDesignModel() {
  const model      = useDesignStore((s) => s.model);
  const size       = useDesignStore((s) => s.size);
  const fixedFlap  = useDesignStore((s) => s.fixedFlap);
  const flute      = useDesignStore((s) => s.flute);
  const scale = 10;
  const params = {
    size: {
      length: size.length * scale,
      width:  size.width  * scale,
      height: size.height * scale,
      depth:  size.depth  * scale,
    },
    fixed: fixedFlap,
    flute,
  };
  const paramsKey = JSON.stringify(params);
  return useMemo(() => {
    const factory = MODELS[model];
    if (!factory) {
      throw new Error(`Unknown model type: ${model}`);
    }
    return factory(params);
  }, [model, paramsKey]);
}