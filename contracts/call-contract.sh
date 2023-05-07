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

# Add contract entry
ADD_RESULT=$(cargo contract call \
    --suri //Alice \
    --contract $PINKROBOT_ADDRESS \
    --message add_new_contract \
    --args 1 $PINKROBOT_ADDRESS \
    --manifest-path pinkrobot/Cargo.toml \
    -x --skip-confirm
    )
echo "-------- ADD_RESULT: $ADD_RESULT"

echo "-------- Upload and Instantiate the pinkpsp34 contract"
PINK_PSP_ADDRESS=$(cargo contract instantiate --constructor new \
    --args PinkName PN 10 [] \
    --suri //Alice --salt $(date +%s) \
    --manifest-path pinkpsp34/Cargo.toml \
    --output-json --skip-confirm --execute | jq .contract -r)

echo "-------- pinkpsp34 Address: $PINK_PSP_ADDRESS"


# Mint through the pinkrobot contract
cargo contract call --contract $PINKROBOT_ADDRESS \
    --message mint \
    --args 1 'ipfs' \
    --suri //Bob \
    --manifest-path pinkrobot/Cargo.toml