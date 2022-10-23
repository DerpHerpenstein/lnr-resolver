// SPDX-License-Identifier: MIT
// By Derp Herpenstein (https://www.derpnation.xyz, https://www.avime.com)

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

interface ILNR {
   function owner(bytes32 _name) external view returns(address);
}

contract LNR_RESOLVER_V0 is Initializable, ReentrancyGuardUpgradeable , OwnableUpgradeable{
    event NewController(bytes32 indexed name, address indexed controller);
    event NewPrimary(bytes32 indexed name, address indexed primary);

    address public lnrAddress;                          //0x5564886ca2C518d1964E5FCea4f423b41Db9F561
    mapping(bytes32 => address) public resolveAddress;  // maps a LNR domain name to an an address
    mapping(bytes32 => address) public controller;      // stores controller for each name, controller or owner can change domain information
    mapping(address => bytes32) public primary;         // stores the primary name of an address

    function initialize() public initializer {
      __Ownable_init();
    }

    function updateLNRAddress(address _addr) public onlyOwner {
      require(lnrAddress == address(0), 'Can only be changed once');
      lnrAddress = _addr;
    }

    function getResolveAddress(bytes32 _name) public view returns (address){
      return resolveAddress[_name];
    }

    function resolve(string calldata _domain) public view returns (address){
      bytes memory domainBytes = bytes(_domain);
      require(domainBytes.length < 36, "Too long"); // bytes32 + .og = 35 bytes
      require(domainBytes[domainBytes.length-1] == 0x67 && domainBytes[domainBytes.length-2] == 0x6F && domainBytes[domainBytes.length-3] == 0x2E, "invalid domain"); // must end in .og
      domainBytes[domainBytes.length-1] = 0x00;
      domainBytes[domainBytes.length-2] = 0x00;
      domainBytes[domainBytes.length-3] = 0x00;
      uint i;
      // ensures there are no other periods in the name, it must be a primary and not a subdomain!
      for(;i<domainBytes.length-3;){
        require(domainBytes[i] != 0x2E, "this is a subdomain");
        unchecked {++i;}
      }
      return resolveAddress[bytes32(domainBytes)];
    }

    // make sure that the _addr is the authorized to make changes (controller or the owner)
    function verifyIsDomainOwner(bytes32 _name, address _addr) public view {
        require((controller[_name] == _addr) || (ILNR(lnrAddress).owner(_name) == _addr) , "Not yours");
    }

    // allow the owner to designate a new controller
    function setController(bytes32 _name, address _controller) public nonReentrant {
      require((ILNR(lnrAddress).owner(_name) == msg.sender) , "Not yours");
      controller[_name] = _controller;
      emit NewController(_name, _controller);
    }

    // setting the primary with map the name to the primary address and the address to the name
    function setPrimary(bytes32 _name) public nonReentrant {
      verifyIsDomainOwner(_name, msg.sender);
      primary[resolveAddress[_name]] = 0x00;   // remove primary from old primary address
      primary[msg.sender] = _name;             // set new primary
      resolveAddress[_name] = msg.sender;      // set new resolver
      emit NewPrimary(_name, msg.sender);
    }
}
