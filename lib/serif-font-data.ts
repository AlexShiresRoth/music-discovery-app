export async function getSerifFontData() {
  return fetch(
    "https://fonts.gstatic.com/s/librebaskerville/v24/kmKUZrc3Hgbbcjq75U4uslyuy4kn0olVQ-LglH6T17ujFgkSCQ.ttf",
  ).then((res) => res.arrayBuffer());
}
