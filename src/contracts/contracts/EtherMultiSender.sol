// SPDX-License-Identifier: MIT

pragma solidity 0.7.4;
import './SafeMath.sol';

abstract contract ERC20Basic {
    function totalSupply() virtual public view returns (uint256);
    function balanceOf(address who) virtual public view returns (uint256);
    function transfer(address to, uint256 value) virtual public returns (bool);
    event Transfer(address indexed from, address indexed to, uint256 value);
}

abstract contract ERC20 is ERC20Basic {
    function allowance(address owner, address spender) virtual public view returns (uint256);
    function transferFrom(address from, address to, uint256 value) virtual public returns (bool);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

contract EtherMultiSender {
    using SafeMath for uint256;
    function multisend(address payable[] memory _recipients, uint256[] memory _balances)
        public
        payable
    {
        //test
        uint256 total = msg.value;
        uint256 i = 0;
        for (i; i < _recipients.length; i++) {
            require(total >= _balances[i]);
            total = total.sub(_balances[i]);
            _recipients[i].transfer(_balances[i]);
        }
    }

    function multisendErc20(address token, address payable[] memory _recipients, uint256[] memory _balances) public payable {
        require(_recipients.length <= 200);

        uint256 i = 0;
        ERC20 erc20 = ERC20(token);

        for(i; i < _recipients.length; i++) {
            erc20.transferFrom(msg.sender, _recipients[i], _balances[i]);
        }
    }
}
