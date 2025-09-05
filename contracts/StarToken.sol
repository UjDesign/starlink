// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title StarToken
 * @dev 星链平台的原生代币
 */
contract StarToken is ERC20, Ownable {
    // 总供应量：10亿
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18;
    
    // 仲裁基金地址
    address public arbitrationFund;
    
    // 质押信息
    struct Stake {
        uint256 amount;
        uint256 timestamp;
        uint256 contentId;
    }
    
    // 用户质押记录
    mapping(address => Stake[]) public userStakes;
    
    event Staked(address indexed user, uint256 amount, uint256 contentId);
    event Unstaked(address indexed user, uint256 amount, uint256 contentId);
    event RewardDistributed(address indexed user, uint256 amount);
    
    constructor(address _arbitrationFund) ERC20("StarLink Token", "STAR") {
        arbitrationFund = _arbitrationFund;
        _mint(msg.sender, MAX_SUPPLY);
    }
    
    /**
     * @dev 质押代币提升内容曝光
     */
    function stake(uint256 amount, uint256 contentId) public {
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        transfer(address(this), amount);
        
        userStakes[msg.sender].push(Stake({
            amount: amount,
            timestamp: block.timestamp,
            contentId: contentId
        }));
        
        emit Staked(msg.sender, amount, contentId);
    }
    
    /**
     * @dev 解除质押
     */
    function unstake(uint256 stakeIndex) public {
        require(stakeIndex < userStakes[msg.sender].length, "Stake does not exist");
        Stake memory stake = userStakes[msg.sender][stakeIndex];
        
        // 质押至少需要24小时
        require(block.timestamp >= stake.timestamp + 24 hours, "Stake must be locked for 24 hours");
        
        // 转移代币回用户
        _transfer(address(this), msg.sender, stake.amount);
        
        // 移除质押记录
        userStakes[msg.sender][stakeIndex] = userStakes[msg.sender][userStakes[msg.sender].length - 1];
        userStakes[msg.sender].pop();
        
        emit Unstaked(msg.sender, stake.amount, stake.contentId);
    }
    
    /**
     * @dev 分发奖励
     */
    function distributeReward(address user, uint256 amount) public onlyOwner {
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(address(this)) >= amount, "Insufficient contract balance");
        
        _transfer(address(this), user, amount);
        
        emit RewardDistributed(user, amount);
    }
    
    /**
     * @dev 更新仲裁基金地址
     */
    function setArbitrationFund(address _arbitrationFund) public onlyOwner {
        arbitrationFund = _arbitrationFund;
    }
    
    /**
     * @dev 获取用户质押总数
     */
    function getUserStakeCount(address user) public view returns (uint256) {
        return userStakes[user].length;
    }
}
    