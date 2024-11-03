// SPDX-License-Identifier: MIT
// NOTICE: This is an example contract with no security considerations taken into account.
// This contract is for educational purposes only and should not be used in production environments.

pragma solidity 0.8.25;

import "@seda-protocol/contracts/src/SedaProver.sol";

/**
 * @title PriceFeed
 * @notice This contract demonstrates how to create and interact with data requests on the SEDA network.
 */
contract PriceFeed {
    // ID of the most recent data request.
    bytes32 public dataRequestId;

    // ID of the data request WASM binary on the SEDA network.
    bytes32 public oracleProgramId;

    // Instance of the SedaProver contract, which verifies the authenticity of data request results.
    SedaProver public sedaProverContract;

    // Struct representing an issue.
    struct Issue {
        uint256 id; // Unique identifier for the issue
        string issueUrl; // URL of the issue (e.g., GitHub issue URL)
        bool merged; // Status indicating if the issue's PR has been merged
        address contributor; // Address of the contributor working on the issue
        uint256 bounty; // Bounty in wei associated with the issue
        address createdBy; // Address of the creator who posted the issue
    }

    mapping(uint256 => Issue) private issues;
    mapping(uint256 => bytes32) dataRequestMapping;

    uint256 private issueCounter;

    event IssueCreated(
        uint256 id,
        string issueUrl,
        address createdBy,
        uint256 bounty
    );

    event IssueUpdated(uint256 id, bool merged, address contributor);

    /**
     * @notice Initializes the contract with the SedaProver contract and the binary ID for the data request.
     * @param _sedaProverContract Address of the deployed SedaProver contract.
     * @param _oracleProgramId The ID of the WASM binary that handles the data request.
     */
    constructor(address _sedaProverContract, bytes32 _oracleProgramId) {
        sedaProverContract = SedaProver(_sedaProverContract);
        oracleProgramId = _oracleProgramId;
    }

    /**
     * @notice Function to create an issue. The bounty must be sent with the transaction.
     * @param _issueUrl URL of the issue.
     */
    function createIssue(string memory _issueUrl) public payable {
        require(msg.value > 0, "Bounty must be greater than 0");

        issueCounter++;
        issues[issueCounter] = Issue({
            id: issueCounter,
            issueUrl: _issueUrl,
            merged: false,
            contributor: address(0),
            bounty: msg.value,
            createdBy: msg.sender
        });

        emit IssueCreated(issueCounter, _issueUrl, msg.sender, msg.value);
    }

    /**
     * @notice Function to get issue details by ID.
     * @param issueId ID of the issue to retrieve.
     * @return The issue details.
     */
    function getIssueById(uint256 issueId) public view returns (Issue memory) {
        require(issues[issueId].id != 0, "Issue not found");
        return issues[issueId];
    }

    /**
     * @notice Function to get all issues.
     * @return An array of all issues.
     */
    function getAllIssues() public view returns (Issue[] memory) {
        Issue[] memory allIssues = new Issue[](issueCounter);
        for (uint256 i = 1; i <= issueCounter; i++) {
            allIssues[i - 1] = issues[i];
        }
        return allIssues;
    }

    /**
     * @notice Transmits a new data request to the SEDA network through the SedaProver contract.
     */
    function transmit(
        uint256 issueId,
        string memory val
    ) public returns (bytes32) {
        bytes memory input = bytes(val);
        SedaDataTypes.DataRequestInputs memory inputs = SedaDataTypes
            .DataRequestInputs(
                oracleProgramId,
                input,
                oracleProgramId,
                hex"00",
                1,
                hex"00",
                1,
                5000000,
                abi.encodePacked(block.number)
            );

        // Post the data request to the SedaProver contract and store the request ID.
        dataRequestId = sedaProverContract.postDataRequest(inputs);

        // Mapping issueId with dataRequestID
        dataRequestMapping[issueId] = dataRequestId;

        return dataRequestId;
    }

    /**
     * @notice Fetches the latest answer for the data request by issue ID.
     */
    function latestAnswerIssueId(uint256 issueId) public returns (uint128) {
        bytes32 tempDataRequestId = dataRequestMapping[issueId];
        require(tempDataRequestId != bytes32(0), "No data request transmitted");

        SedaDataTypes.DataResult memory dataResult = sedaProverContract
            .getDataResult(tempDataRequestId);

        if (dataResult.consensus) {
            uint128 resultValue = uint128(bytes16(dataResult.result));

            if (resultValue == 5) {
                Issue storage issue = issues[issueId];
                require(issue.id != 0, "Issue does not exist");
                require(issue.bounty > 0, "No bounty available");
                require(!issue.merged, "Issue already merged and paid");

                // Transfer the bounty amount to msg.sender.
                payable(msg.sender).transfer(issue.bounty);

                issue.merged = true;
                issue.contributor = msg.sender;

                emit IssueUpdated(issueId, true, msg.sender);
            }

            return resultValue;
        }

        return 0;
    }
}
