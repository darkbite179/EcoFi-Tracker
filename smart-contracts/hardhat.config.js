require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; // Hardhat default account #0

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: {
        version: "0.8.24",
        settings: {
            evmVersion: "cancun",
            optimizer: {
                enabled: true,
                runs: 200,
            },
        },
    },
    networks: {
        // Local Hardhat node — spin up with: npx hardhat node
        localhost: {
            url: "http://127.0.0.1:8545",
            chainId: 31337,
        },
        // Polygon Amoy testnet (formerly Mumbai)
        amoy: {
            url: process.env.AMOY_RPC_URL || "https://rpc-amoy.polygon.technology/",
            chainId: 80002,
            accounts: [PRIVATE_KEY],
            gasPrice: 30000000000, // 30 gwei
        },
    },
    etherscan: {
        apiKey: {
            polygonAmoy: process.env.POLYGONSCAN_API_KEY || "",
        },
        customChains: [
            {
                network: "polygonAmoy",
                chainId: 80002,
                urls: {
                    apiURL: "https://api-amoy.polygonscan.com/api",
                    browserURL: "https://amoy.polygonscan.com/",
                },
            },
        ],
    },
    gasReporter: {
        enabled: process.env.REPORT_GAS !== undefined,
        currency: "USD",
    },
};
