const ChaincodeStub = require('fabric-common-chaincode/ChaincodeStub');
const ClientIdentity = require('fabric-common-chaincode/CID');
const CommonChaincode = require('fabric-common-chaincode/base');

const keyCertPemInsurance = 'certPemInsurance';
const keyCertPemNetwork = 'certPemNetwork';
const keyDeployment = 'deployment';
const GlobalCCID = 'global';

class NetworkContract extends CommonChaincode {

	async init(stub) {
		const {params} = stub.getFunctionAndParameters();
		if (params[0]) {
			const {CertPemInsurance, CertPemNetwork} = JSON.parse(params[0]);
			await stub.putState(keyCertPemInsurance, CertPemInsurance);
			await stub.putState(keyCertPemNetwork, CertPemNetwork);
		}

		if (!await stub.getState(keyDeployment)) {
			await stub.putState(keyDeployment, 'uat'); // default deployment
		}
	}

	async certRotate(stub, certType, newPem) {
		let oldPem;
		switch (certType) {
			case 'insurance':
				oldPem = await stub.getState(keyCertPemInsurance);
				this._verifyCreatorIdentity(stub.stub, oldPem);
				await stub.putState(keyCertPemInsurance, newPem);

				break;
			case 'network':
				oldPem = await stub.getState(keyCertPemNetwork);
				this._verifyCreatorIdentity(stub.stub, oldPem);
				await stub.putState(keyCertPemNetwork, newPem);
				break;
			default:
				return `Unsupported certType: ${certType}`;
		}
	}

	async getStoredCerts(stub) {
		const CertPemInsurance = await stub.getState(keyCertPemInsurance);
		const CertPemNetwork = await stub.getState(keyCertPemNetwork);
		return {
			CertPemInsurance,
			CertPemNetwork
		};
	}

	/**
	 *
	 * @param {shim.ChaincodeStub} stub
	 * @param {string} expectedCert
	 * @protected
	 */
	_verifyCreatorIdentity(stub, expectedCert) {
		const cid = new ClientIdentity(stub);
		const creatorCert = cid.getCertPem();

		if (creatorCert !== expectedCert) {
			this.logger.error('creatorCert', creatorCert);
			this.logger.error('expectedCert', expectedCert);
			throw Error(`tx creator's identity is not as expected`);
		}
	}

	/**
	 *
	 * @param {ChaincodeStub} stub
	 * @param {string} token
	 * @return {Promise<undefined|string>}
	 * @protected
	 */
	async _getToken(stub, token) {
		const FcnGetToken = 'getToken';

		const args = [FcnGetToken, token];
		const {payload} = await stub.invokeChaincode(GlobalCCID, args);

		if (!payload) {
			return;
		}
		return JSON.parse(payload);
	}

	/**
	 *
	 * @param {ChaincodeStub} stub
	 * @param {string} token
	 * @param tokenTransferRequest
	 * @return {Promise<void>}
	 * @protected
	 */
	async _moveToken(stub, token, tokenTransferRequest) {
		const FcnMoveToken = 'moveToken';
		const args = [FcnMoveToken, token, JSON.stringify(tokenTransferRequest)];

		await stub.invokeChaincode(GlobalCCID, args);
	}

	/**
	 *
	 * @param {ChaincodeStub} stub
	 * @param {string} token
	 * @return {Promise<void>}
	 * @protected
	 */
	async _deleteToken(stub, token) {
		const FcnDeleteToken = 'deleteToken';
		const args = [FcnDeleteToken, token];
		await stub.invokeChaincode(GlobalCCID, args);
	}

	async setDeployment(stub, newDeployment) {
		await stub.putState(keyDeployment, newDeployment);
	}

	async getDeployment(stub) {
		return await stub.getState(keyDeployment);
	}
}

module.exports = NetworkContract;
