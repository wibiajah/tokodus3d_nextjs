import type { ComponentType } from "react";
import ShippingBox from "@/models/shipping/box";
import ShoppingBox from "@/models/shopping/box";
import { ModelType } from "@/store/design-store";
import MailerBox from "@/models/mailer/box";
// import MailerBox from "@/models/mailer/MailerBox";

export interface ModelProps {
  l: number;
  w: number;
  h: number;
  t: number;
  innerColor: string;
  outerColor: string;
  openClose: number;
}

export const MODEL_REGISTRY: Record<ModelType, ComponentType<ModelProps>> = {
  shipping: ShippingBox,
  shopping: ShoppingBox,
  mailer: MailerBox,
  shoe: ShoppingBox,
  tuckend: ShippingBox,
  sleeve: ShippingBox,
};
