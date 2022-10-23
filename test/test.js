const truffleAssert = require('truffle-assertions');
const lnrInstance = artifacts.require("LNR");
const lnrResolverInstance = artifacts.require("LNR_RESOLVER_V0");

// note: change this to your metamask address so that you can test in a browser
let zeroAddress = '0x0000000000000000000000000000000000000000';
let metamaskAddress = "0x00F6426fD5215B0c9A2BFC66D49fA5909FaB7701";

contract("LNR RESOLVER - Test LNR RESOLVER", async accounts =>{

  it("updateLNRAddress - non owner cannot set LNR address", async () => {
    console.log("Check that LNR Resolver functions work properly");
    // check that the contact is initally the zero address
    // check that the contract cant
    let lnrContract = await lnrInstance.deployed();
    let lnrResolverContract = await lnrResolverInstance.deployed();
    expect(await lnrResolverContract.lnrAddress.call()).to.eql(zeroAddress);
    await truffleAssert.reverts(lnrResolverContract.updateLNRAddress(lnrContract.address,  {from:accounts[1]}),"not the owner");
  });

  it("updateLNRAddress - owner can set LNR address", async () => {
    // check that the contact is initally the zero address
    // check that the contract can be updated to the correct address
    let lnrContract = await lnrInstance.deployed();
    let lnrResolverContract = await lnrResolverInstance.deployed();
    expect(await lnrResolverContract.lnrAddress.call()).to.eql(zeroAddress);
    await lnrResolverContract.updateLNRAddress(lnrContract.address,  {from:accounts[0]});
    expect(await lnrResolverContract.lnrAddress.call()).to.eql(lnrContract.address);
  });


  it("reserve - reserve derp and abcabcabcabcabcabcabcabcabcabcab to account 0 and orly to account 1, set account[2] as derp and orly controller", async () => {
    let lnrContract = await lnrInstance.deployed();
    let lnrResolverContract = await lnrResolverInstance.deployed();
    await lnrContract.reserve(web3.utils.utf8ToHex("derp"),{from:accounts[0]});
    await lnrContract.reserve(web3.utils.utf8ToHex("orly"),{from:accounts[1]});
    await lnrContract.reserve(web3.utils.utf8ToHex("abcabcabcabcabcabcabcabcabcabcab"),{from:accounts[0]});
    await lnrResolverContract.setController(web3.utils.utf8ToHex("derp"), accounts[2], {from:accounts[0]});
    await lnrResolverContract.setController(web3.utils.utf8ToHex("orly"), accounts[2], {from:accounts[1]});

    let owner = await lnrContract.owner.call(web3.utils.utf8ToHex("derp"));
    expect(owner).to.eql(accounts[0]);
    owner = await lnrContract.owner.call(web3.utils.utf8ToHex("orly"));
    expect(owner).to.eql(accounts[1]);
    owner = await lnrContract.owner.call(web3.utils.utf8ToHex("abcabcabcabcabcabcabcabcabcabcab"));
    expect(owner).to.eql(accounts[0]);
    let controller = await lnrResolverContract.controller.call(web3.utils.utf8ToHex("derp"));
    expect(controller).to.eql(accounts[2]);
    controller = await lnrResolverContract.controller.call(web3.utils.utf8ToHex("orly"));
    expect(controller).to.eql(accounts[2]);
  });

  it("getResolveAddress(derp) & primary(a[2]) - should resolve to the 0 address when not set", async () => {
    let lnrContract = await lnrInstance.deployed();
    let lnrResolverContract = await lnrResolverInstance.deployed();
    let identity = await lnrResolverContract.getResolveAddress.call(web3.utils.utf8ToHex("derp"), {from:accounts[0]});
    expect(identity).to.eql(zeroAddress);
    let primary = await lnrResolverContract.primary.call(accounts[2], {from:accounts[0]});
    expect(primary).to.eql(zeroAddress + "000000000000000000000000"); // empty bytes32
  });

  it("resolve('derp.og') - should resolve to the 0 address when not set", async () => {
    let lnrContract = await lnrInstance.deployed();
    let lnrResolverContract = await lnrResolverInstance.deployed();
    let resolve = await lnrResolverContract.resolve.call("derp.og", {from:accounts[0]});
    expect(resolve).to.eql(zeroAddress);
  });

  it("setPrimary(derp]) from a[0] - owner changes primary, should resolve name to a[0] and a[0] to name", async () => {
    let lnrContract = await lnrInstance.deployed();
    let lnrResolverContract = await lnrResolverInstance.deployed();
    await lnrResolverContract.setPrimary(web3.utils.utf8ToHex("derp"),{from:accounts[0]});
    let identity = await lnrResolverContract.getResolveAddress.call(web3.utils.utf8ToHex("derp"), {from:accounts[0]});
    expect(identity).to.eql(accounts[0]);
    let primary = await lnrResolverContract.primary.call(accounts[0], {from:accounts[0]});
    expect(primary).to.eql(web3.utils.padRight(web3.utils.utf8ToHex("derp"),64)); // must pad to 64 bytes because the hex is shown
  });

  it("setPrimary(derp) from a[2] - controller changes primary, should resolve name to a[2] and a[2] to name", async () => {
    let lnrContract = await lnrInstance.deployed();
    let lnrResolverContract = await lnrResolverInstance.deployed();
    await lnrResolverContract.setPrimary(web3.utils.utf8ToHex("derp"),{from:accounts[2]});
    let identity = await lnrResolverContract.getResolveAddress.call(web3.utils.utf8ToHex("derp"), {from:accounts[1]});
    expect(identity).to.eql(accounts[2]);
    let primary = await lnrResolverContract.primary.call(accounts[2], {from:accounts[1]});
    expect(primary).to.eql(web3.utils.padRight(web3.utils.utf8ToHex("derp"),64)); // must pad to 64 bytes because the hex is shown
  });

  it("setPrimary(abcabcabcabcabcabcabcabcabcabcab) from a[3] - a[3] changes primary, should fail because a3 doesnt own and isnt the controller", async () => {
    let lnrContract = await lnrInstance.deployed();
    let lnrResolverContract = await lnrResolverInstance.deployed();
    await truffleAssert.reverts(lnrResolverContract.setPrimary(web3.utils.utf8ToHex("abcabcabcabcabcabcabcabcabcabcab"), {from:accounts[3]}), "Not yours");
  });

  it("setPrimary(abcabcabcabcabcabcabcabcabcabcab) from a[0] - owner makes a[3] controller, changes primary, a[3] calls set primary and it should resolve to a[3]'", async () => {
    let lnrContract = await lnrInstance.deployed();
    let lnrResolverContract = await lnrResolverInstance.deployed();
    await lnrResolverContract.setController(web3.utils.utf8ToHex("abcabcabcabcabcabcabcabcabcabcab"), accounts[3], {from:accounts[0]});
    await lnrResolverContract.setPrimary(web3.utils.utf8ToHex("abcabcabcabcabcabcabcabcabcabcab"), {from:accounts[3]});
    let identity = await lnrResolverContract.getResolveAddress.call(web3.utils.utf8ToHex("abcabcabcabcabcabcabcabcabcabcab"), {from:accounts[1]});
    expect(identity).to.eql(accounts[3]);
    let primary = await lnrResolverContract.primary.call(accounts[3], {from:accounts[1]});
    expect(primary).to.eql(web3.utils.utf8ToHex("abcabcabcabcabcabcabcabcabcabcab")); // max length
  });

  it("check primary, after change from derp&a[0] to derp&a[2] - verify a[0] primary is 0x00 and name resolves to a[2]", async () => {
    let lnrContract = await lnrInstance.deployed();
    let lnrResolverContract = await lnrResolverInstance.deployed();
    let identity = await lnrResolverContract.getResolveAddress.call(web3.utils.utf8ToHex("derp"), {from:accounts[1]});
    expect(identity).to.eql(accounts[2]);
    let primary = await lnrResolverContract.primary.call(accounts[0], {from:accounts[1]});
    expect(primary).to.eql(zeroAddress + "000000000000000000000000"); // must pad to 64 bytes because the hex is shown
  });

  it("resolve('derp.o') - should revert with invalid domain", async () => {
    let lnrContract = await lnrInstance.deployed();
    let lnrResolverContract = await lnrResolverInstance.deployed();
    await truffleAssert.reverts(lnrResolverContract.resolve.call("derp.o", {from:accounts[0]}),"invalid domain");
  });

  it("resolve('d.erp.og') - should revert with this is a subdomain", async () => {
    let lnrContract = await lnrInstance.deployed();
    let lnrResolverContract = await lnrResolverInstance.deployed();
    await truffleAssert.reverts(lnrResolverContract.resolve.call("d.erp.og", {from:accounts[0]}),"this is a subdomain");
  });
  it("resolve('derp..og') - should revert with this is a subdomain", async () => {
    let lnrContract = await lnrInstance.deployed();
    let lnrResolverContract = await lnrResolverInstance.deployed();
    await truffleAssert.reverts(lnrResolverContract.resolve.call("derp..og", {from:accounts[0]}),"this is a subdomain");
  });

  it("resolve('derp.og') - should resolve to a[2], the last set address", async () => {
    let lnrContract = await lnrInstance.deployed();
    let lnrResolverContract = await lnrResolverInstance.deployed();
    let resolve = await lnrResolverContract.resolve.call("derp.og", {from:accounts[0]});
    expect(resolve).to.eql(accounts[2]);
  });

  it("resolve('abcabcabcabcabcabcabcabcabcabcab.og') - should resolve to a[3], the last set address", async () => {
    let lnrContract = await lnrInstance.deployed();
    let lnrResolverContract = await lnrResolverInstance.deployed();
    let resolve = await lnrResolverContract.resolve.call("abcabcabcabcabcabcabcabcabcabcab.og", {from:accounts[0]});
    expect(resolve).to.eql(accounts[3]);
  });

  it("resolve('abcabcabcabcabcabcabcabcabcabcab..og') - should revert as too long", async () => {
    let lnrContract = await lnrInstance.deployed();
    let lnrResolverContract = await lnrResolverInstance.deployed();
    await truffleAssert.reverts(lnrResolverContract.resolve.call("abcabcabcabcabcabcabcabcabcabcab..og", {from:accounts[0]}), "Too long");
  });
});
