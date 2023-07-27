// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import './Arena.sol';

contract ArenasFactory {
   mapping(uint => Arena) arenas;
   uint public arenaCount;

    event ArenaCreated(uint arenaId);
 
    function createArena(uint _entryCost, uint[] memory fixturesId, bool _isPrivate, string memory name) public returns (Arena) {
        Arena arena = new Arena(_entryCost, fixturesId, _isPrivate, name, msg.sender);
        arenaCount++;
        arenas[arenaCount] = arena;
        emit ArenaCreated(arenaCount);
        return arena;
    }

    function getArena(uint id) public view returns (Arena) {
        return arenas[id];
    }
}