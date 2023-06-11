import { ethers } from "hardhat";

async function main() {
  const Voter = await ethers.getContractFactory("Voter");
  const voter = await Voter.deploy();

  await voter.deployed();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
