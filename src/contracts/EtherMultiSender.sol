pragma solidity 0.7.0;
import './SafeMath.sol';


contract ERC20Basic {
    function totalSupply() public view returns (uint256);
    function balanceOf(address who) public view returns (uint256);
    function transfer(address to, uint256 value) public returns (bool);
    event Transfer(address indexed from, address indexed to, uint256 value);
}

contract ERC20 is ERC20Basic {
    function allowance(address owner, address spender) public view returns (uint256);
    function transferFrom(address from, address to, uint256 value) public returns (bool);
    function approve(address spender, uint256 value) public returns (bool);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

contract EtherMultiSender {
    using SafeMath for uint256;
    function multisend(address payable[] memory _recipients, uint256[] memory _balances)
        public
        payable
    {
        uint256 total = msg.value;
        uint256 i = 0;
        for (i; i < _recipients.length; i++) {
            require(total >= _balances[i]);
            total = total.sub(_balances[i]);
            _recipients[i].transfer(_balances[i]);
        }
    }

    function multisendErc20(address token, address[] _recipients, uint256[] _balances) public payable {
        require(_recipients.length <= 200);

        uint total = 0;
        uint256 i = 0;
        Erc20 erc20 = Erc20(token);

        for(i; i < _recipients.length; i++) {
            require(total >= _balances[i]);
            total = total - _balances[i];
            erc20.transferFrom(msg.sender, _recipients[i], _balances[i]);
        }
    }
}
