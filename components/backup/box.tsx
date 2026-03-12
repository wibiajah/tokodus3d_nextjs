"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { a, SpringValue, useSpring } from "@react-spring/three";
import * as THREE from "three";
import {
  TextureItem,
  useDesignStore,
} from "@/store/design-store";
import { BoxFlap, ExtrudeBoxFlap, FixedBoxFlap } from "../design/flap-3d";

interface CorrugatedBoxProps {
  l: number; // length
  w: number; // width
  h: number; // height
  t: number; // thickness of the box material
  boxColor: string;
  openClose: number; // 0 = closed, 1 = fully open
}

export default function CorrugatedBox({
  l,
  w,
  h,
  t,
  boxColor,
  openClose,
}: CorrugatedBoxProps) {
  const textures = useDesignStore((s) => s.textures);
  const fixedFlap = useDesignStore((s) => s.fixedFlap);
  const multi = 100;
  const fx = fixedFlap / multi;
  const s = Math.min(l, w);
  const textureMap = useMemo(() => {
    const map: Record<string, TextureItem[]> = {};

    textures.forEach((t) => {
      if (!map[t.id]) {
        map[t.id] = []; // buat array baru jika belum ada
      }
      map[t.id].push(t); // tambahkan texture
    });

    return map;
  }, [textures]);

  const { progress } = useSpring({
    progress: openClose,
    config: { mass: 1, tension: 260, friction: 18 },
  });

  const topRot = progress.to([0, 0.85, 1], [0, 0, -Math.PI / 2]);
  const topRotSm = progress.to(
    [0, 0.7, 0.85, 1],
    [0, 0, -Math.PI / 2, -Math.PI / 2]
  );

  // bottomRot mencapai 0 lebih cepat (di progress 0.7 sudah close)
  const bottomRot = progress.to(
    [0, 0.55, 0.7, 1],
    [0, 0, Math.PI / 2, Math.PI / 2]
  );
  const bottomRotSm = progress.to(
    [0, 0.4, 0.55, 1],
    [0, 0, Math.PI / 2, Math.PI / 2]
  );

  const sideRot = progress.to([0, 0.4, 1], [0, Math.PI / 2, Math.PI / 2]);
  const fixedRot = progress.to(
    [0, 0.4, 1],
    [Math.PI, Math.PI / 2, (Math.PI / 2) * 0.9]
  );

  const nh = h - t * 2;
  const ns = s + t * 2;
  const commonProps = { t, c: boxColor };

  return (
    <a.group position={[0, 0, s / 2]}>
      {/* fixed flap */}
      <FixedBoxFlap
        // w={fx+t/2}
        w={fx+t/2}
        h={h}
        p={[-l / 2, 0, 0]}
        // o={[(fx+t/2) / 2, 0, 0]}// kalau dilogika
        o={[(fx+t/4) / 2, 0, 0]}// anehnya justru ini yg benar
        ry={fixedRot}
        mry={Math.PI}
        ti={textureMap["fixed"]}
        {...commonProps}
      />
      {/* Panel Belakang */}
      {/* <BoxFlap w={l} h={h} f={"back"} {...commonProps} /> */}
      <ExtrudeBoxFlap
        hingeCover
        w={l}
        h={h}
        f={"back"}
        ti={textureMap["back"]}
        {...commonProps}
      />
      {/* Top Flap - Belakang */}
      <ExtrudeBoxFlap
        w={l}
        h={s / 2}
        p={[0, h / 2, 0]}
        o={[0, s / 4, 0]}
        rx={w >= l ? topRotSm : topRot}
        f={"back_top"}
        ti={textureMap["back_top"]}
        model="flap"
        {...commonProps}
      />
      {/* Bottom Flap - Belakang */}
      <ExtrudeBoxFlap
        w={l}
        h={s / 2}
        p={[0, -h / 2, 0]}
        o={[0, -s / 4, 0]}
        rx={w >= l ? bottomRotSm : bottomRot}
        f={"back_bottom"}
        ti={textureMap["back_bottom"]}
        model="flap"
        {...commonProps}
      />

      {/* Panel Kanan */}
      <a.group position={[l / 2, 0, 0]} rotation-y={sideRot}>
        {/* <BoxFlap w={w} h={h} o={[w / 2, 0, 0]} f={"right"} {...commonProps} /> */}
        <ExtrudeBoxFlap
          w={w}
          h={h}
          o={[w / 2, 0, 0]}
          f={"right"}
          hingeCover
          model="middle2"
          ti={textureMap["right"]}
          {...commonProps}
        />
        {/* Top Flap - Kanan */}
        <ExtrudeBoxFlap
          w={w}
          h={s / 2}
          p={[w / 2, nh / 2, 0]}
          o={[0, ns / 4, 0]}
          rx={w >= l ? topRot : topRotSm}
          f={"right_top"}
          model="flapucrop"
          ti={textureMap["right_top"]}
          {...commonProps}
        />
        {/* Bottom Flap - Kanan */}
        <ExtrudeBoxFlap
          w={w}
          h={s / 2}
          p={[w / 2, -nh / 2, 0]}
          o={[0, -ns / 4, 0]}
          rx={w >= l ? bottomRot : bottomRotSm}
          f={"right_bottom"}
          model="flapucropr"
          ti={textureMap["right_bottom"]}
          {...commonProps}
        />
        <a.group position={[w, 0, 0]} rotation-y={sideRot}>
          {/* Panel Depan */}
          {/* <BoxFlap w={l} h={h} o={[l / 2, 0, 0]} f={"front"} {...commonProps} /> */}
          <ExtrudeBoxFlap
            w={l}
            h={h}
            o={[l / 2, 0, 0]}
            f={"front"}
            hingeCover
            ti={textureMap["front"]}
            {...commonProps}
          />
          {/* Top Flap - Depan */}
          <ExtrudeBoxFlap
            w={l}
            h={s / 2}
            p={[l / 2, h / 2, 0]}
            o={[0, s / 4, 0]}
            rx={w >= l ? topRotSm : topRot}
            f={"front_top"}
            ti={textureMap["front_top"]}
            model="flap"
            {...commonProps}
          />
          {/* Bottom Flap - Depan */}
          <ExtrudeBoxFlap
            w={l}
            h={s / 2}
            p={[l / 2, -h / 2, 0]}
            o={[0, -s / 4, 0]}
            rx={w >= l ? bottomRotSm : bottomRot}
            f={"front_bottom"}
            ti={textureMap["front_bottom"]}
            model="flap"
            {...commonProps}
          />
          <a.group position={[l, 0, 0]} rotation-y={sideRot}>
            {/* Panel Kiri */}
            {/* <BoxFlap
              w={w}
              h={h}
              o={[w / 2, 0, 0]}
              f={"left"}
              {...commonProps}
              /> */}
            <ExtrudeBoxFlap
              w={w}
              h={h}
              o={[w / 2, 0, 0]}
              f={"left"}
              hingeCover
              model="middle2"
              ti={textureMap["left"]}
              {...commonProps}
            />
            {/* Top Flap - Kiri */}
            <ExtrudeBoxFlap
              w={w}
              h={s / 2}
              p={[w / 2, nh / 2, 0]}
              o={[0, ns / 4, 0]}
              rx={w >= l ? topRot : topRotSm}
              f={"left_top"}
              model="flapucrop"
              ti={textureMap["left_top"]}
              {...commonProps}
            />
            {/* Bottom Flap - Kiri */}
            <ExtrudeBoxFlap
              w={w}
              h={s / 2}
              p={[w / 2, -nh / 2, 0]}
              o={[0, -ns / 4, 0]}
              rx={w >= l ? bottomRot : bottomRotSm}
              f={"left_bottom"}
              model="flapucropr"
              ti={textureMap["left_bottom"]}
              {...commonProps}
            />
          </a.group>
        </a.group>
      </a.group>
    </a.group>
  );
}
