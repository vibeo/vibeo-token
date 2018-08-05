pragma solidity 0.4.24;

import 'openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol';
import 'openzeppelin-solidity/contracts/ownership/NoOwner.sol';
import './CustomPausable.sol';

/**
 * @title VibeoToken
 * @dev Very simple ERC20 Token example, where all tokens are pre-assigned to the creator.
 * `StandardToken` functions.
 */
contract VibeoToken is StandardToken, NoOwner, CustomPausable {

  string public constant name = "Vibeo";
  string public constant symbol = "VBEO";
  uint8 public constant decimals = 18;

  uint256 public constant INITIAL_SUPPLY = 950000000 * (10 ** uint256(decimals)); //950 M

  /**
   * @dev Constructor that gives msg.sender all of existing tokens.
   */
  constructor() public {
    totalSupply_ = INITIAL_SUPPLY;
    balances[msg.sender] = INITIAL_SUPPLY;
    emit Transfer(address(0), msg.sender, INITIAL_SUPPLY);
  }

  function transfer(address _to, uint256 _value) public whenNotPaused returns (bool) {
    return super.transfer(_to, _value);
  }

  function transferFrom(address _from, address _to, uint256 _value) public whenNotPaused returns (bool) {
    return super.transferFrom(_from, _to, _value);
  }

  function approve(address _spender,uint256 _value) public whenNotPaused returns (bool) {
    return super.approve(_spender, _value);
  }

  function increaseApproval(address _spender, uint _addedValue) public whenNotPaused returns (bool success) {
    return super.increaseApproval(_spender, _addedValue);
  }

  function decreaseApproval(address _spender, uint _subtractedValue) public whenNotPaused returns (bool success) {
    return super.decreaseApproval(_spender, _subtractedValue);
  }

}
