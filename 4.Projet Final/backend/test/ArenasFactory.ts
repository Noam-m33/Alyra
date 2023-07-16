import { expect } from "chai";
import { ethers } from "hardhat";

describe("ArenaFactory", function () {
  async function deployArenasFactory() {
    const Factory = await ethers.getContractFactory("ArenasFactory");
    const factoryContract = await Factory.deploy();
    return factoryContract;
  }

  it("should be arena count equals 0", async function () {
    const factoryContract = await deployArenasFactory();
    expect(await factoryContract.arenaCount()).to.equal(0);
  });

  it("should be able to create an arena", async function () {
    const factoryContract = await deployArenasFactory();
    await factoryContract.createArena(10000, [1, 2], false);
    expect(await factoryContract.arenaCount()).to.equal(1);
  });

  it("should be able to get an arena address", async function () {
    const factoryContract = await deployArenasFactory();
    await factoryContract.createArena(10000, [1, 2], false);
    expect(await factoryContract.getArena(1)).match(/^0x[a-fA-F0-9]{40}$/g);
  });
});
