import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Blog from "../../../components/Blog/Blog";
import { getPost } from "@/utils/transition";
import Comments from "../../../components/Comments/Comments";
import GlobalLayout from "../../../components/Global/Global";
import { CircularProgress } from "@mui/material";

const Slug = (props: any) => {
  const router = useRouter();
  const { slug }: any = router.query;

  const [post, setPost]: any = React.useState([]);
  const [replies, setReplies] = useState([]);
  const [address, setAddress] = React.useState("");
  const [loading, setLoading] = useState(false);
  console.log("resplies", replies);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const post = await getPost(parseInt(slug));
        setPost(post);
        console.log("inside slug", post.replies);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    if (post.length === 0) {
      fetchData();
    } else {
      setAddress(post.address);
    }
  }, [slug, post]);

  console.log("post", post);

  return (
    <>
      <GlobalLayout props={props}>
        <div
          style={{ width: "100%", paddingLeft: "20px", paddingRight: "20px" }}
        >
          {loading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "200px",
              }}
            >
              <div className="loader">
                <div className="inner one"></div>
                <div className="inner two"></div>
                <div className="inner three"></div>
              </div>
            </div>
          ) : (
            <>
              <Blog
                key={post.id}
                replies={replies}
                setReplies={setReplies}
                address={address}
                mediaUrl={""}
                setblogData={setPost}
                isSlug={true}
                {...post}
                props={props}
              />
              <Comments postId={post.id} replies={post.replies} />
            </>
          )}
        </div>
      </GlobalLayout>
    </>
  );
};

export default Slug;
