"use client";
import { Size, useDesignStore, type ModelType } from "@/store/design-store";
import { cn } from "@/lib/utils";
import { BoxModel, useBoxModels, useGramasi, useMaterials } from "@/lib/swr";
import { useEffect, useState } from "react";
// const models: {id_bm:string; id: ModelType; name: string; desc: string; size: Size }[] = [
//   {
//     id_bm: "2",
//     id: "shipping",
//     name: "Shipping Box",
//     desc: "Box pengiriman",
//     size: { length: 20, width: 15, height: 10, depth: 0.3 },
//   },
//   {
//     id_bm: "10",
//     id: "shopping",
//     name: "Shopping Box",
//     desc: "Box belanja",
//     size: { length: 22, width: 8, height: 28, depth: 0.2 },
//   },
//   {
//     id_bm: "19",
//     id: "mailer",
//     name: "Mailer Box",
//     desc: "Box pengiriman",
//     size: { length: 30.5, width: 20.55, height: 5.05, depth: 0.3 },
//   },
//   // {
//   //   id: "shoe",
//   //   name: "Shoe Box",
//   //   desc: "Box sepatu",
//   //   size: { length: 31, width: 18, height: 11, depth: 0.2 },
//   // },
//   // {
//   //   id: "tuckend",
//   //   name: "Tuck End Box",
//   //   desc: "Box tutup atas-bawah (produk umum)",
//   //   size: { length: 18, width: 12, height: 9, depth: 0.25 },
//   // },
//   // {
//   //   id: "sleeve",
//   //   name: "Sleeve Box",
//   //   desc: "Box dengan sleeve geser",
//   //   size: { length: 24, width: 18, height: 12, depth: 0.4 },
//   // },
// ];
export function ModelSelector() {
  const { boxModels, loading } = useBoxModels();
  const model = useDesignStore((s) => s.model);
  const setModel = useDesignStore((s) => s.setModel);
  const material = useDesignStore((s) => s.material);
  const setMaterial = useDesignStore((s) => s.setMaterial);
  const setGramasi = useDesignStore((s) => s.setGramasi);
  const serverModel = useDesignStore((s) => s.serverModel);
  const setServerModel = useDesignStore((s) => s.setServerModel);
  const setMaterials = useDesignStore((s) => s.setMaterials);
  const setSize = useDesignStore((s) => s.setSize);
  const setEmptyFaceColors = useDesignStore((s) => s.setEmptyFaceColors);
  const handleModelChange = (m: BoxModel) => {
    setModel(m.id);
    setServerModel(m);
    setSize(m.size);
    setEmptyFaceColors();
  };
  useEffect(() => {
    if (boxModels.length > 0 && !model) {
      const defaultModel =
        boxModels.find((m) => m.id === "shipping") ?? boxModels[0];
      handleModelChange(defaultModel);
    }
  }, [boxModels]);
  const { materialList } = useMaterials(serverModel?.id_bm ?? "10");
  useEffect(() => {
    if (materialList.length === 0) return;
    setMaterials(materialList);
    setMaterial("inner", materialList[0].id);
    setMaterial("outer", materialList[0].id);
  }, [materialList]);
  const { gramasiList } = useGramasi(material["outer"].id);
  useEffect(() => {
    if (gramasiList.length === 0) return;
    const first = gramasiList[0];
    setGramasi("inner", first.gsm);
    setGramasi("outer", first.gsm);
  }, [gramasiList]);
  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        {boxModels.map((m) => (
          <button
            key={m.id_bm}
            onClick={() => handleModelChange(m)}
            className={cn(
              "rounded-md border border-border p-3 text-left hover:bg-accent focus:outline-none",
              model === m.id && "ring-2 ring-ring",
            )}
          >
            <div className="font-medium">{m.name}</div>
            <div className="text-xs text-muted-foreground">{m.description}</div>
          </button>
        ))}
      </div>
      <div className="text-xs text-muted-foreground">
        {"Pilih model box. Atur Sisi Dalam/Luar di toolbar preview 2D."}
      </div>
    </div>
  );
}
