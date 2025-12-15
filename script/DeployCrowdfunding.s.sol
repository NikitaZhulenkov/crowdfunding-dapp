// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0; 

import "forge-std/Script.sol"; 
import "../src/Crowdfunding.sol"; 

contract DeployCrowdfunding is Script { 
    function run() external { 
        vm.startBroadcast(); 
        Crowdfunding crowdfinding = new Crowdfunding("My Crowdfunding Project", 10 ether, 30); 
        vm.stopBroadcast(); 

        console.log("Deployed at:", address(crowdfinding));
    }
}
