/* Utilidades de fecha/tiempo (sin dependencias)
 * Locale por defecto: es-PE
 */

const DEFAULT_LOCALE = 'es-PE';

// ---------- Parseo y normalización ----------

/** Convierte cualquier input válido a Date. Si falla, retorna null. */
export function toDate(input: Date | string | number | null | undefined): Date | null {
  if (input == null) return null;
  if (input instanceof Date && !isNaN(+input)) return new Date(input.getTime());
  const d = new Date(input as any);
  return isNaN(+d) ? null : d;
}

/** ISO extendido (UTC) sin milisegundos. Ej: 2025-10-29T15:03:00Z */
export function toISO(dt: Date | string | number): string {
  const d = toDate(dt);
  if (!d) return '';
  return new Date(d.getTime() - d.getMilliseconds()).toISOString().replace(/\.\d{3}Z$/, 'Z');
}

/** Solo fecha en ISO local (YYYY-MM-DD) usando zona local. */
export function toISODateLocal(dt: Date | string | number): string {
  const d = toDate(dt);
  if (!d) return '';
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// ---------- Operaciones básicas ----------

export function startOfDay(dt: Date | string | number): Date | null {
  const d = toDate(dt);
  if (!d) return null;
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}

export function endOfDay(dt: Date | string | number): Date | null {
  const d = toDate(dt);
  if (!d) return null;
  const r = new Date(d);
  r.setHours(23, 59, 59, 999);
  return r;
}

export function addDays(dt: Date | string | number, days: number): Date | null {
  const d = toDate(dt);
  if (!d) return null;
  const r = new Date(d);
  r.setDate(r.getDate() + days);
  return r;
}

export function diffInDays(a: Date | string | number, b: Date | string | number): number {
  const da = startOfDay(a);
  const db = startOfDay(b);
  if (!da || !db) return NaN;
  const MS = 24 * 60 * 60 * 1000;
  return Math.round((+da - +db) / MS);
}

export function isSameDay(a: Date | string | number, b: Date | string | number): boolean {
  const da = toDate(a), db = toDate(b);
  if (!da || !db) return false;
  return da.getFullYear() === db.getFullYear()
    && da.getMonth()   === db.getMonth()
    && da.getDate()    === db.getDate();
}

export function isBetween(
  target: Date | string | number,
  from: Date | string | number,
  to: Date | string | number,
  inclusive: 'both' | 'left' | 'right' | 'none' = 'both',
): boolean {
  const t = +toDate(target)!;
  const a = +toDate(from)!;
  const b = +toDate(to)!;
  if (isNaN(t) || isNaN(a) || isNaN(b)) return false;
  const min = Math.min(a, b);
  const max = Math.max(a, b);

  switch (inclusive) {
    case 'both':  return t >= min && t <= max;
    case 'left':  return t >= min && t <  max;
    case 'right': return t >  min && t <= max;
    default:      return t >  min && t <  max;
  }
}

/** Restringe una fecha al rango [min,max]. */
export function clampDate(
  dt: Date | string | number,
  min?: Date | string | number,
  max?: Date | string | number
): Date | null {
  const d = toDate(dt);
  if (!d) return null;
  const mi = min ? toDate(min)! : null;
  const ma = max ? toDate(max)! : null;
  if (mi && +d < +mi) return mi;
  if (ma && +d > +ma) return ma;
  return d;
}

// ---------- Formateo ----------

export function formatDate(
  dt: Date | string | number,
  locale: string = DEFAULT_LOCALE,
  opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' }
): string {
  const d = toDate(dt);
  return d ? new Intl.DateTimeFormat(locale, opts).format(d) : '';
}

export function formatDateTime(
  dt: Date | string | number,
  locale: string = DEFAULT_LOCALE,
  opts: Intl.DateTimeFormatOptions = {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }
): string {
  const d = toDate(dt);
  return d ? new Intl.DateTimeFormat(locale, opts).format(d) : '';
}

/** Ej.: “octubre 2025” o “Oct 2025” si `short=true`. */
export function formatMonth(
  dt: Date | string | number,
  locale: string = DEFAULT_LOCALE,
  short = false
): string {
  const d = toDate(dt);
  if (!d) return '';
  return new Intl.DateTimeFormat(locale, {
    month: short ? 'short' : 'long',
    year: 'numeric'
  }).format(d);
}

/** Tiempo relativo tipo “hace 3 h” / “en 2 días”. */
export function relativeTime(
  from: Date | string | number,
  to: Date | string | number = new Date(),
  locale: string = DEFAULT_LOCALE
): string {
  const a = toDate(from), b = toDate(to);
  if (!a || !b) return '';
  const diff = +a - +b;

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const DIVS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ['year',   365 * 24 * 60 * 60 * 1000],
    ['month',   30 * 24 * 60 * 60 * 1000],
    ['day',     24 * 60 * 60 * 1000],
    ['hour',     60 * 60 * 1000],
    ['minute',        60 * 1000],
    ['second',             1000],
  ];

  for (const [unit, ms] of DIVS) {
    const amt = Math.round(diff / ms);
    if (Math.abs(amt) >= 1) return rtf.format(amt, unit);
  }
  return rtf.format(0, 'second');
}

// ---------- Rangos y helpers ----------

/** Devuelve el rango del mes (inicio/fin). */
export function monthRange(dt: Date | string | number): { start: Date; end: Date } | null {
  const d = toDate(dt);
  if (!d) return null;
  const start = new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
  const end   = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

/** Crea una lista de fechas (solo día) entre [start,end], inclusive. */
export function eachDay(
  start: Date | string | number,
  end: Date | string | number
): Date[] {
  const s = startOfDay(start), e = startOfDay(end);
  if (!s || !e || +s > +e) return [];
  const out: Date[] = [];
  for (let d = new Date(s); +d <= +e; d.setDate(d.getDate() + 1)) {
    out.push(new Date(d));
  }
  return out;
}
