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
  bool public transfersEnabled;
  mapping(bytes32 => bool) public minted;
  mapping(address => bool) public transferAgents;
  uint256 public icoEndDate;
  uint public year = 365 * 1 days;
  uint256 public constant MAX_SUPPLY = 950000000 * (10 ** uint256(decimals)); //950 M

  /**
   * @dev Constructor that gives msg.sender all of existing tokens.
   */

  modifier canTransfer(address _from, address _to) {
    if (!transfersEnabled && !transferAgents[_from]) {
      revert();
    }
    _;
  }

  modifier notMinted(string key) {
    if(minted[keccak256(key)]) revert();
    _;
  }

  constructor() public {
    mintTokens(msg.sender, 453000000);
    setTransferAgent(msg.sender, true);
  }

  function setICOEndDate() public onlyWhitelisted {
    require(icoEndDate == 0);
    icoEndDate = now;
    transfersEnabled = true;
  }

  function mintOnce(string key, address _to, uint balance) notMinted(key) internal {
    mintTokens(_to, balance);
    minted[keccak256(key)] = true;
  }

  function mintTeamTokens() public onlyWhitelisted {
    if(icoEndDate == 0) revert();
    if(now < icoEndDate + year) revert();
    mintOnce("team", msg.sender, 50000000);
  }

  function mintTreasuryTokens() public onlyWhitelisted {
    if(icoEndDate == 0) revert();
    mintOnce("treasury", msg.sender, 90000000);
  }

  function mintAdvisorTokens() public onlyWhitelisted {
    if(icoEndDate == 0) revert();
    if(now < icoEndDate + year) revert();
    mintOnce("advisorsTokens", msg.sender, 80000000);
  }

  function mintPartnershipTokens() public onlyWhitelisted {
    mintOnce("partnerships", msg.sender, 60000000);
    setTransferAgent(msg.sender, true);
  }

  function mintCommunityRewards() public onlyWhitelisted {
    if(icoEndDate == 0) revert();
    mintOnce("communityRewards", msg.sender, 90000000);
  }

  function mintUserAdoptionTokens() public onlyWhitelisted {
    if(icoEndDate == 0) revert();
    mintOnce("useradoption", msg.sender, 95000000);
  }

  function mintMarketingTokens() public onlyWhitelisted {
    mintOnce("marketing", msg.sender, 32000000);
    setTransferAgent(msg.sender, true);

  }

  function setTransferAgent(address _agent, bool _state) onlyWhitelisted public {
    transferAgents[_agent] = _state;
  }

  function transfer(address _to, uint256 _value) public canTransfer(msg.sender, _to) whenNotPaused returns (bool) {
    return super.transfer(_to, _value);
  }

  function mintTokens(address _to, uint _value) internal {
    _value = _value.mul(10 ** uint256(decimals));
    require(totalSupply_.add(_value) <= MAX_SUPPLY);
    totalSupply_ = totalSupply_.add(_value);
    balances[_to] = balances[_to].add(_value);
  }

  function transferFrom(address _from, address _to, uint256 _value) canTransfer(_from, _to) public whenNotPaused returns (bool) {
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
