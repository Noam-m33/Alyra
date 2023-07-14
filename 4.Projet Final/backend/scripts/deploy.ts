import { ethers } from "hardhat";

async function main() {
  const arenaFactory = await ethers.deployContract("ArenasFactory");

  await arenaFactory.waitForDeployment();

  console.log(`deploy successfully to ${arenaFactory.target}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
