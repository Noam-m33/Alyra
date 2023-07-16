// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Arena is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    enum ArenaStatus { Open, Closed, GamesEnded, ClaimSessionOpen }
    enum FixtureState { Pending, Cancelled, Ended }
    enum BetProno { None, Home, Draw, Away }

    event BetPlaced(address player, PlayerBet[] pronos);
    event GamesEnded();
    event WinnersSet(uint8[] winners);
    event AddressWhitelisted(address);

    struct Fixture {
        uint id;
        FixtureState state;
        BetProno winningProno;
    }

    struct PlayerBet {
        uint fixtureId;
        BetProno prono;
    }

    uint public entryCost;
    mapping(uint => PlayerBet[]) public playersBets;
    bool public isPrivate;
    mapping(address => bool) public whitelistedAddresses;
    Fixture[] public games;
    ArenaStatus public status;
    uint8[] public winners;
    address public creator;

    constructor(uint _entryCost, uint[] memory fixturesIds, bool _isPrivate, address _creator) ERC721("Arena", "ARENA") {
        require(fixturesIds.length > 0 && fixturesIds.length < 10, "Provide between 1 and 10 fixtures");
        entryCost = _entryCost;
        isPrivate = _isPrivate;
        creator = _creator;
        
        for (uint8 i = 0; i < fixturesIds.length; i++) {
            games.push(Fixture({
                id: fixturesIds[i],
                state: FixtureState.Pending,
                winningProno: BetProno.None
            }));
        }
    }

    modifier onlyCurrentNFTOwner(uint8 tokenId) {
        require(ownerOf(tokenId) == msg.sender, "You must own the token to place bets");
        _;
    }

    modifier onlyCreator(){
        require(msg.sender == creator, "Restricted to creator");
        _;
    }
        
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 firstTokenId,
        uint256 batchSize
    ) internal override  {
        if(_exists(firstTokenId)){
            require(isPrivate == false , "Cannot transfer when arena is private");
        }
        super._beforeTokenTransfer(from, to, firstTokenId, batchSize);
    }

    function getArenaInfosData() public view returns (uint, uint, ArenaStatus, uint8[] memory, Fixture[] memory) {
        return (entryCost, _tokenIds.current() ,status, winners, games);
    }

    function whitelistAddressForPrivateArena(address[] memory _addresses, bool _bool) external onlyCreator {
        require(isPrivate, "You should whitelist address only on private arena");
        for (uint8 i = 0; i < _addresses.length; i++) {
            whitelistedAddresses[_addresses[i]] = _bool;
            emit AddressWhitelisted(_addresses[i]);
        }
    }

    function register() public payable {
        require(msg.value == entryCost, "You must pay the correct entry cost");
        if(isPrivate){
            require(whitelistedAddresses[msg.sender] == true, "not whitelisted");
        }
        _tokenIds.increment();
        _safeMint(msg.sender, _tokenIds.current());
    }

    function closeArena() public onlyCreator {
        status = ArenaStatus.Closed;
    }

    function placeBets(PlayerBet[] memory pronos, uint8 tokenId) external onlyCurrentNFTOwner(tokenId) {
        require(pronos.length == games.length, "You must bet on all fixtures");
        require(status == ArenaStatus.Open, "You can only place bets when the arena is open");
        for (uint8 i = 0; i < pronos.length; i++) {
            require(pronos[i].fixtureId == games[i].id, "The fixture id does not match");
            require(pronos[i].prono != BetProno.None, "You must bet on all fixtures");
            playersBets[tokenId].push(PlayerBet({
                fixtureId: pronos[i].fixtureId,
                prono: pronos[i].prono
            }));
        }
        emit BetPlaced(msg.sender, pronos);
    }

    function setFixturesResult(Fixture[] memory fixturesResult) external {
        require(status != ArenaStatus.Closed, "You can only set the result if the arena is not finished");
        require(fixturesResult.length == games.length, "You must set the result for all fixtures");
        for(uint8 i = 0; i < fixturesResult.length; i++) {
            require(fixturesResult[i].state != FixtureState.Pending, "You must set the result for all fixtures");
            require(fixturesResult[i].id == games[i].id, "The fixture id does not match");
            games[i].winningProno = fixturesResult[i].winningProno;
            games[i].state = fixturesResult[i].state;
        }
        status = ArenaStatus.GamesEnded;
        
        emit GamesEnded();

    }

    function setWinners() public {
        uint8[] memory scores;
        for(uint8 i = 0; i < games.length; i++) {
            if(games[i].state == FixtureState.Ended) {
                for(uint tokenId = 1; i == _tokenIds.current(); i++) {
                    if(playersBets[tokenId][i].fixtureId == games[i].id) {
                        if(
                            playersBets[tokenId][i].prono == games[i].winningProno                  
                        ){
                            scores[tokenId]++;
                        }
                    } else {
                        revert("The fixture id does not match");
                    }
                }
            }
        }
        uint8 largestScore;
        uint8[] memory memoryWinners;
        for(uint8 i = 0; i < scores.length; i++) {
            if(scores[i] > largestScore) {
                largestScore = scores[i];
                uint8[] memory newWinner;
                newWinner[0] = i + 1;
                memoryWinners = newWinner;
            } else if(scores[i] == largestScore) {
                memoryWinners[i] = i +1;
            }
        }
        winners = memoryWinners;
        status = ArenaStatus.ClaimSessionOpen;
        emit WinnersSet(memoryWinners);
    }

    function claim(uint8 tokenId) external onlyCurrentNFTOwner(tokenId)  {
        if(status == ArenaStatus.GamesEnded){
            setWinners();
        }
        require(status == ArenaStatus.ClaimSessionOpen, "You can only payout when the claim session is open");
        payable(ownerOf(tokenId)).transfer((entryCost * _tokenIds.current()) / winners.length);
    }
}