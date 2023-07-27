# Gamble Arena Dapp

Gamble arena est un projet de paris sportifs pair-to-pair dans lequel des participants vont pouvoir s'inscrire dans des arènes et parier pour remportez le prize pool mis en jeu.

Plus de détails sur le litepaper

[Litepaper-GambleArena.pdf](https://github.com/Noam-m33/Alyra/files/12184563/Litepaper-GambleArena.1.pdf)

## Demo

Vous retrouvez une démo du projet via ce lien :
https://www.loom.com/share/0dd3096596c448bb8ac08f8fc72f933e

## Déploiement sur sepolia

ArenaFactory => https://sepolia.etherscan.io/tx/0x602ced4d72077814ef32653897ae638d545704d97c5bcdd24f4e5426f09d4660
GenesisArena => https://sepolia.etherscan.io/tx/0xa875f8e9c0a283de3216bd3a77f701c5a1561cd65cb32b3d9498db3e78990611

## Lauch App

### Front end

Front end is deployed here : https://alyra-xi.vercel.app/

or run locally

`yarn`
`yarn dev`

### backend

Run the hardhat blockchain
`npx hardhat node`

Run the deployment script
`npx hardhat run --network localhost scripts/deploy.ts`

## Test

Des tests fonctionnelles sur les 3 contrats se rapprochent des 100% de coverage


<img width="572" alt="Capture d’écran 2023-07-27 à 16 51 26" src="https://github.com/Noam-m33/Alyra/assets/70531041/e143eb2c-ae7f-4469-afb9-12270205c2df">
