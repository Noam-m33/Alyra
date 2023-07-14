// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import './Arena.sol';

contract ArenasFactory {
   mapping(uint => Arena) arenas;
   uint public arenaCount;

    event PlayerRegistered(address player, uint arenaId);
    event ArenaCreated(uint arenaId);
 
    function createArena(uint _entryCost, uint[] memory fixturesId) public returns (Arena) {
        Arena arena = new Arena(_entryCost, fixturesId);
        arenaCount++;
        arenas[arenaCount] = arena;
        emit ArenaCreated(arenaCount);
        return arena;
    }

    function counterMagic(uint number) public returns (uint) {
        arenaCount = arenaCount + number;
        emit ArenaCreated(arenaCount);
        return arenaCount;
    }

    function getArena(uint id) public view returns (Arena) {
        return arenas[id];
    }

    function registerPlayer(uint arenaId) external payable {
        Arena arena = arenas[arenaId];
        arena.register{value: msg.value}();
        emit PlayerRegistered(msg.sender, arenaId);
    }
}