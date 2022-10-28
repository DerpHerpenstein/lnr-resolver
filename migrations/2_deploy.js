// UUPS IS more gas efficient, use this proxy type
//https://docs.openzeppelin.com/contracts/4.x/api/proxy#UUPSUpgradeable

const { deployProxy } = require('@openzeppelin/truffle-upgrades');

const lnrResolverContract = artifacts.require('LNR_RESOLVER_V1');

module.exports = async function (deployer) {
  const resolverInstance = await deployProxy(lnrResolverContract, { deployer });
  console.log('Resolver Address', resolverInstance.address);
};
