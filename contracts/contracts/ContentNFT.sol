// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract ContentNFT is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    // 内容元数据
    struct Content {
        string ipfsHash;
        uint256 timestamp;
        address creator;
        uint256 royalty; // 版税比例（ Basis points，100 = 1%）
    }

    mapping(uint256 => Content) public tokenIdToContent;

    event ContentCreated(
        uint256 indexed tokenId,
        string ipfsHash,
        address indexed creator,
        uint256 timestamp
    );

    constructor() ERC721("Starlink Content", "STC") {
        _transferOwnership(msg.sender);
    }

    // 铸造新内容NFT
    function mintContent(
        string memory ipfsHash,
        address creator,
        uint256 royalty
    ) external onlyOwner returns (uint256) {
        require(royalty <= 1000, "Royalty cannot exceed 10%");
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        _safeMint(creator, tokenId);
        
        tokenIdToContent[tokenId] = Content({
            ipfsHash: ipfsHash,
            timestamp: block.timestamp,
            creator: creator,
            royalty: royalty
        });
        
        emit ContentCreated(tokenId, ipfsHash, creator, block.timestamp);
        return tokenId;
    }

    // 获取内容元数据
    function getContent(uint256 tokenId) external view returns (Content memory) {
        require(_exists(tokenId), "Content does not exist");
        return tokenIdToContent[tokenId];
    }
}
    