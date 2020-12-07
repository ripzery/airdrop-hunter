pragma solidity 0.7.0;
import './SafeMath.sol';

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
}
