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


  static deepEqual(obj1, obj2) {
    // Adopted from https://stackoverflow.com/a/45683145
    if (obj1 === obj2) {
      return true;
    }

    if (Utils._isPrimitive(obj1) && Utils._isPrimitive(obj2)) {
      return obj1 === obj2;
    }

    if (Object.keys(obj1).length !== Object.keys(obj2).length) {
      return false;
    }
    for (let key in obj1) {
      if (!(key in obj2)) {
        return false;
      }
      if (!Utils.deepEqual(obj1[key], obj2[key])) {
        return false;
      }
    }
    return true;
  }


  static _isPrimitive(obj) {
    return (obj !== Object(obj));
  }
}
