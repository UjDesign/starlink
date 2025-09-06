// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract StarToken is ERC20, Ownable {
    /**
     * 核心修改：添加 `: Ownable(msg.sender)`，传递初始所有者
     * ERC20 构造函数需传入代币名称和符号（如 "Star Token" 和 "STAR"）
     */
    constructor(
        string memory tokenName,
        string memory tokenSymbol,
        uint256 initialSupply // 可选：初始发行量（如 1000000 * 10^18，即100万枚）
    ) ERC20(tokenName, tokenSymbol) Ownable(msg.sender) { // 新增 Ownable(msg.sender)
        //  mint 初始代币给所有者（可选，根据业务需求决定是否初始化发行量）
        _mint(msg.sender, initialSupply * 10 ** decimals());
    }

    /**
     * 可选：仅所有者可增发代币（示例功能）
     */
    function mint(address to, uint256 amount) external onlyOwner {
        require(to != address(0), unicode"StarToken: 接收地址不能为零地址");
        _mint(to, amount);
    }
}