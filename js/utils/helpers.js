// js/utils/helpers.js
//
// Pequenos helpers de geometria/lógica sem DOM, hoje usados pelo
// radar hexagonal de "Gêneros favoritos" no DNA Musical do Perfil.

/** Limita um número entre min e max. */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Converte uma lista de { label, value } (value de 0 a 1) num polígono
 * regular (N eixos, um por item) pronto pra virar um <polygon points="">
 * de SVG — a mesma ideia de um radar chart, mas com N lados em vez de
 * um círculo, o que combina com a identidade de hexágono do Beebop
 * quando N = 6.
 */
export function buildRadarPoints(items, { centerX, centerY, radius }) {
  const step = (Math.PI * 2) / items.length;
  return items
    .map((item, index) => {
      // Começa no topo (-90°) e gira no sentido horário.
      const angle = index * step - Math.PI / 2;
      const r = radius * clamp(item.value, 0, 1);
      const x = centerX + r * Math.cos(angle);
      const y = centerY + r * Math.sin(angle);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

/** Mesmo ângulo/raio do radar, mas devolve pontos {x,y} (pra posicionar os rótulos). */
export function buildRadarLabelPositions(items, { centerX, centerY, radius }) {
  const step = (Math.PI * 2) / items.length;
  return items.map((item, index) => {
    const angle = index * step - Math.PI / 2;
    return {
      label: item.label,
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  });
}
