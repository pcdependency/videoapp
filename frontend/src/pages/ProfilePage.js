import React, { useEffect, useCallback, useState } from "react";
import "../css/ProfilePage.css";
import { useParams } from "react-router-dom";
import ProfilePicture from "../components/ProfilePicture";
import VideosList from "../components/VideosList";
import FormModal from "../modals/FormModal";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Button from "@mui/material/Button";
import {
  getProfile,
  checkFollowing,
  updateFollow,
} from "../redux/client/clientActions";
import FollowModal from "../modals/FollowModal";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import ModalFooter from "../modals/footers/ModalFooter";
import { containedBtnStyle } from "../css/MuiStyles";

const initialState = [
  {
    name: "picture",
    label: "Change Profile Picture",
    required: false,
    inputType: "file",
    fileType: "image",
    test: "validateImage",
    helperText: "Max 5MB",
    endIcon: AddPhotoAlternateIcon,
    maxSize: 5000,
    requireValidated: true,
  },
  {
    name: "banner",
    label: "Change Profile Banner",
    required: false,
    inputType: "file",
    fileType: "image",
    test: "validateImage",
    helperText: "Max 5MB",
    endIcon: AddPhotoAlternateIcon,
    maxSize: 5000,
    requireValidated: true,
  },
  {
    name: "userName",
    label: "Change User Name",
    required: false,
    inputType: "text",
    test: "validateName",
    helperText: "Min 1 Character, Max 14 Characters",
    minLength: 1,
    maxLength: 14,
  },
  {
    name: "email",
    inputType: "email",
    label: "Change Email",
    required: false,
    test: "validateEmail",
    validationType: "email",
    helperText: "(ex. youremail@domain.com)",
    minLength: 5,
    maxLength: 350,
  },
  {
    name: "password2",
    inputType: "password",
    label: "Change Password",
    required: false,
    test: "validatePassword",
    validationType: "validateComparePasswords",
    helperText:
      "Min 6 Characters, Max 26 Characters. Must have at least 2 numbers. Must have at least 1 upper and lower-case character. No spaces.",
    minLength: 6,
    maxLength: 24,
  },
];

const profilePictureStyles = {
  margin: "0 10px 0 0",
  height: "5vw",
  width: "5vw",
  maxHeight: "60px",
  minHeight: "40px",
  maxWidth: "60px",
  minWidth: "40px",
  borderRadius: "50%",
  backgroundColor: "black",
};

const links = [
  {
    link: "home",
    path: "featured",
  },
  {
    link: "videos",
    path: "videos",
  },
  {
    link: "playlists",
    path: "playlists",
  },
  {
    link: "about",
    path: "about",
  },
];

const ProfilePage = ({ mainRef }) => {
  const dispatch = useDispatch();
  const { _id } = useParams();
  const { auth, client } = useSelector((state) => state);
  const [page, setPage] = useState("featured");
  const { profile } = client;
  const GetProfile = useCallback(() => {
    dispatch(getProfile(_id));
    auth._id && dispatch(checkFollowing(_id));
  }, [auth._id, _id, dispatch]);

  useEffect(() => {
    GetProfile();
  }, [GetProfile]);

  return (
    <div className="profilePageContainer">
      <div
        className="profilePageInnerContainer"
        style={{ paddingTop: auth.validated ? "50px" : "0" }}
      >
        <div className="profileBannerContainer">
          <img
            width="100%"
            height="100%"
            src={`/api/main/stream/pb/100/${_id}`}
            alt=""
            className="profileBannerImg"
          />
        </div>
        <div className="profileInfoBarContainer">
          <div className="profileInfoBarInnerContainer">
            <div className="profileInfoBarLeftContainer">
              <ProfilePicture
                styles={profilePictureStyles}
                menu={false}
                _id={_id}
              />
              <div className="profileUserInfoContainer">
                <p className="profileUserNameTxt">{profile.userName}</p>
                <FollowModal _id={_id} type="profile" />
              </div>
            </div>
            <div className="profileInfoBarRightContainer">
              {auth._id === _id ? (
                <FormModal
                  key="editProfile"
                  name="editProfile"
                  initialState={initialState}
                  btnName="Edit Profile"
                  btnClassName="formModalBtn"
                  footerComponent={
                    <ModalFooter
                      authBtnName="Verify & Update"
                      parentName="editProfile"
                      name="update"
                      action="updateProfile"
                      completeness="partial"
                      verify={true}
                    />
                  }
                />
              ) : (
                <Button
                  disabled={!auth.validated}
                  sx={containedBtnStyle}
                  className="btn follow"
                  onClick={() =>
                    dispatch(
                      updateFollow({
                        type: profile.isFollowing ? "unfollow" : "follow",
                        _id: _id,
                        variant: 1,
                      })
                    )
                  }
                >
                  {profile.isFollowing ? "unfollow" : "follow"}
                </Button>
              )}
            </div>
          </div>
        </div>
        <div className="profileMenuBarContainer">
          <div className="profileMenuBarInnerContainer">
            {links.map((l) => {
              const selected = l.path === page ? " selected" : "";
              return (
                <Link
                  onClick={() => setPage(l.path)}
                  to={`/channel/${_id}/${l.path}`}
                  key={l.link}
                  className={"profileMenuBarLinkContainer" + selected}
                >
                  <p className="profileMenuBarLinkTxt">{l.link}</p>
                </Link>
              );
            })}
          </div>
        </div>
        <div className="profileVideosContainer">
          <div className="profileVideosInnerContainer">
            <VideosList mainRef={mainRef} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
