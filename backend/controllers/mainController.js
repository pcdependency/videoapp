var jwt = require("jsonwebtoken"),
  bcrypt = require("bcryptjs"),
  User = require("../models/User"),
  Video = require("../models/Video"),
  { ObjectId } = require("mongodb"),
  mongoose = require("mongoose"),
  conn = mongoose.connection,
  fs = require("fs"),
  crypto = require("crypto"),
  ffmpeg = require("fluent-ffmpeg"),
  ffprobe = require("ffprobe"),
  ffprobeStatic = require("ffprobe-static"),
  ffmpegStatic = require("ffmpeg-static"),
  chalk = require("chalk"),
  Grid = require("gridfs-stream"),
  gfs = Grid(conn, mongoose.mongo),
  ObjectId = require("mongodb").ObjectId;

const uploadFile = async (req, res) => {
  try {
    const collections = ["pp", "pb", "thumbnail", "video"];
    const coll = req.params.collection;
    const sizes = [
      {
        width: 1920,
        height: 1080,
      },
      {
        width: 1280,
        height: 720,
      },
      {
        width: 854,
        height: 480,
      },
      {
        width: 640,
        height: 360,
      },
      {
        width: 426,
        height: 240,
      },
    ];
    const originalFilePath = req.file.path;
    const info = await ffprobe(originalFilePath, { path: ffprobeStatic.path });
    const { width, height } = info.streams[0];
    const sz = sizes.filter((s) => height >= s.height || width >= s.width);
    const fn = crypto.randomBytes(12).toString("hex");
    const vid_id = new ObjectId();

    const user = await User.findOne({ _id: ObjectId(req.user._id) });

    if (!user.validated)
      return res.status(400).json({ message: "Email must be validated" });

    if (collections.indexOf(coll) === -1)
      return res.status(400).json({ message: "Invalid data" });

    const command = ffmpeg(originalFilePath)
      .setFfmpegPath(ffmpegStatic)
      .setFfprobePath(ffprobeStatic.path);

    //removes files from server
    const cleanup = async (type, filename) => {
      fs.unlinkSync(originalFilePath);
      if (type === "video") {
        await sz.reduce(async (a, s) => {
          await a;
          fs.unlinkSync(`./transcoded/${filename}_${s.height}.mp4`);
        }, Promise.resolve());
        fs.unlinkSync(`./transcoded/${filename}.jpg`);
      } else {
        fs.unlinkSync(`./transcoded/${filename}.jpg`);
      }
    };

    //creates an original thumbnail for a video
    const createThumbnail = async () => {
      await new Promise((resolve, reject) => {
        command
          .screenshots({
            timestamps: ["80%"],
            filename: `${fn}.jpg`,
            folder: `./transcoded`,
            size: "720x?",
          })
          .on("end", () => {
            resolve();
          })
          .on("error", (err) => {
            reject(err);
          });
      });
    };

    //creates and transcodes image
    const transImage = async (filename) => {
      await new Promise(async (resolve, reject) => {
        ffmpeg()
          .input(originalFilePath)
          .setFfmpegPath(ffmpegStatic)
          .setFfprobePath(ffprobeStatic.path)
          .size(`?x720`)
          .save(`./transcoded/${filename}.jpg`)
          .on("start", () => {})
          .on("end", () => {
            resolve();
          })
          .on("error", (err) => {
            reject(err);
          });
      });
    };

    //uploads thumbnail, pp, pb
    const uploadImage = async (collection, filename, metadata) => {
      await new Promise((resolve, reject) => {
        const path = `./transcoded/${filename}.jpg`;
        var gridfsbucket = new mongoose.mongo.GridFSBucket(conn, {
          bucketName: `${collection}s`,
        });

        const writeStream = gridfsbucket
          .openUploadStream(filename, {
            metadata: metadata,
          })
          .on("finish", () => {
            resolve();
          })
          .on("error", (err) => {
            reject(err);
          });

        fs.createReadStream(path).pipe(writeStream);
      });
    };

    //removes pp, pb, custom thumbnail for replacement
    const removeImage = async (query) => {
      gfs.collection(`${coll}s`);
      const file = await gfs.files.findOne(query);
      if (file) {
        const gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
          bucketName: `${coll}s`,
        });
        await gridfsBucket.delete(ObjectId(file._id));
      }
    };

    //synchronously proportionally scales the video into up to 5 dimensions
    const scaleVideos = async () => {
      await sz.reduce(async (a, s) => {
        await a;
        await new Promise((resolve, reject) => {
          command
            .clone()
            .videoCodec("libx264")
            .audioCodec("libmp3lame")
            .size(`?x${s.height}`)
            .outputFormat("mp4")
            .save(`./transcoded/${fn}_${s.height}.mp4`)
            .on("end", () => {
              resolve();
            })
            .on("error", (err) => {
              reject(err);
            });
        });
      }, Promise.resolve());
    };

    //stream uploads the videos synchronously to the DB
    const uploadVideos = async () => {
      await new Promise(async (resolve, reject) => {
        var gridfsbucket = new mongoose.mongo.GridFSBucket(conn, {
          bucketName: "videos",
        });

        await sz.reduce(async (a, s) => {
          const path = `./transcoded/${fn}_${s.height}.mp4`;
          await a;
          await new Promise((resolve, reject) => {
            const writeStream = gridfsbucket
              .openUploadStream(fn, {
                metadata: {
                  dimensions: s,
                },
              })
              .on("finish", () => {
                resolve();
              })
              .on("error", (err) => {
                reject(err);
              });

            fs.createReadStream(path).pipe(writeStream);
          });
        }, Promise.resolve());

        resolve();
      });
    };

    //creates/uploads video metadata
    const uploadVideo = async () => {
      const { title, category, description } = req.body;

      const categories = [
        "Gaming",
        "Vlog",
        "Educational",
        "Entertainment",
        "Documentation",
        "Music",
      ];

      if (categories.indexOf(category) === -1)
        res.status(400).json({ message: "Invalid data" });

      const newVideo = new Video({
        _id: vid_id,
        title: title,
        category: category,
        description: description,
        likes: 0,
        views: 0,
        date: new Date(),
        sizes: sz.length,
        filename: fn,
        author: req.user._id,
      });

      await newVideo.save();
    };

    if (coll === "pp" || coll === "pb") {
      console.log(chalk.cyan("---Starting---"));
      console.log(chalk.yellow("Transcoding image"));
      await transImage(fn);
      console.log(chalk.magenta("Removing old image from db"));
      await removeImage({ "metadata.author": ObjectId(req.user._id) });
      console.log(chalk.blue("Uploading new image to db"));
      await uploadImage(coll, fn, { author: req.user._id });
      console.log(chalk.yellow("Cleaning up"));
      await cleanup("pp", fn);
      console.log(chalk.green("---Finished---"));
      res.status(200).json();
    }
    if (coll === "thumbnail") {
      console.log(chalk.cyan("---Starting---"));
      const file = await Video.findOne({ _id: ObjectId(req.body._id) });
      console.log(chalk.yellow("Transcoding image"));
      await transImage(file.filename);
      console.log(chalk.magenta("Removing old image from db"));
      await removeImage({ "metadata.type": "custom", filename: file.filename });
      console.log(chalk.blue("Uploading new image to db"));
      await uploadImage(coll, file.filename, { type: "custom" });
      console.log(chalk.yellow("Cleaning up"));
      await cleanup("thumbnail", file.filename);
      console.log(chalk.green("---Finished---"));
      res.status(200).json();
    }
    if (coll === "video") {
      console.log(chalk.cyan("---Starting---"));
      console.log(chalk.yellow("Scaling videos"));
      await scaleVideos();
      console.log(chalk.blue("Uploading video metadata to db"));
      await uploadVideo();
      console.log(chalk.blue("Uploading videos to db"));
      await uploadVideos();
      console.log(chalk.yellow("Generating original video thumbnail"));
      await createThumbnail();
      console.log(chalk.blue("Uploading original video thumbnail"));
      await uploadImage("thumbnail", fn, { type: "original" });
      console.log(chalk.yellow("Cleaning up"));
      await cleanup("video", fn);
      console.log(chalk.green("---Finished---"));
      res.status(200).json({ _id: vid_id });
    }
  } catch (error) {
    return res.status(400).json({ message: error });
  }
};

const streamFile = async (req, res) => {
  const { collection, resolution, _id } = req.params;
  const resolutions = [240, 360, 480, 720, 1080];
  const collections = ["videos", "pps", "pbs", "thumbnails"];

  try {
    if (
      !ObjectId.isValid(_id) ||
      collections.indexOf(`${collection}s`) === -1 ||
      isNaN(resolution)
    )
      return res.status(400).json({ message: "Invalid data" });

    const gridfsBucket = new mongoose.mongo.GridFSBucket(conn, {
      bucketName: `${collection}s`,
    });

    if (collection === "pp" || collection === "pb") {
      gfs.collection(`${collection}s`);

      const file = await gfs.files.findOne({
        "metadata.author": ObjectId(_id),
      });
      if (!file) return res.status(404).json({ message: "Image not found" });

      const downloadStream = gridfsBucket.openDownloadStream(
        ObjectId(file._id)
      );

      downloadStream.pipe(res);
    }

    if (collection === "thumbnail") {
      const video = await Video.findOne({ _id: ObjectId(_id) });
      gfs.collection("thumbnails");

      if (!video) return res.status(404).json({ message: "Video not found" });

      let thumb_id = "";

      const custom = await gfs.files.findOne({
        filename: video.filename,
        "metadata.type": "custom",
      });

      if (custom != null) thumb_id = custom._id;

      if (!thumb_id) {
        const original = await gfs.files.findOne({
          filename: video.filename,
          "metadata.type": "original",
        });

        if (!original) return res.status(400).json({ message: "No thumbnail" });

        thumb_id = original._id;
      }

      const downloadStream = gridfsBucket.openDownloadStream(
        ObjectId(thumb_id)
      );
      downloadStream.pipe(res);
    }

    if (collection === "video") {
      const gridfsBucket = new mongoose.mongo.GridFSBucket(conn, {
        bucketName: `${collection}s`,
      });

      gfs.collection("videos");

      const videoMetadata = await Video.findOne({ _id });

      if (
        !videoMetadata ||
        resolutions
          .filter((r, i) => i <= videoMetadata.sizes - 1)
          .indexOf(parseInt(resolution)) === -1
      )
        return res.status(404).json({ message: "Video not found" });

      const video = await gfs.files.findOne({
        filename: videoMetadata.filename,
        "metadata.dimensions.height": parseInt(resolution),
      });

      if (!video) return res.status(404).json({ message: "Video not found" });

      const range = req.headers.range;

      if (!range) return res.status(400).send("Requires Range header");

      const videoSize = video.length;
      const start = Number(range.replace(/\D/g, ""));
      const end = videoSize - 1;
      const contentLength = end - start + 1;
      const headers = {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "video/mp4",
      };
      res.writeHead(206, headers);

      const downloadStream = gridfsBucket.openDownloadStream(
        ObjectId(video._id),
        {
          start,
          end: videoSize,
        }
      );

      downloadStream.pipe(res);
    }
  } catch (error) {
    return res.status(400).json({ message: error });
  }
};

const getVideo = async (req, res) => {
  try {
    if (
      !ObjectId.isValid(req.params._id) ||
      !ObjectId.isValid(req.params.user_id)
    )
      res.status(400).json({ message: "Invalid Data" });

    const video = await Video.aggregate([
      { $match: { _id: ObjectId(req.params._id) } },
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                following: {
                  $size: "$following",
                },
                followers: {
                  $size: "$followers",
                },
                verified: 1,
                userName: 1,
                _id: 1,
                isFollowing: {
                  $in: [ObjectId(req.params.user_id), "$followers"],
                },
              },
            },
          ],
          as: "author",
        },
      },
    ]);

    const isLiked = await User.aggregate([
      {
        $match: {
          _id: ObjectId(req.params.user_id),
          $expr: {
            $in: [ObjectId(req.params._id), "$likedVideos"],
          },
        },
      },
    ]);

    if (video)
      return res
        .status(200)
        .json({ video: video[0], isLiked: Boolean(isLiked[0]) });

    return res.status(400).json({ message: "Video not found" });
  } catch (error) {
    return res.status(400).json({ message: error });
  }
};

const getProfile = async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params._id))
      return res.status(400).json({ message: "Invalid data" });

    const profile = await User.aggregate([
      { $match: { _id: ObjectId(req.params._id) } },
      {
        $project: {
          following: {
            $size: "$following",
          },
          followers: {
            $size: "$followers",
          },
          date: 1,
          verified: 1,
          userName: 1,
          _id: 1,
        },
      },
    ]);

    if (profile) return res.status(200).json(profile);
    return res.status(400).json({ message: "Profile not found" });
  } catch (error) {
    return res.status(400).json({ message: error });
  }
};

const getVideos = async (req, res) => {
  try {
    const { _id, page, requested, requesting } = req.params;
    const pages = ["profile"];

    if (
      !ObjectId.isValid(_id) ||
      isNaN(requested) ||
      isNaN(requesting) ||
      pages.indexOf(page) === -1
    )
      return res.status(400).json({ message: "Invalid data" });

    let videos = "";

    if (page === "profile") {
      const length = await Video.find({ author: ObjectId(_id) }).count();

      if (parseInt(requested) >= length)
        return res.status(404).json({ message: "No more videos" });

      videos = await Video.aggregate([
        {
          $skip: parseInt(requested),
        },
        {
          $limit: parseInt(requesting),
        },
        {
          $match: {
            author: ObjectId(_id),
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "author",
            foreignField: "_id",
            pipeline: [
              {
                $project: {
                  _id: 1,
                  userName: 1,
                  verified: 1,
                },
              },
            ],
            as: "author",
          },
        },
      ]).hint({
        $natural: -1,
      });
    }

    if (videos.length === 0)
      return res.status(400).json({ message: "No videos" });

    return res.status(200).json(videos);
  } catch (error) {
    return res.status(400).json({ message: error });
  }
};

module.exports = {
  uploadFile,
  streamFile,
  getVideo,
  getProfile,
  getVideos,
};
