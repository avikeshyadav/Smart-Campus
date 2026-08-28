import React from "react";
import Topbar from "./layouts/Topbar";
import { Footer } from "./layouts/Footer";
import HomePage from "../pages/HomePage";

const Main_layout = ({ isLoggedIn, onLogin,onLogout,bg }) => {
  return (
    <>
      <Topbar
        isLoggedIn={isLoggedIn}
        onLogin={onLogin}
        onLogout={onLogout} 
      /> 
      <HomePage />
      <Footer />
    </>
  );
};

export default Main_layout;