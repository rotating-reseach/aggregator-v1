import { confirmTransaction } from "@solana-developers/helpers";
import { createToken } from "./helper";
import { AdminAggregatorClient } from "../sdk/src";
import { VaultAssetTypeClass } from "../sdk/src/type";
import {
  DRIFT_PROGRAM_ID,
  SOL_MINT,
  USDC_MINT,
  USDC_ORACLE,
} from "./constants";
import * as anchor from "@coral-xyz/anchor";
import {
  AdminClient,
  MarketStatus,
  OracleSource,
  PublicKey,
  QUOTE_PRECISION,
  SPOT_MARKET_RATE_PRECISION,
  SPOT_MARKET_WEIGHT_PRECISION,
} from "@drift-labs/sdk";
import { BN } from "bn.js";

const provider = anchor.AnchorProvider.env();
const admin = anchor.Wallet.local();
const adminClient = new AdminAggregatorClient({
  provider: provider,
  wallet: admin,
  opts: { skipPreflight: true },
});

export async function createUSDCSOL(): Promise<void> {
  const createUSDCTxSig = await createToken("USDC", 6);
  console.log("   Create USDC Token:", createUSDCTxSig);
  await confirmTransaction(provider.connection, createUSDCTxSig);

  const createSOLTxSig = await createToken("SOL", 9);
  console.log("   Create SOL Token:", createSOLTxSig);
  await confirmTransaction(provider.connection, createSOLTxSig);
}

export async function initializeAggregatorGroup(): Promise<void> {
  const initGroupTxSig = await adminClient.initializeAggregatorGroup();
  console.log("   Initialize Aggregator Group:", initGroupTxSig);
  await confirmTransaction(provider.connection, initGroupTxSig);
}

export async function initializeAggregatorMapUSDCSOL(): Promise<void> {
  const initUSDCDepositMapTxSig = await adminClient.initializeAggregatorMap(
    VaultAssetTypeClass.DEPOSIT,
    USDC_MINT,
    DRIFT_PROGRAM_ID
  );
  console.log(
    "   Initialize Aggregator Map (Drift USDC Deposit):",
    initUSDCDepositMapTxSig
  );
  await confirmTransaction(provider.connection, initUSDCDepositMapTxSig);

  const initSOLSpotBorrowMapTxSig = await adminClient.initializeAggregatorMap(
    VaultAssetTypeClass.SPOT_BORROW,
    SOL_MINT,
    DRIFT_PROGRAM_ID
  );
  console.log(
    "   Initialize Aggregator Map (Drift SOL Spot Borrow):",
    initSOLSpotBorrowMapTxSig
  );
  await confirmTransaction(provider.connection, initSOLSpotBorrowMapTxSig);
}

export async function initializeDriftUSDC(admin: AdminClient): Promise<void> {
  const optimalUtilization = SPOT_MARKET_RATE_PRECISION.div(
    new BN(2)
  ).toNumber(); // 50% utilization
  const optimalRate = SPOT_MARKET_RATE_PRECISION.toNumber();
  const maxRate = SPOT_MARKET_RATE_PRECISION.toNumber();
  const initialAssetWeight = SPOT_MARKET_WEIGHT_PRECISION.toNumber();
  const maintenanceAssetWeight = SPOT_MARKET_WEIGHT_PRECISION.toNumber();
  const initialLiabilityWeight = SPOT_MARKET_WEIGHT_PRECISION.toNumber();
  const maintenanceLiabilityWeight = SPOT_MARKET_WEIGHT_PRECISION.toNumber();
  const imfFactor = 0;
  const marketIndex = admin.getStateAccount().numberOfSpotMarkets;

  const initializeSpotMarketTx = await admin.initializeSpotMarket(
    USDC_MINT,
    optimalUtilization,
    optimalRate,
    maxRate,
    PublicKey.default,
    OracleSource.QUOTE_ASSET,
    initialAssetWeight,
    maintenanceAssetWeight,
    initialLiabilityWeight,
    maintenanceLiabilityWeight,
    imfFactor
  );
  await confirmTransaction(provider.connection, initializeSpotMarketTx);
  console.log("   Initialize Drift USDC Spot Market:", initializeSpotMarketTx);
  const updateWithdrawGuardThresholdTx =
    await admin.updateWithdrawGuardThreshold(
      marketIndex,
      new BN(10 ** 10).mul(QUOTE_PRECISION)
    );
  await confirmTransaction(provider.connection, updateWithdrawGuardThresholdTx);
  console.log(
    "   Update Withdraw Guard Threshold:",
    updateWithdrawGuardThresholdTx
  );
  const updateSpotMarketStatusTx = await admin.updateSpotMarketStatus(
    marketIndex,
    MarketStatus.ACTIVE
  );
  await confirmTransaction(provider.connection, updateSpotMarketStatusTx);
  console.log("   Update Spot Market Status:", updateSpotMarketStatusTx);
}

export async function initializeDriftSPL(
  admin: AdminClient,
  mint: PublicKey,
  oracle: PublicKey
): Promise<void> {
  const optimalUtilization = SPOT_MARKET_RATE_PRECISION.div(
    new BN(2)
  ).toNumber(); // 50% utilization
  const optimalRate = SPOT_MARKET_RATE_PRECISION.mul(new BN(20)).toNumber(); // 2000% APR
  const maxRate = SPOT_MARKET_RATE_PRECISION.mul(new BN(50)).toNumber(); // 5000% APR
  const initialAssetWeight = SPOT_MARKET_WEIGHT_PRECISION.mul(new BN(8))
    .div(new BN(10))
    .toNumber();
  const maintenanceAssetWeight = SPOT_MARKET_WEIGHT_PRECISION.mul(new BN(9))
    .div(new BN(10))
    .toNumber();
  const initialLiabilityWeight = SPOT_MARKET_WEIGHT_PRECISION.mul(new BN(12))
    .div(new BN(10))
    .toNumber();
  const maintenanceLiabilityWeight = SPOT_MARKET_WEIGHT_PRECISION.mul(
    new BN(11)
  )
    .div(new BN(10))
    .toNumber();
  const marketIndex = admin.getStateAccount().numberOfSpotMarkets;

  const initializeSpotMarketTx = await admin.initializeSpotMarket(
    mint,
    optimalUtilization,
    optimalRate,
    maxRate,
    oracle,
    OracleSource.PYTH,
    initialAssetWeight,
    maintenanceAssetWeight,
    initialLiabilityWeight,
    maintenanceLiabilityWeight
  );
  await confirmTransaction(provider.connection, initializeSpotMarketTx);
  console.log("   Initialize Drift SPL Spot Market:", initializeSpotMarketTx);

  const updateWithdrawGuardThresholdTx =
    await admin.updateWithdrawGuardThreshold(
      marketIndex,
      new BN(10 ** 10).mul(QUOTE_PRECISION)
    );
  await confirmTransaction(provider.connection, updateWithdrawGuardThresholdTx);
  const updateSpotMarketStatusTx = await admin.updateSpotMarketStatus(
    marketIndex,
    MarketStatus.ACTIVE
  );
  await confirmTransaction(provider.connection, updateSpotMarketStatusTx);
  console.log("   Update Spot Market Status:", updateSpotMarketStatusTx);
}

export async function initializeDriftUSDCSOL(
  admin: AdminClient
): Promise<void> {
  await initializeDriftUSDC(admin);
  await initializeDriftSPL(admin, SOL_MINT, USDC_ORACLE);
}
