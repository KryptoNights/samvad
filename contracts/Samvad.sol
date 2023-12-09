// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Samvad {
  // counters
  uint256 post_counter;
  uint256 reply_counter;
  
  struct Post {
    // identifiers
    address account;
    uint256 id;
    // contents
    string url;
    string text;
    string heading;
    // graph
    uint256[] replies;
  }

  struct Reply {
    // identifiers
    address account;
    uint256 id;
    // contents
    string text;
    // graph
    uint256 parent;
    uint256[] replies;
  }

  event PostCreated(address account, uint256 id, string url, string text, string heading);
  event ReplyCreated(address account, uint256 id, string text, uint256 parent);
  event PostEdited(address account, uint256 id, string additional_text);
  event ReplyEdited(address account, uint256 id, string additional_text);

  constructor() {
    post_counter = 0;
    reply_counter = 0;
  }

  mapping(uint256 => Post) public posts;
  mapping(uint256 => Reply) public replies;

  // create functions

  function createPost(string memory url, string memory text, string memory heading) public {
    post_counter++;
    posts[post_counter] = Post(msg.sender, post_counter, url, text, heading, new uint256[](0));
    emit PostCreated(msg.sender, post_counter, url, text, heading);
  }

  function createReply(uint256 parent, string memory text, bool post_reply) public {
    // check if post_reply is true then the post actually exists
    if (post_reply) {
      require(parent <= post_counter, "Post does not exist.");
    } else {
      require(parent <= reply_counter, "Reply does not exist.");
    }
    reply_counter++;
    replies[reply_counter] = Reply(msg.sender, reply_counter, text, parent, new uint256[](0));
    posts[parent].replies.push(reply_counter);
    emit ReplyCreated(msg.sender, reply_counter, text, parent);
  }

  // edit functions

  function editPost(uint256 id, string memory additional_text) public {
    Post storage post = posts[id];
    require(post.account == msg.sender, "You are not the owner of this post.");
    post.text = string(abi.encodePacked(post.text, additional_text));
    emit PostEdited(msg.sender, id, additional_text);
  }

  function editReply(uint256 id, string memory additional_text) public {
    Reply storage reply = replies[id];
    require(reply.account == msg.sender, "You are not the owner of this reply.");
    reply.text = string(abi.encodePacked(reply.text, additional_text));
    emit ReplyEdited(msg.sender, id, additional_text);
  }

  // view functions

  function getPost(uint256 id) public view returns (address, uint256, string memory, string memory, string memory, uint256[] memory) {
    Post memory post = posts[id];
    return (post.account, post.id, post.url, post.text, post.heading, post.replies);
  }

  function getReply(uint256 id) public view returns (address, uint256, string memory, uint256, uint256[] memory) {
    Reply memory reply = replies[id];
    return (reply.account, reply.id, reply.text, reply.parent, reply.replies);
  }

  function getPostCount() public view returns (uint256) {
    return post_counter;
  }

  function getReplyCount() public view returns (uint256) {
    return reply_counter;
  }

  function getPostReplies(uint256 id) public view returns (uint256[] memory) {
    return posts[id].replies;
  }

  function getReplyReplies(uint256 id) public view returns (uint256[] memory) {
    return replies[id].replies;
  }

  function getPostRepliesCount(uint256 id) public view returns (uint256) {
    return posts[id].replies.length;
  }

  function getReplyRepliesCount(uint256 id) public view returns (uint256) {
    return replies[id].replies.length;
  }
}