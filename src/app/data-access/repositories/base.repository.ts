import { map } from 'rxjs/operators';
import {Observable, OperatorFunction} from 'rxjs';

/**
 * Tiny helpers to map DTO <-> Model in streams.
 */
export const mapOne =
  <D, M>(fromDto: (d: D) => M) =>
    (src$: Observable<D>): Observable<M> =>
      src$.pipe(map(fromDto));

export const mapMany =
  <D, M>(fromDto: (d: D) => M) =>
    (src$: Observable<D[]>): Observable<M[]> =>
      src$.pipe(map(arr => arr.map(fromDto)));

export function mapList<DTO, MODEL>(
  mapper: (dto: DTO) => MODEL
): OperatorFunction<DTO[], MODEL[]> {
  return map((arr) => (arr ?? []).map(mapper));}
