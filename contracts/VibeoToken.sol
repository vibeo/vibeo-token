pragma solidity 0.4.24;

import 'openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol';
import 'openzeppelin-solidity/contracts/ownership/NoOwner.sol';
import "openzeppelin-solidity/contracts/token/ERC20/BurnableToken.sol";
import './CustomPausable.sol';

/**
 * @title Vibeo: A new era of Instant Messaging/Social app allowing access to a blockchain community.
 */
contract VibeoToken is StandardToken, BurnableToken, NoOwner, CustomPausable {
  string public constant name = "Vibeo";
  string public constant symbol = "VBEO";
  uint8 public constant decimals = 18;

  uint256 public constant MAX_SUPPLY = 950000000 * (10 ** uint256(decimals)); //950 M

  ///@notice When transfers are disabled, no one except the transfer agents can use the transfer function.
  bool public transfersEnabled;

  ///@notice This signifies that the ICO was successful.
  bool public softCapReached;

  mapping(bytes32 => bool) private mintingList;

  ///@notice Transfer agents are allowed to perform transfers regardless of the transfer state.
  mapping(address => bool) public transferAgents;

  ///@notice The end date of the crowdsale. 
  uint256 public icoEndDate;
  uint256 private year = 365 * 1 days;

  event TransferAgentSet(address agent, bool state);
  event BulkTransferPerformed(address[] _destinations, uint256[] _amounts);

  constructor() public {
    mintTokens(msg.sender, 453000000);
    setTransferAgent(msg.sender, true);
  }

  ///@notice Checks if the supplied address is able to perform transfers.
  ///@param _from The address to check against if the transfer is allowed.
  modifier canTransfer(address _from) {
    if (!transfersEnabled && !transferAgents[_from]) {
      revert();
    }
    _;
  }

  ///@notice Computes keccak256 hash of the supplied value.
  ///@param _key The string value to compute hash from.
  function computeHash(string _key) private pure returns(bytes32){
    return keccak256(abi.encodePacked(_key));
  }

  ///@notice Check if the minting for the supplied key was already performed.
  ///@param _key The key or category name of minting.
  modifier whenNotMinted(string _key) {
    if(mintingList[computeHash(_key)]) {
      revert();
    }
    
    _;
  }

  ///@notice This function enables the whitelisted application (internal application) to set the ICO end date and can only be used once.
  ///@param _date The date to set as the ICO end date.
  function setICOEndDate(uint256 _date) public whenNotPaused onlyWhitelisted {
    require(icoEndDate == 0);
    icoEndDate = _date;
  }

  ///@notice This function enables the whitelisted application (internal application) to set whether or not the softcap was reached.
  //This function can only be used once.
  function setSoftCapReached() public onlyWhitelisted {
    require(!softCapReached);
    softCapReached = true;
  }

  ///@notice This function enables token transfers for everyone. Can only be enabled after the end of the ICO.
  function enableTransfers() public onlyWhitelisted {
    require(icoEndDate > 0);
    require(now >= icoEndDate);
    require(!transfersEnabled);
    transfersEnabled = true;
  }

  ///@notice This function disables token transfers for everyone.
  function disableTransfers() public onlyWhitelisted {
    require(transfersEnabled);
    transfersEnabled = false;
  }

  ///@notice Mints the tokens only once against the supplied key (category).
  ///@param _key The key or the category of the allocation to mint the tokens for.
  ///@param _amount The amount of tokens to mint.
  function mintOnce(string _key, address _to, uint256 _amount) private whenNotPaused whenNotMinted(_key) {
    mintTokens(_to, _amount);
    mintingList[computeHash(_key)] = true;
  }

  ///@notice Mints the below-mentioned amount of tokens allocated to the Vibeo team. 
  //The tokens are only available to the team after 1 year of the ICO end.
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

  ///@notice Mints the below-mentioned amount of tokens allocated to the Vibeo treasury wallet. 
  //The tokens are available only when the softcap is reached and the ICO end date is specified.
  function mintTreasuryTokens() public onlyWhitelisted {
    require(softCapReached);

    if(icoEndDate == 0) {
      revert();
    }

    mintOnce("treasury", msg.sender, 90000000);
  }

  ///@notice Mints the below-mentioned amount of tokens allocated to the Vibeo board advisors. 
  //The tokens are only available to the team after 1 year of the ICO end.
  function mintAdvisorTokens() public onlyWhitelisted {
    if(icoEndDate == 0) {
      revert();
    }

    if(now < icoEndDate + year) {
      revert("Access is denied. The advisor tokens are locked for 1 year from the ICO end date.");
    }

    mintOnce("advisorsTokens", msg.sender, 80000000);
  }

  ///@notice Mints the below-mentioned amount of tokens allocated to the Vibeo partners. 
  //The tokens are immediately available once the softcap is reached.
  function mintPartnershipTokens() public onlyWhitelisted {
    require(softCapReached);
    mintOnce("partnerships", msg.sender, 60000000);
  }

  ///@notice Mints the below-mentioned amount of tokens allocated to reward the Vibeo community. 
  //The tokens are immediately available once the softcap is reached.
  function mintCommunityRewards() public onlyWhitelisted {
    require(softCapReached);
    mintOnce("communityRewards", msg.sender, 90000000);
  }

  ///@notice Mints the below-mentioned amount of tokens allocated to Vibeo user adoption. 
  //The tokens are immediately available once the softcap is reached and ICO end date is specified.
  function mintUserAdoptionTokens() public onlyWhitelisted {
    require(softCapReached);

    if(icoEndDate == 0) {
      revert();
    }

    mintOnce("useradoption", msg.sender, 95000000);
  }

  ///@notice Mints the below-mentioned amount of tokens allocated to the Vibeo marketing channel. 
  //The tokens are immediately available once the softcap is reached.
  function mintMarketingTokens() public onlyWhitelisted {
    require(softCapReached);
    mintOnce("marketing", msg.sender, 32000000);
  }

  ///@notice Enables or disables the specified address to become a transfer agent.
  //Transfer agents are such wallet addresses which can perform transfers even when transfer state is disabled.
  ///@param _agent The wallet address of the transfer agent to assign or update.
  ///@param _state Sets the status of the supplied wallet address to be a transfer agent. 
  ///When this is set to false, the address will no longer be considered as a transfer agent.
  function setTransferAgent(address _agent, bool _state) public whenNotPaused onlyWhitelisted {
    transferAgents[_agent] = _state;
    emit TransferAgentSet(_agent, _state);
  }

  ///@notice Checks if the specified address is a transfer agent.
  ///@param _address The wallet address of the transfer agent to assign or update.
  ///When this is set to false, the address will no longer be considered as a transfer agent.
  function isTransferAgent(address _address) public constant onlyWhitelisted returns(bool) {
    return transferAgents[_address];
  }

  ///@notice Transfers the specified value of tokens to the destination address. 
  //Transfers can only happen when the tranfer state is enabled. 
  //Transfer state can only be enabled after the end of the crowdsale.
  ///@param _to The destination wallet address to transfer funds to.
  ///@param _value The amount of tokens to send to the destination address.
  function transfer(address _to, uint256 _value) public whenNotPaused canTransfer(msg.sender) returns (bool) {
    require(_to != address(0));
    return super.transfer(_to, _value);
  }

  ///@notice Mints the supplied value of the tokens to the destination address.
  //Minting cannot be performed any further once the maximum supply is reached.
  //This function is private and cannot be used by anyone except for this contract.
  ///@param _to The address which will receive the minted tokens.
  ///@param _value The amount of tokens to mint.
  function mintTokens(address _to, uint256 _value) private {
    require(_to != address(0));
    _value = _value.mul(10 ** uint256(decimals));
    require(totalSupply_.add(_value) <= MAX_SUPPLY);

    totalSupply_ = totalSupply_.add(_value);
    balances[_to] = balances[_to].add(_value);
  }

  ///@notice Transfers tokens from a specified wallet address.
  ///@dev This function is overriden to leverage transfer state feature.
  ///@param _from The address to transfer funds from.
  ///@param _to The address to transfer funds to.
  ///@param _value The amount of tokens to transfer.
  function transferFrom(address _from, address _to, uint256 _value) canTransfer(_from) public returns (bool) {
    require(_to != address(0));
    return super.transferFrom(_from, _to, _value);
  }

  ///@notice Approves a wallet address to spend on behalf of the sender.
  ///@dev This function is overriden to leverage transfer state feature.
  ///@param _spender The address which is approved to spend on behalf of the sender.
  ///@param _value The amount of tokens approve to spend. 
  function approve(address _spender, uint256 _value) public canTransfer(msg.sender) returns (bool) {
    require(_spender != address(0));
    return super.approve(_spender, _value);
  }


  ///@notice Increases the approval of the spender.
  ///@dev This function is overriden to leverage transfer state feature.
  ///@param _spender The address which is approved to spend on behalf of the sender.
  ///@param _addedValue The added amount of tokens approved to spend.
  function increaseApproval(address _spender, uint256 _addedValue) public canTransfer(msg.sender) returns(bool) {
    require(_spender != address(0));
    return super.increaseApproval(_spender, _addedValue);
  }

  ///@notice Decreases the approval of the spender.
  ///@dev This function is overriden to leverage transfer state feature.
  ///@param _spender The address of the spender to decrease the allocation from.
  ///@param _subtractedValue The amount of tokens to subtract from the approved allocation.
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

  ///@notice Allows only the admins and/or whitelisted applications to perform bulk transfer operation.
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
