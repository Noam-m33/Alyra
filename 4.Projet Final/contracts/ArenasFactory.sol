// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import './Arena.sol';

contract ArenasFactory {
   mapping(uint => Arena) arenas;
   uint public arenaCount;

    event PlayerRegistered(address player, uint arenaId);

    function createArena(uint _entryCost, uint[] memory fixturesId) public {
        Arena arena = new Arena(_entryCost, fixturesId);
        arenaCount++;
        arenas[arenaCount] = arena;
    }

    function getArena(uint id) public view returns (Arena) {
        return arenas[id];
    }

    function registerPlayer(uint arenaId) external payable {
        Arena arena = arenas[arenaId];
        arena.register{value: msg.value}();
        emit PlayerRegistered(msg.sender, arenaId);
    }

    function bet(uint arenaId, Arena.PlayerBet[] memory pronos) external {
        Arena arena = arenas[arenaId];
        arena.placeBets(pronos);
        // arena.register();
    }
}