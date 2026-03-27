// src/data/products.js

const imageKeywords = [
  "mechanical keyboard",
  "gaming mouse",
  "wireless headphones",
  "computer monitor",
  "usb c hub",
  "external ssd",
  "bluetooth speaker",
  "smartwatch",
  "wireless earbuds",
  "webcam",
  "laptop stand",
  "power bank",
  "router",
  "graphics tablet",
  "desk lamp",
  "microphone",
  "portable hard drive",
  "gaming controller",
  "vr headset",
  "soundbar"
];

const products = Array.from({ length: 100 }, (_, i) => {
  const id = i + 1;
  const keyword = imageKeywords[i % imageKeywords.length];

  const quantity =
    id % 8 === 0 ? 0 :
    id % 5 === 0 ? 4 :
    Math.floor(Math.random() * 40) + 15;

  return {
    id,
    name: `${keyword
      .split(" ")
      .map(w => w[0].toUpperCase() + w.slice(1))
      .join(" ")} ${id}`,
    price: 1499 + id * 53,
    description: `Premium ${keyword} designed for performance, durability, and daily use.`,
image: `https://picsum.photos/400/400?random=${Math.random()}`,

    availability: {
      quantity,
      status:
        quantity === 0
          ? "out_of_stock"
          : quantity <= 10
          ? "limited"
          : "in_stock",
      delivery:
        quantity === 0
          ? null
          : quantity <= 10
          ? "Ships in 48 hours"
          : "Ships in 24 hours"
    }
  };
});

export default products;
