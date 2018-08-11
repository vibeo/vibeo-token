pragma solidity 0.4.24;

import 'openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol';
import 'openzeppelin-solidity/contracts/ownership/NoOwner.sol';
import "openzeppelin-solidity/contracts/token/ERC20/BurnableToken.sol";
import './CustomPausable.sol';

/**
 * @title VibeoToken
 * @dev Very simple ERC20 Token example, where all tokens are pre-assigned to the creator.
 * `StandardToken` functions.
 */
contract VibeoToken is StandardToken, BurnableToken, NoOwner, CustomPausable {
  string public constant name = "Vibeo";
  string public constant symbol = "VBEO";
  uint8 public constant decimals = 18;
  uint256 public constant MAX_SUPPLY = 950000000 * (10 ** uint256(decimals)); //950 M

  bool public transfersEnabled;
  bool public softCapReached;

  mapping(bytes32 => bool) public minted;
  mapping(address => bool) public transferAgents;

  uint256 public tokenCreatedOn;
  uint256 public icoEndDate;
  uint256 public year = 365 * 1 days;

  event TransferAgentSet(address agent, bool state);
  event BulkTransferPerformed(address[] _destinations, uint256[] _amounts);
  /**
   * @dev Constructor that gives msg.sender all of existing tokens.
   */
  constructor() public {
    tokenCreatedOn = now;
    mintTokens(msg.sender, 453000000);
    setTransferAgent(msg.sender, true);
  }

  modifier canTransfer(address _from) {
    if (!transfersEnabled && !transferAgents[_from]) {
      revert();
    }
    _;
  }

  function computeHash(string key) private pure returns(bytes32){
    return keccak256(abi.encodePacked(key));
  }

  modifier whenNotMinted(string key) {
    if(minted[computeHash(key)]) {
      revert();
    }

    _;
  }

  function setICOEndDate(uint256 date) public whenNotPaused onlyWhitelisted {
    require(icoEndDate == 0);
    icoEndDate = date;
  }

  function setSoftCapReached() public onlyWhitelisted {
    require(!softCapReached);
    softCapReached = true;
  }

  function enableTransfers() public onlyWhitelisted {
    require(now >= icoEndDate);
    require(!transfersEnabled);
    transfersEnabled = true;
  }

  function disableTransfers() public onlyWhitelisted {
    require(transfersEnabled);
    transfersEnabled = false;
  }

  function mintOnce(string key, address _to, uint256 balance) whenNotPaused whenNotMinted(key) private {
    mintTokens(_to, balance);
    minted[computeHash(key)] = true;
  }

  function mintTeamTokens() public onlyWhitelisted {
    require(softCapReached);

    if(icoEndDate == 0) {
      revert();
    }
    
    if(now < icoEndDate + year) {
      revert("Access is denied. The team tokens are locked for 1 year from the ICO end date.");
    }

    mintOnce("team", msg.sender, 50000000);
  }

  function mintTreasuryTokens() public onlyWhitelisted {
    require(softCapReached);

    if(icoEndDate == 0) {
      revert();
    }

    mintOnce("treasury", msg.sender, 90000000);
  }

  function mintAdvisorTokens() public onlyWhitelisted {
    if(icoEndDate == 0) {
      revert();
    }

    if(now < icoEndDate + year) {
      revert("Access is denied. The advisor tokens are locked for 1 year from the ICO end date.");
    }

    mintOnce("advisorsTokens", msg.sender, 80000000);
  }

  function mintPartnershipTokens() public onlyWhitelisted {
    require(softCapReached);
    mintOnce("partnerships", msg.sender, 60000000);
  }

  function mintCommunityRewards() public onlyWhitelisted {
    require(softCapReached);
    mintOnce("communityRewards", msg.sender, 90000000);
  }

  function mintUserAdoptionTokens() public onlyWhitelisted {
    require(softCapReached);

    if(icoEndDate == 0) {
      revert();
    }

    mintOnce("useradoption", msg.sender, 95000000);
  }

  function mintMarketingTokens() public onlyWhitelisted {
    require(softCapReached);
    mintOnce("marketing", msg.sender, 32000000);
  }

  function setTransferAgent(address _agent, bool _state) whenNotPaused onlyWhitelisted public {
    transferAgents[_agent] = _state;
    emit TransferAgentSet(_agent, _state);
  }

  function transfer(address _to, uint256 _value) public whenNotPaused canTransfer(msg.sender) returns (bool) {
    require(_to != address(0));
    return super.transfer(_to, _value);
  }

  function mintTokens(address _to, uint256 _value) private {
    require(_to != address(0));
    _value = _value.mul(10 ** uint256(decimals));
    require(totalSupply_.add(_value) <= MAX_SUPPLY);

    totalSupply_ = totalSupply_.add(_value);
    balances[_to] = balances[_to].add(_value);
  }

  ///@dev This function is overriden to leverage Pausable feature.
  function transferFrom(address _from, address _to, uint256 _value) canTransfer(_from) public returns (bool) {
    require(_to != address(0));
    return super.transferFrom(_from, _to, _value);
  }

  ///@dev This function is overriden to leverage Pausable feature.
  function approve(address _spender, uint256 _value) public canTransfer(msg.sender) returns (bool) {
    require(_spender != address(0));
    return super.approve(_spender, _value);
  }


  ///@dev This function is overriden to leverage Pausable feature.
  function increaseApproval(address _spender, uint256 _addedValue) public canTransfer(msg.sender) returns(bool) {
    require(_spender != address(0));
    return super.increaseApproval(_spender, _addedValue);
  }

  ///@dev This function is overriden to leverage Pausable feature.
  function decreaseApproval(address _spender, uint256 _subtractedValue) public canTransfer(msg.sender) whenNotPaused returns (bool) {
    require(_spender != address(0));
    return super.decreaseApproval(_spender, _subtractedValue);
  }

  ///@notice Returns the sum of supplied values.
  ///@param _values The collection of values to create the sum from.
  function sumOf(uint256[] _values) private pure returns(uint256) {
    uint256 total = 0;

    for (uint256 i = 0; i < _values.length; i++) {
      total = total.add(_values[i]);
    }

    return total;
  }

  ///@notice Allows admins and/or whitelist to perform bulk transfer operation.
  ///@param _destinations The destination wallet addresses to send funds to.
  ///@param _amounts The respective amount of fund to send to the specified addresses. 
  function bulkTransfer(address[] _destinations, uint256[] _amounts) public onlyWhitelisted {
    require(_destinations.length == _amounts.length);

    //Saving gas by determining if the sender has enough balance
    //to post this transaction.
    uint256 requiredBalance = sumOf(_amounts);
    require(balances[msg.sender] >= requiredBalance);
    
    for (uint256 i = 0; i < _destinations.length; i++) {
     transfer(_destinations[i], _amounts[i]);
    }

    emit BulkTransferPerformed(_destinations, _amounts);
  }

  ///@notice Burns the coins held by the sender.
  ///@param _value The amount of coins to burn.
  ///@dev This function is overriden to leverage Pausable feature.
  function burn(uint256 _value) public whenNotPaused {
    super.burn(_value);
  }
}
