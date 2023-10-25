/** Collection of utility functions. */
export class Utils {
  /** Creates a Guid.
   * @returns A new Guid.
   */
  static guid(): /* () => */ string {
    var tS4 = function () {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    };

    return tS4() + tS4() + '-' + tS4() + '-' + tS4() + '-' + tS4() + '-' + tS4() + tS4() + tS4();
  }

  /** Shift the items in an array by shift (positive integer) */
  static cycle<Type>(arr: Type[], shift: number) {
    var tReturn = arr.slice(0);
    for (var tI = 0; tI < shift; tI++) {
      var tmp = tReturn.shift();
      if (tmp) {
        tReturn.push(tmp);
      }
    }
    return tReturn;
  }

  /** Remove value from array, if it is present */
  static removeValue<Type>(array: Type[], value: Type) {
    for (var tI = array.length - 1; tI >= 0; tI--) {
      if (array[tI] === value) {
        array.splice(tI, 1);
      }
    }
  }

  /** Checks if value is in array */
  static hasValue<Type>(array: Type[], value: Type): boolean {
    for (var tI = 0; tI < array.length; tI++) {
      if (array[tI] === value) {
        return true;
      }
    }
    return false;
  }

  static hasProperty<X extends {}, Y extends PropertyKey>(obj: X, prop: Y): boolean {
    return Object.prototype.hasOwnProperty.call(obj, prop);
  }
}
