// js/utils/formatters.js
//
// Formatação pura (sem DOM), reaproveitável por qualquer página.

/** 179414 (ms) -> "2:59" */
export function formatDuration(ms) {
  if (ms == null || Number.isNaN(ms)) return '--:--';
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

/** "2026-08-12T10:00:00Z" -> "12 de agosto de 2026" */
export function formatDate(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** 8.666 -> "8.7" (uma casa decimal; usado em notas/avaliações) */
export function formatRating(value) {
  if (value == null || Number.isNaN(value)) return null;
  return value.toFixed(1);
}
