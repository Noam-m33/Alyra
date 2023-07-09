export const arenaFactoryAbi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "player",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "arenaId",
        type: "uint256",
      },
    ],
    name: "PlayerRegistered",
    type: "event",
  },
  {
    inputs: [],
    name: "arenaCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_entryCost",
        type: "uint256",
      },
      {
        internalType: "uint256[]",
        name: "fixturesId",
        type: "uint256[]",
      },
    ],
    name: "createArena",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
    ],
    name: "getArena",
    outputs: [
      {
        internalType: "contract Arena",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "arenaId",
        type: "uint256",
      },
    ],
    name: "registerPlayer",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
];
