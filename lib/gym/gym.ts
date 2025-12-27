// lib/gym/gym.ts

export type Gym = {
  id: string
  name: string

   /** このジムで販売してよい商品ハンドル */
  allowedProducts: string[]

  /** このジムは「ジム受取」を許可しているか */
  allowGymPickup: boolean
}

export const gyms: Record<string, Gym> = {
  azliv: {
    id: 'azliv',
    name: "AZLIV GYM",
    allowedProducts: ["fitglove-pro", "fitglove-pro-gympick"],
    allowGymPickup: true,
  },
  testgym: {
    name: "Test Gym",
    allowedProducts: [],
    allowGymPickup: true,
  },
};

export function getGym(gymId: string): Gym {
  const gym = gyms[gymId]
  if (!gym) throw new Error(`Unknown gymId: ${gymId}`)
  return gyms[gymId];
}
