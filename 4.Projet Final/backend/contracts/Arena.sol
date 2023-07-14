// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;


contract Arena {
    struct Fixture {
        uint id;
        FixtureResult result;
    }

    struct PlayerBet {
        uint fixtureId;
        BetProno prono;
    }

    struct Player {
        address player;
        PlayerBet[] pronos;
    }

    uint public entryCost;
    Player[] public registeredPlayers;
    bool public isPrivate;
    Fixture[] public games;
    ArenaStatus public status;
    address[] public winners;

    enum ArenaStatus { Open, Closed, Finished }
    enum FixtureResult { Pending, Home,Draw, Away, Cancelled }
    enum BetProno { None, Home, Draw, Away }

    event BetPlaced(address player, PlayerBet[] pronos);
    event ArenaFinished();

    constructor(uint _entryCost, uint[] memory fixturesIds) {
        require(fixturesIds.length > 0 && fixturesIds.length < 10, "Provide between 1 and 10 fixtures");
        entryCost = _entryCost;
        
        for (uint8 i = 0; i < fixturesIds.length; i++) {
            games.push(Fixture({
                id: fixturesIds[i],
                result: FixtureResult.Pending
            }));
        }
    }

    modifier onlyRegistered() {
        _;
    }

    function register() public payable {
        //require(!registeredPlayers[msg.sender], "You are already registered");
        require(msg.value == entryCost, "You must pay the correct entry cost");
        registeredPlayers[msg.sender] = true;
    }

    function placeBets(PlayerBet[] calldata pronos) external onlyRegistered() {
        require(pronos.length == games.length, "You must bet on all fixtures");
        require(status == ArenaStatus.Open, "You can only place bets when the arena is open");
        registeredPlayers[msg.sender].address = pronos;
        emit BetPlaced(msg.sender, pronos);
    }


    function setFixturesResult(Fixture[] calldata fixturesResult) external {
        require(status != ArenaStatus.Closed, "You can only set the result if the arena is not finished");
        require(registeredPlayers[msg.sender], "You must be registered to set the result");
        for(uint8 i = 0; i < fixturesResult.length; i++) {
            require(fixturesResult[i].id == games[i].id, "The fixture id does not match");
            games[i].result = fixturesResult[i].result;
        }
        status = ArenaStatus.Finished;
        
        emit ArenaFinished();

    }

    function setWinners() public view returns (bool) {
        for(uint8 i = 0; i < games.length; i++) {
            if(games[i].result == FixtureResult.Home) {
                return true;
            }
        }
        return true;
    }

    function payoutWinner() external onlyRegistered() {
        require(status == ArenaStatus.Finished, "You can only payout when the arena is finished");
        require(registeredPlayers[msg.sender], "You must be registered to payout");
        if(status != ArenaStatus.Finished){
            setWinners();
        }
        for(uint8 i = 0; i < winners.length; i++) {
            payable(winners[i]).transfer((entryCost * registeredPlayers.length) / winners.length);
        }
    }
}