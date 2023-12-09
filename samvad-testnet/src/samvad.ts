import {
  PostCreated as PostCreatedEvent,
  ReplyCreated as ReplyCreatedEvent,
  TokensTransferred as TokensTransferredEvent
} from "../generated/Samvad/Samvad"
import {
  PostCreated,
  ReplyCreated,
  TokensTransferred
} from "../generated/schema"

export function handlePostCreated(event: PostCreatedEvent): void {
  let entity = new PostCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.account = event.params.account
  entity.Samvad_id = event.params.id
  entity.mediaUrl = event.params.mediaUrl
  entity.url = event.params.url
  entity.text = event.params.text
  entity.heading = event.params.heading

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleReplyCreated(event: ReplyCreatedEvent): void {
  let entity = new ReplyCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.account = event.params.account
  entity.Samvad_id = event.params.id
  entity.text = event.params.text
  entity.post = event.params.post
  entity.parent = event.params.parent
  entity.top_level = event.params.top_level

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTokensTransferred(event: TokensTransferredEvent): void {
  let entity = new TokensTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.messageId = event.params.messageId
  entity.destinationChainSelector = event.params.destinationChainSelector
  entity.receiver = event.params.receiver
  entity.token = event.params.token
  entity.tokenAmount = event.params.tokenAmount
  entity.feeToken = event.params.feeToken
  entity.fees = event.params.fees

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
