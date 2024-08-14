//SPDX-License-Identifier:MIT

pragma solidity ^0.8.0;

contract StakingDapp is Ownable, ReentrancyGuard {
    

    using SafeERC20 for IERC20;

    struct UserInfo{
        uint256 amount;
        uint256 lastRewardAt;
        uint256 lockUntil;
    }

    struct PoolInfo{
        IERC20 depositToken;
        IERC20 rewardToken;
        uint256 depositedAmount;
        uint256 apy;
        uint256 lockDays;
    }

    struct Notification{
        uint256 poolID;
        uint256 amount;
        uint256 user;
        string typeOf;
        uint256 timestamp;
    }


    uint decimals = 10 ** 18;

    uint public poolCount;

    PoolInfo[] public poolInfo;

    mapping(address => uint256) public depositedTokens;
    mapping(uint256 => mapping(address => UserInfo)) public userInfo;


    Notification[] public notifications;

    ////CONTRACT FUNCTION

    function addPool(IERC20 _depositToken, IERC20 _rewardToken, uint256 _apy, uint _lockDays) public onlyOwner{

        poolInfo.push(PoolInfo({
            depositToken:_depositToken,
            rewardToken:_rewardToken,
            depositedAmount:0,
            apy:_apy,
            lockDays:_lockDays
        }));

        poolCount++;
    }


    function deposit(uint _pid, uint _amount) public  noReentrant{

        //first is to get the pool one wants to deposit in
        PoolInfo storage pool = poolInfo[_pid];
        //get the User with the id and address from the nested mapping
        UserInfo storage user = userInfo[_pid][msg.sender];
    }

    function withdraw(){}

    function _calcPendingReward(){}

    function pendingReward(){}

    function sweep(){}

    function modifyPool(){}

    function claimReward(){}

    function _createNotification(){}

    function getNotification(){}

    



}