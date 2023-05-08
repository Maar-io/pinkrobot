#!/bin/bash

# set -eux

CALLER_ADDRESS=""
CALLEE_ADDRESS=""

cargo contract build --manifest-path pinkrobot/Cargo.toml
cargo contract build --manifest-path pinkpsp34/Cargo.toml 

# Upload and Instantiate the pinkrobot contract
PINKROBOT_ADDRESS=$(cargo contract instantiate \
    --constructor new \
    --suri //Alice --salt $(date +%s) \
    --manifest-path pinkrobot/Cargo.toml \
    --output-json --skip-confirm --execute | jq .contract -r)

echo "-------- pinkrobot Address: $PINKROBOT_ADDRESS"


echo "-------- Upload and Instantiate the pinkpsp34 contract"
PINK_PSP_ADDRESS=$(cargo contract instantiate --constructor new \
    --args 0x74657374 0x7465 1000 "None" \
    --suri //Alice --salt $(date +%s) \
    --manifest-path pinkpsp34/Cargo.toml \
    --output-json --skip-confirm --execute | jq .contract -r)

echo "-------- pinkpsp34 Address: $PINK_PSP_ADDRESS"

# Add contract entry
ADD_RESULT=$(cargo contract call \
    --suri //Alice \
    --contract $PINKROBOT_ADDRESS \
    --message add_new_contract \
    --args 1 $PINK_PSP_ADDRESS \
    --manifest-path pinkrobot/Cargo.toml \
    -x --skip-confirm
    )
echo "-------- ADD_RESULT: $ADD_RESULT"

# Get contract entry
GET_RESULT=$(cargo contract call \
    --suri //Alice \
    --contract $PINKROBOT_ADDRESS \
    --message get_contract \
    --args 1 \
    --manifest-path pinkrobot/Cargo.toml \
    -x --skip-confirm
    )
echo "-------- GET_RESULT: $GET_RESULT"

# Add contract entry
MINT_RESULT=$(cargo contract call \
    --suri //Bob \
    --contract $PINKROBOT_ADDRESS \
    --message pink_mint \
    --args 1 0x69706673 \
    --manifest-path pinkrobot/Cargo.toml \
    -x --skip-confirm
    )
echo "-------- MINT_RESULT: $MINT_RESULT"