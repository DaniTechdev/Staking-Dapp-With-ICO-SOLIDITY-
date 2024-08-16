import { ethers } from "ethers";
import StakingDappABI from "./StakingDapp.json";
import TokenICO from "./TokenICO.json";
import CustomTokenABI from "./ERC20.json";

//CONTRACT
const STAKING_DAPP_ADDRESS = process.env.NEXT_PUBLIC_STAKING_DAPP;
const TOKEN_ICO = process.env.NEXT_PUBLIC_TOKEN_ICO;

//TOKEN
const DEPOSIT_TOKEN = process.env.NEXT_PUBLIC_DEPOSIT_TOKEN;
const REWARD_TOKEN = process.env.NEXT_PUBLIC_REWARD_TOKEN;

//WALLET
//UTILITY FUNCTION

//function to convert any number to ETHER
export function toETH(amount, decimals = 18) {
  const toEth = ethers.utils.formatUnits(amount, decimals);
  return toEth.toString();
}

//the native token contract se allow ussers to deposstit
export const tokenContract = async () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const { ethereum } = window;

  if (ethereum) {
    const signer = provider.getSigner();

    const contractReader = new ethers.Contract(
      DEPOSIT_TOKEN,
      CustomTokenABI.abi,
      signer
    );

    return contractReader;
  }
};

export const contract = async () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const { ethereum } = window;

  if (ethereum) {
    const signer = provider.getSigner();

    const contractReader = new ethers.Contract(
      STAKING_DAPP_ADDRESS,
      StakingDappABI.abi,
      signer
    );

    return contractReader;
  }
};

//get specific information about a particular token together with the address
export const ERC20 = async (address, userAddress) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const { ethereum } = window;

  if (ethereum) {
    const signer = provider.getSigner();

    const contractReader = new ethers.Contract(
      address,
      CustomTokenABI.abi,
      signer
    );

    const token = {
      name: await contractReader.name(),
      symbol: await contractReader.symbol(),
      address: await contractReader.address,
      totalSupply: toETH(await contractReader.totalSupply()),
      balance: await toEth(contractReader.balanceOf(userAddress)),
      contractTokenBalance: toETH(
        await contractReader.balanceOf(STAKING_DAPP_ADDRESS)
      ),
    };

    return token;
  }
};

//TOKEN ICO CONTRACT

export const LOAD_TOKEN_ICO = async () => {};
