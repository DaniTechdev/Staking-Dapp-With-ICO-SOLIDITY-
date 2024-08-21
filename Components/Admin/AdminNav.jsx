import React from "react";

import ButtonCmp from "./RegularComp/ButtonCmp";
//INTERNAL IMPORT

const AdminNav = () => {
  return (
    <div className="col-12 col-lg-3 ">
      <div className="section__tabs-profile">
        <ul
          className="nav  nav-tabs section__tabs
         section__tabs--bg section__tabs--profile"
          id="section__tabs"
          role="tablist"
        >
          <ButtonCmp name={"Dashboard"} tab={1} styleClass={"active"} />
        </ul>
      </div>
    </div>
  );
};

export default AdminNav;
