const EtherMultiSender = artifacts.require("./EtherMultiSender");
module.exports = async function(deployer) {
  deployer.deploy(EtherMultiSender);
};