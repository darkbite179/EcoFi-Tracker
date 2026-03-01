const { ethers } = require("ethers");

/**
 * Signs a mint authorization for the GreenToken contract.
 *
 * The contract verifies the following payload:
 *   keccak256(abi.encodePacked(userAddress, score, nonce))
 *
 * This MUST match `GreenToken._buildMessageHash()` exactly.
 *
 * @param {string} userAddress - The user's Ethereum wallet address (checksummed).
 * @param {number} score       - The green score (integer, 1–1000).
 * @param {number} nonce       - Unique nonce for this claim (prevents replay).
 * @returns {Promise<{ signature: string, signer: string }>}
 */
async function signMintAuthorization(userAddress, score, nonce) {
    const privateKey = process.env.ORACLE_PRIVATE_KEY;
    if (!privateKey) {
        throw new Error(
            "ORACLE_PRIVATE_KEY is not set in the backend .env file. " +
            "Copy smart-contracts/.env.example → backend/.env and populate it."
        );
    }

    const wallet = new ethers.Wallet(privateKey);

    // Build the same hash the Solidity contract uses
    const msgHash = ethers.solidityPackedKeccak256(
        ["address", "uint256", "uint256"],
        [userAddress, BigInt(score), BigInt(nonce)]
    );

    // ethers.signMessage prefixes with "\x19Ethereum Signed Message:\n32"
    // which matches ECDSA.toEthSignedMessageHash in the contract
    const signature = await wallet.signMessage(ethers.getBytes(msgHash));

    console.log(`✍️  Signed mint authorization:`);
    console.log(`   User    : ${userAddress}`);
    console.log(`   Score   : ${score}`);
    console.log(`   Nonce   : ${nonce}`);
    console.log(`   Signer  : ${wallet.address}`);
    console.log(`   Sig     : ${signature.slice(0, 20)}...`);

    return {
        signature,
        signer: wallet.address,
    };
}

module.exports = { signMintAuthorization };
