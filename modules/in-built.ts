// in built captialize the first letter of the string
String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

/** Capitalize the first letter/character of a string */
export const capitalize = (string: string): string =>
  string.toString().capitalize();
