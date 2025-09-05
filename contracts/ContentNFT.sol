// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title ContentNFT
 * @dev 用于短视频内容的NFT确权
 */
contract ContentNFT is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;
    
    // 平台收入地址
    address public platformTreasury;
    
    // NFT元数据
    struct ContentMetadata {
        string ipfsHash;         // IPFS哈希
        uint256 timestamp;       // 发布时间
        uint256 royaltyFee;      // 版税比例(%)
        address creator;         // 创作者
        bool isOriginal;         // 是否原创
        address originalCreator; // 原创作者(转载时使用)
    }
    
    // 存储所有NFT元数据
    mapping(uint256 => ContentMetadata) public contentMetadata;
    
    // 举报记录
    struct Report {
        address reporter;
        string reason;
        string evidence;
        bool resolved;
        bool valid;
    }
    
    // NFT的举报记录
    mapping(uint256 => Report[]) public tokenReports;
    
    // 被冻结的NFT
    mapping(uint256 => bool) public frozenTokens;
    
    event ContentCreated(
        uint256 indexed tokenId,
        address indexed creator,
        string ipfsHash,
        bool isOriginal,
        uint256 timestamp
    );
    
    event ContentReported(
        uint256 indexed tokenId,
        address indexed reporter,
        string reason
    );
    
    event ReportResolved(
        uint256 indexed tokenId,
        bool isValid,
        address resolver
    );
    
    constructor(address _treasury) ERC721("StarLink Content", "STARC") {
        platformTreasury = _treasury;
    }
    
    /**
     * @dev 创建内容NFT
     */
    function mintContent(
        string memory ipfsHash,
        uint256 royaltyFee,
        bool isOriginal,
        address originalCreator
    ) public returns (uint256) {
        require(royaltyFee <= 20, "Royalty fee cannot exceed 20%");
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        _safeMint(msg.sender, tokenId);
        
        contentMetadata[tokenId] = ContentMetadata({
            ipfsHash: ipfsHash,
            timestamp: block.timestamp,
            royaltyFee: royaltyFee,
            creator: msg.sender,
            isOriginal: isOriginal,
            originalCreator: originalCreator
        });
        
        emit ContentCreated(tokenId, msg.sender, ipfsHash, isOriginal, block.timestamp);
        return tokenId;
    }
    
    /**
     * @dev 举报内容
     */
    function reportContent(
        uint256 tokenId,
        string memory reason,
        string memory evidence
    ) public {
        require(_exists(tokenId), "Content does not exist");
        
        tokenReports[tokenId].push(Report({
            reporter: msg.sender,
            reason: reason,
            evidence: evidence,
            resolved: false,
            valid: false
        }));
        
        // 自动冻结内容等待审核
        frozenTokens[tokenId] = true;
        
        emit ContentReported(tokenId, msg.sender, reason);
    }
    
    /**
     * @dev 解决举报
     */
    function resolveReport(
        uint256 tokenId,
        uint256 reportIndex,
        bool isValid
    ) public onlyOwner {
        require(_exists(tokenId), "Content does not exist");
        require(reportIndex < tokenReports[tokenId].length, "Report does not exist");
        require(!tokenReports[tokenId][reportIndex].resolved, "Report already resolved");
        
        tokenReports[tokenId][reportIndex].resolved = true;
        tokenReports[tokenId][reportIndex].valid = isValid;
        
        // 如果举报无效，解除冻结
        if (!isValid) {
            frozenTokens[tokenId] = false;
        }
        
        emit ReportResolved(tokenId, isValid, msg.sender);
    }
    
    /**
     * @dev 转移NFT时收取版税
     */
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override {
        require(!frozenTokens[tokenId], "Content is frozen");
        
        ContentMetadata memory metadata = contentMetadata[tokenId];
        uint256 price = msg.value;
        
        // 计算版税
        uint256 royalty = (price * metadata.royaltyFee) / 100;
        uint256 platformFee = (price * 10) / 100; // 平台收取10%费用
        uint256 sellerAmount = price - royalty - platformFee;
        
        // 转账
        payable(metadata.creator).transfer(royalty);
        payable(platformTreasury).transfer(platformFee);
        payable(from).transfer(sellerAmount);
        
        super.transferFrom(from, to, tokenId);
    }
    
    /**
     * @dev 获取内容元数据
     */
    function getContentMetadata(uint256 tokenId) public view returns (ContentMetadata memory) {
        require(_exists(tokenId), "Content does not exist");
        return contentMetadata[tokenId];
    }
    
    /**
     * @dev 检查内容是否被冻结
     */
    function isContentFrozen(uint256 tokenId) public view returns (bool) {
        return frozenTokens[tokenId];
    }
}
    