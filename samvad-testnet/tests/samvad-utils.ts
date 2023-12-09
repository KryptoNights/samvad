import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  PostCreated,
  ReplyCreated,
  TokensTransferred
} from "../generated/Samvad/Samvad"

export function createPostCreatedEvent(
  account: Address,
  id: BigInt,
  mediaUrl: string,
  url: string,
  text: string,
  heading: string
): PostCreated {
  let postCreatedEvent = changetype<PostCreated>(newMockEvent())

  postCreatedEvent.parameters = new Array()

  postCreatedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )
  postCreatedEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  )
  postCreatedEvent.parameters.push(
    new ethereum.EventParam("mediaUrl", ethereum.Value.fromString(mediaUrl))
  )
  postCreatedEvent.parameters.push(
    new ethereum.EventParam("url", ethereum.Value.fromString(url))
  )
  postCreatedEvent.parameters.push(
    new ethereum.EventParam("text", ethereum.Value.fromString(text))
  )
  postCreatedEvent.parameters.push(
    new ethereum.EventParam("heading", ethereum.Value.fromString(heading))
  )

  return postCreatedEvent
}

export function createReplyCreatedEvent(
  account: Address,
  id: BigInt,
  text: string,
  post: BigInt,
  parent: BigInt,
  top_level: boolean
): ReplyCreated {
  let replyCreatedEvent = changetype<ReplyCreated>(newMockEvent())

  replyCreatedEvent.parameters = new Array()

  replyCreatedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )
  replyCreatedEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  )
  replyCreatedEvent.parameters.push(
    new ethereum.EventParam("text", ethereum.Value.fromString(text))
  )
  replyCreatedEvent.parameters.push(
    new ethereum.EventParam("post", ethereum.Value.fromUnsignedBigInt(post))
  )
  replyCreatedEvent.parameters.push(
    new ethereum.EventParam("parent", ethereum.Value.fromUnsignedBigInt(parent))
  )
  replyCreatedEvent.parameters.push(
    new ethereum.EventParam("top_level", ethereum.Value.fromBoolean(top_level))
  )

  return replyCreatedEvent
}

export function createTokensTransferredEvent(
  messageId: Bytes,
  destinationChainSelector: BigInt,
  receiver: Address,
  token: Address,
  tokenAmount: BigInt,
  feeToken: Address,
  fees: BigInt
): TokensTransferred {
  let tokensTransferredEvent = changetype<TokensTransferred>(newMockEvent())

  tokensTransferredEvent.parameters = new Array()

  tokensTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "messageId",
      ethereum.Value.fromFixedBytes(messageId)
    )
  )
  tokensTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "destinationChainSelector",
      ethereum.Value.fromUnsignedBigInt(destinationChainSelector)
    )
  )
  tokensTransferredEvent.parameters.push(
    new ethereum.EventParam("receiver", ethereum.Value.fromAddress(receiver))
  )
  tokensTransferredEvent.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  )
  tokensTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "tokenAmount",
      ethereum.Value.fromUnsignedBigInt(tokenAmount)
    )
  )
  tokensTransferredEvent.parameters.push(
    new ethereum.EventParam("feeToken", ethereum.Value.fromAddress(feeToken))
  )
  tokensTransferredEvent.parameters.push(
    new ethereum.EventParam("fees", ethereum.Value.fromUnsignedBigInt(fees))
  )

  return tokensTransferredEvent
}
