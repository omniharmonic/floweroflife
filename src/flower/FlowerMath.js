export function axialDistance(q, r) {
  return (Math.abs(q) + Math.abs(r) + Math.abs(q + r)) / 2;
}

export function axialToCartesian(q, r, radius = 1) {
  return {
    x: radius * (q + r * 0.5),
    y: radius * (Math.sqrt(3) * 0.5 * r),
  };
}

export function generateFlowerCenters(ringCount = 2, radius = 1) {
  const rings = Math.max(1, Math.round(ringCount));
  const centers = [];

  for (let q = -rings; q <= rings; q += 1) {
    for (let r = -rings; r <= rings; r += 1) {
      if (axialDistance(q, r) <= rings) {
        centers.push({ q, r, ...axialToCartesian(q, r, radius) });
      }
    }
  }

  return centers.sort((a, b) => axialDistance(a.q, a.r) - axialDistance(b.q, b.r) || a.r - b.r || a.q - b.q);
}

export function normalizeScreenPoint(point, bounds) {
  if (!bounds.width || !bounds.height) {
    return { x: 0, y: 0 };
  }

  return {
    x: (point.x / bounds.width) * 2 - 1,
    y: 1 - (point.y / bounds.height) * 2,
  };
}

export function smoothPoint(previous, next, amount) {
  const t = Math.min(1, Math.max(0, amount));

  return {
    x: previous.x + (next.x - previous.x) * t,
    y: previous.y + (next.y - previous.y) * t,
  };
}
