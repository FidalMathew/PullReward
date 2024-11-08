import { getDeployedContract } from "./utils";
import { priceFeedScope } from "./scope";
import { ethers } from "hardhat";
/**
 * Task: Fetches the latest answer from the PriceFeed contract.
 * Optional parameter: contract (PriceFeed contract address).
 * If the contract address is not provided, fetches from previous deployments.
 */
priceFeedScope.task("latest-answer", "Calls the latestAnswer function on the PriceFeed contract")
  .addOptionalParam("contract", "The PriceFeed contract address")
  .setAction(async ({ contract }, hre) => {
    try {
      // Fetch the address from previous deployments if not provided
      let priceFeedAddress = contract;
      if (!priceFeedAddress) {
        console.log("No contract address specified, fetching from previous deployments...");
        priceFeedAddress = getDeployedContract(hre.network.config, 'PriceFeedModule#PriceFeed');
        console.log("Contract found:", priceFeedAddress);
      }

      // Get the PriceFeed contract instance
      const priceFeed = await hre.ethers.getContractAt("PriceFeed", priceFeedAddress);

      // Call the latestAnswer function on the contract
      console.log(`\nCalling latestAnswer() on PriceFeed at ${priceFeedAddress}`);
      const latestAnswer = await priceFeed.latestAnswer();
      console.log("Latest Answer:", latestAnswer.toString());

      const ss = await priceFeed.oracleProgramId();
      console.log("oracleProgramId:", ss.toString());

      const s2 = await priceFeed.dataRequestId();
      console.log("dataRequestId:", s2.toString());

      // const input = "https://github.com/mui/material-ui/pull/44131#https://github.com/mui/material-ui/issues/44130";

      // const s5 = await priceFeed.createIssue("1", "https://github.com/FidalMathew/Poke-dex/issues/12");
      // const s5 = await priceFeed.createIssue(
      //   "https://github.com/FidalMathew/Poke-dex/issues/12", 
      //   {
      //     value: ethers.utils.parseEther("0.0001")
      //   }
      // );
      // const input = "https://github.com/FidalMathew/Poke-dex/pull/13#https://github.com/FidalMathew/Poke-dex/issues/12"
      // const s5 = await priceFeed.transmit(1, input);
      // console.log("transmit:", s5.toString());

      // const s4 = await priceFeed.getAllIssues();
      // console.log("getAllIssues:", s4.toString());

      // const s3 = await priceFeed.latestAnswerIssueId(1);
      // console.log("latestAnswerIssueId:", s3.toString());



      // const s3 = await priceFeed.getRequestIds();
      // console.log("getRequestIds:", s3.toString());

      // const s2 = await priceFeed.getLatestAnswer();
      // console.log("getLatestAnswer:", s2.toString());
      // // const tnx = await priceFeed.StoreYourResult(100);


      // const s4 = await priceFeed.GetYourResult();
      // console.log("GetYourResult:", s4.toString());
      // const res: any = await priceFeed.getRequestIds();
      // console.log("GetYourResult:", res.toString());
    } catch (error: any) {
      console.error(`An error occurred while fetching the latest answer: ${error.message}`);
    }
  });