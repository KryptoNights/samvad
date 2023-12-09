import React, { useState, useEffect } from "react";
import Comments from "../Comments/Comments";
import { useRouter } from "next/router";
import styles from "./blog.module.css";
import { faker } from "@faker-js/faker";
import { Avatar } from "@mui/material";
import { Button } from "@cred/neopop-web/lib/components";
import { Typography } from "@cred/neopop-web/lib/components";
import { colorPalette, FontVariant } from "@cred/neopop-web/lib/primitives";


interface BlogProps {
  id: number;
  heading: string;
  replies: any;
  date: string;
  url: string;
  text: string;
  blogData: any;
  isSlug: boolean;
}
const githubUserIds = [
  23977234,
  31523966,
  3518527,
  27022981,
  68613247,
  89782151,
  72006591,
  46043928,
  46043428,
  68611224,
  89734451
];

const Blog: React.FC<BlogProps> = ({
  id,
  heading,
  url,
  date,
  text,
  replies,
  blogData,
  isSlug,
}) => {
  const router = useRouter();
  const [likes, setLikes] = useState(0);
  const [randomImage, setRandomImage] = useState<string>("");
  const [hovered, setHovered] = useState<boolean>(false);

  useEffect(() => {
    const randomUserId = githubUserIds[Math.floor(Math.random() * githubUserIds.length)];
    const avatarUrl = `https://avatars.githubusercontent.com/u/${randomUserId}`;
    setRandomImage(avatarUrl);
  }, []);

  const handleClick = (id: any) => {
    router.push(`/blog/${id}`);
  };
  const handleLike = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setLikes(likes + 1);
  };

  const random = faker.image.avatar();

  return (
    <div className={styles.container} onClick={() => handleClick(id)} onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        transition: "transform 0.2s ease-in-out",
        transform: hovered ? "scale(1.01)" : "scale(1)",
      }}>
      <div className={styles.subContainer}>
        <Avatar alt="Avatar" src={randomImage} sx={{ height: "400px", width: "auto", borderRadius: "30px" }} />

        <div className={styles.contentContainer}>
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

          {url && (
            <div className={styles.externalLink}>
              <a href={url} target="_blank" rel="noopener noreferrer">
                {url}🔗
              </a>
              {/* <span className="text-gray-700 text-sm self-end ml-2">{date}</span> */}
              
            </div>
          )}
          {/* <span className={styles.date}>{new Date(date).toLocaleDateString()}</span> */}
          <span className={styles.date}>09-12-2023</span>
          
      <div className="mb-2">
        <Typography
          {...FontVariant.HeadingRegular22}
          color={colorPalette.popWhite[500]}
          style={{ fontSize: "18px" }}
        >
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Commodi
          officiis magnam veniam optio voluptatibus animi quos enim similique
          odit deserunt! Lorem ipsum dolor sit, amet consectetur adipisicing
          elit. Commodi officiis magnam veniam optio voluptatibus animi quos
          enim similique odit deserunt! Lorem ipsum dolor sit, amet consectetur
          adipisicing elit. Commodi officiis magnam veniam optio voluptatibus
          animi quos enim similique odit deserunt!
        </Typography>
      </div>

      <div className="flex justify-between items-center w-full">
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