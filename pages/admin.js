import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";

//INTERNAL IMPORT
import { Header, Footer, Loader, ICOSale } from "../Components/index";
import Admin from "../Components/Admin/Admin";
import AdminHead from "../Components/Admin/AdminHead";
import UpdateAPYModel from "../Components/Admin/UpdateAPYModel";
import Auth from "../Components/Admin/Auth";

import {
  CONTRACT_DATA,
  transferToken,
  createPool,
  sweep,
  modifyPool,
} from "../Context/index";

const admin = () => {
  return <div>admin</div>;
};

export default admin;
