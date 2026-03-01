// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/**
 * @title GreenToken ($LEAF)
 * @notice ERC-20 token rewarding users for sustainable grocery choices.
 * @dev Minting is gated behind a cryptographic signature from the EcoFi oracle
 *      backend. This prevents users from minting tokens without a verified
 *      carbon footprint calculation.
 *
 *  Flow:
 *   1. User scans receipt → AI parses items → backend calculates green score
 *   2. Backend signs: keccak256(abi.encodePacked(userAddress, score, nonce))
 *   3. Frontend submits transaction with (score, nonce, signature)
 *   4. This contract verifies the signature and mints score * LEAF_PER_POINT tokens
 */
contract GreenToken is ERC20, Ownable {
    using ECDSA for bytes32;

    // ─── State ─────────────────────────────────────────────────────────────────

    /// @notice Address whose private key signs the mint authorizations off-chain.
    address public oracleSigner;

    /// @notice Tracks used nonces per user to prevent replay attacks.
    mapping(address => mapping(uint256 => bool)) public usedNonces;

    /// @notice How many LEAF tokens (wei) are minted per green score point.
    uint256 public constant LEAF_PER_POINT = 1 ether; // 1 $LEAF per point (18 decimals)

    /// @notice Maximum score that can be claimed in a single receipt (anti-abuse).
    uint256 public constant MAX_SCORE_PER_CLAIM = 1000;

    // ─── Events ────────────────────────────────────────────────────────────────

    event RewardMinted(address indexed recipient, uint256 score, uint256 amount, uint256 nonce);
    event OracleSignerUpdated(address indexed oldSigner, address indexed newSigner);

    // ─── Errors ────────────────────────────────────────────────────────────────

    error InvalidSignature();
    error NonceAlreadyUsed(uint256 nonce);
    error ScoreExceedsMaximum(uint256 score, uint256 max);
    error ZeroScore();
    error ZeroAddress();

    // ─── Constructor ───────────────────────────────────────────────────────────

    constructor(address _oracleSigner) ERC20("Green Token", "LEAF") Ownable(msg.sender) {
        if (_oracleSigner == address(0)) revert ZeroAddress();
        oracleSigner = _oracleSigner;
    }

    // ─── External: Minting ─────────────────────────────────────────────────────

    /**
     * @notice Mint $LEAF tokens for a verified sustainable shopping score.
     * @param score    Green score computed off-chain by the EcoFi AI oracle (0–1000).
     * @param nonce    Unique nonce issued by the backend; prevents replay attacks.
     * @param signature ECDSA signature over (msg.sender, score, nonce) by oracleSigner.
     */
    function mintReward(
        uint256 score,
        uint256 nonce,
        bytes calldata signature
    ) external {
        // ── Validation ──────────────────────────────────────────────────────────
        if (score == 0) revert ZeroScore();
        if (score > MAX_SCORE_PER_CLAIM) revert ScoreExceedsMaximum(score, MAX_SCORE_PER_CLAIM);
        if (usedNonces[msg.sender][nonce]) revert NonceAlreadyUsed(nonce);

        // ── Signature verification ───────────────────────────────────────────────
        bytes32 msgHash = _buildMessageHash(msg.sender, score, nonce);
        bytes32 ethSignedHash = MessageHashUtils.toEthSignedMessageHash(msgHash);
        address recovered = ethSignedHash.recover(signature);

        if (recovered != oracleSigner) revert InvalidSignature();

        // ── State update (CEI pattern) ───────────────────────────────────────────
        usedNonces[msg.sender][nonce] = true;

        uint256 amount = score * LEAF_PER_POINT;
        _mint(msg.sender, amount);

        emit RewardMinted(msg.sender, score, amount, nonce);
    }

    // ─── External: Owner functions ─────────────────────────────────────────────

    /**
     * @notice Rotate the oracle signer address (e.g., after a key compromise).
     * @param newSigner The new oracle signing address.
     */
    function updateOracleSigner(address newSigner) external onlyOwner {
        if (newSigner == address(0)) revert ZeroAddress();
        emit OracleSignerUpdated(oracleSigner, newSigner);
        oracleSigner = newSigner;
    }

    /**
     * @notice Owner can mint tokens directly (e.g., initial liquidity pool seeding).
     * @param to     Recipient address.
     * @param amount Amount in wei (18 decimals).
     */
    function ownerMint(address to, uint256 amount) external onlyOwner {
        if (to == address(0)) revert ZeroAddress();
        _mint(to, amount);
    }

    // ─── Public: View helpers ──────────────────────────────────────────────────

    /**
     * @notice Returns the message hash that the oracle must sign.
     *         Exposed publicly so the backend can replicate it exactly.
     */
    function buildMessageHash(
        address user,
        uint256 score,
        uint256 nonce
    ) external pure returns (bytes32) {
        return _buildMessageHash(user, score, nonce);
    }

    // ─── Internal ──────────────────────────────────────────────────────────────

    function _buildMessageHash(
        address user,
        uint256 score,
        uint256 nonce
    ) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(user, score, nonce));
    }
}
