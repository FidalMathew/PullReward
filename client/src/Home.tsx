import {useAuthCore, useConnect} from "@particle-network/authkit";
import {useEffect, useState} from "react";
import useGlobalContext from "./Context/useGlobalContext";
import {formatUnits} from "viem";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {Badge} from "@/components/ui/badge";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import Navbar from "./components/Navbar";
import axios from "axios";
import {ReloadIcon} from "@radix-ui/react-icons";
import {Field, Form, Formik} from "formik";
import {CircleCheck, CircleX, Loader2} from "lucide-react";
import {useNavigate} from "react-router-dom";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {Label} from "./components/ui/label";

// const abi = [
//   {
//     inputs: [],
//     name: "increment",
//     outputs: [],
//     stateMutability: "nonpayable",
//     type: "function",
//   },
//   {
//     inputs: [],
//     name: "getCounterValue",
//     outputs: [
//       {
//         internalType: "uint256",
//         name: "",
//         type: "uint256",
//       },
//     ],
//     stateMutability: "view",
//     type: "function",
//   },
// ];

// const mockIssues = [
//   {
//     id: 1,
//     title: "Fix login bug",
//     status: "open",
//     labels: ["bug", "high-priority"],
//   },
//   {
//     id: 2,
//     title: "Implement dark mode",
//     status: "open",
//     labels: ["feature", "ui"],
//   },
//   {
//     id: 3,
//     title: "Optimize database queries",
//     status: "closed",
//     labels: ["performance"],
//   },
//   {
//     id: 4,
//     title: "Add user profile page",
//     status: "open",
//     labels: ["feature"],
//   },
//   {
//     id: 5,
//     title: "Update documentation",
//     status: "open",
//     labels: ["documentation"],
//   },
// ];

const Home = () => {
  const {
    getAllIssues,
    shouldGiveBountyState,
    executeVerifyPRFunction,
    setShouldGiveBountyState,
    step,
    setStep,
    getLatestAnswerForIssue,
    createIssue,
    createIssueLoading,
  } = useGlobalContext();

  const {connected} = useConnect();
  const {userInfo} = useAuthCore();
  const navigate = useNavigate();
  // const [selectedIssue, setSelectedIssue] = useState<any>(null);
  // const [incentiveAmount, setIncentiveAmount] = useState("");

  useEffect(() => {
    if (!connected) {
      navigate("/connect");
    }
  }, [connected]);

  function parseGitHubIssueUrl(url: string | URL) {
    // Remove the base GitHub URL part
    const pathParts = new URL(url).pathname.split("/");

    // Extract the owner, repo, and issue number from the URL path
    const owner = pathParts[1]; // "mui"
    const repo = pathParts[2]; // "material-ui"
    const issueNumber = pathParts[4]; // "44130"

    return {owner, repo, issueNumber};
  }

  useEffect(() => {
    const fetchIssues = async () => {
      if (connected) {
        // await switchChain(84532);
        const res_issues = await getAllIssues();
        console.log("getAllIssues", res_issues);

        // for( issue: res_issues){

        //   const { owner, repo, issueNumber } = parseGitHubIssueUrl(issue.issueUrl);
        // }

        const temp: any[] = [];
        for (const issue of res_issues as unknown as any[]) {
          console.log(issue, "issue----");
          const {owner, repo, issueNumber} = parseGitHubIssueUrl(
            issue.issueUrl
          );

          const {data} = await axios.get(
            `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`,
            {
              headers: {
                Accept: "application/vnd.github+json",
                Authorization: `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`,
                "X-GitHub-Api-Version": "2022-11-28",
              },
            }
          );

          console.log(data, "data");

          temp.push({
            id: issue.id,
            issueUrl: data.html_url,
            title: data.title,
            state: issue.merged ? "closed" : "open",
            incentive: formatUnits(issue.bounty, 18),
            labels: data.labels.map((label: any) => label.name),
          });
        }

        console.log(temp, "temp");
        setGithubIssues(temp);
        // setIssues(data);
      }
    };
    fetchIssues();
  }, [connected]);

  // const addIncentive = () => {
  //   if (selectedIssue && incentiveAmount) {
  //     setIssues(
  //       issues.map((issue: any) =>
  //         issue.id === selectedIssue.id
  //           ? {...issue, incentive: parseFloat(incentiveAmount)}
  //           : issue
  //       )
  //     );
  //     setSelectedIssue(null);
  //     setIncentiveAmount("");
  //   }
  // };

  console.log(userInfo, "userInfo");

  // Handle user logout

  // const [toggle, setToggle] = useState(false);

  // const switchChain1 = async () => {
  //   if (connected) {
  //     if (toggle) {
  //       await switchChain(84532);
  //       setToggle(false);
  //     } else {
  //       await switchChain(11155111);
  //       setToggle(true);
  //     }
  //   }
  // };

  // const {walletClient, publicClient} = useGlobalContext();

  // const incrementCounter = async () => {
  //   if (walletClient && publicClient && address) {
  //     await switchChain(84532);
  //     const tx = await walletClient.writeContract({
  //       abi: abi,
  //       functionName: "increment",
  //       args: [],
  //       address: "0xda7Bf9FC15d352F68b5f7793c9F75799C010A7E1",
  //       chain: baseSepolia,
  //       account: address as Hex,
  //     });

  //     await publicClient.waitForTransactionReceipt({hash: tx});

  //     const counterValue = await publicClient.readContract({
  //       abi: abi,
  //       functionName: "getCounterValue",
  //       args: [],
  //       address: "0xda7Bf9FC15d352F68b5f7793c9F75799C010A7E1" as Hex,
  //     });

  //     console.log(counterValue, "counterValue");

  //     // const tx = await sendTransaction({
  //     //   to: "0xda7Bf9FC15d352F68b5f7793c9F75799C010A7E1",
  //     //   data: encodeFunctionData({
  //     //     abi: abi,
  //     //     functionName: "increment",
  //     //     args: [],
  //     //   }),
  //     //   value: "0x0",
  //     // });

  //     // console.log(tx, "tx");
  //   }
  // };

  const [loading, _] = useState(false);
  const [githubIssues, setGithubIssues] = useState<any>([]);

  // async function fetchIssues(
  //   owner = "shadcn-ui",
  //   repo = "next-template",
  //   issueNumber: number
  // ) {
  //   setLoading(true);
  //   try {
  //     const {data} = await axios.get(
  //       `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`,
  //       {
  //         headers: {
  //           Accept: "application/vnd.github+json",
  //           Authorization: `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`,
  //           "X-GitHub-Api-Version": "2022-11-28",
  //         },
  //       }
  //     );

  //     if (data) {
  //       const data1 = data.filter(
  //         (issues: any) => !issues.hasOwnProperty("pull_request")
  //       );

  //       setGithubIssues(data1);

  //       console.log(data1, "data1");
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   } finally {
  //     setLoading(false);
  //   }
  // }

  const [verifyDialog, setVerifyDialog] = useState(false);
  const [bountyModal, setBountyModal] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (verifyDialog === false) {
      setStep(0);
      setShouldGiveBountyState({
        verifyPROwnerLoading: false,
        verifyPROwnerSuccess: false,
        verifyPROwnerError: null,
        prAndIssueMatchingLoading: false,
        prAndIssueMatchingSuccess: false,
        prAndIssueMatchingError: null,
      });
    }
  }, [verifyDialog]);

  console.log(shouldGiveBountyState, "shouldGiveBountyState");

  return (
    <div className="h-screen w-full">
      <Navbar />
      <Dialog open={verifyDialog} onOpenChange={setVerifyDialog}>
        <DialogContent
          onEscapeKeyDown={(e) => e.preventDefault()}
          onInteractOutside={(e) => {
            e.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle>Verify PR</DialogTitle>
            <DialogDescription>
              {step === 0 ? (
                <Formik
                  initialValues={{prLink: ""}}
                  onSubmit={(values) => {
                    const inputValue =
                      values.prLink + "#" + githubIssues[index].issueUrl;
                    console.log(inputValue, "inputValue");
                    // setVerifyDialog(false);
                    // setOpenShouldGiveBountyModal(true);
                    // transmitDataRequest(githubIssues[index].id, inputValue);

                    setStep(1);

                    executeVerifyPRFunction(githubIssues[index].id, inputValue);
                  }}
                >
                  {(formik) => (
                    <Form className="flex flex-col gap-4">
                      <div className="my-5 mb-3 flex flex-col w-full gap-4">
                        <Label htmlFor="prLink">Enter your PR Link</Label>
                        <Field
                          as={Input}
                          name="prLink"
                          id="prLink"
                          placeholder="Enter your PR Link"
                          className={`bg-white max-w-2xl focus-visible:ring-0 ${
                            formik.errors.prLink && formik.touched.prLink
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                        />
                      </div>

                      <Button type="submit" size="lg" className="w-full">
                        Verify PR
                      </Button>
                    </Form>
                  )}
                </Formik>
              ) : step === 1 ? (
                <div className="w-full h-full flex flex-col mt-5 font-sans text-black text-left">
                  <div className="w-full h-[80px] flex items-center px-4">
                    <div className="flex flex-col w-full">
                      <p className="text-xl w-full">Verify PR Owner</p>
                      <p className="text-xs text-blue-800 max-w-sm truncate">
                        {/* {shouldGiveBountyState.verifyPROwnerSuccess && (
                          <a href={`${ipfsUri}`} target="_blank">
                            {" "}
                            {`${ipfsUri}`}
                          </a>
                        )} */}
                        {shouldGiveBountyState.verifyPROwnerError && (
                          <p className="text-red-700">
                            {shouldGiveBountyState.verifyPROwnerError}
                          </p>
                        )}
                      </p>
                    </div>
                    {shouldGiveBountyState.verifyPROwnerLoading ? (
                      <ReloadIcon className="h-5 w-5 animate-spin" />
                    ) : shouldGiveBountyState.verifyPROwnerSuccess ? (
                      <CircleCheck className="h-9 w-9 fill-green-700 text-white" />
                    ) : (
                      shouldGiveBountyState.verifyPROwnerError !== null && (
                        <CircleX className="h-9 w-9 fill-red-700 text-white" />
                      )
                    )}
                  </div>
                  <div className="w-full h-[80px] flex items-center px-4">
                    <div className="flex flex-col w-full">
                      <p className="text-xl w-full">Transmit Request to Seda</p>
                      <p className="text-xs text-blue-800 max-w-sm truncate">
                        {/* https://explorer.story.foundation/ipa/0x5Ec29EA9fFfd4176f3E09B1Eb5c163adc8744c3D */}
                        {shouldGiveBountyState.prAndIssueMatchingError && (
                          <p className="text-red-700">
                            {shouldGiveBountyState.prAndIssueMatchingError}
                          </p>
                        )}
                      </p>
                    </div>
                    {shouldGiveBountyState.prAndIssueMatchingLoading ? (
                      <ReloadIcon className="h-5 w-5 animate-spin" />
                    ) : shouldGiveBountyState.prAndIssueMatchingSuccess ? (
                      <CircleCheck className="h-9 w-9 fill-green-700 text-white" />
                    ) : (
                      shouldGiveBountyState.prAndIssueMatchingError !==
                        null && (
                        <CircleX className="h-9 w-9 fill-red-700 text-white" />
                      )
                    )}
                  </div>
                </div>
              ) : (
                step === 2 && (
                  <div className="w-full flex justify-center items-center flex-col">
                    <div className="p-5">
                      {shouldGiveBountyState.isClaimableLoading ? (
                        <Loader2 className="animate-spin h-20 w-20" />
                      ) : shouldGiveBountyState.isClaimableSuccess ? (
                        <div className="flex justify-center flex-col items-center gap-5">
                          <CircleCheck className="h-20 w-20 text-green-700" />
                          <p className="text-green-700">Bounty Claimable</p>
                        </div>
                      ) : (
                        <div className="flex justify-center flex-col items-center gap-5">
                          <CircleX className="h-20 w-20 text-red-700" />
                          <p className="text-red-700">Bounty Not Claimable</p>
                        </div>
                      )}
                    </div>
                    <div className="w-full">
                      <Button
                        className="w-full"
                        onClick={
                          () => getLatestAnswerForIssue(githubIssues[index].id)
                          // executeWithValidAnswer(githubIssues[index].id)
                        }
                        // @ts-ignore
                        disabled={
                          shouldGiveBountyState.isClaimableLoading ||
                          shouldGiveBountyState.isClaimableError
                        }
                      >
                        Claim Bounty
                      </Button>
                    </div>
                  </div>
                )
              )}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Dialog open={bountyModal} onOpenChange={setBountyModal}>
        <DialogContent
          onEscapeKeyDown={(e) => e.preventDefault()}
          onInteractOutside={(e) => {
            e.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle>Drop Bounty on Issue</DialogTitle>
            <DialogDescription>
              <Formik
                initialValues={{issueUrl: "", bountyAmount: 0}}
                onSubmit={(values, _) => {
                  createIssue(values.issueUrl, values.bountyAmount.toString());
                }}
              >
                {(formik) => (
                  <Form className="flex flex-col gap-4 pt-4">
                    <div className="flex flex-col w-full gap-4">
                      <Label htmlFor="issueUrl">Issue Link</Label>
                      <Field
                        as={Input}
                        name="issueUrl"
                        id="issueUrl"
                        placeholder="Enter your Issue Link"
                        className={`bg-white max-w-2xl focus-visible:ring-0 ${
                          formik.errors.issueUrl && formik.touched.issueUrl
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                    </div>
                    <div className="flex flex-col w-full gap-4">
                      <Label htmlFor="issueUrl">Bounty Amount</Label>
                      <Field
                        as={Input}
                        name="bountyAmount"
                        id="bountyAmount"
                        placeholder="Enter Bounty Amount"
                        className={`bg-white max-w-2xl focus-visible:ring-0 ${
                          formik.errors.bountyAmount &&
                          formik.touched.bountyAmount
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                    </div>
                    {createIssueLoading ? (
                      <Button disabled>
                        <Loader2 className="w-full animate-spin" />
                        Please wait
                      </Button>
                    ) : (
                      <Button type="submit" size="lg" className="w-full">
                        Submit
                      </Button>
                    )}
                  </Form>
                )}
              </Formik>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <div
        className="w-full flex flex-col p-4 gap-5 justify-end"
        style={{height: "calc(100vh - 90px)"}}
      >
        {/* <Formik
          initialValues={{repoLink: ""}}
          onSubmit={async (values, _) => {
            const arr = values.repoLink.split("/");
            const repo = arr[arr.length - 1];
            await fetchIssues(arr[arr.length - 2], repo);
          }}
          validationSchema={Yup.object().shape({
            repoLink: Yup.string()
              .url("Please enter a valid URL")
              .matches(
                /^https:\/\/(www\.)?github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+/,
                "Please enter a valid GitHub repository URL"
              )
              .required("Repository link is required"),
          })}
        >
          {(formik) => (
            <Form className="max-w-xl flex items-start gap-2">
              <div className="flex flex-col w-full justify-start">
                <Field
                  as={Input}
                  name="repoLink"
                  id="repoLink"
                  placeholder="Enter your Repo Link"
                  className={`bg-white max-w-2xl focus-visible:ring-0 ${
                    formik.errors.repoLink && formik.touched.repoLink
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />


                <ErrorMessage name="repoLink">
                  {(msg) => (
                    <div className="text-red-500 text-xs mt-1">{msg}</div>
                  )}
                </ErrorMessage>
              </div>

              <Button size="icon" className="px-4" type="submit">
                <Search className="h-4 w-4 shadow-none" />
              </Button>

              {githubIssues && githubIssues.length > 0 && (
                <div className="">
                  <p className="mt-[8px] text-sm w-[150px]">
                    {githubIssues.length} Issues Found
                  </p>
                </div>
              )}
            </Form>
          )}
            
        </Formik> */}

        <Button
          className="w-fit"
          variant={"outline"}
          onClick={() => setBountyModal((prev) => !prev)}
        >
          Create Bounty for Issues
        </Button>

        <div className="h-full w-full bg-white rounded-lg border border-slate-800 overflow-y-scroll">
          {githubIssues && loading && (
            <div className="p-7 flex justify-center items-center h-full w-full">
              <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
            </div>
          )}
          {githubIssues && !loading && githubIssues.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow className="custom-header-height">
                  <TableHead className="w-[100px] pl-8  ">ID</TableHead>
                  <TableHead>Issue</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Incentive</TableHead>
                  <TableHead className="text-right pr-8">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="min-h-[300px]">
                {githubIssues.map((item: any, index: number) => (
                  <>
                    <TableRow className="py-6 custom-row-height" key={index}>
                      <TableCell className="font-medium pl-8  ">
                        {index + 1}
                      </TableCell>
                      <TableCell className="max-w-[200px] whitespace-normal overflow-hidden text-ellipsis">
                        {item.title}
                      </TableCell>
                      <TableCell className="">
                        {item.state === "open" ? (
                          <Badge className="bg-green-600 hover:bg-green-600">
                            Open
                          </Badge>
                        ) : (
                          <Badge className="bg-red-600 hover:bg-red-600">
                            Closed
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {item.incentive} ETH
                      </TableCell>
                      <TableCell className="text-right pr-8">
                        <Button
                          disabled={item.state === "closed"}
                          className="px-4 border border-slate-500"
                          variant={"outline"}
                          onClick={() => {
                            setVerifyDialog(true);
                            setIndex(index);
                          }}
                        >
                          Verify PR
                        </Button>
                      </TableCell>
                    </TableRow>
                  </>
                ))}
              </TableBody>
            </Table>
          )}

          {/* <Button onClick={()=>}> Hello</Button> */}

          <div className="">
            {githubIssues && githubIssues.length === 0 && !loading && (
              <div className="p-7 text-center">
                <p>No issues found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
