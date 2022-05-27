import React from "react";
import "../css/Header.css";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ProfilePicture from "../components/ProfilePicture";
import SearchIcon from "@mui/icons-material/Search";
import { useSelector } from "react-redux";
import FormModal from "../modals/FormModal";
import ModalFooter from "../modals/footers/ModalFooter";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import useViewportSizes from "use-viewport-sizes";

const initialState1 = [
  {
    name: "userName",
    label: "User Name",
    required: true,
    inputType: "text",
    minLength: 1,
    maxLength: 14,
    helperText: "Min 1 Character, Max 14 Characters",
    test: "validateLength",
  },
  {
    name: "email",
    label: "Email",
    required: true,
    inputType: "email",
    minLength: 5,
    maxLength: 350,
    helperText: "(ex. youremail@domain.com)",
    test: "validateEmail",
  },
  {
    name: "password1",
    label: "Password",
    required: true,
    inputType: "password",
    minLength: 6,
    maxLength: 24,
    helperText:
      "Min 6 Characters, Max 26 Characters. Must have at least 2 numbers. Must have at least 1 upper and lower-case character. No spaces.",
    test: "validatePassword",
  },
  {
    name: "password2",
    label: "Verify Password",
    required: true,
    inputType: "password",
    minLength: 6,
    maxLength: 24,
    helperText:
      "Min 6 Characters, Max 26 Characters. Must have at least 2 numbers. Must have at least 1 upper and lower-case character. No spaces.",
    test: "validateComparePasswords",
  },
];

const initialState2 = [
  {
    name: "video",
    label: "Add Video",
    required: true,
    inputType: "file",
    fileType: "video",
    helperText: "Max 1GB",
    test: "video",
    endIcon: VideoCallIcon,
    maxSize: 5000,
  },
  {
    name: "thumbnail",
    label: "Add Thumbnail",
    required: false,
    inputType: "file",
    fileType: "image",
    helperText: "Max 5MB",
    test: "image",
    endIcon: AddPhotoAlternateIcon,
    maxSize: 5000,
  },
  {
    name: "title",
    label: "Add Title",
    required: true,
    inputType: "text",
    test: "validateLength",
    helperText: "Min 1 Character, Max 48 Characters",
    minLength: 1,
    maxLength: 48,
  },
  {
    name: "description",
    label: "Add Description",
    required: false,
    inputType: "text",
    test: "validateLength",
    rows: 5,
    multiline: true,
    helperText: "Maximum 350 characters",
    minLength: 0,
    maxLength: 350,
  },
  {
    name: "category",
    listItems: [
      { label: "Gaming" },
      { label: "Vlog" },
      { label: "Educational" },
      { label: "Entertainment" },
      { label: "Documentation" },
      { label: "Music" },
    ],
    label: "Video Category",
    required: true,
    inputType: "autocomplete",
    helperText: "Choose a category. No custom categories",
  },
];

const headerIcon = {
  fill: "white",
  cursor: "pointer",
  margin: "0 15px",
};

const profilePictureStyles = {
  margin: "5px 20px",
  maxHeight: "40px",
  minHeight: "40px",
  maxWidth: "40px",
  minWidth: "40px",
  borderRadius: "50%",
  cursor: "pointer",
  backgroundColor: "black",
};

const Header = () => {
  const user_id = useSelector((state) => state.auth._id);
  const search = false;
  const [vpWidth] = useViewportSizes();

  return (
    <div className="headerContainer">
      <div className="headerLeftContainer">
        <MenuIcon className="menuIcon" style={headerIcon} />
      </div>
      <div className="headerSearchContainer">
        {search ||
          (vpWidth > 600 && (
            <input className="headerSearchInput" type="text" />
          ))}
        <SearchIcon className="searchIcon" style={headerIcon} />
      </div>
      <div className="headerRightContainer">
        {user_id && (
          <NotificationsIcon className="bellIcon" style={headerIcon} />
        )}
        {user_id && (
          <FormModal
            key="video"
            name="video"
            initialState={initialState2}
            btnIcon={VideoCallIcon}
            btnName="Upload Video"
            btnClassName={{
              cursor: "pointer",
              margin: "0 15px",
            }}
            btnVariant="icon"
            verify={false}
            progress={true}
            requireValidated={true}
            footerComponent={
              <ModalFooter
                name="video"
                btnName="upload"
                action="uploadVideo"
                verify={false}
                completeness="required"
                initialState={initialState2}
              />
            }
          />
        )}
        {user_id ? (
          <ProfilePicture
            styles={profilePictureStyles}
            menu={true}
            _id={user_id}
          />
        ) : (
          <>
            <FormModal
              key="login"
              name="login"
              initialState={[initialState1[1], initialState1[2]]}
              btnName="Login"
              btnClassName="authModalBtn left"
              btnVariant="contained"
              footerComponent={
                <ModalFooter
                  name="login"
                  action="login"
                  verify={false}
                  completeness="full"
                />
              }
            />
            <FormModal
              key="register"
              name="register"
              initialState={initialState1}
              btnName="Register"
              btnClassName="authModalBtn right"
              btnVariant="outlined"
              footerComponent={
                <ModalFooter
                  name="register"
                  action="register"
                  verify={false}
                  completeness="full"
                />
              }
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Header;
