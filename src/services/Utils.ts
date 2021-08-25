export class Utils {
  static groupBy<T, K>(arr: T[], keyFunc: (arrayElement: T) => K): Map<K, T[]> {
    const grouped = new Map();
    for (const el of arr) {
      const key = keyFunc(el);
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key).push(el);
    }
    return grouped;
  }

  static aggregateMap<T, K, A>(map: Map<K, T[]>, aggregateFunc: (values: T[]) => A): Map<K, A> {
    const newMap = new Map();
    map.forEach((value, key) => newMap.set(key, aggregateFunc(value)));
    return newMap;
  }

  static minBy<T>(element1: T, element2: T, byFunc: (element: T) => number) {
    if (byFunc(element1) < byFunc(element2)) {
      return element1;
    } else {
      return element2;
    }
  }

  static maxBy<T>(element1: T, element2: T, byFunc: (element: T) => number) {
    if (byFunc(element1) > byFunc(element2)) {
      return element1;
    } else {
      return element2;
    }
  }

  static trimBy<T>(arr: T[], isBlankFunc: (element: T) => boolean): T[] {
    let trimmedStart = Utils.trimStartBy(arr, isBlankFunc);
    return Utils.trimEndBy(trimmedStart, isBlankFunc);
  }

  static trimStartBy<T>(arr: T[], isBlankFunc: (element: T) => boolean): T[] {
    let start = 0;
    let end = arr.length;
    for (; start < arr.length; start++) {
      if (!isBlankFunc(arr[start])) {
        break;
      }
    }
    return arr.slice(start, end);
  }

  static trimEndBy<T>(arr: T[], isBlankFunc: (element: T) => boolean): T[] {
    let start = 0;
    let end = arr.length;
    for (; end >= 0; end--) {
      if (!isBlankFunc(arr[end - 1])) {
        break;
      }
    }
    return arr.slice(start, end);
  }

  static getRandomColorCode(): string {
    return '#' + Math.floor(Math.random() * (16 ** 6 - 1)).toString(16);
  }
}
