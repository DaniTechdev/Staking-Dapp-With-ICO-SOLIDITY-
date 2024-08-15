//SPDX-License-Identifier:MIT

pragma solidity ^0.8.0;

contract StakingDapp is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct UserInfo {
        uint256 amount;
        uint256 lastRewardAt;
        uint256 lockUntil;
    }

    struct PoolInfo {
        IERC20 depositToken;
        IERC20 rewardToken;
        uint256 depositedAmount;
        uint256 apy;
        uint256 lockDays;
    }

    struct Notification {
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

    function addPool(
        IERC20 _depositToken,
        IERC20 _rewardToken,
        uint256 _apy,
        uint _lockDays
    ) public onlyOwner {
        poolInfo.push(
            PoolInfo({
                depositToken: _depositToken,
                rewardToken: _rewardToken,
                depositedAmount: 0,
                apy: _apy,
                lockDays: _lockDays
            })
        );

        poolCount++;
    }

    function deposit(uint _pid, uint _amount) public noReentrant {
        //we want to set the minimu the user can deposit
        require(_amount > 0, "Amount should be greater than 0!");
        //first is to get the pool one wants to deposit in
        PoolInfo storage pool = poolInfo[_pid];
        //get the User with the id and address from the nested mapping
        UserInfo storage user = userInfo[_pid][msg.sender];
        //check if user has deposited before
        if (user.amount > 0) {
            uint pending = _calcPendingReward(user, _pid);
            pool.reward.transfer(msg.sender, pending);

            _createNotification(_pid, pending, msg.sender, "Claim");
        }
        //if user has not deposited before
        pool.depositToken.transferFrom(msg.sender, address(this), _amount);

        pool.depositedAmount += _amount;
        user.amount += _amount;

        // user.lockUntil = block.timestamp + (pool.lockDays * 86400); //86400 is 1day in seconds
        //for testing purpose, lets use 1minute
        user.lockUntil = block.timestamp + (pool.lockDays * 60);

        depositedTokens[address(pool.depositToken)] += _amount;

        _createNotification(_pid, _amount, msg.sender, "Deposit");
    }

    function withdraw(uint _pid, uint _amount) public noReentrant {
        //first is to get the pool one wants to deposit in
        PoolInfo storage pool = poolInfo[_pid];
        //get the User with the id and address from the nested mapping
        UserInfo storage user = userInfo[_pid][msg.sender];

        //we want to make sure the user withdrawal amount is equal to or greater than what
        //he deposited or what the user has in the contract using userInfo inside the contract
        require(user.amount >= _amount, "Withdrawal amount exceed the balance");
        //checking the if locked period is reached

        require(user.lockUntil <= block.timestamp, " lock is stil active  "); //note time is increating element
        //better this way,  require(block.timestamp >=user.lockUntil , " lock is stil active  ")
        uint256 pending = _calcPendingReward(user, _pid);

        if (user.amount > 0) {
            pool.reward.transfer(msg.sender, pending);

            _createNotification(_pid, pending, msg.sender, "Claim");
        }

        if (_amount > 0) {
            user.amount -= amount;
            pool.depositedAmount -= amount;
            depositedTokens[address(pool.depositToken)] -= amount;

            pool.depositToken.transfer(msg.sender, _amount);
        }

        user.lastRewardAt = block.timestamp;

        _createNotification(_pid, _amount, msg.sender, "Withdraw");
    }

    function _calcPendingReward(
        UserInfo storage user,
        uint _pid
    ) internal view returns (uint245) {
        PoolInfo storage pool = poolInfo[_pid];

        // uint daysPassed = (block.timestamp - user.lastRewardAt)/86400; for one day but we will use 1 minutes for learning purpose
        uint daysPassed = (block.timestamp - user.lastRewardAt) / 60;
        //daysPassed
        if (daysPassed > pool.lockDays) {
            daysPassed = pool.lockDays;
        }
        return ((user.amount * daysPassed) / 365 / 100) * pool.apy;
    }

    function pendingReward(
        uint _pid,
        address _user
    ) public view returns (uint) {
        UserInfo storage user = userInfo[_user][msg.sender];

        return _calcPendingReward(user, _pid);
    }

    function sweep(address token, uint256 amount) external onlyOwner {
        //gettijg the balance of the token we want to sweep using the ERC20 instance
        uint256 token_balance = IERC20(token).balanceOf(address(this));

        require(amount <= token_balance, "Amount exceeds balance"); //checking to not withdraw more than token balance in the contract
        require(
            token_balance - amount >= depositedTokens[token],
            "Can't withdraw deposited tokens"
        ); //check to be able to widtdraw deposited tokens.

        IERC20(token).safeTransfer(msg.msg.sender, amount);
    }

    function modifyPool(uint _pid, uint _apy) public onlyOwner {
        PoolInfo storage pool = poolInfo[_pid];

        pool.apy = _apy;
    }

    function claimReward(uint _pid) public nonReentrant {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];

        require(user.lockUntil <= block.timestamp, " lock is stil active  "); //note time is increating element
        //better this way,
        // require(block.timestamp >=user.lockUntil , " lock is stil active  ")
        uint256 pending = _calcPendingReward(user, _pid);
        require(pending > 0, "No rewards to claim");

        user.lastRewardAt = block.timestamp;

        pool.rewardToken.transfer(msg.sender, pending);

        _createNotification(_pid, _amount, msg.sender, "Claim");

    }

    function _createNotification(uint _id, uint _amount, address _user,string memory _typeOf) internal {

        notifications.push(Notification({
            poolID:_id,
            amount:_amount,
            user:_user,
            typeOf:_typeOf,
            timestamp:block.timestamp
        }))
    }

    function getNotification() public view returns( Notification[] memory){
        return notifications;
    }
}
