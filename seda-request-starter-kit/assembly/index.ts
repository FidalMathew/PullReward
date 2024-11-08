// import { executionPhase } from "./execution-phase";
// import { tallyPhase } from "./tally-phase";
// import { OracleProgram } from "@seda-protocol/as-sdk/assembly";

/**
 * Defines a price feed oracle program that performs two main tasks:
 * 1. Fetches non-deterministic price data from external sources during the execution phase.
 * 2. Aggregates the results from multiple executors in the tally phase and calculates the median.
 */
// class PriceFeed extends OracleProgram {
//   execution(): void {
//     executionPhase();
//   }

//   tally(): void {
//     tallyPhase();
//   }
// }

// // Runs the price feed oracle program by executing both phases.
// new PriceFeed().run();



// --------------------  New Code 

import {  Tally, Bytes, Console, httpFetch, OracleProgram, Process, u128 } from "@seda-protocol/as-sdk/assembly";

// API response structure for PR verification
@json
class VerifyPRResponse {
  result!: string; // Assuming result is an integer (1 or 0)
}

// Request payload structure for verifying PR
@json
class VerifyPRRequest {
  prUrl!: string;
  issueUrl!: string;
}

// Class for verifying pull requests
class MyDataRequest extends OracleProgram {
  execution(): void {
    // Input format: "prUrl#issueUrl" (e.g., "https://github.com/mui/material-ui/pull/44131-https://github.com/mui/material-ui/issues/44130")
    const drInputsRaw = Process.getInputs().toUtf8String();
    // Console.log(`Verifying PR with URLs: ${drInputsRaw}`);

    // Split the input string into prUrl and issueUrl
    const drInputs = drInputsRaw.split("#");
    
    // Console.log(drInputs.length)
   
    // Validate the input
    if (drInputs.length !== 2) {
      Process.error(Bytes.fromUtf8String("Invalid input format. Expected format: prUrl-issueUrl"));
      return; // Ensure no further execution
    }
    
    const prUrl = drInputs[0];
    const issueUrl = drInputs[1];



    // Prepare the request payload
    const payload = new VerifyPRRequest();
    payload.prUrl = prUrl;
    payload.issueUrl = issueUrl;


    // Console.log(payload)
    // Prepare headers for the request
    const headers = new Map<string, string>();
    headers.set('Content-Type', 'application/json');

    // Make a POST request to verify the PR
    const response = httpFetch("https://beam-f9gu.onrender.com/verifyPR", {
      headers,
      method: "POST",
      body: Bytes.fromJSON(payload),
    });

    Console.log(response.bytes.toUtf8String())
    Console.log("response")
    // Ensure the fetch call has succeeded
    if (!response.ok) {
      Process.error(Bytes.fromUtf8String("Could not fetch API endpoint"));
    }

    // Parse the response
    const data = response.bytes.toJSON<VerifyPRResponse>();

    //   const priceFloat = f32.parse(data.price);
    // if (isNaN(priceFloat)) {
    //   // Report the failure to the SEDA network with an error code of 1.
    //   Process.error(Bytes.fromUtf8String(`Error while parsing price data: ${data.price}`));
    // }
    // const result = u128.from(priceFloat * 1000000);

    const result = f32.parse(data.result);

    if(isNaN(result)) {
      Process.error(Bytes.fromUtf8String(`Error while parsing price data: ${data.result}`));
    }

    const finalResult = u128.from(result);

    Console.log(`${finalResult}: dataaa`)
    // Log the result
    Console.log(`Verification result: ${finalResult}`);

    Process.success(Bytes.fromNumber<u128>(finalResult));

    // Return the result

    // Report the successful result back to the SEDA network.
    // Process.success(Bytes.fromNumber<u128>(u128.from(data.result)));
    
    // Process.success(Bytes.fromNumber<usize>(data.result));
  }

  tally(): void {
    // throw new Error("Not implemented");
    //   // Retrieve consensus reveals from the tally phase.
    const reveals = Tally.getReveals();
    const prices: u128[] = [];

    // Iterate over each reveal, parse its content as an unsigned integer (u64), and store it in the prices array.
    for (let i = 0; i < reveals.length; i++) {
      const price = reveals[i].reveal.toU128();
      prices.push(price);
    }

    if (prices.length > 0) {
      // If there are valid prices revealed, calculate the median price from price reports.
      // const finalPrice = median(prices);
      const finalPrice = prices[prices.length-1];

      // Report the successful result in the tally phase, encoding the result as bytes.
      // Encoding result with big endian to decode from EVM contracts.
      Process.success(Bytes.fromNumber<u128>(finalPrice, true));
    } else {
      // If no valid prices were revealed, report an error indicating no consensus.
      Process.error(Bytes.fromUtf8String("No consensus among revealed results"));
    }

  }
}

// Execute the program
new MyDataRequest().run();


// @json
// class PriceFeedResponse {
//   price!: string;
// }


// // Class for verifying pull requests
// class MyDataRequest extends OracleProgram {
//   execution(): void {

//     const drInputsRaw = Process.getInputs().toUtf8String();

//     // Log the asset pair being fetched as part of the Execution Standard Out.
//     Console.log(`Fetching price for pair: ${drInputsRaw}`);
  
//     // Split the input string into symbolA and symbolB.
//     // Example: "ETH-USDC" will be split into "ETH" and "USDC".
//     const drInputs = drInputsRaw.split("-");
//     const symbolA = drInputs[0];
//     const symbolB = drInputs[1];
//    // Make an HTTP request to a price feed API to get the price for the symbol pair.
//   const response = httpFetch(
//     `https://api.binance.com/api/v3/ticker/price?symbol=${symbolA.toUpperCase()}${symbolB.toUpperCase()}`
//   );

//   // Check if the HTTP request was successfully fulfilled.
//   if (!response.ok) {
//     // Handle the case where the HTTP request failed or was rejected.
//     Console.error(
//       `HTTP Response was rejected: ${response.status.toString()} - ${response.bytes.toUtf8String()}`
//     );
//     // Report the failure to the SEDA network with an error code of 1.
//     Process.error(Bytes.fromUtf8String("Error while fetching price feed"));
//   }

//   // Parse the API response as defined earlier.
//   const data = response.bytes.toJSON<PriceFeedResponse>();

//   // Convert to integer (and multiply by 1e6 to avoid losing precision).
//   const priceFloat = f32.parse(data.price);
//   if (isNaN(priceFloat)) {
//     // Report the failure to the SEDA network with an error code of 1.
//     Process.error(Bytes.fromUtf8String(`Error while parsing price data: ${data.price}`));
//   }
//   const result = u128.from(priceFloat * 1000000);

//   // Console.log(result);
//   // Report the successful result back to the SEDA network.
//   Process.success(Bytes.fromNumber<u128>(result));
//   }

//   tally(): void {
//     // throw new Error("Not implemented");

//   // Retrieve consensus reveals from the tally phase.
//   const reveals = Tally.getReveals();
//   const prices: u128[] = [];

//   // Iterate over each reveal, parse its content as an unsigned integer (u64), and store it in the prices array.
//   for (let i = 0; i < reveals.length; i++) {
//     const price = reveals[i].reveal.toU128();
//     prices.push(price);
//   }

//   if (prices.length > 0) {
//     // If there are valid prices revealed, calculate the median price from price reports.
//     // const finalPrice = median(prices);
//     const finalPrice = prices[prices.length-1];

//     // Report the successful result in the tally phase, encoding the result as bytes.
//     // Encoding result with big endian to decode from EVM contracts.
//     Process.success(Bytes.fromNumber<u128>(finalPrice, true));
//   } else {
//     // If no valid prices were revealed, report an error indicating no consensus.
//     Process.error(Bytes.fromUtf8String("No consensus among revealed results"));
//   }
//   }

  
// }

// function median(numbers: u128[]): u128 {
//   const sorted: u128[] = numbers.sort();
//   const middle = i32(Math.floor(sorted.length / 2));

//   if (sorted.length % 2 === 0) {
//     return u128.div(u128.add(sorted[middle - 1], sorted[middle]), u128.from(2));
//   }

//   return sorted[middle];
// }

// // Execute the program
// new MyDataRequest().run();
