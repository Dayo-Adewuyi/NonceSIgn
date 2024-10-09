"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import LandingPage from "./LandingPage";
import Dashboard from "./dashboard/page";

export default function Home() {
  const account = useAccount();
  console.log(account);
  return <>{account.isConnected ? <Dashboard /> : <LandingPage />}</>;
}
