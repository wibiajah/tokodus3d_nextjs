export function useShippingGeometry(l: number, w: number, h: number, t: number) {
  const s = Math.min(l, w);
  return {
    hs: s / 2,
    qs: s/4,
    ht: t / 2,
    qt: t / 4,
    tqt: t * 3 / 4,
    hl: l / 2,
    hh: h / 2,
    hw: w / 2,
    s,
    nh: h - t * 2,
    qnh: (h - t * 2)/2,
    ns: s + t * 2,
    hmqt: h - t / 4,
    hmht: h - t / 2,
    wmht: w - t / 2,
    wmtqt: w - t *3/ 4,
    hhqt: (h + t/4) / 2,
  };
}
