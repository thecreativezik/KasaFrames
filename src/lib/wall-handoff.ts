/**
 * Carries a photo of the visitor's wall from the home page into the
 * visualizer. It is held in memory for one client-side navigation, then taken
 * exactly once. It never leaves the browser, which is what the hero promises.
 */
let pending: File | null = null;

export function handOverWall(file: File) {
  pending = file;
}

export function takeHandedOverWall(): File | null {
  const file = pending;
  pending = null;
  return file;
}
