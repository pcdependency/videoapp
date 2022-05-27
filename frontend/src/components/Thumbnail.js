import React from "react";
import "../css/Thumbnail.css";
import { Link } from "react-router-dom";
import moment from "moment";
import formatNumber from "../utils/formatNumber";

const Thumbnail = ({ video, i }) => {
  return (
    <Link to={`/watch/${video._id}`} className={`thumbnailContainer ${i}`}>
      <img
        src={`/api/main/stream/thumbnail/100/${video._id}`}
        alt=""
        className="thumbnailImg"
      />
      <p className="thumbnailTitleTxt">{video.title}</p>
      <p className="thumbnailViewsTxt">
        {formatNumber(video.views)} views - {moment(video.date).fromNow()}
      </p>
    </Link>
  );
};

export default Thumbnail;
