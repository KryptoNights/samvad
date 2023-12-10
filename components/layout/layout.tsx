import { useEffect, useState } from "react";
import Blog from "../Blog/Blog";
import { ethers } from "ethers";
import { CircularProgress } from "@mui/material";
import useConnection from "@/utils/connection";
import { useDispatch, useSelector } from "react-redux";
import { setPostData } from "@/store/slice/walletInfo";
import { AppState } from "@/store";

import {
  LightNode,
  Protocols,
  createDecoder,
  createLightNode,
  waitForRemotePeer,
} from "@waku/sdk";

// Choose a content topic
const contentTopic = `/samvad/0/posts/proto`;

// Create a message decoder
const decoder = createDecoder(contentTopic);

export interface AccountType {
  address?: string;
  balance?: string;
  chainId?: string;
  network?: string;
}

interface LayoutProps {
  props: any;
}

const Layout: React.FC<LayoutProps> = ({ props }) => {
  const node = props.node;
  const dispatch = useDispatch();
  const [posts]: any = useSelector((state: AppState) => [
    state.walletInfo.posts,
  ]);

  const {
    txnLoading,
    testProvider,
    getBalance,
    getReplyCount,
    getReply,
    getPost,
    getAllPosts,
    addPaycoins,
    withdrawPaycoins,
    createPost,
    createReply,
  } = props.connectionTransaction;

  const [blogData, setblogData]: any = useState([]);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signer } = useConnection();

  const getLiveliness = async (node: LightNode) => {
    console.log(node);
    // const node: LightNode = props.node!;
    // const node = await createLightNode({ defaultBootstrap: true });
    // await node.start();
    // await waitForRemotePeer(node, [Protocols.Store, Protocols.LightPush, Protocols.Filter]);
    // while (node === null) {
    //   console.log("waiting a while")
    //   await new Promise( resolve => setTimeout(resolve, 1000) );
    // }
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - 1000 * 60 * 60 * 24); // 24 hours ago
    const messages: any = [];
    const callback = (wakuMessage: any) => {
      messages.push(wakuMessage);
      // Return "true" to stop retrieving pages
      // Here, it retrieves only the first page
      if (messages.length >= 100) return true;
    };
    await node.store.queryWithOrderedCallback([decoder], callback, {
      timeFilter: { startTime, endTime },
    });
  };

  // Define the useEffect hook
  useEffect(() => {
    // Create a function to fetch and set data
    const fetchData = async () => {
      try {
        console.log("hey", node);
        setLoading(true);
        const posts = await getAllPosts();
        console.log(posts);
        setblogData(posts);
        dispatch(setPostData({ post: posts }));
        const liveliness = await getLiveliness(node);
        console.log("liveliness");
        console.log(liveliness);
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

  console.log("blog", blogData);
  return (
    <div style={{ width: "100%", paddingLeft: "20px", paddingRight: "20px" }}>
      {loading ? (
        <>
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
        </>
      ) : (
        <>
          {console.log("blogData", blogData)}
          {blogData.map((blog: any) => (
            <Blog
              key={blog.id}
              show={show}
              setShow={setShow}
              blogData={blogData}
              address={blog.address}
              isSlug={false}
              mediaUrl={blog.mediaUrl}
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
