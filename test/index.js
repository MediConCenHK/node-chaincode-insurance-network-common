const NetworkContract = require('node-chaincode-insurance-network-common');

class Chaincode extends NetworkContract {
}

Chaincode.Start(new Chaincode());