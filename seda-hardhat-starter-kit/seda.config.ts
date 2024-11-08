export interface SedaConfig {
  proverAddress: string;
}

export const networkConfigs: { [network: string]: SedaConfig } = {
  baseSepolia: {
    proverAddress: "0xCcB6ffE2b60e0827a5b566920Bdb8d20Cfc01864",
  }
};
