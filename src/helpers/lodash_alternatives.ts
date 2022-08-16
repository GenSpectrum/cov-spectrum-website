/*
sortBy(collection, [iteratees=[_.identity]])
Native alternative for the lodash sortBy function: https://www.npmjs.com/package/lodash.sortby
Sorts an array of elements in ascending order by the results of running each element 
in a collection through each iteratee. This method  preserves the original sort order of equal elements. 
The iteratees are invoked with one argument: (value).
Unlike the lodash version, this implementation modifies the given array.
*/
export const sortBy = (key: string) => {
  return (a: any, b: any) => (a[key] > b[key] ? 1 : b[key] > a[key] ? -1 : 0);
};

/*
Native alternative for the lodash mean function: https://lodash.com/docs/4.17.15#mean
Computes the mean of the values in array.
*/
export const mean = (array: number[]) => array.reduce((a, b) => a + b) / array.length;

/*
pullAll(array, values)
Native alternative for the lodash pullAll function: https://lodash.com/docs/4.17.15#pullAll
Accepts an array of values to remove from an array.
Unlike lodash, where the function mutates the array, this implementation creates and returns its copy. 
*/
export const pullAll = (a: any[], b: any[]) => {
  let itemsToDeleteSet = new Set([...b]);
  return [...a].filter(item => {
    return !itemsToDeleteSet.has(item);
  });
};

/*
Native alternative for the lodash times function: https://lodash.com/docs/4.17.15#times
Invokes the iteratee n times, 
returning an array of the results of each invocation. 
*/
export const times = (n: number, callback: Function) => {
  return [...Array(n)].map(() => {
    return callback();
  });
};

/*
Native alternative for the lodash shuffle function: https://lodash.com/docs/4.17.15#shuffle
Creates an array of shuffled values of the given array. 
The function shuffles the indexes using the js Math.random(),
 while the lodash version uses the Fisher-Yates shuffle.
*/
export function shuffle(inputArray: any[]) {
  let array = [...inputArray];
  let currentIndex = array.length;
  let randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

/*
A native alternative for the lodash random function: https://lodash.com/docs/4.17.15#random
Produces a random number between two parameter values: the inclusive lower and upper bounds.
*/
export const random = (a = 1, b = 0) => {
  const lower = Math.ceil(Math.min(a, b));
  const upper = Math.floor(Math.max(a, b));
  return Math.floor(lower + Math.random() * (upper - lower + 1));
};

/*
https://lodash.com/docs/4.17.15#capitalize
Converts the first character of string to upper case and the remaining to lower case.
*/

export const capitalize = (string: string) => {
  return string ? string.charAt(0).toUpperCase() + string.slice(1).toLowerCase() : '';
};

/* TODO: Comment */
export const mapValues = (
  obj: any,
  callback: Function = (value: any) => {
    return value;
  }
) => {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => {
      return [key, callback(value)];
    })
  );
};

/* 
A recursive function for a deep comparison of two objects.
The compared objects can contain nested structures 
like other objects and arrays with strings, 
numbers and booleans. 
*/
export const isEqual = (first: any, second: any) => {
  /* Checking if the two arguments are the strictly equal. */
  if (first === second) return true;

  /* Checking if any arguments are null */
  if (first === null || second === null) return false;

  /* Checking if any argument is none object */
  if (typeof first !== 'object' || typeof second !== 'object') return false;

  /* Using Object.getOwnPropertyNames() method to return the list of the objects’ properties */
  let first_keys = Object.getOwnPropertyNames(first);
  let second_keys = Object.getOwnPropertyNames(second);

  /* Checking if the objects' length are same*/
  if (first_keys.length !== second_keys.length) return false;

  /* Iterating through all the properties of the first object */
  for (let key of first_keys) {
    /* Making sure that every property in the first object also exists in second object. */
    if (!second.hasOwnProperty(key)) return false;

    /* Using the function recursively  and passing 
      the values of each property into it to check if they are equal. */
    if (isEqual(first[key], second[key]) === false) return false;
  }
  /* if no case matches, returning true */
  return true;
};
