const BaseContract = require('khala-fabric-contract-api/baseContract');
const ChaincodeStub = require('fabric-common-chaincode/ChaincodeStub');
const ClientID = require('fabric-common-chaincode/CID');
const keyCertPemInsurance = 'certPemInsurance';
const keyCertPemNetwork = 'certPemNetwork';
const keyDeployment = 'deployment';

class NetworkContract extends BaseContract {

	async init(context, certs) {
		await super.init(context);
		const stub = new ChaincodeStub(context.stub);

		if (certs) {
			const {CertPemInsurance, CertPemNetwork} = JSON.parse(certs);
			await stub.putState(keyCertPemInsurance, CertPemInsurance);
			await stub.putState(keyCertPemNetwork, CertPemNetwork);
		}

		if (!await stub.getState(keyDeployment)) {
			await stub.putState(keyDeployment, 'uat'); // default deployment
		}
	}

	async certRotate(context, certType, newPem) {
		const stub = new ChaincodeStub(context.stub);
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

	async getStoredCerts(context) {
		const stub = new ChaincodeStub(context.stub);
		const CertPemInsurance = await stub.getState(keyCertPemInsurance);
		const CertPemNetwork = await stub.getState(keyCertPemNetwork);
		return {
			CertPemInsurance,
			CertPemNetwork
		};
	}

	_verifyCreatorIdentity(stub, expectedCert) {
		const cid = new ClientID(stub);
		const creatorCert = cid.getCertPem();

		if (creatorCert !== expectedCert) {
			this.logger.error('creatorCert', creatorCert);
			this.logger.error('expectedCert', expectedCert);
			this.onError('verifyCreatorIdentity', `tx creator's identity is not as expected`);
		}
	}

	async setDeployment({stub}, newDeployment) {
		await stub.putState(keyDeployment, newDeployment);
	}

	async getDeployment(context, newDeployment) {
		const stub = new ChaincodeStub(context.stub);
		return await stub.getState(keyDeployment);
	}

	onError(code, message) {
		const err = Error(message);
		err.code = code;
		throw err;
	}
}

module.exports = NetworkContract;
