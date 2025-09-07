// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ContentNFT is ERC721, Ownable {
    uint256 private _nextTokenId;

    struct ContentMeta {
        string title;
        string ipfsHash;
        string contentType;
        uint256 mintTime;
        uint256 likeCount;
    }

    event ContentMinted(
        uint256 indexed tokenId,
        address indexed recipient,
        string ipfsHash,
        uint256 mintTime
    );

    event ContentLiked(uint256 indexed tokenId, uint256 newLikeCount);

    mapping(uint256 => ContentMeta) public tokenMeta;

    /**
     * 核心修改：添加 `: Ownable(msg.sender)`，显式传递初始所有者（部署者）
     * 同时保持 ERC721 的名称、符号参数传递
     */
    constructor(
        string memory nftName,
        string memory nftSymbol
    ) ERC721(nftName, nftSymbol) Ownable(msg.sender) { // 新增 Ownable(msg.sender)
        _nextTokenId = 1;
    }

    function mintContent(
        address to,
        string memory title,
        string memory ipfsHash,
        string memory contentType
    ) external onlyOwner returns (uint256) {
        require(to != address(0), unicode"ContentNFT: 接收地址不能为零地址");
        require(bytes(title).length > 0, unicode"ContentNFT: 标题不能为空");
        require(bytes(ipfsHash).length > 0, unicode"ContentNFT: IPFS哈希不能为空");
        require(bytes(contentType).length > 0, unicode"ContentNFT: 内容类型不能为空");

        uint256 tokenId = _nextTokenId;
        _nextTokenId++;

        _mint(to, tokenId);

        tokenMeta[tokenId] = ContentMeta({
            title: title,
            ipfsHash: ipfsHash,
            contentType: contentType,
            mintTime: block.timestamp,
            likeCount: 0
        });

        emit ContentMinted(tokenId, to, ipfsHash, block.timestamp);
        return tokenId;
    }

    function likeContent(uint256 tokenId) external {
        ownerOf(tokenId);
        tokenMeta[tokenId].likeCount++;
        emit ContentLiked(tokenId, tokenMeta[tokenId].likeCount);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        ownerOf(tokenId);
        ContentMeta memory meta = tokenMeta[tokenId];
        return string(abi.encodePacked("ipfs://", meta.ipfsHash));
    }

    function batchGetTokenMeta(uint256[] calldata tokenIds) external view returns (ContentMeta[] memory) {
        uint256 length = tokenIds.length;
        ContentMeta[] memory metaList = new ContentMeta[](length);

        for (uint256 i = 0; i < length; i++) {
            uint256 tokenId = tokenIds[i];
            ownerOf(tokenId);
            metaList[i] = tokenMeta[tokenId];
        }

        return metaList;
    }
}