// SPDX-License-Identifier: UNLISCENCED
pragma solidity 0.8.17;

contract Donation {
    address public owner;
    uint256 public noOfDonors;
    address[] public donorList;
    mapping(address => uint256) public donationAmount;
    mapping (address => uint256) public donationTimeStamp;
    uint256 minDonation = 0.1 ether;
    uint256 maxDonation = 10 ether;
    uint256 public targetAmount = 100 ether; 
    uint256 withdrawPeriod = 7 days;
    bool public hasPeriodExpired = false;
    bool public paused = false;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "You are not the OWNER!!!");
        _;
    }

    modifier whenNotPaused(){
        require(!paused, "Contract is paused!");
        _;
    }

    receive() external payable {
        donate();
    }

    function pause() public onlyOwner {
        paused = true;
    }

    function unpause() public onlyOwner {
        paused = false;
    }


    function donate() public payable whenNotPaused{
        require(msg.value >= minDonation , "Donation must be greater than 0.1 ETH");
        require(msg.value <= maxDonation , "Donation cannot be more than 10 ETH");

        uint256 userTotalDonation = donationAmount[msg.sender] + msg.value;
        require(userTotalDonation <= maxDonation, "Total Donation amount cannot exceed 10 ETH");

        //checking if this is a first time donor...
        if (donationAmount[msg.sender] == 0) {
            donorList.push(msg.sender);
            noOfDonors++;
        }
        donationAmount[msg.sender] = userTotalDonation;
        donationTimeStamp[msg.sender] = block.timestamp;
    }

    function withdraw() public whenNotPaused{
        //check if user has donated something...
        if(donationAmount[msg.sender] == 0){
            revert("Withdraw failed: You haven't donated anything!");
        }

        //Check if the withdraw period has passed...
        if(block.timestamp > donationTimeStamp[msg.sender] + withdrawPeriod) {
            hasPeriodExpired = true;
            revert("Withdraw failed: Withdraw period expired, you can no longer withdraw funds!");
        }

        uint256 amount = donationAmount[msg.sender];

        // Make the donation amount zero before transferring money 
        // in order to prevent reentrancy attacks
        donationAmount[msg.sender] = 0;

        payable(msg.sender).transfer(amount);
        noOfDonors--;
    }

    function totalAmountRaised() public view returns (uint256) {
        return address(this).balance;
    }

    function getAllDonors() public view onlyOwner returns (address[] memory, uint256[] memory)
    {   uint256[] memory amounts = new uint256[](donorList.length);

        for (uint256 i = 0; i < donorList.length; i++) {
            amounts[i] = donationAmount[donorList[i]];
        }
        return (donorList, amounts);
    }

    function withdrawAllFunds() public onlyOwner whenNotPaused{
        payable(owner).transfer(address(this).balance);
    }

    function isOwner() public view returns (bool) {
        return msg.sender == owner;
    }

    function isTargetAchieved() public view returns (bool) {
    return address(this).balance >= targetAmount;
    }

}