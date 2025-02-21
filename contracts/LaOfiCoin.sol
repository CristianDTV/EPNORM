// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title LaOfiCoin
 * @dev Token ERC20 para uso interno en LaOfi (pagos, fidelización).
 */
contract LaOfiCoin is ERC20, Ownable {
    constructor() ERC20("LaOfiCoin", "LOFI") Ownable(msg.sender) {
        _mint(msg.sender, 1_000_000 * 10 ** decimals()); // 1M tokens iniciales
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
