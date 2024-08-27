import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";

//INTERNAL IMPORT
import {
  Header,
  HeroSection,
  Footer,
  Pools,
  PoolsModel,
  WithdrawModal,
  Withdraw,
  Partners,
  Statistics,
  Token,
  Loader,
  Notification,
  ICOSale,
  Contact,
  Ask,
} from "../Components/index";

import {
  CONTRACT_DATA,
  deposit,
  widthdraw,
  claimReward,
  addTokenMetaMask,
} from "../Context/index";
import { add } from "lodash";

const index = () => {
  const { address } = useAccount();
  const [loader, setLoader] = useState(false);
  const [contactUs, setContactUs] = useState(false);
  const [poolID, setpoolID] = useState();
  const [widthdrawPoolID, setwidthdrawPoolID] = useState();

  const [poolDetails, setPoolDetails] = useState();
  const [selectedToken, setSselectedToken] = useState();
  const [selectedPool, setSelectedPool] = useState();

  const LOAD_DATA = async () => {
    if (address) {
      setLoader(true);
      const data = await CONTRACT_DATA(address);
      // console.log("data", data);

      setPoolDetails(data);

      setLoader(false);
    }
  };

  useEffect(() => {
    LOAD_DATA();
  }, [address]);

  return (
    <>
      <Header />
      <HeroSection
        poolDetails={poolDetails}
        addTokenMetaMask={addTokenMetaMask}
      />
      <Statistics setPoolDetails={setPoolDetails} />
      <Pools
        setPoolDetails={setPoolDetails}
        poolDetails={poolDetails}
        setSelectedPool={setSelectedPool}
      />
      <Token poolDetails={poolDetails} />
      <widthdraw
        setwidthdrawPoolID={setwidthdrawPoolID}
        poolDetails={poolDetails}
      />
      <Notification poolDetails={poolDetails} />
      <Partners />
      <Ask setContactUs={setContactUs} />
      <Footer />

      {/* MODAL */}
      <PoolsModel
        deposit={deposit}
        poolID={poolID}
        address={address}
        selectedPool={selectedPool}
        selectedToken={selectedToken}
        setLoader={setLoader}
      />

      <WithdrawModal
        widthdraw={widthdraw}
        widthdrawPoolID={widthdrawPoolID}
        address={address}
        setLoader={setLoader}
        claimReward={claimReward}
      />

      <ICOSale setLoader={setLoader} />
    </>
  );
};

export default index;
