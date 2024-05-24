/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/aggregator_v1.json`.
 */
export type AggregatorV1 = {
  "address": "BPanLhvKwatyLQwSWTbUc3R3VVwsrQWrEeTtzD2DA6TZ",
  "metadata": {
    "name": "aggregatorV1",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "initializeAggregatorGroup",
      "discriminator": [
        22,
        172,
        15,
        12,
        33,
        30,
        143,
        142
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "aggregatorGroup",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  103,
                  103,
                  114,
                  101,
                  103,
                  97,
                  116,
                  111,
                  114,
                  95,
                  103,
                  114,
                  111,
                  117,
                  112
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initializeAggregatorMap",
      "discriminator": [
        174,
        3,
        190,
        14,
        57,
        125,
        26,
        151
      ],
      "accounts": [
        {
          "name": "aggregatorMap",
          "writable": true
        },
        {
          "name": "tokenMint"
        },
        {
          "name": "aggregatorGroup",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  103,
                  103,
                  114,
                  101,
                  103,
                  97,
                  116,
                  111,
                  114,
                  95,
                  103,
                  114,
                  111,
                  117,
                  112
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "vaultLut",
          "writable": true
        },
        {
          "name": "lendingProgram"
        },
        {
          "name": "addressLookupTableProgram",
          "address": "AddressLookupTab1e1111111111111111111111111"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "tokenType",
          "type": {
            "defined": {
              "name": "vaultAssetType"
            }
          }
        },
        {
          "name": "recentSlot",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "aggregatorGroup",
      "discriminator": [
        14,
        207,
        148,
        253,
        55,
        225,
        105,
        240
      ]
    },
    {
      "name": "aggregatorMap",
      "discriminator": [
        254,
        218,
        137,
        215,
        208,
        152,
        183,
        100
      ]
    }
  ],
  "types": [
    {
      "name": "aggregatorGroup",
      "docs": [
        "This account is used to store the global configuration of the aggregator."
      ],
      "serialization": "bytemuck",
      "repr": {
        "kind": "c"
      },
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "docs": [
              "The authority of the aggregator group."
            ],
            "type": "pubkey"
          },
          {
            "name": "bump",
            "docs": [
              "Bump seed for the group."
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "aggregatorMap",
      "docs": [
        "This account is used to store the number of vaults with specific SPL token mint for a protocol.",
        "The account use token mint and protocol id as the seed to derive the account key."
      ],
      "serialization": "bytemuck",
      "repr": {
        "kind": "c"
      },
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "vaultNum",
            "docs": [
              "The number of vaults with specific SPL token mint."
            ],
            "type": "u8"
          },
          {
            "name": "bump",
            "docs": [
              "Bump seed for the map."
            ],
            "type": "u8"
          },
          {
            "name": "vaultLut",
            "docs": [
              "Address lookup table for the vaults."
            ],
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "vaultAssetType",
      "repr": {
        "kind": "rust"
      },
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "deposit"
          },
          {
            "name": "spotBorrow"
          },
          {
            "name": "perpLong"
          },
          {
            "name": "perpShort"
          }
        ]
      }
    }
  ]
};
