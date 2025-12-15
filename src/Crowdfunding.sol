// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0; 

contract Crowdfunding { 
    address public owner; 
    string public projectName; 
    uint public goal; 
    uint public deadline;
    uint public totalDonated; 

    struct Donation { 
        address donor; 
        uint amount; 
        uint timestamp;
    } 

    Donation[] public donations; 

    modifier onlyOwner() { 
        require(msg.sender == owner, "Only owner can call this"); 
        _;
    } 

    constructor(string memory _projectName, uint _goal, uint _durationInDays) { 
        owner = msg.sender; 
        projectName = _projectName; 
        goal = _goal; 
        deadline = block.timestamp + (_durationInDays * 1 days);
    } 

    function donate() external payable { 
        require(block.timestamp < deadline, "Funding period ended"); 
        require(msg.value > 0, "Donation must be greater than 0"); 

        donations.push(Donation(msg.sender, msg.value, block.timestamp)); 
        totalDonated += msg.value;
    } 

    function getDonationCount() external view returns (uint) { 
        return donations.length;
    } 

    function getDonations() external view returns (Donation[] memory) { 
        return donations;
    } 

    function withdraw() external onlyOwner { 
        require(totalDonated >= goal, "Goal not reached"); 
        payable(owner).transfer(address(this).balance);
    } 

    function isFundingEnded() external view returns (bool) { 
        return  block.timestamp >= deadline;
    }
}
