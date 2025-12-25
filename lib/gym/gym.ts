// lib/gym/gyms.ts
export const gyms = {
  azliv: {
    name: "AZLIV GYM",
    allowedProducts: ["fitglove-pro"],
  },
  testgym: {
    name: "Test Gym",
    allowedProducts: [],
  },
};

export function getGym(gymId: string) {
  return gyms[gymId];
}
