const BaseContract = require('khala-fabric-contract-api/baseContract');
const keyCertPemInsurance = 'certPemInsurance';
const keyCertPemNetwork = 'certPemNetwork';
const keyDeployment = 'deployment';

class NetworkContract extends BaseContract {

	async init(context, certs) {
		super.init(context);
		const {stub} = context;

		if (certs) {
			const {CertPemInsurance, CertPemNetwork} = JSON.parse(certs);
			await stub.putState(keyCertPemInsurance, CertPemInsurance);
			await stub.putState(keyCertPemNetwork, CertPemNetwork);
		}

		if (!await stub.getState(keyDeployment)) {
			await stub.putState(keyDeployment, 'uat'); // default deployment
		}
	}

	async certRotate({stub}, certType, newPem) {
		let oldPem;
		switch (certType) {
			case 'insurance':
				oldPem = await stub.getState(keyCertPemInsurance);
				this._verifyCreatorIdentity({stub}, oldPem.toString());
				await stub.putState(keyCertPemInsurance, newPem);

				break;
			case 'network':
				oldPem = await stub.getState(keyCertPemNetwork);
				this._verifyCreatorIdentity({stub}, oldPem.toString());
				await stub.putState(keyCertPemNetwork, newPem);
				break;
			default:
				return `Unsupported certType: ${certType}`;
		}
	}

	async getStoredCerts({stub}) {
		const CertPemInsurance = await stub.getState(keyCertPemInsurance);
		const CertPemNetwork = await stub.getState(keyCertPemNetwork);
		return {
			CertPemInsurance: CertPemInsurance.toString(),
			CertPemNetwork: CertPemNetwork.toString()
		};
	}

	_verifyCreatorIdentity({stub}, expectedCert) {
		const creatorCert = stub.getCreator().id_bytes.toString('utf8');

		if (creatorCert !== expectedCert) {
			this.logger.error('creatorCert', creatorCert);
			this.logger.error('expectedCert', expectedCert);
			this.onError('verifyCreatorIdentity', `tx creator's identity is not as expected`);
		}
	}

	async setDeployment({stub}, newDeployment) {
		await stub.putState(keyDeployment, newDeployment);
	}

	async getDeployment({stub}, newDeployment) {
		const deployment = await stub.getState(keyDeployment);
		return deployment.toString();
	}

	onError(code, message) {
		const err = Error(message);
		err.code = code;
		throw err;
	}
}

module.exports = NetworkContract;
