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
      const teamWallet = accounts[1];
      const advisorsWallet = accounts[2];
      const treasuryWallet = accounts[3];
      const partnershipWallet = accounts[4];
      const communityRewardsWallet = accounts[5];
      const marketingWallet = accounts[6];
      const userAdoptionWallet = accounts[7];
      const expectedTotalSupply = ether(950000000);
      const token = await Token.new(
        teamWallet,
        advisorsWallet,
        treasuryWallet,
        partnershipWallet,
        communityRewardsWallet,
        userAdoptionWallet,
        marketingWallet
      );
      assert((await token.teamWallet()) == teamWallet);
      assert((await token.advisorsWallet()) == advisorsWallet);
      assert((await token.treasuryWallet()) == treasuryWallet);
      assert((await token.partnershipWallet()) == partnershipWallet);
      assert((await token.communityRewardsWallet()) == communityRewardsWallet);
      assert((await token.userAdoptionWallet()) == userAdoptionWallet);
      assert((await token.marketingWallet()) == marketingWallet);
      assert((await token.initialized()) == false);
      assert((await token.icoDateInitialized()) == false);
      assert((await token.icoEndDate()).toNumber() == 0);
      const totalSupply = await token.totalSupply();
      totalSupply.should.be.bignumber.equal(expectedTotalSupply);
    });
  });

  describe('Initialize', async () => {
    const teamWallet = accounts[1];
    const advisorsWallet = accounts[2];
    const treasuryWallet = accounts[3];
    const partnershipWallet = accounts[4];
    const communityRewardsWallet = accounts[5];
    const marketingWallet = accounts[6];
    const userAdoptionWallet = accounts[7];
    let token;
    beforeEach(async () => {
      token = await Token.new(
        teamWallet,
        advisorsWallet,
        treasuryWallet,
        partnershipWallet,
        communityRewardsWallet,
        userAdoptionWallet,
        marketingWallet
      );
    })
    it('it transfer tokens to all the requried wallets', async () => {
      await token.initialize();
      const expectedBalances = {};
      expectedBalances[teamWallet] = ether(50000000);
      expectedBalances[advisorsWallet] = ether(80000000);
      expectedBalances[treasuryWallet] = ether(90000000);
      expectedBalances[partnershipWallet] = ether(60000000);
      expectedBalances[communityRewardsWallet] = ether(90000000);
      expectedBalances[userAdoptionWallet] = ether(95000000);
      expectedBalances[marketingWallet] = ether(32000000);
      const wallets = Object.keys(expectedBalances);
      let sum = new BigNumber(0);
      for(let i=0; i< wallets.length; i++) {
        const balance = await token.balanceOf(wallets[i]);
        balance.should.be.bignumber.equal(expectedBalances[wallets[i]]);
      }
      assert((await token.initialized()));
      const transfersAfter1Year = [teamWallet, advisorsWallet];
      const transfersAfterICO = [treasuryWallet, communityRewardsWallet, userAdoptionWallet];

      for(let i=0;i<transfersAfter1Year.length; i++) {
        assert(await token.transfersAfter1Year(transfersAfter1Year[i]));
      }

      for(let i=0;i<transfersAfterICO.length; i++) {
        assert(await token.transfersAfterICO(transfersAfterICO[i]));
      }

    });

    it('initialize cannot be called twice', async () => {
      await token.initialize();
      await token.initialize().should.be.rejectedWith(EVMRevert);
    });

    it('initialize cannot be called by non-whitelisted', async () => {
      await token.initialize({ from : accounts[1] }).should.be.rejectedWith(EVMRevert);
    });
  });

  describe('set different wallets', async () => {
    const teamWallet = accounts[1];
    const advisorsWallet = accounts[2];
    const treasuryWallet = accounts[3];
    const partnershipWallet = accounts[4];
    const communityRewardsWallet = accounts[5];
    const marketingWallet = accounts[6];
    const userAdoptionWallet = accounts[7];
    beforeEach(async () => {
      token = await Token.new(
        teamWallet,
        advisorsWallet,
        treasuryWallet,
        partnershipWallet,
        communityRewardsWallet,
        userAdoptionWallet,
        marketingWallet
      );
    });
    it('should set teamwallet', async () => {
      await token.setTeamWallet(accounts[1]);
      assert((await token.teamWallet()) == accounts[1]);
    });

    it('should set advisorsWallet', async () => {
      await token.setAdvisorsWallet(accounts[1]);
      assert((await token.advisorsWallet()) == accounts[1]);
    });

    it('should set partnershipWallet', async () => {
      await token.setPartnershipWallet(accounts[1]);
      assert((await token.partnershipWallet()) == accounts[1]);
    });

    it('should set treasuryWallet', async () => {
      await token.setTreasuryWallet(accounts[1]);
      assert((await token.treasuryWallet()) == accounts[1]);
    });

    it('should set communityRewardsWallet', async () => {
      await token.setCommunityRewardsWallet(accounts[1]);
      assert((await token.communityRewardsWallet()) == accounts[1]);
    });

    it('should set userAdoptionWallet', async () => {
      await token.setUserAdoptionWallet(accounts[1]);
      assert((await token.userAdoptionWallet()) == accounts[1]);
    });

    it('should set marketingWallet', async () => {
      await token.setMarketingWallet(accounts[1]);
      assert((await token.marketingWallet()) == accounts[1]);
    });

    it('cannot be called after initialize', async () => {
      await token.initialize();
      await token.setTeamWallet(accounts[1]).should.be.rejectedWith(EVMRevert);
      await token.setMarketingWallet(accounts[1]).should.be.rejectedWith(EVMRevert);
      await token.setUserAdoptionWallet(accounts[1]).should.be.rejectedWith(EVMRevert);
      await token.setTreasuryWallet(accounts[1]).should.be.rejectedWith(EVMRevert);
      await token.setAdvisorsWallet(accounts[1]).should.be.rejectedWith(EVMRevert);
      await token.setCommunityRewardsWallet(accounts[1]).should.be.rejectedWith(EVMRevert);
      await token.setPartnershipWallet(accounts[1]).should.be.rejectedWith(EVMRevert);
    });

    it('cannot be called by non-whitelist', async () => {
      await token.setTeamWallet(accounts[1], { from: accounts[2] }).should.be.rejectedWith(EVMRevert);
      await token.setMarketingWallet(accounts[1], { from: accounts[2] }).should.be.rejectedWith(EVMRevert);
      await token.setUserAdoptionWallet(accounts[1], { from: accounts[2] }).should.be.rejectedWith(EVMRevert);
      await token.setTreasuryWallet(accounts[1], {from: accounts[2] }).should.be.rejectedWith(EVMRevert);
      await token.setAdvisorsWallet(accounts[1], {from: accounts[2] }).should.be.rejectedWith(EVMRevert);
      await token.setCommunityRewardsWallet(accounts[1], {from: accounts[2] }).should.be.rejectedWith(EVMRevert);
      await token.setPartnershipWallet(accounts[1], {from: accounts[2] }).should.be.rejectedWith(EVMRevert);
    });
  });

  describe('Transfer function', async () => {
    const teamWallet = accounts[1];
    const advisorsWallet = accounts[2];
    const treasuryWallet = accounts[3];
    const partnershipWallet = accounts[4];
    const communityRewardsWallet = accounts[5];
    const marketingWallet = accounts[6];
    const userAdoptionWallet = accounts[7];
    const transfersAfter1Year = [teamWallet, advisorsWallet];
    const transfersAfterICO = [treasuryWallet, communityRewardsWallet, userAdoptionWallet];
    beforeEach(async () => {
      token = await Token.new(
        teamWallet,
        advisorsWallet,
        treasuryWallet,
        partnershipWallet,
        communityRewardsWallet,
        userAdoptionWallet,
        marketingWallet
      );
      await token.initialize();
    });

    it('teamWallet, advisorsWallet, treasuryWallet, communityRewardsWallet, userAdoptionWallet should not transfer when ico has not been initialized', async () => {
      const wallets = transfersAfterICO.concat(transfersAfter1Year);
      for(let i=0;i<wallets.length;i++) {
        await token.transfer(accounts[8], 1, {from: wallets[i]})
        .should.be.rejectedWith(EVMRevert);
      }
    });

    it('transfersAfterICO can transfer after ico is over', async () =>{
      await token.setICOEndDate();
      let sum = 0;
      for(let i=0;i<transfersAfterICO.length;i++) {
        await token.transfer(accounts[8], 1, { from: transfersAfterICO[i] });
        sum++;
        let balance = await token.balanceOf(accounts[8])
        assert(balance.toNumber() == sum);
      }
    })

    it('transfersAfter1Year cannot transfer after ico is over and before 1 year', async () =>{
      await token.setICOEndDate();
      await increaseTimeTo(latestTime() + duration.hours(24));
      for(let i=0;i<transfersAfter1Year.length;i++) {
        await token.transfer(accounts[8], 1, { from: transfersAfter1Year[i] })
        .should.be.rejectedWith(EVMRevert);
      }
    })

    it('transfersAfter1Year cannot transfer after ico is over and before 1 year', async () =>{
      await token.setICOEndDate();
      await increaseTimeTo((await latestTime()) + duration.hours(24));
      for(let i=0;i<transfersAfter1Year.length;i++) {
        await token.transfer(accounts[8], 1, { from: transfersAfter1Year[i] })
        .should.be.rejectedWith(EVMRevert);
      }
    })

    it('transfersAfter1Year transfer after ico is over and after 1 year', async () =>{
      const ct = await latestTime();
      await token.setICOEndDate();

      await increaseTimeTo(ct + duration.years(1) + 10);
      let sum = 0;
      for(let i=0;i<transfersAfter1Year.length;i++) {
        await token.transfer(accounts[8], 1, { from: transfersAfter1Year[i] });
        sum++;
        let balance = await token.balanceOf(accounts[8])
        assert(balance.toNumber() == sum);
      }
    })
  })


});
