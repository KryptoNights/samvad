// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

// deployed at: 0x47BDb4751F01A36695b93A1c560f39BcF9a0b376
// constructor args: 0x779877A7B0D9E8603169DdbD7836e478b4624789, 0xd0daae2231e9cb96b94c8512223533293c3693bf, 0xFd57b4ddBf88a4e07fF4e34C487b99af2Fe82a05

import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {CCIPReceiver} from "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";
import {IRouterClient} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import {LinkTokenInterface} from "@chainlink/contracts/src/v0.8/shared/interfaces/LinkTokenInterface.sol";
import {IERC20} from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.0/contracts/token/ERC20/IERC20.sol";

contract Samvad is CCIPReceiver {
    // counters
    uint256 post_counter;
    uint256 reply_counter;

    // ccip
    LinkTokenInterface link;
    IRouterClient router;

    // balances
    IERC20 public payCoin;
    address payCoinAddress;
    mapping(address => uint256) public balances;

    mapping(uint256 => Post) public posts;
    mapping(uint256 => Reply) public replies;

    struct Post {
        // identifiers
        address account;
        uint256 id;
        // contents
        string mediaUrl;
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
        uint256 post;
        uint256 parent;
        bool top_level;
        uint256[] replies;
    }

    event PostCreated(
        address account,
        uint256 id,
        string mediaUrl,
        string url,
        string text,
        string heading
    );
    event ReplyCreated(
        address account,
        uint256 id,
        string text,
        uint256 post,
        uint256 parent,
        bool top_level
    );

    event TokensTransferred(
        bytes32 indexed messageId, // The unique ID of the message.
        uint64 indexed destinationChainSelector, // The chain selector of the destination chain.
        address receiver, // The address of the receiver on the destination chain.
        address token, // The token address that was transferred.
        uint256 tokenAmount, // The token amount that was transferred.
        address feeToken, // the token address used to pay CCIP fees.
        uint256 fees // The fees paid for sending the message.
    );

    error NotEnoughBalance(uint256 currentBalance, uint256 calculatedFees);

    constructor(
        address _link,
        address _router,
        address _payCoinAddress
    ) CCIPReceiver(_router) {
        // 0x779877A7B0D9E8603169DdbD7836e478b4624789, 0xd0daae2231e9cb96b94c8512223533293c3693bf, 0xFd57b4ddBf88a4e07fF4e34C487b99af2Fe82a05
        payCoin = IERC20(_payCoinAddress);
        payCoinAddress = _payCoinAddress;
        post_counter = 0;
        reply_counter = 0;
        router = IRouterClient(_router);
        link = LinkTokenInterface(_link);
        // link.approve(_router, type(uint256).max);
    }

    // internal create functions

    function _internal_createPost(
        address user,
        string memory mediaUrl,
        string memory url,
        string memory text,
        string memory heading
    ) private {
        post_counter++;
        posts[post_counter] = Post(
            user,
            post_counter,
            mediaUrl,
            url,
            text,
            heading,
            new uint256[](0)
        );
        emit PostCreated(user, post_counter, mediaUrl, url, text, heading);
    }

    function _internal_createReply(
        address user,
        uint256 post,
        uint256 parent,
        string memory text,
        bool top_level,
        uint256 amount
    ) private {
        // check if user has enough balance
        require(balances[user] >= amount, "Insufficient balance");
        // check if post_reply is true then the post actually exists
        if (top_level) {
            require(parent <= post_counter, "Post does not exist.");
        } else {
            require(parent <= reply_counter, "Reply does not exist.");
        }
        reply_counter++;
        replies[reply_counter] = Reply(
            user,
            reply_counter,
            text,
            post,
            parent,
            top_level,
            new uint256[](0)
        );
        if (top_level) {
            posts[parent].replies.push(reply_counter);
        } else {
            replies[parent].replies.push(reply_counter);
        }

        // define incentives (max upto 3 levels (50%, 25%, 25%), if top_level then post gets 100%)
        balances[user] -= amount;
        uint256 remaining_amount = amount;
        uint256 curr = parent;
        if (top_level) {
            balances[posts[curr].account] += amount;
            remaining_amount = 0;
        } else {
            balances[replies[parent].account] += amount / 2;
            remaining_amount -= amount / 2;
            curr = replies[curr].parent;
        }

        if (remaining_amount > 0 && replies[curr].top_level) {
            balances[posts[curr].account] += remaining_amount;
            remaining_amount = 0;
        } else {
            balances[replies[curr].account] += remaining_amount / 2;
            remaining_amount -= remaining_amount / 2;
            curr = replies[curr].parent;
        }

        if (remaining_amount > 0 && replies[curr].top_level) {
            balances[posts[curr].account] += remaining_amount;
            remaining_amount = 0;
        } else {
            balances[replies[curr].account] += remaining_amount;
            remaining_amount = 0;
        }

        // emit event
        emit ReplyCreated(user, reply_counter, text, post, parent, top_level);
    }

    // external (eth) create functions

    function _ccipReceive(
        Client.Any2EVMMessage memory message
    ) internal override {
        if (message.destTokenAmounts.length == 0) {
            // post/reply creation call
            (
                address _sender,
                uint8 _type,
                string memory _url,
                string memory _text,
                string memory _heading,
                uint256 _post,
                uint256 _parent,
                bool _top_level,
                uint256 _amount
            ) = abi.decode(
                    message.data,
                    (
                        address,
                        uint8,
                        string,
                        string,
                        string,
                        uint256,
                        uint256,
                        bool,
                        uint256
                    )
                );
            if (_type == 0) {
                _internal_createPost(_sender, "mediaUrl", _url, _text, _heading);
            } else if (_type == 1) {
                _internal_createReply(
                    _sender,
                    _post,
                    _parent,
                    _text,
                    _top_level,
                    _amount
                );
            } else if (_type == 2) {
                ccipwithraw_paycoins(
                    _sender,
                    _amount,
                    message.sourceChainSelector
                );
            } else {
                revert("Invalid type");
            }
        } else {
            // add funds call
            require(
                message.destTokenAmounts[0].amount > 0,
                "Amount should be greater than 0"
            );
            _ccipadd_paycoins(
                abi.decode(message.data, (address)),
                message.destTokenAmounts[0].amount
            );
        }
    }

    function createPost(
        string memory mediaUrl,
        string memory url,
        string memory text,
        string memory heading
    ) public {
        _internal_createPost(msg.sender, mediaUrl, url, text, heading);
    }

    function createReply(
        uint256 post,
        uint256 parent,
        string memory text,
        bool top_level,
        uint256 amount
    ) public {
        _internal_createReply(msg.sender, post, parent, text, top_level, amount);
    }

    // external (ccip - link) create functions

    // funds related functions

    function add_paycoins(uint256 amount) public {
        payCoin.transferFrom(msg.sender, address(this), amount);
        balances[msg.sender] += amount;
    }

    function _ccipadd_paycoins(address sender, uint256 amount) internal {
        balances[sender] += amount;
    }

    function withdraw_paycoins(uint256 amount) public {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        payCoin.transfer(msg.sender, amount);
    }

    function ccipwithraw_paycoins(
        address _receiver,
        uint256 _amount,
        uint64 _destinationChainSelector
    ) internal returns (bytes32 messageId) {
        // withdraws paycoins to another chain using bnm mechanism
        Client.EVMTokenAmount[]
            memory tokenAmounts = new Client.EVMTokenAmount[](1);
        Client.EVMTokenAmount memory tokenAmount = Client.EVMTokenAmount({
            token: address(payCoin),
            amount: _amount
        });
        tokenAmounts[0] = tokenAmount;

        // Build the CCIP Message
        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(_receiver),
            data: "",
            tokenAmounts: tokenAmounts,
            extraArgs: Client._argsToBytes(
                Client.EVMExtraArgsV1({gasLimit: 0})
            ),
            feeToken: address(link)
        });

        // CCIP Fees Management
        uint256 fees = router.getFee(_destinationChainSelector, message);

        if (fees > link.balanceOf(address(this)))
            revert NotEnoughBalance(link.balanceOf(address(this)), fees);

        link.approve(address(router), fees);

        // Approve Router to spend CCIP-BnM tokens we send
        payCoin.approve(address(router), _amount);

        // Send CCIP Message
        messageId = router.ccipSend(_destinationChainSelector, message);

        emit TokensTransferred(
            messageId,
            _destinationChainSelector,
            _receiver,
            payCoinAddress,
            _amount,
            address(link),
            fees
        );
    }

    // view functions

    function getPost(
        uint256 id
    )
        public
        view
        returns (
            address,
            uint256,
            string memory,
            string memory,
            string memory,
            uint256[] memory
        )
    {
        Post memory post = posts[id];
        return (
            post.account,
            post.id,
            post.url,
            post.text,
            post.heading,
            post.replies
        );
    }

    function getReply(
        uint256 id
    )
        public
        view
        returns (address, uint256, string memory, uint256, uint256[] memory)
    {
        Reply memory reply = replies[id];
        return (
            reply.account,
            reply.id,
            reply.text,
            reply.parent,
            reply.replies
        );
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

    function getReplyReplies(
        uint256 id
    ) public view returns (uint256[] memory) {
        return replies[id].replies;
    }

    function getPostRepliesCount(uint256 id) public view returns (uint256) {
        return posts[id].replies.length;
    }

    function getReplyRepliesCount(uint256 id) public view returns (uint256) {
        return replies[id].replies.length;
    }
}
