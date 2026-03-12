"use client";

import { MODEL_REGISTRY, ModelProps } from "@/components/three/registry";
import { ModelType } from "@/store/design-store";

interface ModelRendererProps extends ModelProps {
  model: ModelType;
}

export default function ModelRenderer({
  model,
  ...props
}: ModelRendererProps) {
  const Model = MODEL_REGISTRY[model];

  if (!Model) {
    console.warn(`Model "${model}" tidak terdaftar`);
    return null;
  }

  return <Model {...props} />;
}
