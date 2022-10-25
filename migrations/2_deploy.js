// https://github.com/icon-project/devportal/blob/master/btp-gitbook/Contract-Upgradeability-Solidity.md
// https://github.com/OpenZeppelin/openzeppelin-upgrades/blob/master/packages/plugin-truffle/README.md
// https://github.com/OpenZeppelin/openzeppelin-upgrades

const { deployProxy } = require('@openzeppelin/truffle-upgrades');

const lnrResolverContract = artifacts.require('LNR_RESOLVER_V0');

module.exports = async function (deployer) {
  const resolverInstance = await deployProxy(lnrResolverContract, { deployer });
  console.log('Resolver Address', resolverInstance.address);
};
