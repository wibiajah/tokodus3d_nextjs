// import { ImageItem, TextItem } from "@/store/design-store";
// import * as THREE from "three";
// import { FlapBounds, MockTextItem } from "./box";

// export function loadImage(src: string): Promise<HTMLImageElement> {
//   return new Promise((resolve) => {
//     const img = new Image();
//     img.crossOrigin = "anonymous"; // IMPORTANT if image is from server
//     img.onload = () => resolve(img);
//     img.src = src;
//   });
// }

// export function toTexture(
//   x: number,
//   y: number,
//   images: ImageItem[],
//   texts?: MockTextItem[]
// ) {
//   const canvas = document.createElement("canvas");
//   const multi = 1;
//   canvas.width = x * multi;
//   canvas.height = y * multi;
//   const ctx = canvas.getContext("2d");
//   if (!ctx) return null;
//   ctx.fillStyle = "white";
//   ctx.fillRect(0, 0, canvas.width, canvas.height);
//   if (texts && texts?.length > 0) {
//     texts.forEach((t: MockTextItem) => {
//       ctx.fillStyle = t.color;
//       ctx.font = `${t.fontSize}px Inter`;
//       ctx.textAlign = "center";
//       ctx.textBaseline = "middle";

//       // apply rotation di titik anchor (x,y)
//       // ctx.translate(t.x, t.y);
//       ctx.rotate((t.rotation * Math.PI) / 180);

//       ctx.fillText(t.text, t.x-15, t.y-20);
//     });
//   }
//   // ctx.fillStyle = "black";
//   // ctx.font = `${text.}px Arial`;
//   // ctx.textAlign = "center";
//   // ctx.textBaseline = "middle";
//   // ctx.fillText("HELLO WORLD", canvas.width / 2 - 100, canvas.height / 2);
//   const tex = new THREE.CanvasTexture(canvas);
//   if (images.length > 0) {
//     Promise.all(images.map((src) => loadImage(src.dataUrl))).then((imgs) => {
//       imgs.forEach((img, i) => {
//         const x = canvas.width / 2;
//         const y = canvas.height / 2 + 50;

//         ctx.drawImage(img, x, y, 600, 600);
//       });

//       tex.needsUpdate = true;
//     });
//   }
//   return tex;
// }
// export function groupTextsByFlap(
//   texts: TextItem[],
//   flapBounds: FlapBounds
// ): Record<string, TextItem[]> {
//   const result: Record<string, TextItem[]> = {};

//   // siapkan array kosong per flap
//   for (const flapName in flapBounds) {
//     result[flapName] = [];
//   }

//   // proses setiap text
//   for (const item of texts) {
//     let assigned = false;

//     for (const flapName in flapBounds) {
//       const { xMin, xMax, yMin, yMax } = flapBounds[flapName];

//       // Hitung area teks 
//       const textLeft = item.x; 
//       const textRight = item.x + item.width; 
//       const textTop = item.y; 
//       const textBottom = item.y + item.height;

//       const inside =
//         textRight >= xMin && textLeft <= xMax && textBottom >= yMin && textTop <= yMax;

//       if (inside) {
//         result[flapName].push(item);
//         assigned = true;
//         break;
//       }
//     }

//     // Jika tidak masuk flap mana pun
//     if (!assigned) {
//       if (!result["__unassigned"]) result["__unassigned"] = [];
//       result["__unassigned"].push(item);
//     }
//   }

//   return result;
// }
