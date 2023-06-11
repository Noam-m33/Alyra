# Voting Project

This project contains a Voting smart contracts for a small organization.

The smart contract is unit tested using Hardhat.

Don't forget to install npm packages before if it the first time you're running the project

```shell
npm install
```

You could run the test by running :

```shell
npx hardhat test
```

If you want to see the coverage, it could be done by using :

```shell
npx hardhat coverage
```

For this test we have separate the testing in multiple section :

- Getter: will test the getters functions
- Actions: Voting, Proposal, Result
- Worklow: Testing incorect worflow
