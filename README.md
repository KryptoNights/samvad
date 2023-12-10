# Samvad

Samvad is a cross-chain forum where you are incentivised to have meaningful discussions. The more people engage with your thoughts, the more you earn. Think of it as Hacker News, but decentralized and incentivised.

## How it works

You can make a post for free, but replies cost tokens. If you reply to a post, all the tokens go to the poster. When someone replies to your reply, you get half the tokens they give, and the other half is split between the person you reply to (parent of your reply) and the parent of that parent.

This incentivises people to make meaningful posts and replies, and to engage with other people's posts. Incentives don't die out as you go deeper into the thread.

## How to use

The usage is 2 step. First you give in some tokens to the contract, and then you can use those tokens to make posts and replies. All rewards you get through people engaging with you automatically get added to your balance. You can withdraw your balance at any time.

## Not on Ethereum? Not a problem.

Samvad is cross-chain. While we treat Ethereum as our base chain, you can use any supported chain to interact with Samvad through Chainlink's CCIP. All supported chains have functions through which you can deposit and withdraw tokens, and make posts and replies. All supported networks have a native deployment of the token, so you can use the same token across all chains.

## Which token

On testnet, we use Chainlink's BnM token. On mainnet, we will use our own token, which will be distributed through an airdrop. The token will be used to participate in the forum and to vote on proposals to change the incentive structure and tokenomics. This makes Samvad a DAO.

# Sponsor Tracks
## Waku
To incentivise people maximize their engagement, we show a highly unique and powerful metric to them: the number of people who are viewing the particular post or have viewed it in a particular time frame, either live or the past few minutes. We do this by sending a non-ephemeral ping every time a post is viewed. We then fetch it using a filter. This is highly privacy preserving, and something we have never seen in any other web app. We also tried to ping devices whenever a new reply is created so they can auto-reload, but currently facing some issues there.
## Chainlink
We use CCIP to interact with our contract on the primary chain (sepolia) from other chains (currently, avalanche fuji). We transfer both tokens (CCIP BnM) and data (post, reply, etc). We also have a double CCIP call, where you request to withdraw your tokens on sepolia from fuji. Your request first goes from fuji to sepolia through CCIP, and then it triggers another CCIP send internally, from sepolia to fuji (both contracts are funded with LINK).
## Metamask/Infura
We fetch real time gas prices from Infura and show them to the user when they want to do a transaction. We multiply the gas prices with the number of instructions we have per tx to show a reliable estimation.
## Push Protocol
We use Push Protocol to show real-time notifications to people who's post or reply we are engaging with.
## The Graph
Instead of our own indexing platform, we are using The Graph for super fast and reliable fetcher for on-chain data. We are using their 2 graphql apis, one with is parameterized and one is not.
## Filecoin/IPFS
In addition to URLs we also support media uploads in the form of images or videos for the posts.
## Alliance
We are confident we are building the most innovative incentivised protocol which is most likely to be a startup. We will reduce token sell pressures by improving the token utility two-fold: participation incentives (you earn more by having meaningful conversations) and governance (you can vote on proposals that will benefit you long term). We will do an incentivised testnet launch followed by an airdrop leading up to our mainnet launch.