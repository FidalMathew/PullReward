import { Bytes, Console, httpFetch, OracleProgram, Process } from "@seda-protocol/as-sdk/assembly";

// API response structure for PR verification
@json
class VerifyPRResponse {
  result!: i32; // Assuming result is an integer (1 or 0)
}

// Class for verifying pull requests
export class MyDataRequest extends OracleProgram {
  execution(): void {
    // Input format: "prUrl-issueUrl" (e.g., "https://github.com/mui/material-ui/pull/44131-https://github.com/mui/material-ui/issues/44130")
    const drInputsRaw = Process.getInputs().toUtf8String();
    Console.log(`Verifying PR with URLs: ${drInputsRaw}`);

    // Split the input string into prUrl and issueUrl
    const drInputs = drInputsRaw.split("-");

    Console.log(drInputs)
    const prUrl = drInputs[0];
    const issueUrl = drInputs[1];

    Console.log(`${prUrl} : ${issueUrl}`)

    // Prepare the request payload as a JSON object
    const payload = {
      prUrl: prUrl,
      issueUrl: issueUrl,
    };

    // Prepare headers for the request
    const headers = new Map<string, string>();
    headers.set('Content-Type', 'application/json');

    // Make a POST request to verify the PR
    const response = httpFetch("http://localhost:8000/verifyPR", {
      headers,
      method: "POST",
      body: Bytes.fromJSON(payload),
    });

    Console.log( `response ${response}`);

    // Ensure the fetch call has succeeded
    if (!response.ok) {
      Process.error(Bytes.fromUtf8String("Could not fetch API endpoint"));
    }

    // Parse the response
    const data = response.bytes.toJSON<VerifyPRResponse>();

    // Log the result
    Console.log(`Verification result: ${data.result}`);

    // Optionally, you can return the result if needed.
    Process.success(Bytes.fromNumber<i32>(data.result));
  }

  tally(): void {
    throw new Error("Not implemented");
  }
}

// Execute the program
new MyDataRequest().run();




// import {
//   Bytes,
//   Console,
//   Process,
//   httpFetch,
//   u128,
// } from "@seda-protocol/as-sdk/assembly";

// // API response structure for the price feed
// @json
// class PriceFeedResponse {
//   price!: string;
// }

// /**
//  * Executes the data request phase within the SEDA network.
//  * This phase is responsible for fetching non-deterministic data (e.g., price of an asset pair)
//  * from an external source such as a price feed API. The input specifies the asset pair to fetch.
//  */
// export function executionPhase(): void {
//   // Retrieve the input parameters for the data request (DR).
//   // Expected to be in the format "symbolA-symbolB" (e.g., "BTC-USDT").
//   const drInputsRaw = Process.getInputs().toUtf8String();

//   // Log the asset pair being fetched as part of the Execution Standard Out.
//   Console.log(`Fetching price for pair: ${drInputsRaw}`);

//   // Split the input string into symbolA and symbolB.
//   // Example: "ETH-USDC" will be split into "ETH" and "USDC".
//   const drInputs = drInputsRaw.split("-");
//   const symbolA = drInputs[0];
//   const symbolB = drInputs[1];

//   // Make an HTTP request to a price feed API to get the price for the symbol pair.
//   // The URL is dynamically constructed using the provided symbols (e.g., ETHUSDC).
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

//   // Report the successful result back to the SEDA network.
//   Process.success(Bytes.fromNumber<u128>(result));
// }






// ------------------------


