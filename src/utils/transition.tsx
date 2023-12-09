import { Contract, ethers } from "ethers";
import { sepolia, avalanche, samvad_abi, payCoin_abi } from "./configs";

export async function testProvider(url: String, data: any, signer: ethers.Signer) {
    console.log("inside the function 🎉")
    console.log("signer", signer)
    console.log("type", typeof signer)
    Promise.resolve();
}

const sepoliaProvider = new ethers.JsonRpcProvider("https://1rpc.io/sepolia");
// const sepoliaProvider = new ethers.JsonRpcProvider("https://rpc.sepolia.org");
// provider: ethers.Provider | ethers.Signer

export async function getBalance(address: string) {
    console.log("address", address)
    const samvad = new Contract(sepolia.samvad, samvad_abi, sepoliaProvider);
    const balance = await samvad.balances(address);
    console.log(balance);
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
    console.log("getting reply number ", id);
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
    }
    console.log(reply);
    for (let i = 0; i < _reply[4].length; i++) {
        console.log(_reply[4][i].toString());
        reply.replies.push(await getReply(parseInt(_reply[4][i])));
    }
    console.log(reply);
    return reply;
}

export async function getPost(id: any) {
    console.log("id",id);
    
    console.log("NETWORK")
    console.log((await sepoliaProvider.getNetwork()).name)
    const samvad = new Contract(sepolia.samvad, samvad_abi, sepoliaProvider);
    const _post = await samvad.getPost(id);
    console.log(_post);
    console.log(_post[0].toString());
    for (let i = 0; i < _post.length; i++) {
        console.log(_post[i]);
    }
    const post = {
        address: _post[0].toString(),
        id: _post[1].toString(),
        url: _post[2].toString(),
        text: _post[3].toString(),
        heading: _post[4].toString(),
        replies: [] as any[],
    }
    console.log(post);
    for (let i = 0; i < _post[5].length; i++) {
        console.log(_post[5][i].toString());
        post.replies.push(await getReply(parseInt(_post[5][i])));
    }
    console.log(post);
    return post;
}

export async function getAllPosts() {
    const samvad = new Contract(sepolia.samvad, samvad_abi, sepoliaProvider);
    const postCount = await samvad.getPostCount();
    console.log(postCount);
    const posts = [] as any[];
    for (let i = 1; i <= postCount; i++) {
        posts.push(await getPost(i));
    }
    console.log(posts);
    return posts;
}

export async function addPaycoins(amount: number, signer: ethers.Signer, network: string) {
    // if (network == "avalanche") {
    //     const samvad = new Contract(sepolia.samvad, samvad_abi, signer);
    //     const tx = await samvad.addPaycoins(amount);
    //     console.log(tx);
    // }
    const samvad = new Contract(sepolia.samvad, samvad_abi, signer);
    const payCoin = new Contract(sepolia.payCoin, payCoin_abi, signer)
    const approve_tx = await payCoin.approve(sepolia.samvad, amount);
    await approve_tx.wait();
    const tx = await samvad.addPaycoins(amount);
    await tx.wait();
    console.log(tx);
    return true;
}

export async function createPost(url: string, text: string, heading: string, signer: ethers.Signer, network: string) {
    // if (network == "avalanche") {
    //     const samvad = new Contract(sepolia.samvad, samvad_abi, signer);
    //     const tx = await samvad.createPost(url, text, heading);
    //     console.log(tx);
    // }
    const samvad = new Contract(sepolia.samvad, samvad_abi, signer);
    const tx = await samvad.createPost(url, text, heading);
    await tx.wait();
    console.log(tx);
}

export async function createReply(post: number, parent: number, text: string, top_level: boolean, amount: number, signer: ethers.Signer, network: string) {
    // if (network == "avalanche") {
    //     const samvad = new Contract(sepolia.samvad, samvad_abi, signer);
    //     const tx = await samvad.createReply(post, parent, text, top_level, amount);
    //     console.log(tx);
    // }
    const samvad = new Contract(sepolia.samvad, samvad_abi, signer);
    const tx = await samvad.createReply(post, parent, text, top_level, amount);
    await tx.wait();
    console.log(tx);
}