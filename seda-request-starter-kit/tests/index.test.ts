// import { afterEach, describe, it, expect, mock } from "bun:test";
// import { file } from "bun";
// import { testOracleProgramExecution, testOracleProgramTally } from "@seda-protocol/dev-tools"
// import { BigNumber } from 'bignumber.js'

// const WASM_PATH = "build/debug.wasm";

// const fetchMock = mock();

// afterEach(() => {
//   fetchMock.mockRestore();
// });

// describe("data request execution", () => {
//   it("should aggregate the results from the different APIs", async () => {
//     fetchMock.mockImplementation((url) => {
//       if (url.host === "api.binance.com") {
//         return new Response(JSON.stringify({ price: "2452.30000" }));
//       }

//       return new Response('Unknown request');
//     });

//     const oracleProgram = await file(WASM_PATH).arrayBuffer();

//     const vmResult = await testOracleProgramExecution(
//       Buffer.from(oracleProgram),
//       Buffer.from("eth-usdc"),
//       fetchMock
//     );

//     expect(vmResult.exitCode).toBe(0);
//     // BigNumber.js is big endian
//     const hex = Buffer.from(vmResult.result.toReversed()).toString('hex');
//     const result = BigNumber(`0x${hex}`);
//     expect(result).toEqual(BigNumber('2452300032'));
//   });

//   it('should tally all results in a single data point', async () => {
//     const oracleProgram = await file(WASM_PATH).arrayBuffer();

//     // Result from the execution test
//     let buffer = Buffer.from([0, 33, 43, 146, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
//     const vmResult = await testOracleProgramTally(Buffer.from(oracleProgram), Buffer.from('tally-inputs'), [{
//       exitCode: 0,
//       gasUsed: 0,
//       inConsensus: true,
//       result: buffer,
//     }]);

//     expect(vmResult.exitCode).toBe(0);
//     const hex = Buffer.from(vmResult.result).toString('hex');
//     const result = BigNumber(`0x${hex}`);
//     expect(result).toEqual(BigNumber('2452300032'));
//   });
// });





// --------------------------



// import { describe, it } from "bun:test";
import { file } from "bun";
import { testOracleProgramExecution } from "@seda-protocol/dev-tools";
import { afterEach, describe, it, expect, mock } from "bun:test";
// import { testOracleProgramExecution, testOracleProgramTally } from "@seda-protocol/dev-tools"
// import { BigNumber } from 'bignumber.js'

const fetchMock = mock();

afterEach(() => {
  fetchMock.mockRestore();
});


describe("MyDataRequest execution", () => {
  it("should run MyDataRequest", async () => {
    const wasmBinary = await file("build/debug.wasm").arrayBuffer();

    // Prepare the input format: "prUrl-issueUrl"
    const input = "https://github.com/mui/material-ui/pull/44131#https://github.com/mui/material-ui/issues/44130";
    // const input = "eth-usdc";
    console.log("testinggg")
    // Locally executes the Data Request
    const vmResult = await testOracleProgramExecution(
      Buffer.from(wasmBinary),
      Buffer.from(input), // Providing the input here
    );

    console.log(vmResult.stdout, "helllloooo");
  });
});
