let Token = artifacts.require("./VibeoToken.sol")
const { ether }  = require('./helpers/ether');
const { EVMRevert } = require('./helpers/EVMRevert.js')
const { increaseTimeTo, duration} = require('./helpers/increaseTime');
const { latestTime } = require('./helpers/latestTime');
const BigNumber  = require('bignumber.js');
const nov302018 = 1543536000;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should()

contract('Vibeo ERC20 Token', async function(accounts) {
  describe('  Construct Vibeo Token', async () => {
    it('must correctly create the token.', async () => {
      const expectedTotalSupply = ether(453000000);
      const expectedMaxSupply = ether(950000000);

      const token = await Token.new();
      const totalSupply = await token.totalSupply();

      totalSupply.should.be.bignumber.equal(expectedTotalSupply);

      const MAX_SUPPLY = await token.MAX_SUPPLY();
      MAX_SUPPLY.should.be.bignumber.equal(expectedMaxSupply);

      assert(await token.transferAgents(accounts[0]));
    });
  });

  describe('  Minting feature ruleset::', async () => {
    let token;

    beforeEach(async () => {
      token = await Token.new();
    });

    it('must correctly mint treasury tokens only once and only if the ICO is successful.', async () => {
      const totalSupply = await token.totalSupply();
      const treasuryTokens = ether(90000000);

      /*-------------------------------------------------------------
       SHOULD NOT ALLOW MINTING BEFORE THE ICO END DATE IS SET 
      -------------------------------------------------------------*/
      await token.addAddressToWhitelist(accounts[1]);
      await token.setSoftCapReached();

      await token.mintTreasuryTokens({ from : accounts[1] }).should.be.rejectedWith(EVMRevert);

      /*-------------------------------------------------------------
       SHOULD ALLOW MINTING ONLY AFTER THE ICO END DATE IS SET 
      -------------------------------------------------------------*/
      await token.setICOEndDate(nov302018);
      await token.mintTreasuryTokens({ from : accounts[1] });

      const balance = await token.balanceOf(accounts[1]);
      balance.should.be.bignumber.equal(treasuryTokens);

      (await token.totalSupply()).should.be.bignumber.equal(totalSupply.add(treasuryTokens));

      /*-------------------------------------------------------------
       ADDITIONAL CORRECTNESS RULE(S) 
      -------------------------------------------------------------*/

      //additional minting attempts of treasury tokens should be declined.
      await token.mintTreasuryTokens({ from : accounts[1] }).should.be.rejectedWith(EVMRevert);
    });

    it('must correctly mint community rewards only once and only if the ICO is successful.', async () => {
      const totalSupply = await token.totalSupply();
      const communityRewards = ether(90000000);

      await token.addAddressToWhitelist(accounts[1]);
      await token.setSoftCapReached();

      await token.mintCommunityRewards({ from : accounts[1] });
      const balance = await token.balanceOf(accounts[1]);
      balance.should.be.bignumber.equal(communityRewards);

      (await token.totalSupply()).should.be.bignumber.equal(totalSupply.add(communityRewards));

      /*-------------------------------------------------------------
       ADDITIONAL CORRECTNESS RULE(S) 
      -------------------------------------------------------------*/
      //additional minting attempts of community rewards should be declined.      
      await token.mintCommunityRewards({ from : accounts[1] }).should.be.rejectedWith(EVMRevert);
    });

    it('must not allow minting of team and advisor tokens before the specified date.', async () => {
      await token.addAddressToWhitelist(accounts[1]);
      await token.setICOEndDate(nov302018);
      await token.setSoftCapReached();

      await token.mintTeamTokens({ from : accounts[1] }).should.be.rejectedWith(EVMRevert);
      await token.mintAdvisorTokens({ from : accounts[1] }).should.be.rejectedWith(EVMRevert);
    });

    it('must not allow transfer before ICO end date.', async () => {
      await token.transfer(accounts[2], 10, { from: accounts[0] });
      await token.setICOEndDate(nov302018);

      await token.enableTransfers().should.be.rejectedWith(EVMRevert);
      await token.transfer(accounts[3], 10, { from: accounts[2] }).should.be.rejectedWith(EVMRevert);
    });


    it('must correctly mint user adoption tokens only once and only if the ICO is successful.', async () => {
      const totalSupply = await token.totalSupply();
      const userAdoptionTokens = ether(95000000);

      /*-------------------------------------------------------------
       SHOULD NOT ALLOW MINTING BEFORE THE ICO END DATE IS SET 
      -------------------------------------------------------------*/
      await token.addAddressToWhitelist(accounts[1]);
      await token.setSoftCapReached();

      await token.mintUserAdoptionTokens({ from : accounts[1] }).should.be.rejectedWith(EVMRevert);

      /*-------------------------------------------------------------
       SHOULD ALLOW MINTING ONLY AFTER THE ICO END DATE IS SET 
      -------------------------------------------------------------*/
      await token.setICOEndDate(nov302018);
      await token.mintUserAdoptionTokens({ from : accounts[1] });

      const balance = await token.balanceOf(accounts[1]);
      balance.should.be.bignumber.equal(userAdoptionTokens);
      (await token.totalSupply()).should.be.bignumber.equal(totalSupply.add(userAdoptionTokens));

      /*-------------------------------------------------------------
       ADDITIONAL CORRECTNESS RULE(S) 
      -------------------------------------------------------------*/

      //additional minting attempts of community rewards should be declined.      
      await token.mintUserAdoptionTokens({ from : accounts[1] }).should.be.rejectedWith(EVMRevert);
    });

    it('must correctly mint partnership tokens only once and only if the ICO is successful.', async () => {
      const totalSupply = await token.totalSupply();
      const partnershipTokens = ether(60000000);

      await token.addAddressToWhitelist(accounts[1]);
      await token.setSoftCapReached();

      await token.mintPartnershipTokens({ from : accounts[1] });

      const balance = await token.balanceOf(accounts[1]);
      balance.should.be.bignumber.equal(partnershipTokens);
      (await token.totalSupply()).should.be.bignumber.equal(totalSupply.add(partnershipTokens));

      /*-------------------------------------------------------------
       ADDITIONAL CORRECTNESS RULE(S) 
      -------------------------------------------------------------*/
      //additional minting attempts of partnership tokens should be declined.      
      await token.mintPartnershipTokens({ from : accounts[1] }).should.be.rejectedWith(EVMRevert);
    });

    it('must correctly mint marketing tokens only once and only if the ICO is successful.', async () => {
      const totalSupply = await token.totalSupply();
      const marketingTokens = ether(32000000);

      await token.addAddressToWhitelist(accounts[1]);
      await token.setSoftCapReached();

      await token.mintMarketingTokens({ from : accounts[1] });

      const balance = await token.balanceOf(accounts[1]);
      balance.should.be.bignumber.equal(marketingTokens);
      (await token.totalSupply()).should.be.bignumber.equal(totalSupply.add(marketingTokens));

      /*-------------------------------------------------------------
       ADDITIONAL CORRECTNESS RULE(S) 
      -------------------------------------------------------------*/
      //additional minting attempts of marketing tokens should be declined.      
      await token.mintMarketingTokens({ from : accounts[1] }).should.be.rejectedWith(EVMRevert);
    });

    it('must only allow minting of team and advisors tokens after 1 year from the ICO end date.', async () => {
      const totalSupply = await token.totalSupply();
      var balance = 0;

      const teamTokens = ether(50000000);
      const advisorsTokens = ether(80000000);
      const combinedSupply = totalSupply.add(teamTokens.add(advisorsTokens)); 

      await token.addAddressToWhitelist(accounts[1]);
      
      await token.setICOEndDate(nov302018);
      await token.setSoftCapReached();

      const endDate = (await token.icoEndDate()).toNumber();

      //Need to increase the EVM time after the lockup period.
      await increaseTimeTo(endDate + duration.days(365) + duration.seconds(1));

      /*-------------------------------------------------------------
       ADVISOR TOKEN MINTING
      -------------------------------------------------------------*/
      await token.mintAdvisorTokens({ from : accounts[1] });
      
      balance = await token.balanceOf(accounts[1]);
      balance.should.be.bignumber.equal(advisorsTokens);
      
      (await token.totalSupply()).should.be.bignumber.equal(totalSupply.add(advisorsTokens));

      /*-------------------------------------------------------------
       TEAM TOKEN MINTING
      -------------------------------------------------------------*/

      await token.mintTeamTokens({ from : accounts[1] });

      balance = await token.balanceOf(accounts[1]);
      balance.should.be.bignumber.equal(advisorsTokens.add(teamTokens));

      (await token.totalSupply()).should.be.bignumber.equal(combinedSupply);

      /*-------------------------------------------------------------
       ADDITIONAL CORRECTNESS RULES
      -------------------------------------------------------------*/

      //additional minting attempts of team and/or advisor tokens should be declined.
      await token.mintAdvisorTokens().should.be.rejectedWith(EVMRevert);
      await token.mintTeamTokens().should.be.rejectedWith(EVMRevert);
    });

    it('must exactly match the set maximum supply after all minting is performed.', async () => {
      const MAX_SUPPLY = await token.MAX_SUPPLY();

      await token.setICOEndDate(nov302018);
      await token.setSoftCapReached();

      //The EVM time is already increased to a date after the lockup period.
      // const endDate = (await token.icoEndDate()).toNumber();
      // await increaseTimeTo(endDate + duration.days(365) + duration.seconds(2));

      await token.mintTeamTokens({ from : accounts[0] });
      await token.mintAdvisorTokens({ from : accounts[0] });
      await token.mintTreasuryTokens({ from : accounts[0] });
      await token.mintPartnershipTokens({ from : accounts[0] });
      await token.mintCommunityRewards({ from : accounts[0] });
      await token.mintUserAdoptionTokens({ from : accounts[0] });
      await token.mintMarketingTokens({ from : accounts[0] });

      const totalSupply = await token.totalSupply();
      totalSupply.should.be.bignumber.equal(MAX_SUPPLY);

      (await token.balanceOf(accounts[0])).should.be.bignumber.equal(MAX_SUPPLY);
    });
  });

  describe('  Transfer feature ruleset::', async () => {
    let token;
    beforeEach(async () => {
      token = await Token.new();
    });

    it('must not allow the transfer of tokens when paused.', async () => {
      await token.pause();

      await token.transfer(accounts[1], 1).should.be.rejectedWith(EVMRevert);
    });

    it('must allow the owner to transfer tokens when unpaused.', async () => {
      await token.transfer(accounts[1], 1);
      assert((await token.balanceOf(accounts[1])).toNumber() == 1);
    });

    it('must allow the transfer agents to transfer the tokens even when transfer is disabled.', async () => {
      await token.transfer(accounts[1], 10);
      await token.setTransferAgent(accounts[1], true);

      await token.transfer(accounts[2], 10, { from: accounts[1] });
      assert((await token.balanceOf(accounts[2])).toNumber() == 10);

      await token.transfer(accounts[3], 10, { from: accounts[2] }).should.be.rejectedWith(EVMRevert);
    });

    it('must allow transfer only after ICO end date', async () => {
      await token.transfer(accounts[2], 10, { from: accounts[0] });
      await token.setICOEndDate(nov302018);

      await token.enableTransfers();
      await token.transfer(accounts[3], 10, { from: accounts[2] });
    });
  });

  describe('  Burn token ruleset::', async () => {
    let token;
    beforeEach(async () => {
      token = await Token.new();
      await token.addAddressToWhitelist(accounts[2]);
      await token.transfer(accounts[2], 10);
    });

    it('must correctly reduce the total supply when the burn feature is used.', async () => {
      let totalSupply = await token.totalSupply();
      await token.burn(1, {from: accounts[2]});
      (await token.totalSupply()).should.be.bignumber.equal(totalSupply.sub(1));
    });

    it('must correctly reduce the balance when the burn feature is used.', async () => {
      let balance = await token.balanceOf(accounts[2]);
      await token.burn(1, {from: accounts[2]});
      (await token.balanceOf(accounts[2])).should.be.bignumber.equal(balance.sub(1));
    });
  });

  describe('  Bulk token transfer ruleset::', async () => {
    let token;
    beforeEach(async () => {
      token = await Token.new();
      await token.addAddressToWhitelist(accounts[2]);
    });

    it('must correctly perform bulk transfers.', async () => {
      const balances = [];
      const destinations = [];

      for(let i=1;i<4;i++) {
        destinations.push(accounts[i]);
        balances.push(i);
      };

      await token.bulkTransfer(destinations, balances);

      for(let i=0;i<destinations.length;i++) {
        let balance = await token.balanceOf(destinations[i]);
        assert(balance == balances[i]);
      };
    });

    it('must not allow non-whitelisted (non-admin) addresses to bulk transfers.', async () => {
      const balances = [];
      const destinations = [];

      for(let i=1;i<4;i++) {
        destinations.push(accounts[i]);
        balances.push(i);
      };

      await token.bulkTransfer(destinations, balances, { from: accounts[1] }).should.be.rejectedWith(EVMRevert);
    });

    it('must revert when the balance is less than the sum.', async () => {
      const balances = [];
      const destinations = [];
 
      for(let i=1;i<4;i++) {
        destinations.push(accounts[i]);
        balances.push(i);
      };

      let currentBalance = await token.balanceOf(accounts[0]);

      await token.transfer(accounts[6], currentBalance);
      await token.bulkTransfer(destinations, balances, { from: accounts[0] }).should.be.rejectedWith(EVMRevert);
    });    
  });

  describe('  Transfer state and transfer agent ruleset:: ', async () => {
    let token;
    beforeEach(async () => {
      token = await Token.new();

      await token.setICOEndDate(nov302018);

      await token.enableTransfers();
      await token.disableTransfers();
    });

    it('must only allow transfer agents to perform token transfers when disabled.', async() => {
      await token.transfer(accounts[3], 2);
      const balance = await token.balanceOf(accounts[3]);
      assert.equal(balance.toNumber(), 2);
    });

    it('must not allow transfers when the transfer state is disabled.', async () => {
      await token.transfer(accounts[2], 5, { from: accounts[2] }).should.be.rejectedWith(EVMRevert);
    });

    it('must not allow token approvals when the transfer state is disabled.', async () => {
      await token.approve(accounts[2], 10, { from: accounts[2] }).should.be.rejectedWith(EVMRevert);
    });

    it('must not allow approved transfers when the transfer state is disabled.', async () => {
      await token.transferFrom(accounts[2], accounts[5], 1, {from: accounts[2] }).should.be.rejectedWith(EVMRevert);
    });

    it('must not allow approval increase when the transfer state is disabled.', async () => {
      await token.increaseApproval(accounts[3], 10, {from: accounts[2]}).should.be.rejectedWith(EVMRevert);
    });

    it('must not allow approval decrease when the transfer state is disabled.', async () => {
      await token.decreaseApproval(accounts[3], 5, {from: accounts[2]}).should.be.rejectedWith(EVMRevert);
    });
  });
});