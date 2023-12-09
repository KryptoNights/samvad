import React, { useState, useEffect } from "react";
import Comments from "../Comments/Comments";
import { useRouter } from "next/router";
import styles from "./blog.module.css";
import { faker } from "@faker-js/faker";
import { Avatar } from "@mui/material";
import { Button } from "@cred/neopop-web/lib/components";
import { Typography } from "@cred/neopop-web/lib/components";
import { colorPalette, FontVariant } from "@cred/neopop-web/lib/primitives";

import { createEncoder, createDecoder, LightNode } from "@waku/sdk";
import protobuf from "protobufjs";
const Liveliness = new protobuf.Type("Liveliness").add(
  new protobuf.Field("id", 1, "uint64")
);

interface BlogProps {
  id: number;
  heading: string;
  replies: any;
  date: string;
  url: string;
  text: string;
  blogData: any;
  isSlug: boolean;
  props: any;
  address:any
}
const githubUserIds = [
  23977234, 31523966, 3518527, 27022981, 68613247, 89782151, 72006591, 46043928,
  46043428, 68611224, 89734451,
];

// Choose a content topic
const contentTopic = `/samvad/0/posts/proto`;
// Create a message encoder and decoder
const encoder = createEncoder({
  contentTopic: contentTopic, // message content topic
  ephemeral: false, // allows messages be stored on the network
});
const decoder = createDecoder(contentTopic);

const Blog: React.FC<BlogProps> = ({
  id,
  heading,
  url,
  date,
  text,
  replies,
  blogData,
  isSlug,
  address,
  props,
}) => {

  console.log('assa',)
  const router = useRouter();
  const [likes, setLikes] = useState(0);
  const [randomImage, setRandomImage] = useState<string>("");
  const [hovered, setHovered] = useState<boolean>(false);

  useEffect(() => {
    const randomUserId =
      githubUserIds[Math.floor(Math.random() * githubUserIds.length)];
    const avatarUrl = `https://avatars.githubusercontent.com/u/${randomUserId}`;
    setRandomImage(avatarUrl);
  }, []);

  const handleClick = async (id: any) => {
    try {
      console.log("props inside blog")
      console.log(props)
      const node: LightNode = props.node;
      console.log("node got")
      const liveliness = Liveliness.create({ id: id });
      console.log("liveliness created")
      const serialisedMessage = Liveliness.encode(liveliness).finish();
      console.log("liveliness encoded")
      // Send the message using Light Push
      await node.lightPush.send(encoder, {
        payload: serialisedMessage,
      });
      console.log(">>>> message sent")
    } catch (error) {
      console.log(error);
    }
    router.push(`/blog/${id}`);
  };
  const handleLike = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setLikes(likes + 1);
  };

  const random = faker.image.avatar();

  return (
    <div
      className={styles.container}
      onClick={() => handleClick(id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        transition: "transform 0.2s ease-in-out",
        transform: hovered ? "scale(1.01)" : "scale(1)",
      }}
    >
      <div className={styles.subContainer}>
        <Avatar
          alt="Avatar"
          src={randomImage}
          sx={{ height: "150px", width: "auto", borderRadius: "10px" }}
        />

        <div className={styles.contentContainer}>
          <div style={{display:'flex',flexDirection:'row',gap:'8px',alignItems:'center'}}>
            {isSlug && (
              <a
                target="_blank"
                href={url}
                className="text-gray-800 hover:underline"
              >
                <Typography
                  {...FontVariant.HeadingBold20}
                  color={colorPalette.popWhite[500]}
                  style={{ fontSize: "22px" }}
                >
                  {heading}
                </Typography>
              </a>
            )}
            {!isSlug && (
              <a target="_blank" className="text-gray-800 hover:underline">
                <Typography
                  {...FontVariant.HeadingBold20}
                  color={colorPalette.popWhite[500]}
                  style={{ fontSize: "22px" }}
                >
                  {heading}
                </Typography>
              </a>
            )}

            <Typography
              {...FontVariant.HeadingRegular20}
              color={colorPalette.popWhite[500]}
              style={{ fontSize: "12px" }}
            >
            {`(By : ${address.slice(
              0,
              4
            )}...${address.slice(-4)})`}
            </Typography>
          </div>

          {url && (
            <div className={styles.externalLink}>
              <a href={url} target="_blank" rel="noopener noreferrer">
                {url}🔗
              </a>
              {/* <span className="text-gray-700 text-sm self-end ml-2">{date}</span> */}
            </div>
          )}
          {/* <span className={styles.date}>{new Date(date).toLocaleDateString()}</span> */}

          <div className="mb-8">
            <Typography
              {...FontVariant.HeadingMedium20}
              color={colorPalette.popWhite[500]}
              style={{ fontSize: "16px" }}
            >
              Lorem ipsum dolor sit, amet consectetur adipisicing elit. Commodi
              officiis magnam veniam optio voluptatibus animi quos enim
              similique odit deserunt! Lorem ipsum dolor sit, amet consectetur
              adipisicing elit. Commodi officiis magnam veniam optio
              voluptatibus animi quos enim similique odit deserunt! Lorem ipsum
              dolor sit, amet consectetur adipisicing elit. Commodi officiis
              magnam veniam optio voluptatibus animi quos enim similique odit
              deserunt!
            </Typography>
          </div>

          <div className="flex justify-between items-center w-full ml-4">
            {!isSlug && (
              <Button
                colorMode="light"
                kind="elevated"
                size="small"
                style={{ marginRight: "12px" }}
              >
                {"Show Replies"}
              </Button>
            )}

            <Button
              colorMode="light"
              kind="link"
              size="small"
              style={{ marginRight: "12px" }}
              onClick={(event: any) => handleLike(event)}
            >
              👍 {likes}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;
