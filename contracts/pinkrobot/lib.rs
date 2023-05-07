#![cfg_attr(not(feature = "std"), no_std)]

#[ink::contract]
mod pinkrobot {
    
    use crate::ensure;
    // use ink::env::{
        //     call::{build_call, ExecutionInput, Selector},
        //     DefaultEnvironment,
        // };

    use ink::prelude::vec::Vec;
    use ink::storage::Mapping;
    
    use pinkpsp34::pinkpsp34::PinkPsp34;

    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum Error {
        NotOwner,
        FailedToGetContract,
    }

    pub type Result<T> = core::result::Result<T, Error>;

    /// `Id` represents the identifier of the NFT. `Id::U8(1)` and `Id::U16(1)` are two different identifiers.
    #[derive(Debug, PartialEq, Eq, PartialOrd, Ord, Clone, scale::Encode, scale::Decode)]
    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    pub enum Id {
        U8(u8),
        U16(u16),
        U32(u32),
        U64(u64),
        U128(u128),
        Bytes(Vec<u8>),
    }

    #[ink(storage)]
    pub struct Pinkrobot {
        /// Contract owner
        owner: AccountId,
        /// Mapping of contract id to contract address
        contracts_map: Mapping<u8, AccountId>,
    }

    impl Pinkrobot {
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                owner: Self::env().caller(),
                contracts_map: Mapping::default(),
            }
        }

        #[ink(message)]
        pub fn add_new_contract(&mut self, entry: u8, contract: AccountId) -> Result<()> {
            ensure!(self.env().caller() == self.owner, Error::NotOwner);
            ensure_valid_contract(contract)?;
            self.contracts_map.insert(&entry, &contract);
            Ok(())
        }

        #[ink(message)]
        pub fn mint(&self, entry: u8) -> Result<()> {
            let caller = self.env().caller();
            ensure!(caller == self.owner, Error::NotOwner);
            let contract = self
                .contracts_map
                .get(&entry)
                .ok_or(Error::FailedToGetContract)?;

            // let _mint_result = build_call::<DefaultEnvironment>()
            //     .call(contract)
            //     .gas_limit(50000000)
            //     .exec_input(
            //         ExecutionInput::new(Selector::new(ink::selector_bytes!("mint")))
            //             .push_arg(caller),
            //     )
            //     .returns::<Id>()
            //     .invoke();

            let mint_result = PinkPsp34::mint(&contract, caller);
            println!("mint_result: {:?}", mint_result);
            Ok(())
        }

        /// Simply returns the current value of our `bool`.
        #[ink(message)]
        pub fn get_contract(&self, entry: u8) -> Option<AccountId> {
            self.contracts_map.get(&entry)
        }
    }

    fn ensure_valid_contract(_contract: AccountId) -> Result<()> {
        Ok(())
    }


    #[cfg(test)]
    mod tests {
        use super::*;

        #[ink::test]
        fn add_contract_works() {
            let contract: AccountId = [0x42; 32].into();
            let mut pinkrobot = Pinkrobot::new();
            assert!(pinkrobot.add_new_contract(1, contract).is_ok());
        }

        #[ink::test]
        fn get_contract_works() {
            let contract: AccountId = [0x42; 32].into();
            let mut pinkrobot = Pinkrobot::new();
            assert!(pinkrobot.add_new_contract(1, contract).is_ok());
            assert_eq!(pinkrobot.get_contract(1), Some(contract));
        }
    }

    /// This is how you'd write end-to-end (E2E) or integration tests for ink! contracts.
    ///
    /// When running these you need to make sure that you:
    /// - Compile the tests with the `e2e-tests` feature flag enabled (`--features e2e-tests`)
    /// - Are running a Substrate node which contains `pallet-contracts` in the background
    #[cfg(all(test, feature = "e2e-tests"))]
    mod e2e_tests {
        use super::DelegatorRef;
        use ink_e2e::build_message;

        type E2EResult<T> = std::result::Result<T, Box<dyn std::error::Error>>;

        // #[ink_e2e::test(
        //     additional_contracts = "accumulator/Cargo.toml adder/Cargo.toml subber/Cargo.toml"
        // )]
        // async fn e2e_delegator(mut client: ink_e2e::Client<C, E>) -> E2EResult<()> {
        //     // given
        //     let accumulator_hash = client
        //         .upload("accumulator", &ink_e2e::alice(), None)
        //         .await
        //         .expect("uploading `accumulator` failed")
        //         .code_hash;

        // }

        /// Imports all the definitions from the outer scope so we can use them here.
        use super::*;

        /// A helper function used for calling contract messages.
        use ink_e2e::build_message;

        /// The End-to-End test `Result` type.
        type E2EResult<T> = std::result::Result<T, Box<dyn std::error::Error>>;

        /// We test that we can upload and instantiate the contract using its default constructor.
        #[ink_e2e::test]
        async fn default_works(mut client: ink_e2e::Client<C, E>) -> E2EResult<()> {
            // Given
            let constructor = PinkrobotRef::default();

            // When
            let contract_account_id = client
                .instantiate("pinkrobot", &ink_e2e::alice(), constructor, 0, None)
                .await
                .expect("instantiate failed")
                .account_id;

            // Then
            let get = build_message::<PinkrobotRef>(contract_account_id.clone())
                .call(|pinkrobot| pinkrobot.get());
            let get_result = client.call_dry_run(&ink_e2e::alice(), &get, 0, None).await;
            assert!(matches!(get_result.return_value(), false));

            Ok(())
        }

        /// We test that we can read and write a value from the on-chain contract contract.
        #[ink_e2e::test]
        async fn it_works(mut client: ink_e2e::Client<C, E>) -> E2EResult<()> {
            // Given
            let constructor = PinkrobotRef::new(false);
            let contract_account_id = client
                .instantiate("pinkrobot", &ink_e2e::bob(), constructor, 0, None)
                .await
                .expect("instantiate failed")
                .account_id;

            let get = build_message::<PinkrobotRef>(contract_account_id.clone())
                .call(|pinkrobot| pinkrobot.get());
            let get_result = client.call_dry_run(&ink_e2e::bob(), &get, 0, None).await;
            assert!(matches!(get_result.return_value(), false));

            // When
            let flip = build_message::<PinkrobotRef>(contract_account_id.clone())
                .call(|pinkrobot| pinkrobot.flip());
            let _flip_result = client
                .call(&ink_e2e::bob(), flip, 0, None)
                .await
                .expect("flip failed");

            // Then
            let get = build_message::<PinkrobotRef>(contract_account_id.clone())
                .call(|pinkrobot| pinkrobot.get());
            let get_result = client.call_dry_run(&ink_e2e::bob(), &get, 0, None).await;
            assert!(matches!(get_result.return_value(), true));

            Ok(())
        }
    }
}

/// Evaluate `$x:expr` and if not true return `Err($y:expr)`.
///
/// Used as `ensure!(expression_to_ensure, expression_to_return_on_false)`.
#[macro_export]
macro_rules! ensure {
    ( $x:expr, $y:expr $(,)? ) => {{
        if !$x {
            return Err($y.into());
        }
    }};
}
