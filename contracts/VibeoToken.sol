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
  address public teamWallet;
  address public advisorsWallet;
  address public treasuryWallet;
  address public partnershipWallet;
  address public communityRewardsWallet;
  address public userAdoptionWallet;
  address public marketingWallet;
  bool public initialized;
  uint256 public icoEndDate;
  bool public icoDateInitialized;
  uint256 public constant INITIAL_SUPPLY = 950000000 * (10 ** uint256(decimals)); //950 M

  mapping(address => bool) public transfersAfterICO;
  mapping(address => bool) public transfersAfter1Year;


  /**
   * @dev Constructor that gives msg.sender all of existing tokens.
   */

  modifier canTransfer(address _from, address _to) {
    if(transfersAfterICO[_from]) {
      if(!icoDateInitialized || now < icoEndDate) revert();
    } else if(transfersAfter1Year[_from]) {
      if(!icoDateInitialized || now < icoEndDate + 365* 1 days) revert();
    }
    _;
  }

  constructor(address _teamWallet, address _advisorsWallet, address _treasuryWallet, address _partnershipWallet, address _communityRewardsWallet, address _userAdoptionWallet, address _marketingWallet) public {
    totalSupply_ = INITIAL_SUPPLY;
    require(_teamWallet != address(0));
    require(_advisorsWallet != address(0));
    require(_treasuryWallet != address(0));
    require(_partnershipWallet != address(0));
    require(_communityRewardsWallet != address(0));
    require(_marketingWallet != address(0));
    require(_userAdoptionWallet != address(0));
    teamWallet = _teamWallet;
    advisorsWallet = _advisorsWallet;
    treasuryWallet = _treasuryWallet;
    partnershipWallet = _partnershipWallet;
    communityRewardsWallet = _communityRewardsWallet;
    userAdoptionWallet = _userAdoptionWallet;
    marketingWallet = _marketingWallet;
  }



  function setTeamWallet(address _teamWallet) public onlyWhitelisted {
    require(!initialized);
    teamWallet = _teamWallet;
  }

  function setAdvisorsWallet(address _advisorWallet) public onlyWhitelisted {
    require(!initialized);
    advisorsWallet = _advisorWallet;
  }

  function setPartnershipWallet(address _partnershipWallet) public onlyWhitelisted {
    require(!initialized);
    partnershipWallet = _partnershipWallet;
  }

  function setCommunityRewardsWallet(address _communityRewardsWallet) public onlyWhitelisted {
    require(!initialized);
    communityRewardsWallet = _communityRewardsWallet;
  }

  function setMarketingWallet(address _marketingWallet) public onlyWhitelisted {
    require(!initialized);
    marketingWallet = _marketingWallet;
  }

  function setUserAdoptionWallet(address _userAdoptionWallet) public onlyWhitelisted {
    require(!initialized);
    userAdoptionWallet = _userAdoptionWallet;
  }

  function setICOEndDate(uint _icoEndDate) public onlyWhitelisted {
    icoEndDate = now;
    icoDateInitialized = true;
  }

  function setTreasuryWallet(address _treasuryWallet) public onlyWhitelisted {
    require(!initialized);
    treasuryWallet = _treasuryWallet;
  }

  function initialize() public onlyWhitelisted {
    require(!initialized);
    balances[msg.sender] = INITIAL_SUPPLY;

    transfer(teamWallet, 50000000 * (10 ** uint256(decimals)));
    transfer(advisorsWallet, 80000000 * (10 ** uint256(decimals)));
    transfer(treasuryWallet, 90000000 * (10 ** uint256(decimals)));
    transfer(partnershipWallet, 60000000 * (10 ** uint256(decimals)));
    transfer(communityRewardsWallet, 90000000 * (10 ** uint256(decimals)));
    transfer(userAdoptionWallet, 95000000 * (10 ** uint256(decimals)));
    transfer(marketingWallet, 32000000 * (10 ** uint256(decimals)));

    transfersAfterICO[treasuryWallet] = true;
    transfersAfterICO[communityRewardsWallet] = true;
    transfersAfterICO[userAdoptionWallet] = true;

    transfersAfter1Year[teamWallet] = true;
    transfersAfter1Year[advisorsWallet] = true;

    initialized = true;
  }

  function transfer(address _to, uint256 _value) public canTransfer(msg.sender, _to) whenNotPaused returns (bool) {
    return super.transfer(_to, _value);
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
