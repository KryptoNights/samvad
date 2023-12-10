import { useState, useEffect } from "react";
import { Contract, ethers } from "ethers";
import {
  sepolia,
  avalanche,
  samvad_abi,
  payCoin_abi,
  samvadcc_abi,
} from "./configs";
import { showFailureToast, showSuccessToast } from "./notifications";
import { GraphQLClient } from "graphql-request";

const postsSchema = `query ExampleQuery {
  postCreateds {
    Samvad_id
    account
    mediaUrl
    url
    text
    heading
    blockTimestamp
  }
}`

const postSchema = `query ExampleQuery($where: PostCreated_filter, $replyCreatedsWhere2: ReplyCreated_filter) {
  postCreateds(where: $where) {
    Samvad_id
    account
    mediaUrl
    url
    text
    heading
    blockTimestamp
  }
  replyCreateds(where: $replyCreatedsWhere2) {
    account
    Samvad_id
    text
    post
    parent
    top_level
    blockTimestamp
  }
}`
// {
//   "where": {
//     "Samvad_id": 1
//   },
//   "replyCreatedsWhere2": {
//     "post": 1
//   }
// }

const gqlClient = new GraphQLClient("https://api.thegraph.com/subgraphs/name/debjit-bw/samvad-testnet");

const useTransactions = () => {
  const sepoliaProvider = new ethers.providers.JsonRpcProvider("https://1rpc.io/sepolia");
  // const sepoliaProvider = new ethers.JsonRpcProvider("https://rpc.sepolia.org");
  // provider: ethers.Provider | ethers.Signer
  // const [handleSuccessSnackbar, handleWarningSnackbar, handleInfoSnackbar] =
  // useHandleSnackBar();
  const [txnLoading, setTxnLoading] = useState(false);

  const testProvider = async (
    url: String,
    data: any,
    signer: ethers.Signer
  ) => {
    console.log("inside the function 🎉");
    console.log("signer", signer);
    console.log("type", typeof signer);
    Promise.resolve();
  };

  const getBalance = async (address: string) => {
    console.log("address", address);
    const samvad = new Contract(sepolia.samvad, samvad_abi, sepoliaProvider);
    const balance = await samvad.balances(address);
    return balance;
  };

  const getReplyCount = async () => {
    const samvad = new Contract(sepolia.samvad, samvad_abi, sepoliaProvider);
    const replyCount = await samvad.getReplyCount();
    console.log(replyCount);
  };

  const getReply = async (id: number): Promise<any> => {
    //   console.log("getting reply number ", id);
    const samvad = new Contract(sepolia.samvad, samvad_abi, sepoliaProvider);
    const _reply = await samvad.getReply(id);
    // console.log(_reply);
    const reply = {
      address: _reply[0].toString(),
      id: _reply[1].toString(),
      text: _reply[2].toString(),
      // post: _reply[3].toString(),
      parent: _reply[3].toString(),
      // top_level: _reply[5].toString(),
      replies: [] as any[],
    };
    //   console.log(reply);
    for (let i = 0; i < _reply[4].length; i++) {
      console.log(_reply[4][i].toString());
      reply.replies.push(await getReply(parseInt(_reply[4][i])));
    }
    //   console.log(reply);
    return reply;
  };

  const getPost = async (id: any) => {
    // const samvad = new Contract(sepolia.samvad, samvad_abi, sepoliaProvider);
    // const _post = await samvad.getPost(id);
    // const post = {
    //   address: _post[0].toString(),
    //   id: _post[1].toString(),
    //   mediaUrl: _post[2].toString(),
    //   url: _post[3].toString(),
    //   text: _post[4].toString(),
    //   heading: _post[5].toString(),
    //   replies: [] as any[],
    // };
    // for (let i = 0; i < _post[5].length; i++) {
    //   post.replies.push(await getReply(parseInt(_post[5][i])));
    // }
    // return post;

    console.log("GQLLLLL getting post number ", id);

    const _postandreplies: any = await gqlClient.request(postSchema, {
      where: {
        Samvad_id: id
      },
      replyCreatedsWhere2: {
        post: id
      }
    });
    console.log(_postandreplies);

    const post = {
      ..._postandreplies.postCreateds[0],
      id: _postandreplies.postCreateds[0].Samvad_id,
      replies: [] as any[],
    };
    const non_top_level_replies = [] as any[];
    for (let i = 0; i < _postandreplies.replyCreateds.length; i++) {
      if (_postandreplies.replyCreateds[i].top_level) {
        post.replies.push({..._postandreplies.replyCreateds[i], id: _postandreplies.replyCreateds[i].Samvad_id});
      } else {
        non_top_level_replies.push({..._postandreplies.replyCreateds[i], id: _postandreplies.replyCreateds[i].Samvad_id});
      }
    }
    for (let i = 0; i < non_top_level_replies.length; i++) {
      for (let j = 0; j < post.replies.length; j++) {
        if (non_top_level_replies[i].parent == post.replies[j].id) {
          post.replies[j].replies.push(non_top_level_replies[i]);
        }
      }
    }
    console.log(post);
    return post;
  };

  const getAllPosts = async () => {
    const _posts: any = await gqlClient.request(postsSchema);
    // console.log(postCount);
    const posts = [] as any[];
    for (let i = 0; i < _posts.postCreateds.length; i++) {
      posts.push({
        ..._posts.postCreateds[i],
        id: _posts.postCreateds[i].Samvad_id,
        address: _posts.postCreateds[i].account,
      })
    }
    return posts;
  };

  const addPaycoins = async (_amount: number, signer: ethers.Signer) => {
    const amount = BigInt(_amount*1000000000) * BigInt("1000000000000000000") / BigInt(1000000000)
    setTxnLoading(true);
    const networkjs = await signer.provider?.getNetwork()!
    console.log("chain", networkjs)
    // err if chain id not in [1, 43113]
    if (networkjs.chainId != 43113 && networkjs.chainId != 11155111) {
      console.log("only sepolia and avalanche fuji supported rn");
      return false;
    }
    try {
      if (networkjs.chainId == 43113) {
        const samvad = new Contract(avalanche.samvadCC, samvadcc_abi, signer);
        const payCoin = new Contract(avalanche.payCoin, payCoin_abi, signer);
        const approve_tx = await payCoin.approve(avalanche.samvadCC, amount);
        await approve_tx.wait();
        console.log(approve_tx);
        const tx = await samvad.sendPaycoins(amount);
        await tx.wait();
        console.log(tx);
        return true;
      }
      const samvad = new Contract(sepolia.samvad, samvad_abi, signer);
      const payCoin = new Contract(sepolia.payCoin, payCoin_abi, signer);
      const approve_tx = await payCoin.approve(sepolia.samvad, amount);
      await approve_tx.wait();
      const tx = await samvad.add_paycoins(amount);
      await tx.wait();
      console.log(tx);
      setTxnLoading(false);
      showSuccessToast("Yeeepii Transaction Successfull 🚀");
      return true;
    } catch (error) {
      console.log(error);
      showFailureToast("Oppss Something went wrong 🙁");
      setTxnLoading(false);
      return false;
    }
  };

  const withdrawPaycoins = async (_amount: number, signer: ethers.Signer) => {
    const amount = BigInt(_amount*1000000000) * BigInt("1000000000000000000") / BigInt(1000000000);
    setTxnLoading(true);
    const networkjs = (await signer.provider?.getNetwork())!
    // err if chain id not in [1, 43113]
    if (networkjs.chainId != 43113 && networkjs.chainId != 11155111) {
      console.log("only sepolia and avalanche fuji supported rn");
      setTxnLoading(false);
      return false;
    }
    try {
      if (networkjs.chainId == 43113) {
        const samvad = new Contract(avalanche.samvadCC, samvadcc_abi, signer);
        const tx = await samvad.requestWithdrawl(amount);
        await tx.wait();
        console.log(tx);
        return true;
      }
      const samvad = new Contract(sepolia.samvad, samvad_abi, signer);
      const tx = await samvad.withdraw_paycoins(amount);
      await tx.wait();
      console.log(tx);
      showSuccessToast("Yeeepii Transaction Successfull 🚀");
      setTxnLoading(false);
      return true;
    } catch (error) {
      console.log(error);
      showFailureToast("Oppss Something went wrong 🙁");
      setTxnLoading(false);
      return false;
    }
  };

  const createPost = async (
    mediaUrl: string,
    url: string,
    text: string,
    heading: string,
    signer: ethers.Signer
  ) => {
    const networkjs = (await signer.provider?.getNetwork())!
    setTxnLoading(true);
    // err if chain id not in [1, 43113]
    if (networkjs.chainId != 43113 && networkjs.chainId != 11155111) {
      console.log("only sepolia and avalanche fuji supported rn");
      setTxnLoading(false);
      return false;
    }
    try {
      if (networkjs.chainId == 43113) {
        const samvad = new Contract(avalanche.samvadCC, samvadcc_abi, signer);
        const tx = await samvad.createPost(url, text, heading);
        await tx.wait();
        console.log(tx);
        setTxnLoading(false);
        return true;
      }
      console.log("network");
      console.log();
      const samvad = new Contract(sepolia.samvad, samvad_abi, signer);
      const tx = await samvad.createPost(mediaUrl, url, text, heading);
      await tx.wait();
      console.log(tx);
      setTxnLoading(false);
      showSuccessToast("Yeeepii Transaction Successfull 🚀");
      return true;
    } catch (error) {
      setTxnLoading(false);
      showFailureToast("Oppss Something went wrong 🙁");
      console.log(error);
      return false;
    }
  };

  const createReply = async (
    post: number,
    parent: number,
    text: string,
    top_level: boolean,
    amount: string,
    signer: ethers.Signer
  ) => {
    setTxnLoading(true);
    const networkjs = (await signer.provider?.getNetwork())!
    // err if chain id not in [1, 43113]
    console.log(networkjs.chainId);

    if (
      networkjs.chainId != 43113 &&
      networkjs.chainId != 111551111155111 &&
      networkjs.chainId != 11155111
    ) {
      console.log("only sepolia and avalanche fuji supported rn");
      setTxnLoading(false);
      return false;
    }
    // return
    try {
      if (networkjs.chainId == 43113) {
        console.log("fuji");
        const samvad = new Contract(avalanche.samvadCC, samvadcc_abi, signer);
        const tx = await samvad.createReply(
          post,
          parent,
          text,
          top_level,
          amount
        );
        await tx.wait();
        console.log(tx);
        setTxnLoading(false);
        return true;
      }
      console.log("sepolia");
      const samvad = new Contract(sepolia.samvad, samvad_abi, signer);
      const tx = await samvad.createReply(
        post,
        parent,
        text,
        top_level,
        amount
      );
      await tx.wait();
      console.log(tx);
      showSuccessToast("Yeeepii Transaction Successfull 🚀");
      setTxnLoading(false);
      return true;
    } catch (error) {
      setTxnLoading(false);
      showFailureToast("Oppss Something went wrong 🙁");
      console.log(error);
      return false;
    }
  };

  return {
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
  };
};

export default useTransactions;
