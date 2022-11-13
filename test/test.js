const truffleAssert = require('truffle-assertions');

const lnrAbi = [{"constant": true,"inputs": [{"name": "_owner","type": "address"}],"name": "name","outputs": [{"name": "o_name","type": "bytes32"}],"type": "function","payable": false,"stateMutability": "view"},{"constant": true,"inputs": [{"name": "_name","type": "bytes32"}],"name": "owner","outputs": [{"name": "","type": "address"}],"type": "function","payable": false,"stateMutability": "view"},{"constant": true,"inputs": [{"name": "_name","type": "bytes32"}],"name": "content","outputs": [{"name": "","type": "bytes32"}],"type": "function","payable": false,"stateMutability": "view"},{"constant": true,"inputs": [{"name": "_name","type": "bytes32"}],"name": "addr","outputs": [{"name": "","type": "address"}],"type": "function","payable": false,"stateMutability": "view"},{"constant": false,"inputs": [{"name": "_name","type": "bytes32"}],"name": "reserve","outputs": [],"type": "function","payable": true,"stateMutability": "payable"},{"constant": true,"inputs": [{"name": "_name","type": "bytes32"}],"name": "subRegistrar","outputs": [{"name": "o_subRegistrar","type": "address"}],"type": "function","payable": false,"stateMutability": "view"},{"constant": false,"inputs": [{"name": "_name","type": "bytes32"},{"name": "_newOwner","type": "address"}],"name": "transfer","outputs": [],"type": "function","payable": true,"stateMutability": "payable"},{"constant": false,"inputs": [{"name": "_name","type": "bytes32"},{"name": "_registrar","type": "address"}],"name": "setSubRegistrar","outputs": [],"type": "function","payable": true,"stateMutability": "payable"},{"constant": false,"inputs": [],"name": "Registrar","outputs": [],"type": "function","payable": true,"stateMutability": "payable"},{"constant": false,"inputs": [{"name": "_name","type": "bytes32"},{"name": "_a","type": "address"},{"name": "_primary","type": "bool"}],"name": "setAddress","outputs": [],"type": "function","payable": true,"stateMutability": "payable"},{"constant": false,"inputs": [{"name": "_name","type": "bytes32"},{"name": "_content","type": "bytes32"}],"name": "setContent","outputs": [],"type": "function","payable": true,"stateMutability": "payable"},{"constant": false,"inputs": [{"name": "_name","type": "bytes32"}],"name": "disown","outputs": [],"type": "function","payable": true,"stateMutability": "payable"},{"constant": true,"inputs": [{"name": "_name","type": "bytes32"}],"name": "register","outputs": [{"name": "","type": "address"}],"type": "function","payable": false,"stateMutability": "view"},{"anonymous": false,"inputs": [{"indexed": true,"name": "name","type": "bytes32"}],"name": "Changed","type": "event"},{"anonymous": false,"inputs": [{"indexed": true,"name": "name","type": "bytes32"},{"indexed": true,"name": "addr","type": "address"}],"name": "PrimaryChanged","type": "event"},{"type": "fallback","payable": true,"stateMutability": "payable"}];

const lnrAddress = "0x5564886ca2C518d1964E5FCea4f423b41Db9F561";

const lnrResolverInstance = artifacts.require("LNR_RESOLVER_V2");

// note: change this to your metamask address so that you can test in a browser
let zeroAddress = '0x0000000000000000000000000000000000000000';
let metamaskAddress = "0x00F6426fD5215B0c9A2BFC66D49fA5909FaB7701";

contract("LNR RESOLVER - Test LNR RESOLVER", async accounts =>{

  // THIS IS VERY IRRITATING!!!
  // cant quite figure out how to load the artifacts so that the same syntax
  // can be used with the truffle deployed contracts and the externally loaded contracts.
  // notice how lnrContract calls require the lnrContract.methods.functionName and lnrResolverContract can be called with lnrResolverContract.functionName
  it("reserve - reserve dderp and abcabcabcabcabcabcabcabcabcabcab to account 0 and oorly to account 1, set account[2] as dderp and oorly controller", async () => {
    let lnrContract = new web3.eth.Contract(lnrAbi, lnrAddress);

    await lnrContract.methods.reserve(web3.utils.utf8ToHex("dderp")).send({from:accounts[0]});
    await lnrContract.methods.reserve(web3.utils.utf8ToHex("oorly")).send({from:accounts[1]});
    await lnrContract.methods.reserve(web3.utils.utf8ToHex("abcabcabcabcabcabcabcabcabcabcab")).send({from:accounts[0]});

    let lnrResolverContract = await lnrResolverInstance.deployed();
    await lnrResolverContract.setController(web3.utils.utf8ToHex("dderp"), accounts[2], {from:accounts[0]});
    await lnrResolverContract.setController(web3.utils.utf8ToHex("oorly"), accounts[2], {from:accounts[1]});

    let owner = await lnrContract.methods.owner(web3.utils.utf8ToHex("dderp")).call();
    expect(owner).to.eql(accounts[0]);
    owner = await lnrContract.methods.owner(web3.utils.utf8ToHex("oorly")).call();
    expect(owner).to.eql(accounts[1]);
    owner = await lnrContract.methods.owner(web3.utils.utf8ToHex("abcabcabcabcabcabcabcabcabcabcab")).call();
    expect(owner).to.eql(accounts[0]);
    let controller = await lnrResolverContract.controller.call(web3.utils.utf8ToHex("dderp"));
    expect(controller).to.eql(accounts[2]);
    controller = await lnrResolverContract.controller.call(web3.utils.utf8ToHex("oorly"));
    expect(controller).to.eql(accounts[2]);
  });

  it("getResolveAddress(dderp) & primary(a[2]) - should resolve to the 0 address when not set", async () => {
    let lnrResolverContract = await lnrResolverInstance.deployed();
    let identity = await lnrResolverContract.getResolveAddress.call(web3.utils.utf8ToHex("dderp"), {from:accounts[0]});
    expect(identity).to.eql(zeroAddress);
    let primary = await lnrResolverContract.primary.call(accounts[2], {from:accounts[0]});
    expect(primary).to.eql(zeroAddress + "000000000000000000000000"); // empty bytes32
  });

  it("resolve('dderp.og') - should resolve to the 0 address when not set", async () => {
    let lnrResolverContract = await lnrResolverInstance.deployed();
    let resolve = await lnrResolverContract.resolve.call("dderp.og", {from:accounts[0]});
    expect(resolve).to.eql(zeroAddress);
  });

  it("setPrimary(dderp]) from a[0] - owner changes primary, should resolve name to a[0] and a[0] to name", async () => {
    let lnrResolverContract = await lnrResolverInstance.deployed();
    await lnrResolverContract.setPrimary(web3.utils.utf8ToHex("dderp"),{from:accounts[0]});
    let identity = await lnrResolverContract.getResolveAddress.call(web3.utils.utf8ToHex("dderp"), {from:accounts[0]});
    expect(identity).to.eql(accounts[0]);
    let primary = await lnrResolverContract.primary.call(accounts[0], {from:accounts[0]});
    expect(primary).to.eql(web3.utils.padRight(web3.utils.utf8ToHex("dderp"),64)); // must pad to 64 bytes because the hex is shown
  });

  it("setPrimary(dderp) from a[2] - controller changes primary, should resolve name to a[2] and a[2] to name", async () => {
    let lnrResolverContract = await lnrResolverInstance.deployed();
    await lnrResolverContract.setPrimary(web3.utils.utf8ToHex("dderp"),{from:accounts[2]});
    let identity = await lnrResolverContract.getResolveAddress.call(web3.utils.utf8ToHex("dderp"), {from:accounts[1]});
    expect(identity).to.eql(accounts[2]);
    let primary = await lnrResolverContract.primary.call(accounts[2], {from:accounts[1]});
    expect(primary).to.eql(web3.utils.padRight(web3.utils.utf8ToHex("dderp"),64)); // must pad to 64 bytes because the hex is shown
  });

  it("setPrimary(abcabcabcabcabcabcabcabcabcabcab) from a[3] - a[3] changes primary, should fail because a3 doesnt own and isnt the controller", async () => {
    let lnrResolverContract = await lnrResolverInstance.deployed();
    await truffleAssert.reverts(lnrResolverContract.setPrimary(web3.utils.utf8ToHex("abcabcabcabcabcabcabcabcabcabcab"), {from:accounts[3]}), "Not yours");
  });

  it("setPrimary(abcabcabcabcabcabcabcabcabcabcab) from a[0] - owner makes a[3] controller, changes primary, a[3] calls set primary and it should resolve to a[3]'", async () => {
    let lnrResolverContract = await lnrResolverInstance.deployed();
    await lnrResolverContract.setController(web3.utils.utf8ToHex("abcabcabcabcabcabcabcabcabcabcab"), accounts[3], {from:accounts[0]});
    await lnrResolverContract.setPrimary(web3.utils.utf8ToHex("abcabcabcabcabcabcabcabcabcabcab"), {from:accounts[3]});
    let identity = await lnrResolverContract.getResolveAddress.call(web3.utils.utf8ToHex("abcabcabcabcabcabcabcabcabcabcab"), {from:accounts[1]});
    expect(identity).to.eql(accounts[3]);
    let primary = await lnrResolverContract.primary.call(accounts[3], {from:accounts[1]});
    expect(primary).to.eql(web3.utils.utf8ToHex("abcabcabcabcabcabcabcabcabcabcab")); // max length
  });

  it("check primary, after change from dderp&a[0] to dderp&a[2] - verify a[0] primary is 0x00 and name resolves to a[2]", async () => {
    let lnrResolverContract = await lnrResolverInstance.deployed();
    let identity = await lnrResolverContract.getResolveAddress.call(web3.utils.utf8ToHex("dderp"), {from:accounts[1]});
    expect(identity).to.eql(accounts[2]);
    let primary = await lnrResolverContract.primary.call(accounts[0], {from:accounts[1]});
    expect(primary).to.eql(zeroAddress + "000000000000000000000000"); // must pad to 64 bytes because the hex is shown
  });

  it("resolve('dderp.o') - should revert with invalid domain", async () => {
    let lnrResolverContract = await lnrResolverInstance.deployed();
    await truffleAssert.reverts(lnrResolverContract.resolve.call("dderp.o", {from:accounts[0]}),"invalid domain");
  });

  it("resolve('d.erp.og') - should revert with this is a subdomain", async () => {
    let lnrResolverContract = await lnrResolverInstance.deployed();
    await truffleAssert.reverts(lnrResolverContract.resolve.call("d.erp.og", {from:accounts[0]}),"this is a subdomain");
  });
  it("resolve('dderp..og') - should revert with this is a subdomain", async () => {
    let lnrResolverContract = await lnrResolverInstance.deployed();
    await truffleAssert.reverts(lnrResolverContract.resolve.call("dderp..og", {from:accounts[0]}),"this is a subdomain");
  });

  it("resolve('dderp.og') - should resolve to a[2], the last set address", async () => {
    let lnrResolverContract = await lnrResolverInstance.deployed();
    let resolve = await lnrResolverContract.resolve.call("dderp.og", {from:accounts[0]});
    expect(resolve).to.eql(accounts[2]);
  });

  it("resolve('abcabcabcabcabcabcabcabcabcabcab.og') - should resolve to a[3], the last set address", async () => {
    let lnrResolverContract = await lnrResolverInstance.deployed();
    let resolve = await lnrResolverContract.resolve.call("abcabcabcabcabcabcabcabcabcabcab.og", {from:accounts[0]});
    expect(resolve).to.eql(accounts[3]);
  });

  it("resolve('abcabcabcabcabcabcabcabcabcabcab..og') - should revert as too long", async () => {
    let lnrResolverContract = await lnrResolverInstance.deployed();
    await truffleAssert.reverts(lnrResolverContract.resolve.call("abcabcabcabcabcabcabcabcabcabcab..og", {from:accounts[0]}), "Too long");
  });

  it("unsetPrimary() - should set the resolve[address] and the primary[bytes32] to 0x00", async () => {
    let lnrResolverContract = await lnrResolverInstance.deployed();
    let primary = await lnrResolverContract.primary(accounts[2]);
    expect(primary).to.eql(web3.utils.padRight(web3.utils.utf8ToHex("dderp"),64));
    let resolveAddress = await lnrResolverContract.resolveAddress(web3.utils.padRight(web3.utils.utf8ToHex("dderp")));
    expect(resolveAddress).to.eql(accounts[2]);
    let unsetPrimary = await lnrResolverContract.unsetPrimary({from:accounts[2]});
    expect(unsetPrimary.receipt.status).to.eql(true);
    primary = await lnrResolverContract.primary(accounts[2]);
    expect(primary).to.eql(web3.utils.padRight("0x00",64));
    resolveAddress = await lnrResolverContract.resolveAddress(web3.utils.padRight(web3.utils.utf8ToHex("dderp")));
    expect(resolveAddress).to.eql(zeroAddress);
  });

  it("setPrimary(dderp]) from a[0] - owner changes primary, should resolve name to a[0] and a[0] to name", async () => {
    let lnrResolverContract = await lnrResolverInstance.deployed();
    await lnrResolverContract.setPrimary(web3.utils.utf8ToHex("dderp"),{from:accounts[0]});
    let identity = await lnrResolverContract.getResolveAddress.call(web3.utils.utf8ToHex("dderp"), {from:accounts[0]});
    expect(identity).to.eql(accounts[0]);
    let primary = await lnrResolverContract.primary.call(accounts[0], {from:accounts[0]});
    expect(primary).to.eql(web3.utils.padRight(web3.utils.utf8ToHex("dderp"),64)); // must pad to 64 bytes because the hex is shown
  });

  it("verifyIsNameOwner(a[0], dderp) from a[0](owner) - ensure a[0] is nameOwner", async () => {
    let lnrResolverContract = await lnrResolverInstance.deployed();
    let verifyIsNameOwner = await lnrResolverContract.verifyIsNameOwner.call(web3.utils.utf8ToHex("dderp"), accounts[0], {from:accounts[0]});
    expect(verifyIsNameOwner).to.eql(true); // max length
  });

  it("verifyIsNameOwner(a[2], dderp) from a[2](controller) - ensure a[2] is nameOwner", async () => {
    let lnrResolverContract = await lnrResolverInstance.deployed();
    let verifyIsNameOwner = await lnrResolverContract.verifyIsNameOwner.call(web3.utils.utf8ToHex("dderp"), accounts[2], {from:accounts[0]});
    expect(verifyIsNameOwner).to.eql(true); // max length
  });

  it("unsetController(dderp) - a[1](not owner or controller) cannot unset the controller", async () => {
    let lnrResolverContract = await lnrResolverInstance.deployed();
    await truffleAssert.reverts(lnrResolverContract.unsetController(web3.utils.utf8ToHex("dderp"), {from:accounts[1]}),"Not yours");
  });

  it("unsetController(dderp) - a[2](controller) cannot unset the controller", async () => {
    let lnrResolverContract = await lnrResolverInstance.deployed();
    await truffleAssert.reverts(lnrResolverContract.unsetController(web3.utils.utf8ToHex("dderp"), {from:accounts[2]}),"Not yours");
  });

  it("unsetController(dderp) - a[0] can unset the controller", async () => {
    let lnrResolverContract = await lnrResolverInstance.deployed();
    await lnrResolverContract.unsetController(web3.utils.utf8ToHex("dderp"), {from:accounts[0]});
    let controller = await lnrResolverContract.controller.call(web3.utils.utf8ToHex("dderp"));
    expect(controller).to.eql(zeroAddress);
  });

  it("verifyIsNameOwner(a[0], dderp) from a[0](owner) - ensure a[0] is nameOwner", async () => {
    let lnrResolverContract = await lnrResolverInstance.deployed();
    let verifyIsNameOwner = await lnrResolverContract.verifyIsNameOwner.call(web3.utils.utf8ToHex("dderp"), accounts[0], {from:accounts[0]});
    expect(verifyIsNameOwner).to.eql(true); // max length
  });

  it("verifyIsNameOwner(a[2], dderp) from a[2](no longer controller) - ensure a[2] is NOT nameOwner", async () => {
    let lnrResolverContract = await lnrResolverInstance.deployed();
    let verifyIsNameOwner = await lnrResolverContract.verifyIsNameOwner.call(web3.utils.utf8ToHex("dderp"), accounts[2], {from:accounts[0]});
    expect(verifyIsNameOwner).to.eql(false); // max length
  });

  it("setPrimary(abcabcabcabcabcabcabcabcabcabcab) from a[0] - ensure primary was set", async () => {
    let lnrResolverContract = await lnrResolverInstance.deployed();
    await lnrResolverContract.setPrimary(web3.utils.utf8ToHex("abcabcabcabcabcabcabcabcabcabcab"), {from:accounts[0]});
    let primary = await lnrResolverContract.primary.call(accounts[0], {from:accounts[1]});
    expect(primary).to.eql(web3.utils.padRight(web3.utils.utf8ToHex("abcabcabcabcabcabcabcabcabcabcab"),64)); // max length
  });

  it("---ensure resolveAddress records are flushed for a[0] dderp", async () => {
    let lnrResolverContract = await lnrResolverInstance.deployed();
    let resolveAddress = await lnrResolverContract.getResolveAddress.call(web3.utils.utf8ToHex("dderp"), {from:accounts[1]});
    expect(resolveAddress).to.eql(zeroAddress);
  });

});
