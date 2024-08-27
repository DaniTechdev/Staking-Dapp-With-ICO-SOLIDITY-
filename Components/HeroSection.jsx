import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";

const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY;

import { TiTick } from "react-icons/ti";

import { LOAD_TOKEN_ICO } from "../Context";

const HeroSection = ({ poolDetails, addTokenMetaMask }) => {
  const { address } = useAccount;

  const [percentage, setPercentage] = useState();
  const [tokenDetails, setTokenDetails] = useState();

  useEffect(() => {
    if (address) {
      const loadToken = async () => {
        const token = await LOAD_TOKEN_ICO();
        setTokenDetails(token);
      };
    }

    loadToken();
  }, [address]);

  useEffect(() => {
    const calculatePercentage = () => {
      const tokenSold = tokenDetails?.soldTokens ?? 0;

      const tokenTotalSupply =
        tokenDetails?.soldTokens + Number(tokenDetails?.tokenBal) * 1 ?? 1;

      if (percentageNew == 0) {
        console.log("Token balance is zero, cannot calculate percentage");
      } else {
        setPercentage(percentageNew);
      }
    };
    const timer = setTimeout(calculatePercentage, 1000);

    return () => clearTimeout(timer);
  }, [notify]);
  return <div>HeroSection</div>;
};

export default HeroSection;
