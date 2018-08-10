let Token = artifacts.require("./VibeoToken.sol")
const {advanceBlock} = require('./helpers/advanceToBlock');
const { ether }  = require('./helpers/ether');
const { EVMRevert } = require('./helpers/EVMRevert.js')
const { increaseTimeTo, duration} = require('./helpers/increaseTime');
const { latestTime } = require('./helpers/latestTime');
const BigNumber  = require('bignumber.js');


require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should()

contract('Token', async function(accounts) {
  describe('Token construction', async () => {
    it('should initialize', async () => {
      const expectedTotalSupply = ether(453000000);
      const token = await Token.new();
      const totalSupply = await token.totalSupply();
      totalSupply.should.be.bignumber.equal(expectedTotalSupply);
      const MAX_SUPPLY = await token.MAX_SUPPLY();
      MAX_SUPPLY.should.be.bignumber.equal(ether(950000000));
      assert(await token.transferAgents(accounts[0]));
    });
  });

  describe('Minting tokens', async () => {
    let token;
    beforeEach(async () => {
      token = await Token.new();
    });
    it('mint to treasury', async () => {
      const totalSupply = await token.totalSupply();
      const treasuryTokens = ether(90000000);
      await token.setICOEndDate();
      await token.addAddressToWhitelist(accounts[1]);
      await token.mintTreasuryTokens({ from : accounts[1] });
      const balance = await token.balanceOf(accounts[1])
      balance.should.be.bignumber.equal(treasuryTokens);
      (await token.totalSupply()).should.be.bignumber.equal(totalSupply.add(treasuryTokens));

    });

    it('mint communityRewards', async () => {
      const totalSupply = await token.totalSupply();
      const communityRewards = ether(90000000);
      await token.setICOEndDate();
      await token.addAddressToWhitelist(accounts[1]);
      await token.mintCommunityRewards({ from : accounts[1] });
      const balance = await token.balanceOf(accounts[1])
      balance.should.be.bignumber.equal(communityRewards);
      (await token.totalSupply()).should.be.bignumber.equal(totalSupply.add(communityRewards));
      await token.mintCommunityRewards().should.be.rejectedWith(EVMRevert);
    });

    it('mint team tokens', async () => {
      const totalSupply = await token.totalSupply();
      const teamTokens = ether(50000000);
      await token.addAddressToWhitelist(accounts[1]);
      await token.setICOEndDate();
      const endDate = (await token.icoEndDate()).toNumber();

      await token.mintTeamTokens({ from : accounts[1] })
      .should.be.rejectedWith(EVMRevert);

      await increaseTimeTo(endDate + duration.years(1) + 1);
      await token.mintTeamTokens({ from : accounts[1] })
      const balance = await token.balanceOf(accounts[1])
      balance.should.be.bignumber.equal(teamTokens);
      (await token.totalSupply()).should.be.bignumber.equal(totalSupply.add(teamTokens));
      await token.mintTeamTokens().should.be.rejectedWith(EVMRevert);
    });

    it('mint advisorsTokens', async () => {
      const totalSupply = await token.totalSupply();
      const advisorsTokens = ether(80000000);
      await token.addAddressToWhitelist(accounts[1]);
      await token.setICOEndDate();
      const endDate = (await token.icoEndDate()).toNumber();

      await token.mintAdvisorTokens({ from : accounts[1] })
      .should.be.rejectedWith(EVMRevert);

      await increaseTimeTo(endDate + duration.years(1) + 1);
      await token.mintAdvisorTokens({ from : accounts[1] })
      const balance = await token.balanceOf(accounts[1])
      balance.should.be.bignumber.equal(advisorsTokens);
      (await token.totalSupply()).should.be.bignumber.equal(totalSupply.add(advisorsTokens));
      await token.mintAdvisorTokens().should.be.rejectedWith(EVMRevert);
    });

    it('mint userAdoption tokens', async () => {
      const totalSupply = await token.totalSupply();
      const userAdoptionTokens = ether(95000000);
      await token.addAddressToWhitelist(accounts[1]);
      await token.mintUserAdoptionTokens({ from : accounts[1] }).should.be.rejectedWith(EVMRevert);
      await token.setICOEndDate();
      await token.mintUserAdoptionTokens({ from : accounts[1] })
      const balance = await token.balanceOf(accounts[1])
      balance.should.be.bignumber.equal(userAdoptionTokens);
      (await token.totalSupply()).should.be.bignumber.equal(totalSupply.add(userAdoptionTokens));
      //only once
      await token.mintUserAdoptionTokens().should.be.rejectedWith(EVMRevert);
    });

    it('mint partnership tokens', async () => {
      const totalSupply = await token.totalSupply();
      const partnershipTokens = ether(60000000);
      await token.addAddressToWhitelist(accounts[1]);
      await token.mintPartnershipTokens({ from : accounts[1] })
      const balance = await token.balanceOf(accounts[1])
      balance.should.be.bignumber.equal(partnershipTokens);
      (await token.totalSupply()).should.be.bignumber.equal(totalSupply.add(partnershipTokens));
      await token.mintPartnershipTokens().should.be.rejectedWith(EVMRevert);
      assert(await token.transferAgents(accounts[1]));
    });

    it('mint marketing tokens', async () => {
      const totalSupply = await token.totalSupply();
      const marketingTokens = ether(32000000);
      await token.addAddressToWhitelist(accounts[1]);
      await token.mintMarketingTokens({ from : accounts[1] })
      const balance = await token.balanceOf(accounts[1])
      balance.should.be.bignumber.equal(marketingTokens);
      (await token.totalSupply()).should.be.bignumber.equal(totalSupply.add(marketingTokens));
      await token.mintMarketingTokens().should.be.rejectedWith(EVMRevert);
      assert(await token.transferAgents(accounts[1]));
    });
    it('should match max supply after minting', async () => {
      const MAX_SUPPLY = await token.MAX_SUPPLY();
      await token.setICOEndDate();
      const endDate = (await token.icoEndDate()).toNumber();
      await increaseTimeTo(endDate + duration.years(1) + 1);
      await token.mintTeamTokens({ from : accounts[0] })
      await token.mintAdvisorTokens({ from : accounts[0] })
      await token.mintTreasuryTokens({ from : accounts[0] })
      await token.mintPartnershipTokens({ from : accounts[0] })
      await token.mintCommunityRewards({ from : accounts[0] })
      await token.mintUserAdoptionTokens({ from : accounts[0] })
      await token.mintMarketingTokens({ from : accounts[0] })
      const totalSupply = await token.totalSupply();
      totalSupply.should.be.bignumber.equal(MAX_SUPPLY);
      (await token.balanceOf(accounts[0])).should.be.bignumber.equal(MAX_SUPPLY);
    })
  });

  describe('Transfering tokens', async () => {
    let token;
    beforeEach(async () => {
      token = await Token.new();
    });

    it('Owner can transfer tokens', async () => {
      await token.transfer(accounts[1], 1);
      assert((await token.balanceOf(accounts[1])).toNumber() == 1)
    })

    it('transfer agents can transfer tokens when transfers are disabled', async () => {
      await token.transfer(accounts[1], 10);
      await token.setTransferAgent(accounts[1], true);
      await token.transfer(accounts[2], 10, { from: accounts[1] });
      assert((await token.balanceOf(accounts[2])).toNumber() == 10)
      await token.transfer(accounts[3], 10, { from: accounts[2] })
      .should.be.rejectedWith(EVMRevert);
    });

    it('enableTransfers ', async () => {
      await token.transfer(accounts[2], 10, { from: accounts[0] });
      await token.setICOEndDate();
      let endDate = await token.icoEndDate();
      await increaseTimeTo(endDate.toNumber() + duration.years(1) + 10);
      await token.enableTransfers();
      await token.transfer(accounts[3], 10, { from: accounts[2] })

    });
  });
});
