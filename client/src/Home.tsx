import {useAuthCore, useConnect, useEthereum} from "@particle-network/authkit";
import {useEffect, useState} from "react";
import useGlobalContext from "./Context/useGlobalContext";
import {encodeFunctionData, Hex} from "viem";
import {baseSepolia} from "viem/chains";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {Badge} from "@/components/ui/badge";
import {ArrowRight, Plus, Search} from "lucide-react";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import Navbar from "./components/Navbar";
import axios from "axios";
import {ReloadIcon} from "@radix-ui/react-icons";
import {ErrorMessage, Field, Form, Formik} from "formik";
import * as Yup from "yup";
import {useNavigate} from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {Label} from "./components/ui/label";

const abi = [
  {
    inputs: [],
    name: "increment",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getCounterValue",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const mockIssues = [
  {
    id: 1,
    title: "Fix login bug",
    status: "open",
    labels: ["bug", "high-priority"],
  },
  {
    id: 2,
    title: "Implement dark mode",
    status: "open",
    labels: ["feature", "ui"],
  },
  {
    id: 3,
    title: "Optimize database queries",
    status: "closed",
    labels: ["performance"],
  },
  {id: 4, title: "Add user profile page", status: "open", labels: ["feature"]},
  {
    id: 5,
    title: "Update documentation",
    status: "open",
    labels: ["documentation"],
  },
];

const Home = () => {
  const {connect, disconnect, connected, connectionStatus} = useConnect();
  const {address, chainInfo, switchChain, sendTransaction} = useEthereum();
  const {userInfo} = useAuthCore();
  const navigate = useNavigate();
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [incentiveAmount, setIncentiveAmount] = useState("");

  useEffect(() => {
    if (!connected) {
      navigate("/connect");
    }
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

  const [toggle, setToggle] = useState(false);

  const switchChain1 = async () => {
    if (connected) {
      if (toggle) {
        await switchChain(84532);
        setToggle(false);
      } else {
        await switchChain(11155111);
        setToggle(true);
      }
    }
  };

  const {walletClient, publicClient} = useGlobalContext();

  const incrementCounter = async () => {
    if (walletClient && publicClient && address) {
      await switchChain(84532);
      const tx = await walletClient.writeContract({
        abi: abi,
        functionName: "increment",
        args: [],
        address: "0xda7Bf9FC15d352F68b5f7793c9F75799C010A7E1",
        chain: baseSepolia,
        account: address as Hex,
      });

      await publicClient.waitForTransactionReceipt({hash: tx});

      const counterValue = await publicClient.readContract({
        abi: abi,
        functionName: "getCounterValue",
        args: [],
        address: "0xda7Bf9FC15d352F68b5f7793c9F75799C010A7E1" as Hex,
      });

      console.log(counterValue, "counterValue");

      // const tx = await sendTransaction({
      //   to: "0xda7Bf9FC15d352F68b5f7793c9F75799C010A7E1",
      //   data: encodeFunctionData({
      //     abi: abi,
      //     functionName: "increment",
      //     args: [],
      //   }),
      //   value: "0x0",
      // });

      // console.log(tx, "tx");
    }
  };

  const [githubIssues, setGithubIssues] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  async function fetchIssues(owner = "shadcn-ui", repo = "next-template") {
    setLoading(true);
    try {
      const {data} = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}/issues?state=all`,
        {
          headers: {
            Accept: "application/vnd.github+json",
            Authorization: `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`,
            "X-GitHub-Api-Version": "2022-11-28",
          },
        }
      );

      if (data) {
        const data1 = data.filter(
          (issues: any) => !issues.hasOwnProperty("pull_request")
        );

        setGithubIssues(data1);

        console.log(data1, "data1");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  const [verifyDialog, setVerifyDialog] = useState(false);

  return (
    <div className="h-screen w-full">
      <Navbar />

      <Dialog open={verifyDialog} onOpenChange={setVerifyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify PR</DialogTitle>
            <DialogDescription>
              <Formik initialValues={{prLink: ""}} onSubmit={() => {}}>
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
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <div
        className="w-full flex flex-col p-4 gap-5"
        style={{height: "calc(100vh - 90px)"}}
      >
        <Formik
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
                {/* Error message positioned under the input field */}

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
        </Formik>

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
                  <TableRow className="py-6 custom-row-height" key={index}>
                    <TableCell className="font-medium pl-8  ">
                      {index + 1}
                    </TableCell>
                    <TableCell className="max-w-[200px] whitespace-normal overflow-hidden text-ellipsis">
                      {item.title}
                    </TableCell>
                    <TableCell>
                      {item.state === "open" ? (
                        <Badge className="bg-green-600">Open</Badge>
                      ) : (
                        <Badge className="bg-red-600">Closed</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">-</TableCell>
                    <TableCell className="text-right pr-8">
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button
                            disabled={item.state === "closed"}
                            size="icon"
                            className="px-4 border border-slate-500"
                            variant={"outline"}
                          >
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>Drop Incentive</DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setVerifyDialog(true)}
                          >
                            Verify PR
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

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
