# Aggregator Architecture

## Aggregator Group

Group record all global config of the aggregator.

## Aggregator Map

Map record the all vault address of the aggregator.
A map account contain 3 infomation:

1. Mint Account Public Key (PDA seed)
2. Lending Program Public Key (PDA seed)
3. Type of assets (Deposit/ Borrow) (PDA seed)
4. Number of vault
5. Share of asset

To optimise the compute unit, map account also store the bump of the map PDA.