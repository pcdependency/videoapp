import React, { useCallback, useEffect, useRef } from "react";
import "../css/VideosList.css";
import InfiniteScroll from "react-infinite-scroll-component";
import Thumbnail from "../components/Thumbnail";
import { useDispatch, useSelector } from "react-redux";
import { getVideos } from "../redux/client/clientActions";
import { useParams } from "react-router-dom";
import { RESET_FLV } from "../redux/client/clientTypes";

const VideosList = () => {
  const ref = useRef();
  const dispatch = useDispatch();
  const { _id } = useParams();
  const videos = useSelector((state) => state.client.videos);

  const GetVideos = useCallback(
    (type) => {
      const size = Math.floor(
        ((window.innerHeight - 200) / 200) *
          ((window.innerWidth >= 1280 ? 1280 : window.innerWidth) / 200)
      );
      const requested = videos.length;
      const requesting = requested === 0 ? size : Math.ceil(size / 2);
      dispatch(
        getVideos({
          _id,
          requested: type === "set" ? 0 : requested,
          requesting,
          type,
        })
      );
    },
    [dispatch, _id, videos.length]
  );

  useEffect(() => {
    GetVideos("set");
  }, [GetVideos]);

  useEffect(() => {
    dispatch({
      type: RESET_FLV,
      payload: "videos",
    });
  }, [_id, dispatch]);

  return (
    <div className="videosListContainer" ref={ref}>
      <InfiniteScroll
        dataLength={videos.length}
        className="videosListInnerContainer"
        next={() => GetVideos("push")}
        hasMore={true}
        scrollableTarget="mainContainer"
      >
        {videos?.map((v, i) => {
          return <Thumbnail video={v} i={i} key={v._id} />;
        })}
      </InfiniteScroll>
    </div>
  );
};

export default VideosList;
