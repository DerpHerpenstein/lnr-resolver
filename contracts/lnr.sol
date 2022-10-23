// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract LNR {

   constructor() {
    }

    mapping(bytes32 => address)public names;
    mapping(bytes32 => address)public primary;

    function reserve(bytes32 _name) public {
        require(names[_name] == address(0));
        names[_name] = msg.sender;
    }
    function owner(bytes32 _name) public view returns(address){
        return names[_name];
    }

    function setAddress(bytes32 _name, address _addr) public {
      primary[_name] = _addr;
    }

    function addr(bytes32 _name) public view returns (address){
      return primary[_name];
    }


   function transfer(bytes32 _name, address _newOwner) public {
     if(owner(_name) == msg.sender)
       names[_name] = _newOwner;
   }

}
