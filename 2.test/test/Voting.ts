import { ethers } from "hardhat";
import { expect } from "chai";
import { Voting, Voting__factory } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("Voting", () => {
  let deployedContract: Voting;

  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;

  beforeEach(async () => {
    const votingContract = await ethers.getContractFactory("Voting");
    deployedContract = await votingContract.deploy();
    [owner, addr1, addr2] = await ethers.getSigners();
  });

  describe("Getters", async () => {
    beforeEach(async () => {
      await deployedContract.addVoter(addr1.address);
    });

    it("Voting workflow status should start at 0", async () => {
      expect(await deployedContract.workflowStatus()).equal(0);
    });

    it("proposal getter should be reverted as a non voters", async () => {
      await expect(
        deployedContract.connect(addr2).getOneProposal(0)
      ).to.be.revertedWith("You're not a voter");
    });

    it("voter getter should return an empty array", async () => {
      await expect(
        deployedContract.connect(addr2).getVoter(owner.address)
      ).to.be.revertedWith("You're not a voter");
    });

    it("voter getter should return the registered voter", async () => {
      expect(
        await (
          await deployedContract.connect(addr1).getVoter(addr1.address)
        ).isRegistered
      ).equal(true);
    });

    it("voter can get a proposal", async () => {
      await deployedContract.addVoter(addr2.address);
      await deployedContract.startProposalsRegistering();
      await deployedContract.connect(addr1).addProposal("Proposal 1");
      expect(
        await (
          await deployedContract.connect(addr2).getOneProposal(1)
        ).description
      ).equal("Proposal 1");
    });
  });

  describe("Registration", async () => {
    beforeEach(async () => {
      expect(await deployedContract.workflowStatus()).equal(0);
    });

    it("owner should be able to add a voter", async () => {
      await expect(deployedContract.addVoter(addr1.address))
        .to.emit(deployedContract, "VoterRegistered")
        .withArgs(addr1.address);
    });

    it("owner should not be able to add a voter twice", async () => {
      await deployedContract.addVoter(addr1.address);
      await expect(deployedContract.addVoter(addr1.address)).to.be.revertedWith(
        "Already registered"
      );
    });

    it("non owner should not be able to add a voter", async () => {
      await expect(
        deployedContract.connect(addr1).addVoter(addr2.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("it should not be possible to add a voter after the end of the registration", async () => {
      await deployedContract.startProposalsRegistering();
      await expect(deployedContract.addVoter(addr1.address)).to.be.revertedWith(
        "Voters registration is not open yet"
      );
    });
  });

  describe("Proposals", async () => {
    beforeEach(async () => {
      await deployedContract.addVoter(addr1.address);
      await deployedContract.startProposalsRegistering();
    });

    it("non voter should not be able to add a proposal even the owner", async () => {
      await expect(
        deployedContract.connect(addr2).addProposal("Proposal 1")
      ).to.be.revertedWith("You're not a voter");
      await expect(
        deployedContract.addProposal("Proposal 1")
      ).to.be.revertedWith("You're not a voter");
    });

    it("voter should be able to add a proposal", async () => {
      await expect(deployedContract.connect(addr1).addProposal("Proposal 1"))
        .to.emit(deployedContract, "ProposalRegistered")
        .withArgs(1);
    });

    it("voter should not be able to add a empty proposal", async () => {
      await expect(
        deployedContract.connect(addr1).addProposal("")
      ).to.be.revertedWith("Vous ne pouvez pas ne rien proposer");
    });

    it("it should not be possible to register a proposal after the end of the registration", async () => {
      await deployedContract.endProposalsRegistering();
      await expect(
        deployedContract.connect(addr1).addProposal("Proposal 1")
      ).to.be.revertedWith("Proposals are not allowed yet");
    });
  });

  describe("Voting session", async () => {
    beforeEach(async () => {
      await deployedContract.addVoter(addr1.address);
      await deployedContract.startProposalsRegistering();
      await deployedContract.connect(addr1).addProposal("Proposal 1");
      await deployedContract.connect(addr1).addProposal("Proposal 2");
      await deployedContract.endProposalsRegistering();
      await deployedContract.startVotingSession();
    });

    it("non voter should not be able to vote", async () => {
      await expect(
        deployedContract.connect(addr2).setVote(1)
      ).to.be.revertedWith("You're not a voter");
    });

    it("voter should be able to vote", async () => {
      await expect(deployedContract.connect(addr1).setVote(1))
        .to.emit(deployedContract, "Voted")
        .withArgs(addr1.address, 1);
    });

    it("voter should not be able to vote twice", async () => {
      await deployedContract.connect(addr1).setVote(1);
      await expect(
        deployedContract.connect(addr1).setVote(2)
      ).to.be.revertedWith("You have already voted");
    });

    it("it should not be possible to vote after the end of the voting session", async () => {
      await deployedContract.endVotingSession();
      await expect(
        deployedContract.connect(addr1).setVote(2)
      ).to.be.revertedWith("Voting session havent started yet");
    });

    it("it should not be possible to vote for a non existing proposal", async () => {
      await expect(
        deployedContract.connect(addr1).setVote(3)
      ).to.be.revertedWith("Proposal not found");
    });
  });

  describe("Tally Votes", async () => {
    beforeEach(async () => {
      await deployedContract.addVoter(addr1.address);
      await deployedContract.addVoter(addr2.address);
      await deployedContract.startProposalsRegistering();
      await deployedContract.connect(addr1).addProposal("Proposal 1");
      await deployedContract.connect(addr2).addProposal("Proposal 2");
      await deployedContract.connect(addr2).addProposal("Proposal 3");
      await deployedContract.endProposalsRegistering();
      await deployedContract.startVotingSession();
      await deployedContract.connect(addr1).setVote(3);
      await deployedContract.connect(addr2).setVote(3);
      await deployedContract.endVotingSession();
    });

    it("non owner should not be able to tally votes", async () => {
      await expect(
        deployedContract.connect(addr2).tallyVotes()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("owner should be able to tally votes and winning proposalId should be gettable", async () => {
      await expect(deployedContract.tallyVotes())
        .to.emit(deployedContract, "WorkflowStatusChange")
        .withArgs(4, 5);
      expect(await deployedContract.winningProposalID()).equal(3);
    });
  });

  describe("Blocking Workflow", async () => {
    // -------- Only owner can start and end workflow ---------
    it("non owner should not be possible to start proposals registering", async () => {
      await expect(
        deployedContract.connect(addr1).startProposalsRegistering()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
    it("non owner should not be possible to end proposals registering", async () => {
      await expect(
        deployedContract.connect(addr1).endProposalsRegistering()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
    it("non owner should not be possible to start voting session", async () => {
      await expect(
        deployedContract.connect(addr1).startVotingSession()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
    it("non owner should not be possible to end voting session", async () => {
      await expect(
        deployedContract.connect(addr1).endVotingSession()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
    it("non owner should not be possible to tally votes", async () => {
      await expect(
        deployedContract.connect(addr1).tallyVotes()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
    // -------- Only owner can start and end workflow ---------

    // -------- Workflow should be in the right state ---------
    it("it should not be possible to start proposals registering if workflow is not in RegisteringProposals state", async () => {
      await deployedContract.startProposalsRegistering();
      await deployedContract.endProposalsRegistering();
      await expect(
        deployedContract.startProposalsRegistering()
      ).to.be.revertedWith("Registering proposals cant be started now");
    });
    it("it should not be possible to end proposals registering if workflow is not in RegisteringProposals state", async () => {
      await expect(
        deployedContract.endProposalsRegistering()
      ).to.be.revertedWith("Registering proposals havent started yet");
    });
    it("it should not be possible to start voting session if workflow is not in ProposalsRegistrationEnded state", async () => {
      await expect(deployedContract.startVotingSession()).to.be.revertedWith(
        "Registering proposals phase is not finished"
      );
    });
    it("it should not be possible to end voting session if workflow is not in VotingSessionStarted state", async () => {
      await expect(deployedContract.endVotingSession()).to.be.revertedWith(
        "Voting session havent started yet"
      );
    });
    it("it should not be possible to tally votes if workflow is not in VotingSessionEnded state", async () => {
      await expect(deployedContract.tallyVotes()).to.be.revertedWith(
        "Current status is not voting session ended"
      );
    });
    // -------- Workflow should be in the right state ---------
  });
});
