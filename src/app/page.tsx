"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import LandingPage from "./LandingPage";
import Dashboard from "./dashboard/page";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export default function Home() {
  const account = useAccount();
  console.log(account);
  return (
    <>
      {account.isConnected ? <Dashboard /> : <LandingPage />}
      <ToastContainer />
    </>
  );
}
