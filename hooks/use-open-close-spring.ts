import { useSpring } from "@react-spring/three";

export function useOpenCloseSpring(openClose: number) {
  const { progress } = useSpring({
    progress: openClose,
    config: { mass: 1, tension: 260, friction: 18 },
  });
  return {
    // shipping model
    top: {
      normal: progress.to([0, 0.85, 1], [0, 0, -Math.PI / 2]),
      small: progress.to([0, 0.7, 0.85, 1], [0, 0, -Math.PI / 2, -Math.PI / 2]),
    },
    bottom: {
      normal: progress.to([0, 0.55, 0.7, 1], [0, 0, Math.PI / 2, Math.PI / 2]),
      small: progress.to([0, 0.4, 0.55, 1], [0, 0, Math.PI / 2, Math.PI / 2]),
    },
    side: progress.to([0, 0.4, 1], [0, Math.PI / 2, Math.PI / 2]),
    fixed: progress.to(
      [0, 0.4, 1],
      [Math.PI, (Math.PI / 2) * 0.9, (Math.PI / 2) * 0.9],
    ),
    // shopping model
    atas: progress.to([0, 0.1, 1], [0, -Math.PI, -Math.PI*0.99]),
    balik: progress.to([0, 0.1, 0.4, 1], [0, 0, -Math.PI / 2, -Math.PI / 2]),
    samping: progress.to([0, 0.1, 0.4, 1], [0, 0, Math.PI / 2, Math.PI / 2]),
    bawah: {
      awal: progress.to([0, 0.4, 0.6, 1], [0, 0, Math.PI / 2, Math.PI*1.05 / 2]),
      akhirf: progress.to([0, 0.6, 0.8, 1], [0, 0, Math.PI / 2, Math.PI / 2]),
      akhirb: progress.to([0, 0.8, 1, 1], [0, 0, Math.PI / 2, Math.PI / 2]),
      akhirbx: progress.to([0, 0.7, 0.8, 1], [0, 0, Math.PI, Math.PI*0.99]),
      akhirfx: progress.to([0, 0.6, 0.7, 1], [0, 0, Math.PI, Math.PI*0.99]),
    },
    // mailer model
    // monet: progress.to([0, 0.1, 1], [0, Math.PI/2, Math.PI/2]),
    // moneb: progress.to([0, 0.1, 1], [0, -Math.PI/2, -Math.PI/2]),
    // mleft: progress.to([0, 0.1, 0.2, 1], [0, 0, -Math.PI/2, -Math.PI/2]),
    // mright: progress.to([0, 0.1, 0.2, 1], [0, 0, Math.PI/2, Math.PI/2]),
    // mtop: progress.to([0, 0.2, 0.3, 1], [0, 0, Math.PI/2, Math.PI/2]),
    // mbtm: progress.to([0, 0.3, 0.4, 1], [0, 0, -Math.PI/2, -Math.PI/2]),
    // mbridge: progress.to([0, 0.3, 0.4, 1], [0, 0, -Math.PI/2, -Math.PI/2]),
    // mextra: progress.to([0, 0.4, 0.5, 1], [0, 0, -Math.PI/2, -Math.PI/2]),
    // mfront: progress.to([0, 0.5, 0.8, 1], [0, 0, Math.PI/2, Math.PI/2]),
    // mf: progress.to([0, 0.5, 0.6, 1], [0, 0, Math.PI/2, Math.PI/2]),
    monet: progress.to([0, 0.1, 1], [0, -Math.PI/2, -Math.PI/2]),
    mright: progress.to([0, 0.1, 0.2, 1], [0, 0, -Math.PI/2, -Math.PI/2]),
    mtop: progress.to([0, 0.2, 0.3, 1], [0, 0, -Math.PI/2, -Math.PI/2]),
    mfront: progress.to([0, 0.5, 0.8, 1], [0, 0, -Math.PI/2, -Math.PI/2]),
    mf: progress.to([0, 0.5, 0.6, 1], [0, 0, -Math.PI/2, -Math.PI/2]),

    moneb: progress.to([0, 0.1, 1], [0, Math.PI/2, Math.PI/2]),
    mleft: progress.to([0, 0.1, 0.2, 1], [0, 0, Math.PI/2, Math.PI/2]),
    mbtm: progress.to([0, 0.3, 0.4, 1], [0, 0, Math.PI/2, Math.PI/2]),
    mbridge: progress.to([0, 0.3, 0.4, 1], [0, 0, Math.PI/2, Math.PI/2]),
    mextra: progress.to([0, 0.4, 0.5, 1], [0, 0, Math.PI/2, Math.PI/2*1.01]),
  };
}
