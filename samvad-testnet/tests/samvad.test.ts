import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import { PostCreated } from "../generated/schema"
import { PostCreated as PostCreatedEvent } from "../generated/Samvad/Samvad"
import { handlePostCreated } from "../src/samvad"
import { createPostCreatedEvent } from "./samvad-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let account = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let id = BigInt.fromI32(234)
    let mediaUrl = "Example string value"
    let url = "Example string value"
    let text = "Example string value"
    let heading = "Example string value"
    let newPostCreatedEvent = createPostCreatedEvent(
      account,
      id,
      mediaUrl,
      url,
      text,
      heading
    )
    handlePostCreated(newPostCreatedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("PostCreated created and stored", () => {
    assert.entityCount("PostCreated", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "PostCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "account",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "PostCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "mediaUrl",
      "Example string value"
    )
    assert.fieldEquals(
      "PostCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "url",
      "Example string value"
    )
    assert.fieldEquals(
      "PostCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "text",
      "Example string value"
    )
    assert.fieldEquals(
      "PostCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "heading",
      "Example string value"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
