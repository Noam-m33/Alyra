import { ArenasFactory } from "../typechain-types";

const hre = require("hardhat");

async function main() {
  const ArenasFactory = await hre.ethers.getContractFactory("ArenasFactory");
  const ArenasFactoryContract: ArenasFactory = await ArenasFactory.deploy();

  const deployed = await ArenasFactoryContract.deployed();
  console.log("ArenasFactory deployed to:", deployed.address);

  const createGenesisArenaTx = await ArenasFactoryContract.createArena(
    10000,
    [1, 2],
    false,
    "Genesis Arena"
  );

  await createGenesisArenaTx
    .wait()
    .then((receipt) => {
      console.log(receipt.transactionHash, receipt.status);
    })
    .catch(console.error);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
