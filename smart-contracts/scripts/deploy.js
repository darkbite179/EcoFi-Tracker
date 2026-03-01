const { ethers } = require("hardhat");

async function main() {
    console.log("\n🌿 EcoFi Tracker — Deploying GreenToken ($LEAF)...\n");

    const [deployer, oracleAccount] = await ethers.getSigners();

    console.log(`📦 Deployer address  : ${deployer.address}`);
    console.log(`🔑 Oracle signer     : ${oracleAccount.address}`);

    const deployerBalance = await ethers.provider.getBalance(deployer.address);
    console.log(`💰 Deployer balance  : ${ethers.formatEther(deployerBalance)} ETH\n`);

    // Deploy GreenToken, passing the oracle signer address to the constructor
    const GreenToken = await ethers.getContractFactory("GreenToken");
    const greenToken = await GreenToken.deploy(oracleAccount.address);
    await greenToken.waitForDeployment();

    const contractAddress = await greenToken.getAddress();

    console.log("✅ GreenToken deployed!");
    console.log(`   Contract address : ${contractAddress}`);
    console.log(`   Token name       : ${await greenToken.name()}`);
    console.log(`   Token symbol     : $${await greenToken.symbol()}`);
    console.log(`   Oracle signer    : ${await greenToken.oracleSigner()}\n`);

    // ─── Seed owner liquidity (for demo) ────────────────────────────────────────
    // On local network, give the deployer 10,000 $LEAF so the demo wallet
    // shows a non-zero balance immediately after deploy.
    if ((await ethers.provider.getNetwork()).chainId === 31337n) {
        const seedAmount = ethers.parseEther("10000");
        const tx = await greenToken.ownerMint(deployer.address, seedAmount);
        await tx.wait();
        console.log(`🪙  Seeded deployer with ${ethers.formatEther(seedAmount)} $LEAF for local demo`);
    }

    console.log("\n📋 Copy these values into your backend/.env:\n");
    console.log(`CONTRACT_ADDRESS=${contractAddress}`);
    console.log(`ORACLE_PRIVATE_KEY=<private key of ${oracleAccount.address}>`);
    console.log("\n✨ Done!\n");
}

main().catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exitCode = 1;
});
