// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;


contract Arena {
    struct Fixture {
        uint id;
        BetStatus status;
        FixtureResult result;
    }

    struct PlayerBet {
        uint fixtureId;
        BetProno prono;
    }

    uint public entryCost;
    mapping(address => bool) public registeredPlayers;
    mapping(address => PlayerBet[]) public playersBets;
    bool public isPrivate;
    Fixture[] public games;
    ArenaStatus public status;
    mapping(address => bool) public winners;


    enum ArenaStatus { Open, Closed, Finished }
    enum BetStatus { Open, Closed, Finished }
    enum FixtureResult { Pending, Home,Draw, Away, Cancelled }
    enum BetProno { None, Home, Draw, Away }

    constructor(uint _entryCost, uint[] memory fixturesIds) {
        require(fixturesIds.length > 0 || fixturesIds.length < 50, "Provide between 1 and 50 fixtures");
        entryCost = _entryCost;
        
        for (uint8 i = 0; i < fixturesIds.length; i++) {
            games.push(Fixture({
                id: fixturesIds[i],
                status: BetStatus.Open,
                result: FixtureResult.Pending
            }));
        }
    }

    modifier onlyRegistered() {
        require(registeredPlayers[msg.sender], "You must be registered to perform this action");
        _;
    }

    function register() public payable onlyRegistered {
        require(!registeredPlayers[msg.sender], "You are already registered");
        require(msg.value == entryCost, "You must pay the correct entry cost");
        registeredPlayers[msg.sender] = true;
    }

    function placeBets(PlayerBet[] memory pronos) external onlyRegistered() {
        require(registeredPlayers[msg.sender], "You must be registered to place bets");
        for(uint8 i = 0; i < pronos.length; i++) {
            require(games[pronos[i].fixtureId].status == BetStatus.Open, "You can only bet on open fixtures");
            games[pronos[i].fixtureId].status = BetStatus.Closed;
        }
    }


    function setResult() public {
        // call the oracle to get the result
        // set the result
        // set the status to finished
    }

    function setWinners() public view returns (bool) {
        for(uint8 i = 0; i < games.length; i++) {
            // call the oracle to get the result
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
            setResult();
            setWinners();
        }
        require(winners[msg.sender], "You are not a winner");
        // pay the winner;
    }
}