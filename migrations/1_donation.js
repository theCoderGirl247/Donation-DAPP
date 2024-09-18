const Donation = artifacts.require("Donation");

module.exports = function (deployer) {
  // Deploy the Donation contract
  deployer.deploy(Donation);
};
