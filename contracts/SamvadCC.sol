// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

// constructor args: 0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846, 0x554472a2720e5e7d5d3c817529aba05eed5f82d8, 0xD21341536c5cF5EB1bcb58f6723cE26e8D8E90e4, 0x47BDb4751F01A36695b93A1c560f39BcF9a0b376, 16015286601757825753
// link = 0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846
// router = 0x554472a2720e5e7d5d3c817529aba05eed5f82d8
// payCoin = 0xD21341536c5cF5EB1bcb58f6723cE26e8D8E90e4
// samvad = ?
// destinationChain = 16015286601757825753
// deployed at 0x8C4eAD73aA4EEe01DF4d1a3A9d76bF1cD349A166

import {IRouterClient} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import {OwnerIsCreator} from "@chainlink/contracts-ccip/src/v0.8/shared/access/OwnerIsCreator.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {CCIPReceiver} from "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";
import {IERC20} from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.0/contracts/token/ERC20/IERC20.sol";

contract SamvadCC is CCIPReceiver, OwnerIsCreator {
    // ccip
    IERC20 private link;
    uint64 destinationChainSelector;
    address samvad;

    // balances
    IERC20 public payCoin;

    event SentPaycoins(bytes32 messageId, uint256 amount);
    event SentPost(bytes32 messageId, string url, string text, string heading);
    event SentReply(
        bytes32 messageId,
        address user,
        uint256 post,
        uint256 parent,
        string text,
        bool top_level,
        uint256 amount
    );
    event RequestedWithdrawl(bytes32 messageId, uint256 amount);
    // Event emitted when a message is received from another chain.
    event MessageReceived(
        bytes32 indexed messageId, // The unique ID of the CCIP message.
        uint64 indexed sourceChainSelector, // The chain selector of the source chain.
        address sender, // The address of the sender from the source chain.
        string text, // The text that was received.
        address token, // The token address that was transferred.
        uint256 tokenAmount // The token amount that was transferred.
    );

    // Custom errors to provide more descriptive revert messages.
    error NotEnoughBalance(uint256 currentBalance, uint256 calculatedFees); // Used to make sure contract has enough balance to cover the fees.
    error NothingToWithdraw(); // Used when trying to withdraw Ether but there's nothing to withdraw.
    error FailedToWithdrawEth(address owner, address target, uint256 value); // Used when the withdrawal of Ether fails.
    error DestinationChainNotAllowed(uint64 destinationChainSelector); // Used when the destination chain has not been allowlisted by the contract owner.
    error SourceChainNotAllowed(uint64 sourceChainSelector); // Used when the source chain has not been allowlisted by the contract owner.
    error SenderNotAllowed(address sender); // Used when the sender has not been allowlisted by the contract owner.

    constructor(
        address _link,
        address _router,
        address _payCoinAddress,
        address _samvad,
        uint64 _destinationChainSelector
    ) CCIPReceiver(_router) {
        payCoin = IERC20(_payCoinAddress);
        link = IERC20(_link);
        // link.approve(_router, type(uint256).max);
        samvad = _samvad;
        destinationChainSelector = _destinationChainSelector;
    }

    function sendPaycoins(uint256 _amount) external returns (bytes32 messageId) {
        payCoin.transferFrom(msg.sender, address(this), _amount);

        bytes memory _data = abi.encode(
            msg.sender,
            uint8(0),
            "", "", "",
            uint256(0), uint256(0),
            _amount
        );

        Client.EVMTokenAmount[]
            memory tokenAmounts = new Client.EVMTokenAmount[](1);
        tokenAmounts[0] = Client.EVMTokenAmount({
            token: address(payCoin),
            amount: _amount
        });

        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(samvad), // ABI-encoded receiver address
            data: _data, // ABI-encoded string
            tokenAmounts: tokenAmounts, // The amount and type of token being transferred
            extraArgs: Client._argsToBytes(
                // Additional arguments, setting gas limit and non-strict sequencing mode
                Client.EVMExtraArgsV1({gasLimit: 200_000})
            ),
            // Set the feeToken to a feeTokenAddress, indicating specific asset will be used for fees
            feeToken: address(link)
        });

        // Initialize a router client instance to interact with cross-chain router
        IRouterClient router = IRouterClient(this.getRouter());

        // Get the fee required to send the CCIP message
        uint256 fees = router.getFee(destinationChainSelector, message);

        if (fees > link.balanceOf(address(this)))
            revert NotEnoughBalance(link.balanceOf(address(this)), fees);

        // approve the Router to transfer LINK tokens on contract's behalf. It will spend the fees in LINK
        link.approve(address(router), fees);

        // approve the Router to spend tokens on contract's behalf. It will spend the amount of the given token
        payCoin.approve(address(router), _amount);

        // Send the message through the router and store the returned message ID
        messageId = router.ccipSend(destinationChainSelector, message);

        emit SentPaycoins(messageId, _amount);
    }

    function createPost(
        string memory url,
        string memory text,
        string memory heading
    ) public returns (bytes32 messageId) {
        // create a post on samvad
        bytes memory _data = abi.encode(
            msg.sender,
            uint8(0),
            url,
            text,
            heading,
            uint256(0),
            uint256(0),
            false,
            uint256(0)
        );

        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(samvad), // ABI-encoded receiver address
            data: _data, // ABI-encoded string
            tokenAmounts: new Client.EVMTokenAmount[](0), // The amount and type of token being transferred
            extraArgs: Client._argsToBytes(
                // Additional arguments, setting gas limit and non-strict sequencing mode
                Client.EVMExtraArgsV1({gasLimit: 200_000})
            ),
            // Set the feeToken to a feeTokenAddress, indicating specific asset will be used for fees
            feeToken: address(link)
        });

        // Initialize a router client instance to interact with cross-chain router
        IRouterClient router = IRouterClient(this.getRouter());

        // Get the fee required to send the CCIP message
        uint256 fees = router.getFee(destinationChainSelector, message);

        if (fees > link.balanceOf(address(this)))
            revert NotEnoughBalance(link.balanceOf(address(this)), fees);

        // approve the Router to transfer LINK tokens on contract's behalf. It will spend the fees in LINK
        link.approve(address(router), fees);

        // Send the message through the router and store the returned message ID
        messageId = router.ccipSend(destinationChainSelector, message);

        emit SentPost(messageId, url, text, heading);
    }

    function createReply(
        uint256 post,
        uint256 parent,
        string memory text,
        bool top_level,
        uint256 amount
    ) public returns (bytes32 messageId) {
        // create a post on samvad
        bytes memory _data = abi.encode(
            msg.sender,
            uint8(1),
            "",
            text,
            "",
            post,
            parent,
            top_level,
            amount
        );

        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(samvad), // ABI-encoded receiver address
            data: _data, // ABI-encoded string
            tokenAmounts: new Client.EVMTokenAmount[](0), // The amount and type of token being transferred
            extraArgs: Client._argsToBytes(
                // Additional arguments, setting gas limit and non-strict sequencing mode
                Client.EVMExtraArgsV1({gasLimit: 200_000})
            ),
            // Set the feeToken to a feeTokenAddress, indicating specific asset will be used for fees
            feeToken: address(link)
        });

        // Initialize a router client instance to interact with cross-chain router
        IRouterClient router = IRouterClient(this.getRouter());

        // Get the fee required to send the CCIP message
        uint256 fees = router.getFee(destinationChainSelector, message);

        if (fees > link.balanceOf(address(this)))
            revert NotEnoughBalance(link.balanceOf(address(this)), fees);

        // approve the Router to transfer LINK tokens on contract's behalf. It will spend the fees in LINK
        link.approve(address(router), fees);

        // Send the message through the router and store the returned message ID
        messageId = router.ccipSend(destinationChainSelector, message);

        emit SentReply(messageId, msg.sender, post, parent, text, top_level, amount);
    }

    function requestWithdrawl(uint256 amount) public returns (bytes32 messageId) {
        // request withdrawl of paycoins from primary chain
        bytes memory _data = abi.encode(
            msg.sender,
            uint8(2),
            "",
            "",
            "",
            uint256(0),
            uint256(0),
            false,
            amount
        );

        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(samvad), // ABI-encoded receiver address
            data: _data, // ABI-encoded string
            tokenAmounts: new Client.EVMTokenAmount[](0), // The amount and type of token being transferred
            extraArgs: Client._argsToBytes(
                // Additional arguments, setting gas limit and non-strict sequencing mode
                Client.EVMExtraArgsV1({gasLimit: 200_000})
            ),
            // Set the feeToken to a feeTokenAddress, indicating specific asset will be used for fees
            feeToken: address(link)
        });

        // Initialize a router client instance to interact with cross-chain router
        IRouterClient router = IRouterClient(this.getRouter());

        // Get the fee required to send the CCIP message
        uint256 fees = router.getFee(destinationChainSelector, message);

        if (fees > link.balanceOf(address(this)))
            revert NotEnoughBalance(link.balanceOf(address(this)), fees);

        // approve the Router to transfer LINK tokens on contract's behalf. It will spend the fees in LINK
        link.approve(address(router), fees);

        // Send the message through the router and store the returned message ID
        messageId = router.ccipSend(destinationChainSelector, message);
        
        emit RequestedWithdrawl(messageId, amount);
    }

    /// handle a received message
    function _ccipReceive(
        Client.Any2EVMMessage memory any2EvmMessage
    )
        internal
        override
        // onlyAllowlisted(
        //     any2EvmMessage.sourceChainSelector,
        //     abi.decode(any2EvmMessage.sender, (address))
        // ) // Make sure source chain and sender are allowlisted
    {
        emit MessageReceived(
            any2EvmMessage.messageId,
            any2EvmMessage.sourceChainSelector, // fetch the source chain identifier (aka selector)
            abi.decode(any2EvmMessage.sender, (address)), // abi-decoding of the sender address,
            abi.decode(any2EvmMessage.data, (string)),
            any2EvmMessage.destTokenAmounts[0].token,
            any2EvmMessage.destTokenAmounts[0].amount
        );
    }

    receive() external payable {}
}
