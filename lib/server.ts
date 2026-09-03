
export async function getAj() {
  if (!process.env.ARCJET_KEY) {
    return {
      protect: async () => ({
        isDenied: () => false,
        reason: { remaining: 100 },
      }),
    };
  }

  const { default: arcjet, tokenBucket } = await import("@arcjet/next");

  return arcjet({
    key: process.env.ARCJET_KEY,
    rules: [
      tokenBucket({
        mode: "LIVE",
        characteristics: ["userId"],
        refillRate: 10,
        interval: 86400,
        capacity: 20,
      }),
    ],
  });
}
