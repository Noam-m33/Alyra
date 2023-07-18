import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { Arena, Marketplace } from "../typechain-types";
import { BigNumber } from "ethers";
import { expect } from "chai";

describe("Marketplace", function () {
  let marketplaceContract: Marketplace;
  async function deployMarketplace() {
    const Marketplace = await ethers.getContractFactory("Marketplace");
    marketplaceContract = await Marketplace.deploy();
  }

  async function deployArenasFactory() {
    const Factory = await ethers.getContractFactory("ArenasFactory");
    const factoryContract = await Factory.deploy();
    return factoryContract;
  }

  let arenaContract: Arena;

  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;

  async function deployArena(
    cost: BigNumber | number = 10000,
    pokemons = [1, 2],
    isPrivate = false,
    name = "Arena"
  ) {
    const factoryContract = await deployArenasFactory();
    await factoryContract.createArena(cost, pokemons, isPrivate, name);
    const arenaAddress = await factoryContract.getArena(1);
    const arenaInstance = await ethers.getContractAt("Arena", arenaAddress);
    [owner, addr1, addr2] = await ethers.getSigners();
    arenaContract = arenaInstance;
  }

  async function setup() {
    await deployMarketplace();
    await deployArenasFactory();
    await deployArena();
    await arenaContract.register({
      value: 10000,
    });
    await arenaContract.connect(addr1).register({
      value: 10000,
    });
    await arenaContract.connect(addr2).register({
      value: 10000,
    });
  }

  it("should not be able to approve a nft if its not the owner", async function () {
    await setup();
    await expect(
      marketplaceContract.approve(arenaContract.address, 3)
    ).to.be.revertedWith("You are not the owner of this NFT");
  });

  it("should not be able to list a nft if its not approved", async function () {
    await setup();
    await expect(
      marketplaceContract.list(arenaContract.address, 1, 10000)
    ).to.be.revertedWith("Contract is not approved to manage this NFT");
  });

  it("should not be able to list a nft if its not the owner", async function () {
    await setup();
    await arenaContract.approve(marketplaceContract.address, 1);
    await expect(
      marketplaceContract.connect(addr1).list(arenaContract.address, 1, 10000)
    ).to.be.revertedWith("You are not the owner of this NFT");
  });

  it("should not be able to list a nft with a price of 0", async function () {
    await setup();
    await arenaContract.approve(marketplaceContract.address, 1);
    await expect(
      marketplaceContract.list(arenaContract.address, 1, 0)
    ).to.be.revertedWith("Price must be greater than 0");
  });

  it("should be able to list a nft", async function () {
    await setup();
    await arenaContract.approve(marketplaceContract.address, 1);
    await expect(
      marketplaceContract.list(arenaContract.address, 1, 10000)
    ).to.emit(marketplaceContract, "NFTListed");
  });

  it("should be able to cancel a listing", async function () {
    await setup();
    await arenaContract.approve(marketplaceContract.address, 1);
    await marketplaceContract.list(arenaContract.address, 1, 10000);
    await expect(marketplaceContract.cancelListing(1)).to.emit(
      marketplaceContract,
      "CancelListing"
    );
  });

  it("should not be able to cancel a listing if its not the owner", async function () {
    await setup();
    await arenaContract.approve(marketplaceContract.address, 1);
    await marketplaceContract.list(arenaContract.address, 1, 10000);
    await expect(
      marketplaceContract.connect(addr1).cancelListing(1)
    ).to.be.revertedWith("You are not the owner of this NFT");
  });

  it("should not be able to buy a nft if its already sold", async function () {
    await setup();
    await arenaContract.connect(addr2).approve(marketplaceContract.address, 3);
    await marketplaceContract.connect(addr2).list(arenaContract.address, 3, 10);
    await marketplaceContract.connect(addr1).buy(1, { value: 10 });
    await expect(
      marketplaceContract.connect(addr2).buy(1, { value: 10 })
    ).to.be.revertedWith("This NFT is already sold");
  });

  it("should not be able to buy a nft if it's not send the good price", async function () {
    await setup();
    await arenaContract.approve(marketplaceContract.address, 1);
    await marketplaceContract.list(arenaContract.address, 1, 100);
    await expect(
      marketplaceContract.connect(addr1).buy(1, { value: 100023 })
    ).to.be.revertedWith("The price is not equal to the value sent");
  });

  it("should be able to buy a nft", async function () {
    await setup();
    await arenaContract.connect(addr2).approve(marketplaceContract.address, 3);
    await marketplaceContract.connect(addr2).list(arenaContract.address, 3, 10);
    await marketplaceContract.connect(addr1).buy(1, { value: 10 });
    await expect(await arenaContract.ownerOf(3)).to.be.equal(addr1.address);
  });

  it("should be able to widthdraw the balance", async function () {
    await setup();
    await arenaContract.connect(addr2).approve(marketplaceContract.address, 3);
    await marketplaceContract.connect(addr2).list(arenaContract.address, 3, 10);
    await marketplaceContract.connect(addr1).buy(1, { value: 10 });
    await expect(await arenaContract.ownerOf(3)).to.be.equal(addr1.address);
    await expect(await marketplaceContract.balances(addr2.address)).to.be.equal(
      9
    );
    await marketplaceContract.connect(addr2).withdraw();
    await expect(await marketplaceContract.balances(addr2.address)).to.be.equal(
      9
    );
  });

  it("should revert if withdraw with a zero balance", async function () {
    await setup();
    await expect(
      marketplaceContract.connect(addr2).withdraw()
    ).to.be.revertedWith("No balance");
  });

  it("should not be able to widhrwaw if its not the owner", async function () {
    await setup();
    await arenaContract.connect(addr2).approve(marketplaceContract.address, 3);
    await marketplaceContract.connect(addr2).list(arenaContract.address, 3, 10);
    await marketplaceContract.connect(addr1).buy(1, { value: 10 });
    await expect(await arenaContract.ownerOf(3)).to.be.equal(addr1.address);
    await expect(await marketplaceContract.balances(addr2.address)).to.be.equal(
      9
    );
    await expect(
      marketplaceContract.connect(addr1).withdrawFees()
    ).to.be.revertedWith("You are not the owner");
  });

  it("should be able to widhrwaw the fees", async function () {
    await setup();
    await arenaContract.connect(addr2).approve(marketplaceContract.address, 3);
    await marketplaceContract
      .connect(addr2)
      .list(arenaContract.address, 3, 1000000000);
    await marketplaceContract.connect(addr1).buy(1, { value: 1000000000 });
    const beforeBalance = await ethers.provider.getBalance(owner.address);
    await marketplaceContract.connect(owner).withdrawFees();
    const afterBalance = await ethers.provider.getBalance(owner.address);
    expect(afterBalance).to.be.gt(beforeBalance);
  });
});
