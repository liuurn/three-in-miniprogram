// 来源于网络
export default function flip(pixels, w, h, c) {
  // handle Arrays
  if (Array.isArray(pixels)) {
    const result = flip(new Float64Array(pixels), w, h, c);
    for (let i = 0; i < pixels.length; i++) {
      pixels[i] = result[i];
    }
    return pixels;
  }

  if (!w || !h) throw Error("Bad dimensions");
  if (!c) c = pixels.length / (w * h);

  const h2 = h >> 1;
  const row = w * c;
  const Ctor = pixels.constructor;

  // make a temp buffer to hold one row
  const temp = new Ctor(w * c);
  for (let y = 0; y < h2; ++y) {
    const topOffset = y * row;
    const bottomOffset = (h - y - 1) * row;

    // make copy of a row on the top half
    temp.set(pixels.subarray(topOffset, topOffset + row));

    // copy a row from the bottom half to the top
    pixels.copyWithin(topOffset, bottomOffset, bottomOffset + row);

    // copy the copy of the top half row to the bottom half
    pixels.set(temp, bottomOffset);
  }

  return pixels;
}
