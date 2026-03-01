const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GreenToken ($LEAF)", function () {
    let greenToken;
    let owner;
    let oracleSigner;
    let user;
    let other;

    // ─── Helpers ─────────────────────────────────────────────────────────────────

    /** Build the exact same hash the contract uses internally */
    async function buildMessageHash(userAddress, score, nonce) {
        return ethers.solidityPackedKeccak256(
            ["address", "uint256", "uint256"],
            [userAddress, score, nonce]
        );
    }

    /** Sign the message hash with the oracle wallet (ethers v6) */
    async function signMintAuth(wallet, userAddress, score, nonce) {
        const msgHash = await buildMessageHash(userAddress, score, nonce);
        return wallet.signMessage(ethers.getBytes(msgHash));
    }

    // ─── Setup ───────────────────────────────────────────────────────────────────

    beforeEach(async function () {
        [owner, oracleSigner, user, other] = await ethers.getSigners();

        const GreenToken = await ethers.getContractFactory("GreenToken");
        greenToken = await GreenToken.deploy(oracleSigner.address);
        await greenToken.waitForDeployment();
    });

    // ─── Deployment ──────────────────────────────────────────────────────────────

    describe("Deployment", function () {
        it("should set the correct token name and symbol", async function () {
            expect(await greenToken.name()).to.equal("Green Token");
            expect(await greenToken.symbol()).to.equal("LEAF");
        });

        it("should set the deployer as the owner", async function () {
            expect(await greenToken.owner()).to.equal(owner.address);
        });

        it("should set the correct oracle signer", async function () {
            expect(await greenToken.oracleSigner()).to.equal(oracleSigner.address);
        });

        it("should revert if oracle signer is zero address", async function () {
            const GreenToken = await ethers.getContractFactory("GreenToken");
            await expect(
                GreenToken.deploy(ethers.ZeroAddress)
            ).to.be.revertedWithCustomError(greenToken, "ZeroAddress");
        });
    });

    // ─── mintReward ──────────────────────────────────────────────────────────────

    describe("mintReward()", function () {
        it("should mint the correct amount of tokens for a valid signature", async function () {
            const score = 50;
            const nonce = 1;
            const signature = await signMintAuth(oracleSigner, user.address, score, nonce);

            await expect(greenToken.connect(user).mintReward(score, nonce, signature))
                .to.emit(greenToken, "RewardMinted")
                .withArgs(user.address, score, ethers.parseEther("50"), nonce);

            const balance = await greenToken.balanceOf(user.address);
            expect(balance).to.equal(ethers.parseEther("50")); // 50 points × 1 LEAF each
        });

        it("should mark the nonce as used after minting", async function () {
            const score = 20;
            const nonce = 42;
            const signature = await signMintAuth(oracleSigner, user.address, score, nonce);

            await greenToken.connect(user).mintReward(score, nonce, signature);
            expect(await greenToken.usedNonces(user.address, nonce)).to.be.true;
        });

        it("should reject a replay attack (same nonce used twice)", async function () {
            const score = 30;
            const nonce = 7;
            const signature = await signMintAuth(oracleSigner, user.address, score, nonce);

            await greenToken.connect(user).mintReward(score, nonce, signature);

            await expect(
                greenToken.connect(user).mintReward(score, nonce, signature)
            ).to.be.revertedWithCustomError(greenToken, "NonceAlreadyUsed").withArgs(nonce);
        });

        it("should reject a signature made by a wallet that is NOT the oracle", async function () {
            const score = 50;
            const nonce = 1;
            // other signs — but only oracleSigner is authorised
            const fakeSignature = await signMintAuth(other, user.address, score, nonce);

            await expect(
                greenToken.connect(user).mintReward(score, nonce, fakeSignature)
            ).to.be.revertedWithCustomError(greenToken, "InvalidSignature");
        });

        it("should reject a signature for a different user address", async function () {
            const score = 50;
            const nonce = 1;
            // oracle signed for `user` but `other` tries to claim it
            const signature = await signMintAuth(oracleSigner, user.address, score, nonce);

            await expect(
                greenToken.connect(other).mintReward(score, nonce, signature)
            ).to.be.revertedWithCustomError(greenToken, "InvalidSignature");
        });

        it("should reject a score of zero", async function () {
            const score = 0;
            const nonce = 1;
            const signature = await signMintAuth(oracleSigner, user.address, score, nonce);

            await expect(
                greenToken.connect(user).mintReward(score, nonce, signature)
            ).to.be.revertedWithCustomError(greenToken, "ZeroScore");
        });

        it("should reject a score exceeding MAX_SCORE_PER_CLAIM", async function () {
            const score = 1001;
            const nonce = 1;
            const signature = await signMintAuth(oracleSigner, user.address, score, nonce);

            await expect(
                greenToken.connect(user).mintReward(score, nonce, signature)
            ).to.be.revertedWithCustomError(greenToken, "ScoreExceedsMaximum").withArgs(score, 1000);
        });
    });

    // ─── updateOracleSigner ──────────────────────────────────────────────────────

    describe("updateOracleSigner()", function () {
        it("should allow the owner to rotate the oracle signer", async function () {
            await expect(greenToken.connect(owner).updateOracleSigner(other.address))
                .to.emit(greenToken, "OracleSignerUpdated")
                .withArgs(oracleSigner.address, other.address);

            expect(await greenToken.oracleSigner()).to.equal(other.address);
        });

        it("should reject a non-owner caller", async function () {
            await expect(
                greenToken.connect(user).updateOracleSigner(other.address)
            ).to.be.revertedWithCustomError(greenToken, "OwnableUnauthorizedAccount");
        });

        it("should reject zero address", async function () {
            await expect(
                greenToken.connect(owner).updateOracleSigner(ethers.ZeroAddress)
            ).to.be.revertedWithCustomError(greenToken, "ZeroAddress");
        });

        it("should allow minting with the NEW signer after rotation", async function () {
            await greenToken.connect(owner).updateOracleSigner(other.address);

            const score = 40;
            const nonce = 99;
            // Now `other` is the oracle signer
            const signature = await signMintAuth(other, user.address, score, nonce);

            await expect(greenToken.connect(user).mintReward(score, nonce, signature))
                .to.emit(greenToken, "RewardMinted");
        });
    });

    // ─── ownerMint ───────────────────────────────────────────────────────────────

    describe("ownerMint()", function () {
        it("should allow owner to mint tokens directly", async function () {
            const amount = ethers.parseEther("1000");
            await greenToken.connect(owner).ownerMint(user.address, amount);
            expect(await greenToken.balanceOf(user.address)).to.equal(amount);
        });

        it("should reject non-owner callers", async function () {
            await expect(
                greenToken.connect(user).ownerMint(user.address, ethers.parseEther("100"))
            ).to.be.revertedWithCustomError(greenToken, "OwnableUnauthorizedAccount");
        });
    });
});
