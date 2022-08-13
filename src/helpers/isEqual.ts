/* 
A recursive function for a deep comparison of two objects.
The compared objects can contain nested structures 
like other objects and arrays with strings, 
numbers and booleans. 
*/

const isEqual = (first: any, second: any) => {
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
    if (!Object.hasOwn(second, key)) return false;

    /* Using the function recursively  and passing 
    the values of each property into it to check if they are equal. */
    if (isEqual(first[key], second[key]) === false) return false;
  }
  /* if no case matches, returning true */
  return true;
};

export default isEqual;
