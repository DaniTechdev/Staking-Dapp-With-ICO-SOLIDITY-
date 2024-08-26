import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";

import { LOAD_TOKEN_ICO } from "../../Context/constants";
import {
  UPDATE_TOKEN,
  UPDATE_TOKEN_PRICE,
  TOKEN_WIDTHRAW,
} from "../../Context/index";

import ButtonCmp from "./RegularComp/ButtonCmp";
import InputField from "./RegularComp/InputField";
import ClickButton from "./RegularComp/ClickButton";
import Title from "./RegularComp/Title";
s;

const ICOToken = ({ setLoader }) => {
  return <div>ICOToken</div>;
};

export default ICOToken;
