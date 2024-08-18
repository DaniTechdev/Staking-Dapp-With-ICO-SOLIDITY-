import { BigNumber } from "ethers";
import toast from "react-hot-toast";
import {
  contract,
  tokenContract,
  ERC20,
  toEth,
  TOKEN_ICO_CONTRACT,
} from "./constants";

const STAKING_DAPP_ADDRESS = process.env.NEXT_PUBLIC_STAKING_DAPP;
const DEPOSIT_TOKEN = process.env.NEXT_PUBLIC_DEPOSIT_TOKEN;
const REWARD_TOKEN = process.env.NEXT_PUBLIC_REWARD_TOKEN;
const TOKEN_LOGO = process.env.NEXT_PUBLIC_TOKEN_LOGO;

const notifySuccess = (msg) => toast.success(msg, { duration: 2000 });
const notifyError = (msg) => toast.error(msg, { duration: 2000 });

//FUNCTIONS

function CONVERT_TIMESTAMP_TO_READABLE(timestamp) {
  const date = new Date(timestamp * 1000);

  const readableTime = data.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return readableTime;
}

function toWei(amount) {
  const toWei = ethers.utils.parseUnits(amount.toString());

  return toWei.toString();
}

function parseErrorMsg(e) {
  const json = JSON.parse(JSON.stringify(e));

  return json?.reason || json?.error?.message;
}

export const SHORTEN_ADDRESS = (address) => {
  `${address?.slice(0, 8)}...${address?.slice(address.length - 4)}`;
};

export const copyAddress = (text) => {
  navigator.clipboard.writeText(text);
  nofifySuccess("Address copied successfully!");
};

//READING DATA function
export async function CONTRACT_DATA(address) {
  try {
    const contractObj = await contract();
    const stakingTokenObj = await tokenContract();

    if (address) {
      const contractOwner = await contractObj.owner();
      const contractAddress = await contractObj.address();

      //NOTIFICATION
      //reading the data

      const notifications = await contractObj.getNotification();
      const _notificationsArray = await Promise.all(
        notifications.map(
          async ({ pooID, amount, user, typeOf, timeStamp }) => {
            return {
              pooID: pooID.toNumber(),
              amount: toEth(amount),
              user: user,
              typeOf: typeOf,
              timeStamp: CONVERT_TIMESTAMP_TO_READABLE(timeStamp),
            };
          }
        )
      );

      //POOL INFORMATION
      //reading the data

      let poolInfoArray = [];
      const poolLenght = await contractObj.poolCount();
      const length = poolLenght.toNumber();

      for (let i = 0; 1 < length; i++) {
        const poolInfo = await contractObj.poolInfo(i);

        const userInfo = await contractObj.userInfo(i, address);
        const userReward = await contract.pendingReward(i, address);

        //getting the ERC20 token information/object at the stakingPoolContract with a particular user address
        const tokenPoolInfoA = await ERC20(poolInfo.depositToken, address);
        const tokenPoolInfoB = await ERC20(poolInfo.rewardToken, address);

        //information of the poolTokenAddressess and pool token objects
        const pool = {
          //poolinfor
          depositTokenAddress: poolInfo.depositToken,
          rewardTokenAddress: poolInfo.rewardToken,
          depositToken: tokenPoolInfoA,
          rewardToken: tokenPoolInfoB,

          //user
          amount: toEth(userInfo.amount.toString()),
          userReward: toEth(userReward),
          lockUntil: CONVERT_TIMESTAMP_TO_READABLE(userInfo.lockUntil.toNumber),
          lastRewardAt: toEth(userInfo.lastRewardAt.toString()),
        };

        poolInfoArray.push(pool);
      }

      //lets get the total amount of token deposited by a single user in all the pool
      //since we looped using the user address then pushed it inside an array, note. We are still inside the user loop
      const totalDepositAmount = poolInfoArray.reduce((total, pool) => {
        return total + parseFloat(pool.depositedAmount);
      });

      const rewardToken = await ERC20(REWARD_TOKEN, address);
      const depositedToken = await ERC20(DEPOSIT_TOKEN, address);

      const data = {
        contractOwner: contractOwner,
        contractAddress: contractAddress,
        notifications: _notificationsArray.reverse(),
        poolInfoArray: poolInfoArray,
        rewardToken: rewardToken,
        depositedToken: depositedToken,
        totalDepositAmount: totalDepositAmount,
        contractTokenBalance:
          depositedToken.contractTokenBalance - totalDepositAmount,
      };

      return data;
    }
  } catch (error) {
    console.log(error);

    console.log(parseErrorMsg(error));

    return parseErrorMsg(error);
  }
}

//WRITING DATA FUNCTION
export async function deposit(poolID, amount, address) {
  try {
    notifySuccess("calling contract...");

    const contractObj = await contract();
    //we will take stakingToken object in order to call the allowance/approve function.
    // This is necessary because the token contract needs to allow the
    //staking contract to transfer tokens on its behalf.

    const stakingTokenObj = await tokenContract();

    // const depositAmount = toWei(amount);
    const amountInWei = ethers.utils.parseUnits(amount.toString(), 18);

    const currentAllowance = await stakingTokenObj.allowance(
      address,
      contractObj.address
    );

    //if the current allowance is less than the deposit amount, approve the amount
    if (currentAllowance.lt(amountInWei)) {
      const approveTx = await stakingTokenObj.approve(
        contractObj.address,
        amountInWei
      );

      await approveTx.wait();

      console.log(`Approved ${amountInWei.toString()} token for staking`);
    }

    //we can calculate the gas we want to pay when we call a function to write on the blockchain
    //though they might have estimation for any function we want to call in the contract

    const gasEstimation = await contractObj.gasEstimation.deposit(
      Number(poolID),
      amountInWei
    ); //this will give the gas estimation the deposit function call will cost,
    //we will use the estimation in the deposit function

    notifySuccess("Staking token call...");
    const stakeTx = await contractObj.deposit(poolID, amountInWei, {
      gasLimit: gasEstimation,
    });

    const receipt = await stakeTx.wait();
    notifySuccess("Token staked successfully");

    return receipt;
  } catch (error) {
    console.log(error);

    const errorMsg = parseErrorMsg(error);
    notifyError(errorMsg);
  }
}

export async function transferToken(amount, transferAddresss) {
  try {
    notifySuccess("calling contract token ...");
    //transfer from tokenObject
    const stakingTokenObj = await tokenContract();
    //if you want to make the transfer dynamic, we have to work on the tokenContract object and
    //dynamically pass different contract address in the
    // const contractReader = new ethers.Contract(
    //     Dynamic token addresss here,
    //     CustomTokenABI.abi,
    //     signer
    //   );

    const transferAmount = ethers.utils.parseEther(amount);

    const approveTx = await stakingTokenObj.transfer(
      transferAddresss,
      transferAmount
    );

    await approveTx.wait();

    notifySuccess("token transfered successfully");
  } catch (error) {
    console.log(error);

    const errorMsg = parseErrorMsg(error);
    notifyError(errorMsg);
  }
}

export async function widthdraw(poolID, amount) {
  try {
    notifySuccess("calling contract ...");
    const amountInWei = ethers.utils.parseUnits(amount.toString(), 18);
    //widthdraw from contract oject//staking contract
    const contractObj = await contract();

    //estimate widthdrawal gas
    const gasEstimation = await contractObj.gasEstimation.widthdraw(
      Number(poolID),
      amountInWei
    );

    const data = await contractObj.widthdraw(Number(poolID), amountInWei, {
      gasLimit: gasEstimation,
    });

    const receipt = await data.wait();
    notifySuccess("transaction successfully completed");

    return receipt;
  } catch (error) {
    console.log(error);

    const errorMsg = parseErrorMsg(error);
    notifyError(errorMsg);
  }
}

export async function claimReward(pool) {
  try {
    const { _depositToken, _rewardToken, _api, _lockDays } = pool;
    //checking if all pool data are provided
    if (!_depositToken || !_rewardToken || !_api || !_lockDays)
      return notifyError("Provide all the details");

    notifySuccess("calling contract...");

    //claims from contract oject//staking contract
    const contractObj = await contract();

    const gasEstimation = await contractObj.gasEstimation.addPool(
      _depositToken,
      _rewardToken,
      Number(_api),
      Number(_lockDays)
    );

    const stakeTx = await contractObj.addPool(
      _depositToken,
      _rewardToken,
      Number(_api),
      Number(_lockDays),
      {
        gasLimit: gasEstimation,
      }
    );

    const receipt = await stakeTx.wait();
    notifySuccess(" Pool creation successfully completed");

    return receipt;
  } catch (error) {
    console.log(error);

    const errorMsg = parseErrorMsg(error);
    notifyError(errorMsg);
  }
}
export async function claimReward(poolID) {
  try {
    notifySuccess("calling contract...");

    //claims from contract oject//staking contract
    const contractObj = await contract();

    const gasEstimation = await contractObj.gasEstimation.widthdraw(
      Number(poolID)
    );

    const data = await contractObj.claimReward(Number(poolID), {
      gasLimit: gasEstimation,
    });

    const receipt = await data.wait();
    notifySuccess("Reward claim successfully completed");

    return receipt;
  } catch (error) {
    console.log(error);

    const errorMsg = parseErrorMsg(error);
    notifyError(errorMsg);
  }
}
