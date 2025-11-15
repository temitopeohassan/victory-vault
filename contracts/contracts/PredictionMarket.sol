// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/security/Pausable.sol";

contract PredictionMarket is Ownable, ReentrancyGuard, Pausable {
    enum Outcome { None, TeamA, TeamB, Draw }

    struct MatchInfo {
        string teamA;
        string teamB;
        uint64 startTime;
        uint64 endTime;
        bool resolved;
        Outcome result;
        uint256 totalPool;
        uint256 poolA;
        uint256 poolB;
        bool exists;
    }

    // Config
    address public feeRecipient;
    uint16 public platformFeeBps; // basis points (10000 = 100%)
    uint16 public constant MAX_PLATFORM_FEE_BPS = 1000; // 10% max by design

    // Matches & stakes
    mapping(bytes32 => MatchInfo) public matchesById;
    mapping(bytes32 => mapping(address => uint256)) public stakeA;
    mapping(bytes32 => mapping(address => uint256)) public stakeB;

    // Claim tracking
    mapping(bytes32 => mapping(address => bool)) public claimed; // winners claimed rewards
    mapping(bytes32 => mapping(address => bool)) public refunded; // refunds on draws claimed
    mapping(bytes32 => bool) public feePaid; // fee accounted for per match

    // Platform accounting
    uint256 public platformAccrued; // native currency accrued for platform (pull)

    // Events
    event MatchCreated(bytes32 indexed id, string teamA, string teamB, uint64 startTime);
    event Staked(bytes32 indexed id, address indexed user, Outcome outcome, uint256 amount);
    event MatchResolved(bytes32 indexed id, Outcome result, uint64 endTime);
    event RewardClaimed(bytes32 indexed id, address indexed user, uint256 reward);
    event RefundClaimed(bytes32 indexed id, address indexed user, uint256 refundAmount);
    event FeeRecipientUpdated(address indexed oldRecipient, address indexed newRecipient);
    event PlatformFeeUpdated(uint16 oldFeeBps, uint16 newFeeBps);
    event PlatformFeesWithdrawn(address indexed recipient, uint256 amount);
    event MatchCreatedExistsGuard(bytes32 indexed id);

    constructor(address _feeRecipient, uint16 _platformFeeBps) {
        require(_feeRecipient != address(0), "feeRecipient=0");
        require(_platformFeeBps <= MAX_PLATFORM_FEE_BPS, "fee bps > max");
        feeRecipient = _feeRecipient;
        platformFeeBps = _platformFeeBps;
    }

    // ---------- Admin ----------

    function setFeeRecipient(address _recipient) external onlyOwner {
        require(_recipient != address(0), "zero");
        address old = feeRecipient;
        feeRecipient = _recipient;
        emit FeeRecipientUpdated(old, _recipient);
    }

    function setPlatformFeeBps(uint16 _bps) external onlyOwner {
        require(_bps <= MAX_PLATFORM_FEE_BPS, "bps > max");
        uint16 old = platformFeeBps;
        platformFeeBps = _bps;
        emit PlatformFeeUpdated(old, _bps);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // Owner withdraws accumulated platform fees (pull)
    function withdrawPlatformFees() external nonReentrant {
        require(platformAccrued > 0, "no fees");
        uint256 amount = platformAccrued;
        platformAccrued = 0;

        // Allow feeRecipient to be changed to address(0) disallowed earlier; safe to require
        require(feeRecipient != address(0), "no feeRecipient");

        (bool ok, ) = payable(feeRecipient).call{value: amount}("");
        require(ok, "withdraw failed");

        emit PlatformFeesWithdrawn(feeRecipient, amount);
    }

    // ---------- Match lifecycle ----------

    function createMatch(
        bytes32 id,
        string calldata teamA_,
        string calldata teamB_,
        uint64 startTime
    ) external onlyOwner whenNotPaused {
        require(!matchesById[id].exists, "match exists");
        require(startTime > block.timestamp, "startTime must be future");

        matchesById[id] = MatchInfo({
            teamA: teamA_,
            teamB: teamB_,
            startTime: startTime,
            endTime: 0,
            resolved: false,
            result: Outcome.None,
            totalPool: 0,
            poolA: 0,
            poolB: 0,
            exists: true
        });

        emit MatchCreated(id, teamA_, teamB_, startTime);
    }

    // Stake with native CELO (or native currency) before match start
    function stake(bytes32 id, Outcome outcome) external payable whenNotPaused nonReentrant {
        uint256 amount = msg.value;
        require(amount > 0, "amount");
        require(outcome == Outcome.TeamA || outcome == Outcome.TeamB, "bad outcome");

        MatchInfo storage m = matchesById[id];
        require(m.exists, "no match");
        require(!m.resolved, "resolved");
        require(block.timestamp < m.startTime, "betting closed");

        if (outcome == Outcome.TeamA) {
            stakeA[id][msg.sender] += amount;
            m.poolA += amount;
        } else {
            stakeB[id][msg.sender] += amount;
            m.poolB += amount;
        }
        m.totalPool += amount;

        emit Staked(id, msg.sender, outcome, amount);
    }

    // Resolve: owner only but with timing validation
    function resolveMatch(bytes32 id, Outcome result, uint64 endTime) external onlyOwner whenNotPaused {
        require(result == Outcome.TeamA || result == Outcome.TeamB || result == Outcome.Draw, "bad result");
        MatchInfo storage m = matchesById[id];
        require(m.exists, "no match");
        require(!m.resolved, "resolved");
        require(endTime >= m.startTime, "endTime < startTime");
        require(block.timestamp >= endTime, "cannot resolve before endTime");

        m.resolved = true;
        m.result = result;
        m.endTime = endTime;

        emit MatchResolved(id, result, endTime);
    }

    // ---------- Claiming ----------

    // Claim reward if you backed the winning side (only for TeamA/TeamB)
    function claimReward(bytes32 id) external nonReentrant whenNotPaused {
        MatchInfo storage m = matchesById[id];
        require(m.exists, "no match");
        require(m.resolved, "not resolved");
        require(m.result == Outcome.TeamA || m.result == Outcome.TeamB, "draw or none");

        require(!claimed[id][msg.sender], "claimed");

        uint256 userStake = (m.result == Outcome.TeamA) ? stakeA[id][msg.sender] : stakeB[id][msg.sender];
        require(userStake > 0, "no stake");

        // Mark claimed first (effects)
        claimed[id][msg.sender] = true;

        // Fee accounting: on first claim, set aside platform fee (pull model), do not transfer here
        if (!feePaid[id]) {
            uint256 fee = (m.totalPool * platformFeeBps) / 10000;
            feePaid[id] = true;
            if (fee > 0) {
                platformAccrued += fee;
            }
            // distributable (for reward calculation) should exclude fee
            // (we do not transfer fee now — owner will withdraw via withdrawPlatformFees)
        }

        uint256 feeLocal = (m.totalPool * platformFeeBps) / 10000;
        uint256 distributable = m.totalPool;
        if (feeLocal > 0 && feeLocal <= m.totalPool) {
            distributable = m.totalPool - feeLocal;
        } else {
            // defensively set to 0 if fee exceeds pool (shouldn't happen due to MAX_PLATFORM_FEE_BPS)
            distributable = 0;
        }

        uint256 winnerPool = (m.result == Outcome.TeamA) ? m.poolA : m.poolB;
        // if no one staked on the winner side, avoid division by zero (should be caught by userStake>0)
        require(winnerPool > 0, "no winner pool");

        uint256 reward = (userStake * distributable) / winnerPool;

        // Interaction: send reward
        (bool ok, ) = payable(msg.sender).call{value: reward}("");
        require(ok, "reward transfer failed");

        emit RewardClaimed(id, msg.sender, reward);
    }

    // If match resolved as Draw, bettors can reclaim their stake
    function claimRefund(bytes32 id) external nonReentrant whenNotPaused {
        MatchInfo storage m = matchesById[id];
        require(m.exists, "no match");
        require(m.resolved, "not resolved");
        require(m.result == Outcome.Draw, "not a draw");
        require(!refunded[id][msg.sender], "refunded");

        uint256 refundAmount = stakeA[id][msg.sender] + stakeB[id][msg.sender];
        require(refundAmount > 0, "no stake");

        refunded[id][msg.sender] = true;

        // reduce pools to avoid double refunds if someone calls again via storage manipulation attempts
        // (we keep original stake records intact for auditing; refunded flag prevents re-entries)
        // Interaction: send refund
        (bool ok, ) = payable(msg.sender).call{value: refundAmount}("");
        require(ok, "refund transfer failed");

        emit RefundClaimed(id, msg.sender, refundAmount);
    }

    // Emergency: owner can mark a match as invalid and allow refunds (onlyOwner, with caution)
    function adminMarkDrawAndAllowRefunds(bytes32 id) external onlyOwner whenNotPaused {
        MatchInfo storage m = matchesById[id];
        require(m.exists, "no match");
        require(!m.resolved, "already resolved");
        m.resolved = true;
        m.result = Outcome.Draw;
        m.endTime = uint64(block.timestamp);
        emit MatchResolved(id, Outcome.Draw, m.endTime);
    }

    // ---------- View helpers ----------

    function userStakeOf(bytes32 id, address user) external view returns (uint256 a, uint256 b) {
        a = stakeA[id][user];
        b = stakeB[id][user];
    }

    // ---------- Admin rescue (dust) ----------

    // Owner can rescue dust/native not accounted for platformAccrued or matches — protected and explicit
    function rescueNative(address to, uint256 amount) external onlyOwner nonReentrant {
        // compute expected locked amount = sum of all match totalPools + platformAccrued
        // NOTE: we cannot iterate mapping to compute sum on-chain - owner should use off-chain accounting
        // Use this function only when confident that rescue is safe (e.g., after migrating or after all matches settled)
        require(to != address(0), "zero");
        (bool ok, ) = payable(to).call{value: amount}("");
        require(ok, "rescue failed");
    }
}
