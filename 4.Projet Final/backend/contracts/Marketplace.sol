// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";


contract Marketplace is Ownable, ReentrancyGuard  {
    using Counters for Counters.Counter;
    Counters.Counter public _counter;
    struct NFT {
        uint id;
        address owner;
        uint price;
        bool isSold;
    }

    mapping(uint => NFT) public listedNFTs;
    mapping(address => uint) public balances;

    uint public marketplaceFee = 5;

    event NFTListed(uint id, address owner, uint price);
    event NFTSold(uint id, address from, address to, uint price);
    event CancelListing(uint id, address owner);

    function approve(address nftAddress, uint tokenId) external {
        IERC721 nftContract = IERC721(nftAddress);
        require(nftContract.ownerOf(tokenId) == msg.sender, "You are not the owner of this NFT");
        nftContract.approve(address(this), tokenId);
    }

    function list(address nftAddress, uint tokenId, uint price) external {
        IERC721 nftContract = IERC721(nftAddress);
        require(nftContract.ownerOf(tokenId) == msg.sender, "You are not the owner of this NFT");
        require(nftContract.getApproved(tokenId) == address(this), "Contract is not approved to manage this NFT");
        require(price > 0, "Price must be greater than 0");
        _counter.increment();
        uint currentId = _counter.current();
        listedNFTs[currentId] = NFT({
            id: currentId,
            owner: msg.sender,
            price: price,
            isSold: false
        });
        emit NFTListed(currentId, msg.sender, price);
    }

    function cancelListing(uint id) external {
        require(listedNFTs[id].owner == msg.sender, "You are not the owner of this NFT");
        require(listedNFTs[id].isSold == false, "This NFT is already sold");
        delete listedNFTs[id];

        emit CancelListing(id, msg.sender);
    }

    function buy(uint id) external payable nonReentrant {
        require(listedNFTs[id].isSold == false, "This NFT is already sold");
        require(listedNFTs[id].owner != msg.sender, "You are the owner of this NFT");
        require(listedNFTs[id].price == msg.value, "The price is not equal to the value sent");
        listedNFTs[id].isSold = true;
        balances[listedNFTs[id].owner] = balances[listedNFTs[id].owner] + (msg.value * (100 - marketplaceFee) / 100);
        IERC721 nftContract = IERC721(msg.sender);
        nftContract.safeTransferFrom(listedNFTs[id].owner, msg.sender, id);
        emit NFTSold(id, listedNFTs[id].owner, msg.sender, msg.value);
    }

    function withdrawFees() external onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }

    function withdraw() external nonReentrant() {
        uint senderBalance = balances[msg.sender];
        require(senderBalance > 0, "No balance");
        payable(msg.sender).transfer(senderBalance);
        senderBalance = 0;
    }
}