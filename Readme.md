# PullReward

**Empowering Open Source, One Verified Contribution at a Time**

**PullReward** is a decentralized platform that allows anyone to create their own wallet using WalletConnect using their Github Id and utilize Seda's Web3 oracle to verify GitHub pull request (PR) resolutions and reward developers with bounties issued by project maintainers. By connecting contributors with bounty-backed issues and using oracle technology for secure verification, PullReward enables a transparent, trustless system for rewarding open-source work. 

**NOTE: Make sure to mention issue in the PR!**

---

## Key Features

- **Bounty Issuance**: Project maintainers can create GitHub issues with attached bounties to incentivize contributors.
- **Oracle-Based Verification**: Ensures that PRs meet specified requirements and pass automated checks before approving rewards.
- **Trustless Rewards**: Once verified, bounties are automatically transferred to the contributor’s wallet.
- **Transparent System**: All transactions and verifications are conducted on-chain, promoting transparency and security.
- **Seamless Developer Experience**: Easy integration with GitHub and Web3 wallets for contributors and maintainers.

---

## How It Works

1. **Issue Creation**: Maintainers create GitHub issues on PullReward, attaching a bounty and specifying requirements for resolution.

2. **PR Submission**: Developers submit pull requests to resolve the issues.

3. **Verification**: PullReward utilizes Web3 oracles to verify the PR, ensuring that:
    - The PR owner and logged-in user are the same.
    - The PR references the correct issue and is successfully merged.

4. **Reward Distribution**: After verification, the bounty is automatically distributed to the developer’s wallet.

---

## Technology Stack

- **Particle Network**: Allows to easily integrate Github and web3 wallet for seamless verification and user onboarding. 
- **Seda Web3 Oracles**: Verifies PR submissions and conditions for releasing bounties using Off chain Github API data on chain.
- **GitHub API**: Integrates GitHub issues and pull requests.
- **Smart Contracts**: Manages bounty distribution in a decentralized, secure manner.
- **Ethereum Blockchain**: Ensures transparency and immutability of all transactions on Base Sepolia Chain.

---

## Benefits

- **Security**: Leveraging decentralized oracles ensures that contributions are verified accurately and securely.
- **Transparency**: All rewards and verifications are recorded on-chain, promoting a fair ecosystem.
- **Incentive-Driven Open Source**: PullReward enables developers to earn rewards for their open-source contributions, fostering a motivated, active community.

---

## Future Roadmap

- **Multi-Chain Support**: Expanding to additional blockchain networks.
- **Enhanced Verification**: Integrating more advanced oracle features for complex project requirements.
- **Reputation System**: Building a system to reward repeat contributors and verified maintainers.

---
