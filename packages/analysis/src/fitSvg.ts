import { JSDOM } from 'jsdom';
import bounds from 'svg-path-bounds';

type Matrix = { a: number; b: number; c: number; d: number; e: number; f: number };
const identity: Matrix = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };

function parseTransform(str: string | null): Matrix {
  if (!str) return { ...identity };
  const m = { ...identity };
  const translate = /translate\(([^)]+)\)/.exec(str);
  if (translate) {
    const [tx, ty] = translate[1].split(/[ ,]+/).map(Number);
    m.e = tx;
    m.f = ty || 0;
  }
  const scale = /scale\(([^)]+)\)/.exec(str);
  if (scale) {
    const parts = scale[1].split(/[ ,]+/).map(Number);
    m.a = parts[0];
    m.d = parts.length > 1 ? parts[1] : parts[0];
  }
  return m;
}

function multiply(a: Matrix, b: Matrix): Matrix {
  return {
    a: a.a * b.a + a.c * b.b,
    b: a.b * b.a + a.d * b.b,
    c: a.a * b.c + a.c * b.d,
    d: a.b * b.c + a.d * b.d,
    e: a.a * b.e + a.c * b.f + a.e,
    f: a.b * b.e + a.d * b.f + a.f,
  };
}

function apply(m: Matrix, x: number, y: number): [number, number] {
  return [x * m.a + y * m.c + m.e, x * m.b + y * m.d + m.f];
}

function computeBounds(el: Element, matrix: Matrix = identity): [number, number, number, number] {
  const transform = el.getAttribute('transform');
  const localMatrix = multiply(matrix, parseTransform(transform));

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  const update = (x1: number, y1: number, x2: number, y2: number) => {
    if (!isFinite(x1) || !isFinite(y1) || !isFinite(x2) || !isFinite(y2)) return;
    if (x1 < minX) minX = x1;
    if (y1 < minY) minY = y1;
    if (x2 > maxX) maxX = x2;
    if (y2 > maxY) maxY = y2;
  };

  const tag = el.tagName.toLowerCase();
  const attr = (name: string) => parseFloat((el.getAttribute(name) || '0').trim());

  switch (tag) {
    case 'rect': {
      const p1 = apply(localMatrix, attr('x'), attr('y'));
      const p2 = apply(localMatrix, attr('x') + attr('width'), attr('y') + attr('height'));
      update(Math.min(p1[0], p2[0]), Math.min(p1[1], p2[1]), Math.max(p1[0], p2[0]), Math.max(p1[1], p2[1]));
      break;
    }
    case 'circle': {
      const c = apply(localMatrix, attr('cx'), attr('cy'));
      const rX = attr('r') * localMatrix.a;
      const rY = attr('r') * localMatrix.d;
      update(c[0] - rX, c[1] - rY, c[0] + rX, c[1] + rY);
      break;
    }
    case 'ellipse': {
      const c = apply(localMatrix, attr('cx'), attr('cy'));
      const rX = attr('rx') * localMatrix.a;
      const rY = attr('ry') * localMatrix.d;
      update(c[0] - rX, c[1] - rY, c[0] + rX, c[1] + rY);
      break;
    }
    case 'line': {
      const p1 = apply(localMatrix, attr('x1'), attr('y1'));
      const p2 = apply(localMatrix, attr('x2'), attr('y2'));
      update(Math.min(p1[0], p2[0]), Math.min(p1[1], p2[1]), Math.max(p1[0], p2[0]), Math.max(p1[1], p2[1]));
      break;
    }
    case 'polygon':
    case 'polyline': {
      const points = (el.getAttribute('points') || '').trim().split(/\s+/).map(p => p.split(',').map(Number));
      points.forEach(([x,y]) => {
        const [tx, ty] = apply(localMatrix, x, y);
        update(tx, ty, tx, ty);
      });
      break;
    }
    case 'path': {
      const d = el.getAttribute('d');
      if (d) {
        let [x1, y1, x2, y2] = bounds(d);
        const p1 = apply(localMatrix, x1, y1);
        const p2 = apply(localMatrix, x2, y2);
        update(Math.min(p1[0], p2[0]), Math.min(p1[1], p2[1]), Math.max(p1[0], p2[0]), Math.max(p1[1], p2[1]));
      }
      break;
    }
    default:
      break;
  }

  Array.from(el.children).forEach(child => {
    const [cminX, cminY, cmaxX, cmaxY] = computeBounds(child as Element, localMatrix);
    update(cminX, cminY, cmaxX, cmaxY);
  });

  if (minX === Infinity) return [0, 0, 0, 0];
  return [minX, minY, maxX, maxY];
}

export function fitSvgToViewBox(svg: string, viewport = 200): string {
  const dom = new JSDOM(svg, { contentType: 'image/svg+xml' });
  const document = dom.window.document;
  const svgEl = document.querySelector('svg');
  if (!svgEl) {
    throw new Error('No <svg> element found');
  }

  const [minX, minY, maxX, maxY] = computeBounds(svgEl);
  const width = maxX - minX || 1;
  const height = maxY - minY || 1;

  svgEl.setAttribute('viewBox', `${minX} ${minY} ${width} ${height}`);
  svgEl.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svgEl.removeAttribute('width');
  svgEl.removeAttribute('height');
  svgEl.setAttribute('style', `max-width:${viewport}px; max-height:${viewport}px`);

  return svgEl.outerHTML;
}
