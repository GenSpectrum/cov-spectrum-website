export type VennIntersectionsResult = {
  indicesOfSets: number[];
  values: string[];
}[];

export function vennIntersections(...sets: string[][]): VennIntersectionsResult {
  // This map stores for each value the indices of the sets that contain the value.
  // A set will be represented by its index in the "sets" list.
  const valuesToSetsMap = new Map<string, number[]>();
  for (let i = 0; i < sets.length; i++) {
    const set = sets[i];
    for (let value of set) {
      if (!valuesToSetsMap.has(value)) {
        valuesToSetsMap.set(value, []);
      }
      valuesToSetsMap.get(value)!.push(i);
    }
  }

  // This map stores for each combination of sets (e.g., set 0, 2 and 3) the values that are in those and only those
  // sets (e.g., values "a" and "b" are in the sets 0, 2, and 3; and are not in any other sets). The map uses as key
  // a string which is a comma-separated and sorted list of the sets (e.g., "0,2,3").
  const setsToValuesMap = new Map<string, string[]>();
  const getKey = (_sets: number[]) => _sets.sort().join(',');
  const keyToValues = (key: string) => key.split(',').map(x => Number.parseInt(x));
  for (let [value, _sets] of valuesToSetsMap) {
    const key = getKey(_sets);
    if (!setsToValuesMap.has(key)) {
      setsToValuesMap.set(key, []);
    }
    setsToValuesMap.get(key)!.push(value);
  }

  // Construct final result object
  const result: VennIntersectionsResult = [];
  for (let [_sets, values] of setsToValuesMap) {
    result.push({
      indicesOfSets: keyToValues(_sets),
      values,
    });
  }
  return result;
}
