import React from "react";
import { Transaction } from "@coinbase/onchainkit/transaction";

const TransactionWrapper: React.FC<any> = (props) => {
  return <Transaction {...props} />;
};

export default TransactionWrapper;
