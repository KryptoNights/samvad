import { useEffect, useState } from "react";
import Blog from "../Blog/Blog";
import { createReply, getAllPosts } from "@/utils/transition";
import { ethers } from "ethers";
import { CircularProgress } from "@mui/material";
import useConnection from "@/utils/connection";
import { useDispatch, useSelector } from "react-redux";
import { setPostData } from "@/store/slice/walletInfo";
import { AppState } from "@/store";

export interface AccountType {
  address?: string;
  balance?: string;
  chainId?: string;
  network?: string;
}

const Layout = ({props}:{props:any}) => {
  const dispatch = useDispatch();
  const [posts]: any = useSelector((state: AppState) => [
    state.walletInfo.posts,
  ]);

  const [blogData, setblogData]: any = useState([]);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signer } = useConnection();

  // Define the useEffect hook
  useEffect(() => {
    // Create a function to fetch and set data
    const fetchData = async () => {
      try {
        setLoading(true);
        const posts = await getAllPosts();
        console.log(posts);
        setblogData(posts);
        dispatch(setPostData({ post: posts }));
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error("Error fetching data:", error);
      }
    };
    if (posts.length) {
      setblogData(posts);
    } else {
      fetchData();
    }
  }, [blogData]);
  return (
    <div style={{ width: "100%", paddingLeft: "20px", paddingRight: "20px" }}>
      {loading ? (
        <>
          <div style={{display:'flex',justifyContent:'center',marginTop:'200px'}}>
            <CircularProgress size={40} sx={{ color: "#3B82F6" }} />
          </div>
        </>
      ) : (
        <>
          {blogData.map((blog: any) => (
            <Blog
              key={blog.id}
              show={show}
              setShow={setShow}
              blogData={blogData}
              isSlug={false}
              {...blog}
              props={props}
            />
          ))}
        </>
      )}
    </div>
  );
};

export default Layout;
