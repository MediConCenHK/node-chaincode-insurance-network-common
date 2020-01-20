/**
 * @typedef TimeLong
 * @type {number}
 */

/**
 *
 * @typedef TokenData
 * @type {Object}
 * @property {string} Owner
 * @property {MspId} Issuer
 * @property {MspId} Manager
 * @property {OwnerType} OwnerType
 * @property {TokenType} TokenType
 * @property {ClientIdentityData} IssuerClient
 * @property {TimeLong} ExpiryDate
 * @property {TimeLong} TransferDate
 * @property {ClientIdentityData} Client Latest Operator Client
 * @property MetaData
 *
 */


const OwnerType = {
	OwnerTypeMember: 1,
	OwnerTypeClinic: 2,
	OwnerTypeNetwork: 3,
	OwnerTypeInsurance: 4
};
const TokenType = {
	TokenTypeVerify: 1,
	TokenTypePay: 2
};

module.exports = {
	TokenType,
	OwnerType
};