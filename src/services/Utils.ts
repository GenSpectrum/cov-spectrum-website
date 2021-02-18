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
}
