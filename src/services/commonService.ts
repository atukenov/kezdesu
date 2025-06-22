// src/services/commonService.ts

/**
 * Recursively removes all undefined fields from an object or array.
 */
export function stripUndefinedFields<T>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map(stripUndefinedFields) as any;
  } else if (obj && typeof obj === "object") {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = stripUndefinedFields(value);
      }
      return acc;
    }, {} as any);
  }
  return obj;
}
