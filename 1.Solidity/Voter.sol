// SPDX-License-Identifier: GPL-3.0

import "@openzeppelin/contracts/access/Ownable.sol";

pragma solidity >=0.8.3;

contract Voting is Ownable {
    event VoterRegistered(address voterAddress);
    event WorkflowStatusChange(
        WorkflowStatus previousStatus,
        WorkflowStatus newStatus
    );
    event ProposalRegistered(uint proposalId);
    event Voted(address voter, uint proposalId);

    enum WorkflowStatus {
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        VotesTallied
    }

    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint votedProposalId;
    }
    struct Proposal {
        string description;
        uint voteCount;
    }

    uint winningProposalId;
    mapping(address => Voter) voters;
    WorkflowStatus public currentStatus;
    Proposal[] proposals;
    address[] whitelistedAddresses;

    modifier onlyWhitelisted() {
        if (voters[msg.sender].isRegistered == false) {
            revert("Address not whitelisted");
        }
        _;
    }

    function whitelistAddresses(address[] memory _addresses) public onlyOwner {
        for (uint i; i < _addresses.length; i++) {
            emit VoterRegistered(_addresses[i]);
            whitelistedAddresses.push(_addresses[i]);
            voters[_addresses[i]] = Voter(true, false, 0);
        }
    }

    function startProposalSession() public onlyOwner {
        require(
            currentStatus == WorkflowStatus.RegisteringVoters,
            "Voting workflow is not respected"
        );
        currentStatus = WorkflowStatus.ProposalsRegistrationStarted;
    }

    function endProposalSession() public onlyOwner {
        require(
            currentStatus == WorkflowStatus.ProposalsRegistrationStarted,
            "Voting workflow is not respected"
        );
        currentStatus = WorkflowStatus.ProposalsRegistrationEnded;
    }

    function startVoteSession() public onlyOwner {
        require(
            currentStatus == WorkflowStatus.ProposalsRegistrationEnded,
            "Voting workflow is not respected"
        );
        currentStatus = WorkflowStatus.VotingSessionStarted;
    }

    function endVoteSession() public onlyOwner {
        require(
            currentStatus == WorkflowStatus.VotingSessionStarted,
            "Voting workflow is not respected"
        );
        currentStatus = WorkflowStatus.VotingSessionEnded;
    }

    function startVoteTailledSession() public onlyOwner {
        require(
            currentStatus == WorkflowStatus.VotingSessionEnded,
            "Voting workflow is not respected"
        );
        currentStatus = WorkflowStatus.VotesTallied;
    }

    function submitProposal(string memory description) public onlyWhitelisted {
        require(
            currentStatus == WorkflowStatus.ProposalsRegistrationStarted,
            "Proposal registeration has not started"
        );
        proposals.push(Proposal(description, 0));
        emit ProposalRegistered(proposals.length + 1);
    }

    function voting(uint proposalId) public onlyWhitelisted {
        require(
            currentStatus == WorkflowStatus.VotingSessionStarted,
            "Voting registeration has not started"
        );
        if (voters[msg.sender].hasVoted) {
            revert("already voted");
        }
        voters[msg.sender].votedProposalId = proposalId;
        emit Voted(msg.sender, proposalId);
    }

    function voteResult() public onlyOwner {
        require(
            currentStatus == WorkflowStatus.VotesTallied,
            "Voting tailled has not started"
        );
        for (uint i; i < whitelistedAddresses.length; i++) {
            if (voters[whitelistedAddresses[i]].hasVoted == true) {
                proposals[voters[whitelistedAddresses[i]].votedProposalId]
                    .voteCount += 1;
            }
        }
        uint currentWinningId;
        uint currentWinningCount;
        for (uint i; i < proposals.length; i++) {
            if (proposals[i].voteCount > currentWinningCount) {
                currentWinningId = i;
            }
        }
        winningProposalId = currentWinningId;
    }
}
