"use client"
import { useAccount } from "wagmi"
import { useEffect, useState } from "react"
import { useNotification } from "@web3uikit/core"
import { ethers } from "ethers"
import { useEvmRunContractFunction } from "@moralisweb3/next"
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseEther } from 'viem';

import { contractAddresses, abi } from "../constants"

export default function LotteryEntrance() {
    const { isConnected, chain } = useAccount()
    console.log(isConnected);
    // These get re-rendered every time due to our connect button!
    const chainId = parseInt(chain?.id)
    // console.log(`ChainId is ${chainId}`)
    const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId] : null
    console.log(`chainId ${chainId}`);
    
    console.log(`raffleAddress ${raffleAddress}`);

    // State hooks
    // https://stackoverflow.com/questions/58252454/react-hooks-using-usestate-vs-just-variables
    const [entranceFee, setEntranceFee] = useState("0")
    const [numberOfPlayers, setNumberOfPlayers] = useState("0")
    const [recentWinner, setRecentWinner] = useState("0")

    const dispatch = useNotification()

    // const {
    //     runContractFunction: enterRaffle,
    //     data: enterTxResponse,
    //     isLoading,
    //     isFetching,
    // } = useWeb3Contract({
    //     abi: abi,
    //     contractAddress: raffleAddress,
    //     functionName: "enterRaffle",
    //     msgValue: entranceFee,
    //     params: {},
    // })

    // const {
    //     runContractFunction: enterRaffle,
    //     data: enterTxResponse,
    //     isLoading,
    //     isFetching,
    // } = useEvmRunContractFunction({
    //     chain: "0xaa36a7",
    //     abi: abi,
    //     address: raffleAddress,
    //     functionName: "enterRaffle",
    //     msgValue: entranceFee,
    //     params: {},
    // })

    /* View Functions */

    const { data: entranceFeeTxResponse, error: entranceFeeError } = useEvmRunContractFunction({
        chain: "0xaa36a7",
        abi,
        address: raffleAddress, // specify the networkId
        functionName: "getEntranceFee",
        params: {},
    })

    const { data: getNumberOfPlayersTxResponse, error: getNumberOfPlayersError } =
        useEvmRunContractFunction({
            chain: "0xaa36a7",
            abi,
            address: raffleAddress,
            functionName: "getNumberOfPlayers",
            params: {},
        })

    const { data: getRecentWinnerTxResponse, error: getRecentWinnerError } = useEvmRunContractFunction({
        chain: "0xaa36a7",
        abi,
        address: raffleAddress,
        functionName: "getRecentWinner",
        params: {},
    })
    console.log(`getRecentWinnerTxResponse ${getRecentWinnerTxResponse}`);
   

    useEffect(() => {
        if (isConnected) {
            setEntranceFee(entranceFeeTxResponse);
            setNumberOfPlayers(getNumberOfPlayersTxResponse);
            setRecentWinner(getRecentWinnerTxResponse);
        }
    }, [isConnected, entranceFeeTxResponse, getNumberOfPlayersTxResponse, getRecentWinnerTxResponse])
    // no list means it'll update everytime anything changes or happens
    // empty list means it'll run once after the initial rendering
    // and dependencies mean it'll run whenever those things in the list change

    // An example filter for listening for events, we will learn more on this next Front end lesson
    // const filter = {
    //     address: raffleAddress,
    //     topics: [
    //         // the name of the event, parnetheses containing the data type of each event, no spaces
    //         utils.id("RaffleEnter(address)"),
    //     ],
    // }

    const handleNewNotification = () => {
        dispatch({
            type: "info",
            message: "Transaction Complete!",
            title: "Transaction Notification",
            position: "topR",
            icon: "bell",
        })
    }

    const handleSuccess = async (tx) => {
        try {
            await tx.wait(1)
            updateUIValues()
            handleNewNotification(tx)
        } catch (error) {
            console.log(error)
        }
    }

    
    console.log(getNumberOfPlayersTxResponse);

    const { data: lastTime } = useReadContract({
        chain: "0xaa36a7",
        abi,
        address: raffleAddress,
        functionName: 'getLatestTimeStamp',
        args: [],
    });
    console.log(`lastTime ${lastTime}`)
    console.log(`raffleAddress ${raffleAddress}`)

   

    const { data: hash, error: writeContractError,failureReason, status: writeContractStatus, isPending, writeContract } = useWriteContract();
    console.log(`status: ${writeContractStatus}`);
    console.log(`error: ${writeContractError}`);
    console.log(`failureReason: ${failureReason}`)

    const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    })

    const enterRaffle = async () => {
        await writeContract({ 
            abi,
            address: raffleAddress,
            functionName: 'enterRaffle',
            value: parseEther('0.01')
         });
    }


    return (
        <div className="p-5">
            <h1 className="py-4 px-4 font-bold text-3xl">Lottery</h1>
            {raffleAddress ? (
                <>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
                        onClick={enterRaffle}
                        disabled={ isPending || isConfirming}
                    >
                        {/* { isPending || isConfirming ? (
                            <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
                        ) : (
                            "Enter Raffle"
                        )} */}
                        Enter Raffle
                    </button>
                    <div>Entrance Fee: {entranceFee && ethers.formatUnits(entranceFee, "ether")} ETH</div>
                    <div>The current number of players is: {numberOfPlayers}</div>
                    <div>The most previous winner was: {recentWinner}</div>
                </>
            ) : (
                <div>Please connect to a supported chain </div>
            )}
        </div>
    )
}
