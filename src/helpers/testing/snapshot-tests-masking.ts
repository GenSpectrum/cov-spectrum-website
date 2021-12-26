// Some external components draw from randomness and create non-deterministic output. The random parts have to be
// removed to make the snapshot tests work. This file contains common masking functions.

export function maskRegex(obj: any, regex: RegExp) {
  if (obj) {
    for (let [key, value] of Object.entries(obj)) {
      if (typeof value === 'string' || value instanceof String) {
        obj[key] = (value as string).replaceAll(regex, '***masked***');
      } else {
        maskRegex(value, regex);
      }
    }
  }
}

export function maskUuid(obj: any) {
  const uuidRegex = /[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}/gi;
  maskRegex(obj, uuidRegex);
}
