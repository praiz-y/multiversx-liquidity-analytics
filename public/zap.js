import { Address, Transaction, TransactionPayload, TokenPayment } from "@multiversx/sdk-core";
// In vanilla JS without a bundler, you might load these from a CDN or use a simple build tool.

async function zapIn(poolAddress, amountEgldToZap) {
    console.log(`⚡ Zapping ${amountEgldToZap} EGLD into pool ${poolAddress}...`);

    // Step 1: Calculate the split (50% for swap, 50% for liquidity)
    // We keep a tiny buffer for gas fees.
    const amountToSwap = amountEgldToZap / 2;
    const amountToKeep = amountEgldToZap / 2;

    // Step 2: Construct the Swap Transaction (EGLD -> MEX)
    // We call the 'swap' function on the DEX smart contract
    const swapPayload = TransactionPayload.fromEncoded(
        `swapFixedInput@${TokenPayment.egldFromAmount(amountToSwap).toHex()}`
    );

    const txSwap = new Transaction({
        receiver: new Address(poolAddress), // The DEX contract
        value: TokenPayment.egldFromAmount(amountToSwap),
        data: swapPayload,
        gasLimit: 10000000 // Estimation
    });

    // Step 3: Construct the Add Liquidity Transaction
    // We call the 'addLiquidity' function. 
    // Note: In a real Zap, we need the output from Step 2 to know exactly how much MEX we have.
    // For this MVP version, we chain the transactions optimistically.
    
    const addLiquidityPayload = TransactionPayload.fromEncoded(
        `addLiquidity@${TokenPayment.egldFromAmount(amountToKeep).toHex()}@...` // simplified arguments
    );

    const txAddLiq = new Transaction({
        receiver: new Address(poolAddress),
        value: TokenPayment.egldFromAmount(amountToKeep),
        data: addLiquidityPayload,
        gasLimit: 10000000
    });

    // Step 4: Bundle and Send
    // The wallet provider (e.g., xPortal) will ask the user to sign this batch.
    await window.walletProvider.signTransactions([txSwap, txAddLiq]);
    
    alert("⚡ Zap Transactions Sent! Watch your wallet.");
}