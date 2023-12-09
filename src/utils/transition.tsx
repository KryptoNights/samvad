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
  const post = {
    address: _post[0].toString(),
    id: _post[1].toString(),
    url: _post[2].toString(),
    text: _post[3].toString(),
    heading: _post[4].toString(),
    replies: [] as any[],
  };
  for (let i = 0; i < _post[5].length; i++) {
    // console.log(_post[5][i].toString());
    post.replies.push(await getReply(parseInt(_post[5][i])));
  }
  return post;
}

export async function getAllPosts() {
  const samvad = new Contract(sepolia.samvad, samvad_abi, sepoliaProvider);
  const postCount = await samvad.getPostCount();
  // console.log(postCount);
  const posts = [] as any[];
  for (let i = 1; i <= postCount; i++) {
    posts.push(await getPost(i));
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
