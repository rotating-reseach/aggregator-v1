import { AddressLookupTableAccount, Keypair, PublicKey, RpcResponseAndContext, SignatureResult, SimulatedTransactionResponse, TransactionInstruction, TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { FaucetClient } from "@tkkinn/token-faucet-sdk";
import { createTransferInstruction, getAssociatedTokenAddressSync } from "@solana/spl-token";
import { confirmTransaction } from "@solana-developers/helpers";

export async function v0_pack(instructions: TransactionInstruction[], signer?: Keypair, lookupTable?: AddressLookupTableAccount[]): Promise<VersionedTransaction> {
    const provider = anchor.AnchorProvider.env();
    const wallet = anchor.Wallet.local();
    const blockhash = await provider.connection
    .getLatestBlockhash()
    .then(res => res.blockhash);

    const messageV0 = new TransactionMessage({
        payerKey: wallet.publicKey,
        recentBlockhash: blockhash,
        instructions,
    }).compileToV0Message(lookupTable);
    
    const transaction = new VersionedTransaction(messageV0);
    transaction.sign([wallet.payer]);
    if (signer) {
        transaction.sign([signer]);
    }

    return transaction;
}

export async function getLogs(signature: string): Promise<void> {
    const connection = anchor.AnchorProvider.env().connection;
    
    const block = await connection.getLatestBlockhash();
    const rpcResponse = await connection.confirmTransaction(
        {
            signature,
            ...block,
        },
        "confirmed"
    );
    const txDetails = await connection.getTransaction(signature, {
        maxSupportedTransactionVersion: 0,
        commitment: "confirmed",
      });

    console.log("")
    console.log(txDetails?.meta?.logMessages);
    console.log("")

    const error = rpcResponse.value.err;
    if (error) {
      // Can be a string or an object (literally just {}, no further typing is provided by the library)
      // https://github.com/solana-labs/solana-web3.js/blob/4436ba5189548fc3444a9f6efb51098272926945/packages/library-legacy/src/connection.ts#L2930
      // TODO: if still occurs in web3.js 2 (unlikely), fix it.
      if (typeof error === "object") {
        const errorKeys = Object.keys(error);
        if (errorKeys.length === 1) {
          if (errorKeys[0] !== "InstructionError") {
            throw new Error(`Unknown RPC error: ${error}`);
          }
          // @ts-ignore due to missing typing information mentioned above.
          const instructionError = error["InstructionError"];
          // An instruction error is a custom program error and looks like:
          // [
          //   1,
          //   {
          //     "Custom": 1
          //   }
          // ]
          // See also https://solana.stackexchange.com/a/931/294
          throw new Error(
            `Error in transaction: instruction index ${instructionError[0]}, custom program error ${instructionError[1]["Custom"]}`,
          );
        }
      }
      throw new Error(error.toString());
    }
}

export async function createToken(token_symbol: string, token_decimals: number): Promise<string> {
    const provider = anchor.AnchorProvider.env();
    const wallet = anchor.Wallet.local();
    const tokenClient = new FaucetClient({wallet, provider});

    const tx = await tokenClient.createToken(token_symbol, token_decimals, token_symbol, token_symbol);
    return tx;
}

export async function mintToken(token_symbol: string, amount: number, target?: PublicKey): Promise<string> {
    const provider = anchor.AnchorProvider.env();
    const wallet = anchor.Wallet.local();
    const tokenClient = new FaucetClient({wallet, provider});

    if (!target) {
        const tx = await tokenClient.mintToken(token_symbol, amount);
        return tx;
    } else {
        const mint_token = await tokenClient.buildMintTokenTx(token_symbol, amount);
        const mintPDA = tokenClient.findTokenMintAddress(token_symbol);
        const source_ata = getAssociatedTokenAddressSync(mintPDA, wallet.publicKey);
        const target_ata = getAssociatedTokenAddressSync(mintPDA, target);
        const transfer_spl = createTransferInstruction(
            source_ata,
            target_ata,
            wallet.publicKey,
            amount
        );
        const tx = await provider.connection.sendTransaction(await v0_pack([mint_token, transfer_spl]));
        return tx;
    }
}

