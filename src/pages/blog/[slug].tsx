import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Blog from "../../../components/Blog/Blog";
import { getPost, getReply } from "@/utils/transition";
import Comments from "../../../components/Comments/Comments";

const Slug = () => {
  const router = useRouter();
  const { slug }: any = router.query;

  // const { blogData, setblogData, getDataByParentId } = useBlogData(); // Get your blog data
  const [post, setPost]: any = React.useState([]);
  const [replies, setReplies] = useState([]);
  console.log("resplies", replies);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const post = await getPost(parseInt(slug));
        setPost(post);
        console.log("inside slug", post.replies);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (post.length === 0) {
      fetchData();
    }
  }, [slug]);

  // React.useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       console.log("hey1", slug);
  //       const data2: any = await getDataByParentId(parseInt(slug));
  //       setPost(data2);
  //     } catch (error) {
  //       // Handle errors, e.g., log them or set a default value for post
  //       console.error("Error fetching data:", error);
  //       setPost({}); // Set a default value for post in case of error
  //     }
  //   };

  //   if (slug) {
  //     fetchData();
  //   }
  // }, [slug]);

  return (
    <>
      <Blog
        key={post.id}
        replies={replies}
        setReplies={setReplies}
        setblogData={setPost}
        isSlug={true}
        {...post}
      />
      <Comments replies={post.replies}/>
    </>
  );
};

export default Slug;
