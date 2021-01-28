export class Utils {
  static groupBy(arr, keyFunc) {
    if (!arr) {
      return null;
    }
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


  static minBy(element1, element2, byFunc) {
    if (byFunc(element1) < byFunc(element2)) {
      return element1;
    } else {
      return element2;
    }
  }


  static maxBy(element1, element2, byFunc) {
    if (byFunc(element1) > byFunc(element2)) {
      return element1;
    } else {
      return element2;
    }
  }
}
