const { ethers } = require("hardhat");

async function main() {
    console.log("\n🌿 EcoFi Tracker — Deploying GreenToken ($LEAF)...\n");

    const [deployer] = await ethers.getSigners();

    // On testnet, use the deployer as both deployer AND oracle signer
    // (In production, these should be separate keys for security)
    const oracleAddress = deployer.address;

    console.log(`📦 Deployer address  : ${deployer.address}`);
    console.log(`🔑 Oracle signer     : ${oracleAddress}`);

    const deployerBalance = await ethers.provider.getBalance(deployer.address);
    const network = await ethers.provider.getNetwork();
    console.log(`💰 Deployer balance  : ${ethers.formatEther(deployerBalance)} MATIC`);
    console.log(`🌐 Network           : ${network.name} (chainId: ${network.chainId})\n`);

    // Deploy GreenToken, passing the oracle signer address to the constructor
    const GreenToken = await ethers.getContractFactory("GreenToken");
    const greenToken = await GreenToken.deploy(oracleAddress);
    await greenToken.waitForDeployment();

    const contractAddress = await greenToken.getAddress();

    console.log("✅ GreenToken deployed!");
    console.log(`   Contract address : ${contractAddress}`);
    console.log(`   Token name       : ${await greenToken.name()}`);
    console.log(`   Token symbol     : $${await greenToken.symbol()}`);
    console.log(`   Oracle signer    : ${await greenToken.oracleSigner()}\n`);

    // ─── Seed owner liquidity (for demo — local only) ─────────────────────────
    if (network.chainId === 31337n) {
        const seedAmount = ethers.parseEther("10000");
        const tx = await greenToken.ownerMint(deployer.address, seedAmount);
        await tx.wait();
        console.log(`🪙  Seeded deployer with ${ethers.formatEther(seedAmount)} $LEAF for local demo`);
    }

    console.log("\n📋 Copy these values into your backend/.env:\n");
    console.log(`CONTRACT_ADDRESS=${contractAddress}`);
    console.log(`ORACLE_PRIVATE_KEY=0x1fb906f30f4d5817981716821a2af3d5defdd3d876d6390d1a374399eabc91e8`);
    console.log(`\n🔗 View on explorer: https://amoy.polygonscan.com/address/${contractAddress}`);
    console.log("\n✨ Done!\n");
}

main().catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exitCode = 1;
});
