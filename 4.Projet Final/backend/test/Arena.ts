import { expect } from "chai";
import { ethers } from "hardhat";
import { Arena } from "../typechain-types";
import { BigNumber } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("Arena", function () {
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
    isPrivate = false
  ) {
    const factoryContract = await deployArenasFactory();
    await factoryContract.createArena(cost, pokemons, isPrivate);
    const arenaAddress = await factoryContract.getArena(1);
    const arenaInstance = await ethers.getContractAt("Arena", arenaAddress);
    [owner, addr1, addr2] = await ethers.getSigners();
    arenaContract = arenaInstance;
  }

  // ------- Constructor -------
  it("should not be able to create an arena if the number fixture is not between 1 and 10", async function () {
    await expect(
      deployArena(10000, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    ).to.be.revertedWith("Provide between 1 and 10 fixtures");
  });
  // ------- END Constructor -------

  // ------- REGISTER -------
  it("should be able to register if pay the entry cost", async function () {
    await deployArena();
    const [signer] = await ethers.getSigners();
    await arenaContract.register({ value: 10000 });
    expect(await arenaContract.ownerOf(1)).to.equal(signer.address);
  });

  it("should not be able to register if not pay the entry cost", async function () {
    await deployArena();
    await expect(arenaContract.register({ value: 10 })).to.be.revertedWith(
      "You must pay the correct entry cost"
    );
  });

  it("should be reverted if the arena is private and not whitelisted", async function () {
    await deployArena(10000, [1, 2], true);
    await expect(arenaContract.register({ value: 10000 })).to.be.revertedWith(
      "not whitelisted"
    );
  });

  it("should be able to register if the arena is private and whitelisted", async function () {
    await deployArena(10000, [1, 2], true);
    await arenaContract.whitelistAddressForPrivateArena([addr1.address], true);
    await arenaContract.connect(addr1).register({ value: 10000 });
    expect(await arenaContract.ownerOf(1)).to.equal(addr1.address);
  });
  // ------- END REGISTER -------

  // ------- Place Bet -------
  it("should be able to place bet if his the owner of an nft", async function () {
    await deployArena();
    await arenaContract.register({ value: 10000 });
    expect(
      await arenaContract.placeBets(
        [
          { fixtureId: 1, prono: 2 },
          { fixtureId: 2, prono: 3 },
        ],
        1
      )
    ).to.emit(arenaContract, "BetPlaced");
  });

  it("should not be able to place bet if not the owner of an nft", async function () {
    await deployArena();
    await arenaContract.register({
      value: 10000,
    });
    await expect(
      arenaContract.connect(addr2).placeBets(
        [
          { fixtureId: 1, prono: 2 },
          { fixtureId: 2, prono: 3 },
        ],
        1
      )
    ).to.be.revertedWith("You are not the owner of this NFT");
  });

  it("should not be able able to place a bet partially", async function () {
    await deployArena();
    await arenaContract.register({
      value: 10000,
    });
    await expect(
      arenaContract.placeBets([{ fixtureId: 1, prono: 2 }], 1)
    ).to.be.revertedWith("You must bet on all fixtures");
  });

  it("should not be able to place a bet on invalid id", async function () {
    await deployArena();
    await arenaContract.register({
      value: 10000,
    });
    await expect(
      arenaContract.placeBets(
        [
          { fixtureId: 5, prono: 2 },
          { fixtureId: 2, prono: 3 },
        ],
        1
      )
    ).to.be.revertedWith("The fixture id does not match");
  });

  it("should be able to place a bet only when the arena is open", async function () {
    await deployArena();
    await arenaContract.register({
      value: 10000,
    });
    await arenaContract.closeArena();
    await expect(
      arenaContract.placeBets(
        [
          { fixtureId: 1, prono: 2 },
          { fixtureId: 2, prono: 3 },
        ],
        1
      )
    ).to.be.revertedWith("You can only place bets when the arena is open");
  });

  it("should bet on all fixtures", async function () {
    await deployArena();
    await arenaContract.register({
      value: 10000,
    });
    await expect(
      arenaContract.placeBets(
        [
          { fixtureId: 1, prono: 0 },
          { fixtureId: 2, prono: 3 },
        ],
        1
      )
    ).to.be.revertedWith("You must bet on all fixtures");
  });

  // ------- END PLACE BET -------

  // ------- CLOSE ARENA -------
  it("should be able to close arena only for the arena creator", async function () {
    await deployArena();
    await expect(arenaContract.connect(addr2).closeArena()).to.be.revertedWith(
      "Restricted to creator"
    );
  });

  // ------- SET FIXTURE RESULT -------
  it("should be able to set fixture result only if the arena is closed", async function () {
    await deployArena();
    await expect(
      arenaContract.setFixturesResult([
        { id: 1, state: 2, winningProno: 2 },
        { id: 2, state: 2, winningProno: 3 },
      ])
    ).to.be.revertedWith("You can only set the result if the arena is closed");
  });

  it("should be able to set fixture result only if set all fixtures", async function () {
    await deployArena();
    await arenaContract.closeArena();
    await expect(
      arenaContract.setFixturesResult([{ id: 1, state: 2, winningProno: 2 }])
    ).to.be.revertedWith("You must set the result for all fixtures");
  });

  it("should be able to set fixture result only if the fixture id match", async function () {
    await deployArena();
    await arenaContract.closeArena();
    await expect(
      arenaContract.setFixturesResult([
        { id: 1, state: 2, winningProno: 2 },
        { id: 3, state: 2, winningProno: 3 },
      ])
    ).to.be.revertedWith("The fixture id does not match");
  });

  it("should be able to set fixture results", async function () {
    await deployArena();
    await arenaContract.closeArena();
    await expect(
      arenaContract.setFixturesResult([
        { id: 1, state: 2, winningProno: 2 },
        { id: 2, state: 2, winningProno: 3 },
      ])
    ).to.emit(arenaContract, "GamesEnded");
  });

  // ------- END SET FIXTURE RESULT -------

  // ------- SET WINNERS ---------

  it("should be able to set winners", async function () {
    await deployArena();
    await arenaContract.closeArena();
    await arenaContract.setFixturesResult([
      { id: 1, state: 2, winningProno: 2 },
      { id: 2, state: 2, winningProno: 3 },
    ]);
    await expect(arenaContract.setWinners()).to.emit(
      arenaContract,
      "WinnersSet"
    );
  });

  it("should not be able to set winners only if the arena is not GameEnded", async function () {
    await deployArena();
    await arenaContract.closeArena();
    await expect(arenaContract.setWinners()).to.be.revertedWith(
      "You can only set the winners if the games have ended"
    );
  });

  // ------- END SET WINNERS ---------

  // ------- GETTERS INFO ----------

  it("should be able to get arena data", async function () {
    const expectedResult = [
      ethers.BigNumber.from("10000"),
      ethers.BigNumber.from("2"),
      0,
      [],
    ];
    await deployArena(10000, [1, 2], false);
    await arenaContract.register({
      value: 10000,
    });
    await arenaContract.connect(addr2).register({
      value: 10000,
    });
    await arenaContract.placeBets(
      [
        { fixtureId: 1, prono: 2 },
        { fixtureId: 2, prono: 3 },
      ],
      1
    );
    const [ownerBalance, state, winner, winners, fixtures] =
      await arenaContract.getArenaInfosData();
    const resultWithoutFixtures = [ownerBalance, state, winner, winners];
    expect(resultWithoutFixtures).to.deep.equal(expectedResult);
  });

  // ------- END GETTERS INFO -------

  // ------- CLAIM ---------

  it("should be able to claim only if the arena is ClaimSessionOpen", async function () {
    await deployArena();
    await arenaContract.closeArena();
    await arenaContract.setFixturesResult([
      { id: 1, state: 2, winningProno: 2 },
      { id: 2, state: 2, winningProno: 3 },
    ]);
    expect(arenaContract.claim(1)).to.be.revertedWith(
      "You can only claim when the claim session is open"
    );
  });

  it("should be able to claim only if the arena is ClaimSessionOpen", async function () {
    await deployArena();
    await arenaContract.closeArena();
    await arenaContract.setFixturesResult([
      { id: 1, state: 2, winningProno: 2 },
      { id: 2, state: 2, winningProno: 3 },
    ]);
    await arenaContract.setWinners();
    expect(arenaContract.claim(1)).not.to.be.revertedWith(
      "You can only claim when the claim session is open"
    );
  });

  it("should be able to claim only for current nft owner", async function () {
    await deployArena();
    await arenaContract.register({
      value: 10000,
    });
    await arenaContract.closeArena();
    await arenaContract.setFixturesResult([
      { id: 1, state: 2, winningProno: 2 },
      { id: 2, state: 2, winningProno: 3 },
    ]);
    await arenaContract.setWinners();
    await expect(arenaContract.connect(addr2).claim(1)).to.be.revertedWith(
      "You are not the owner of this NFT"
    );
  });

  it("should not be able to claim if the nft is not a winner", async function () {
    await deployArena(BigNumber.from("1000000000000000000"));
    const initialBalance = await owner.getBalance();
    await arenaContract.register({
      value: BigNumber.from("1000000000000000000"),
    });
    await arenaContract.connect(addr2).register({
      value: BigNumber.from("1000000000000000000"),
    });
    console.log(await arenaContract.ownerOf(2), addr2.address);
    await arenaContract.placeBets(
      [
        { fixtureId: 1, prono: 2 },
        { fixtureId: 2, prono: 3 },
      ],
      1
    );
    await arenaContract.connect(addr2).placeBets(
      [
        { fixtureId: 1, prono: 1 },
        { fixtureId: 2, prono: 3 },
      ],
      2
    );
    await arenaContract.closeArena();
    await arenaContract.setFixturesResult([
      { id: 1, state: 2, winningProno: 2 },
      { id: 2, state: 2, winningProno: 3 },
    ]);
    await arenaContract.setWinners();
    await expect(arenaContract.claim(1)).to.emit(arenaContract, "Claimed");
    await expect(arenaContract.connect(addr2).claim(2)).to.be.revertedWith(
      "You are not a winner"
    );
    await expect((await owner.getBalance()).gt(initialBalance)).to.be.true;
  });

  // ------- END CLAIM ---------

  // ------- Private Arena ---------
  it("should be able to whitelist address on private arena", async function () {
    await deployArena(10000, [1, 2], true);
    await expect(
      arenaContract.whitelistAddressForPrivateArena([addr2.address], true)
    ).to.emit(arenaContract, "AddressWhitelisted");
  });

  it("should not be able to whitelist address on private arena if not creator", async function () {
    await deployArena(10000, [1, 2], true);
    await expect(
      arenaContract
        .connect(addr2)
        .whitelistAddressForPrivateArena([addr2.address], true)
    ).to.be.revertedWith("Restricted to creator");
  });

  it("should not be able to whitelist address on private arena if not private", async function () {
    await deployArena(10000, [1, 2], false);
    await expect(
      arenaContract.whitelistAddressForPrivateArena([addr2.address], true)
    ).to.be.revertedWith("You should whitelist address only on private arena");
  });

  it("should not be able to send a nft if the arena is private", async function () {
    await deployArena(10000, [1, 2], false);
    await arenaContract.register({
      value: 10000,
    });
    expect(
      await arenaContract.transferFrom(owner.address, addr2.address, 1)
    ).to.be.revertedWith("Cannot transfer when arena is private");
  });
});
