import { Z_ASCII } from "zlib";

const hre = require("hardhat");

async function main() {
  const ArenasFactory = await hre.ethers.getContractFactory("ArenasFactory");
  const ArenasFactoryContract = await ArenasFactory.deploy();

  await ArenasFactoryContract.deployed();

  console.log(`ArenasFactory deployed to ${ArenasFactoryContract.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
