import { Contract, ethers } from "ethers";
import {
  sepolia,
  avalanche,
  samvad_abi,
  payCoin_abi,
  samvadcc_abi,
} from "./configs";

export async function testProvider(
  url: String,
  data: any,
  signer: ethers.Signer
) {
  console.log("inside the function 🎉");
  console.log("signer", signer);
  console.log("type", typeof signer);
  Promise.resolve();
}

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

const sepoliaProvider = new ethers.providers.JsonRpcProvider("https://1rpc.io/sepolia");
// const sepoliaProvider = new ethers.JsonRpcProvider("https://rpc.sepolia.org");
// provider: ethers.Provider | ethers.Signer

export async function getBalance(address: string) {
  console.log("address", address);
  const samvad = new Contract(sepolia.samvad, samvad_abi, sepoliaProvider);
  const balance = await samvad.balances(address);
  console.log(balance);
  return balance;
}

export async function getPostCount() {
  const samvad = new Contract(sepolia.samvad, samvad_abi, sepoliaProvider);
  const postCount = await samvad.getPostCount();
  console.log(postCount);
}

export async function getReplyCount() {
  const samvad = new Contract(sepolia.samvad, samvad_abi, sepoliaProvider);
  const replyCount = await samvad.getReplyCount();
  console.log(replyCount);
}

export async function getReply(id: number): Promise<any> {
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
}

function createReplyGraph(id_to_reply: Map<string, any>, parent_to_child: Map<string, string[]>, id: string): Array<any> {
  const reply = id_to_reply.get(id);
  const replies = [] as any[];
  if (!parent_to_child.has(id)) {
    return replies;
  }
  for (let i = 0; i < parent_to_child.get(id)!.length; i++) {
    replies.push({...id_to_reply.get(parent_to_child.get(id)![i]), replies: createReplyGraph(id_to_reply, parent_to_child, parent_to_child.get(id)![i])});
  }
  return replies;
}

export async function getPost(id: any) {
  //   console.log("id", id);
  //   console.log("NETWORK");
  //   console.log((await sepoliaProvider.getNetwork()).toJSON());
  const samvad = new Contract(sepolia.samvad, samvad_abi, sepoliaProvider);
  const _post = await samvad.getPost(id);
  // console.log(_post);
  // console.log(_post[0].toString());
  // for (let i = 0; i < _post.length; i++) {
  //     console.log(_post[i]);
  // }
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

  let post = {
    ..._postandreplies.postCreateds[0],
    id: _postandreplies.postCreateds[0].Samvad_id,
    address: _postandreplies.postCreateds[0].account,
    replies: [] as any[],
  };
  console.log("> post");
  console.log(post);
  let non_top_level_replies = [] as any[];
  for (let i = 0; i < _postandreplies.replyCreateds.length; i++) {
    if (_postandreplies.replyCreateds[i].top_level) {
      post.replies.push({..._postandreplies.replyCreateds[i], id: _postandreplies.replyCreateds[i].Samvad_id, address: _postandreplies.replyCreateds[i].account});
    } else {
      non_top_level_replies.push({..._postandreplies.replyCreateds[i], id: _postandreplies.replyCreateds[i].Samvad_id, address: _postandreplies.replyCreateds[i].account, replies: [] as any[]});
    }
  }
  console.log("> non top level replies");
  console.log(non_top_level_replies);
  
  // make a parent to child index
  const parent_to_child = new Map<string, string[]>();
  const id_to_reply = new Map<string, any>();
  for (let i = 0; i < non_top_level_replies.length; i++) {
    id_to_reply.set(non_top_level_replies[i].id, non_top_level_replies[i]);
    if (parent_to_child.has(non_top_level_replies[i].parent)) {
      parent_to_child.set(non_top_level_replies[i].parent, [...parent_to_child.get(non_top_level_replies[i].parent)!, non_top_level_replies[i].id]);
    } else {
      parent_to_child.set(non_top_level_replies[i].parent, [non_top_level_replies[i].id]);
    }
  }
  console.log("> parent to child");
  console.log(parent_to_child);
  console.log("> id to reply");
  console.log(id_to_reply);
  // create the graph
  for (let i = 0; i < post.replies.length; i++) {
    const r = createReplyGraph(id_to_reply, parent_to_child, post.replies[i].id)
    console.log(">> R", r)
    post.replies[i] = {...post.replies[i], replies: r};
  }
  console.log(">> post");
  console.log(post);
  return post;
}

export async function getAllPosts() {
  console.log("GQLLLLL getting all posts");
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
}

export async function addPaycoins(amount: number, signer: ethers.Signer) {
  const networkjs = (await signer.provider?.getNetwork())!
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
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export async function withdrawPaycoins(amount: number, signer: ethers.Signer) {
  const networkjs = (await signer.provider?.getNetwork())!
  // err if chain id not in [1, 43113]
  if (networkjs.chainId != 43113 && networkjs.chainId != 11155111) {
    console.log("only sepolia and avalanche fuji supported rn");
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
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export async function createPost(
  url: string,
  text: string,
  heading: string,
  signer: ethers.Signer
) {
  const networkjs = (await signer.provider?.getNetwork())!
  console.log(networkjs);
  // err if chain id not in [1, 43113]
  if (networkjs.chainId != 43113 && networkjs.chainId != 11155111) {
    console.log("only sepolia and avalanche fuji supported rn");
    return false;
  }
  try {
    if (networkjs.chainId == 43113) {
      const samvad = new Contract(avalanche.samvadCC, samvadcc_abi, signer);
      const tx = await samvad.createPost(url, text, heading);
      await tx.wait();
      console.log(tx);
      return true;
    }
    console.log("network");
    console.log();
    const samvad = new Contract(sepolia.samvad, samvad_abi, signer);
    const tx = await samvad.createPost(url, text, heading);
    await tx.wait();
    console.log(tx);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export async function createReply(
  post: number,
  parent: number,
  text: string,
  top_level: boolean,
  amount: string,
  signer: ethers.Signer
) {
  const networkjs = (await signer.provider?.getNetwork())!
  // err if chain id not in [1, 43113]
  console.log(networkjs.chainId);

  if (
    networkjs.chainId != 43113 &&
    networkjs.chainId != 111551111155111 &&
    networkjs.chainId != 11155111
  ) {
    console.log("only sepolia and avalanche fuji supported rn");
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
      return true;
    }
    console.log("sepolia");
    const samvad = new Contract(sepolia.samvad, samvad_abi, signer);
    const tx = await samvad.createReply(post, parent, text, top_level, amount);
    await tx.wait();
    console.log(tx);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}
