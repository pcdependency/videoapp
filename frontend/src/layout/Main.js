import React from "react";
import "../css/Main.css";
import { Routes, Route } from "react-router-dom";
import ProfilePage from "../pages/ProfilePage";
import VideoPage from "../pages/VideoPage";
import EmailConfirmation from "../components/EmailConfirmation";
import { useSelector } from "react-redux";

const Main = () => {
  const auth = useSelector((state) => state.auth);
  return (
    <div id="mainContainer">
      {!auth.validated && auth._id && <EmailConfirmation />}
      <Routes>
        <Route path="/channel/:_id/*" element={<ProfilePage />} />
        <Route path="/watch/:_id" element={<VideoPage />} />
      </Routes>
    </div>
  );
};

export default Main;
