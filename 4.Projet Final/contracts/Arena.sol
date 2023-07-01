// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;


contract Arena {
    struct Fixture {
        uint id;
        BetStatus status;
        FixtureResult result;
    }

    struct PlayerBet {
        uint id;
        BetProno prono;
    }

    uint public entryCost;
    mapping(address => bool) public player;
    Fixture[] public games;
    ArenaStatus public status;
    address[] public winners;
    

    enum ArenaStatus { Open, Closed, Finished }
    enum BetStatus { Open, Closed, Finished }
    enum FixtureResult { Pending, Home,Draw, Away, Cancelled }
    enum BetProno { Home,Draw, Away }


    constructor(uint _entryCost, uint[] memory fixturesId) {
        entryCost = _entryCost;
        
        for (uint8 i = 0; i < fixturesId.length; i++) {
            games.push(Fixture({
                id: fixturesId[i],
                status: BetStatus.Open,
                result: FixtureResult.Pending
            }));
        }
    }

    function bet(uint fixtureId, ) public payable {
        require(status == ArenaStatus.Open, "Arena is closed");
        require(msg.value == entryCost, "Entry cost is not correct");
        require(result >= 1 && result <= 3, "Result is not correct");
        require(!player[msg.sender], "You already bet");

        player[msg.sender] = true;
        games[fixtureId].status = BetStatus.Closed;
        games[fixtureId].result = FixtureResult(result);
    }




}