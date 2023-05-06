#![cfg_attr(not(feature = "std"), no_std)]
#![feature(min_specialization)]

#[openbrush::contract]
pub mod pinkrobot34 {
    use ink::codegen::{EmitEvent, Env};

    use openbrush::contracts::ownable::*;
    use openbrush::contracts::psp34::extensions::burnable::*;
    use openbrush::contracts::psp34::extensions::enumerable::*;
    use openbrush::contracts::psp34::extensions::metadata::*;
    use openbrush::traits::Storage;
    use openbrush::traits::String;

    use psp34_minting::pink_minting::*;
    use psp34_minting::traits::*;

    #[ink(storage)]
    #[derive(Default, Storage)]
    pub struct PinkPsp34 {
        #[storage_field]
        psp34: psp34::Data<enumerable::Balances>,
        #[storage_field]
        ownable: ownable::Data,
        #[storage_field]
        metadata: metadata::Data,
        #[storage_field]
        minting: MintingData,
    }

    /// Event emitted when a token transfer occurs.
    #[ink(event)]
    pub struct Transfer {
        #[ink(topic)]
        from: Option<AccountId>,
        #[ink(topic)]
        to: Option<AccountId>,
        #[ink(topic)]
        id: Id,
    }

    /// Event emitted when a token approve occurs.
    #[ink(event)]
    pub struct Approval {
        #[ink(topic)]
        from: AccountId,
        #[ink(topic)]
        to: AccountId,
        #[ink(topic)]
        id: Option<Id>,
        approved: bool,
    }

    impl PSP34 for PinkPsp34 {}
    // impl PSP34Burnable for PinkPsp34 {}
    impl PSP34Enumerable for PinkPsp34 {}
    impl Ownable for PinkPsp34 {}
    impl PSP34Metadata for PinkPsp34 {}
    impl PinkMint for PinkPsp34 {}

    impl PinkPsp34 {
        #[ink(constructor)]
        pub fn new() -> Self {
            let mut instance = Self::default();
            instance._init_with_owner(instance.env().caller());
            instance
                .pink_mint(instance.env().caller(), String::from("PinkPsp34"))
                .unwrap();
            instance._set_attribute(Id::U64(0), String::from("name"), String::from("PinkPsp34"));
            instance._set_attribute(Id::U64(0), String::from("symbol"), String::from("PnkP"));
            instance
        }
    }

    // Override event emission methods
    impl psp34::Internal for PinkPsp34 {
        fn _emit_transfer_event(&self, from: Option<AccountId>, to: Option<AccountId>, id: Id) {
            self.env().emit_event(Transfer { from, to, id });
        }

        fn _emit_approval_event(
            &self,
            from: AccountId,
            to: AccountId,
            id: Option<Id>,
            approved: bool,
        ) {
            self.env().emit_event(Approval {
                from,
                to,
                id,
                approved,
            });
        }
    }
    // ------------------- T E S T -----------------------------------------------------
    #[cfg(test)]
    mod tests {
        use super::*;
        use ink::{
            env::{pay_with_call, test},
            prelude::string::String as PreludeString,
        };
        use psp34_minting::traits::*;
        const PRICE: Balance = 100_000_000_000_000_000;
        const BASE_URI: &str = "ipfs://myIpfsUri/";
        const MAX_SUPPLY: u64 = 10;

        fn init() -> PinkPsp34 {
            PinkPsp34::new(
                    // String::from("Shiden34"),
                    // String::from("SH34"),
                    // String::from(BASE_URI),
                    // MAX_SUPPLY,
                    // PRICE,
                )
        }

        #[ink::test]
        fn init_works() {
            let sh34 = init();
            let collection_id = sh34.collection_id();
            assert_eq!(
                sh34.get_attribute(Id::U64(0), String::from("name")),
                Some(String::from("PinkPsp34"))
            );
            assert_eq!(
                sh34.get_attribute(Id::U64(0), String::from("symbol")),
                Some(String::from("PnkP"))
            );
            // assert_eq!(
            //     sh34.get_attribute(collection_id, String::from("baseUri")),
            //     Some(String::from(BASE_URI))
            // );
            // assert_eq!(sh34.max_supply(), MAX_SUPPLY);
            // assert_eq!(sh34.price(), PRICE);
        }

        // #[ink::test]
        // fn mint_single_works() {
        //     let mut sh34 = init();
        //     let accounts = default_accounts();
        //     assert_eq!(sh34.owner(), accounts.alice);
        //     set_sender(accounts.bob);

        //     assert_eq!(sh34.total_supply(), 0);
        //     test::set_value_transferred::<ink::env::DefaultEnvironment>(PRICE);
        //     assert!(sh34.mint_next().is_ok());
        //     assert_eq!(sh34.total_supply(), 1);
        //     assert_eq!(sh34.owner_of(Id::U64(1)), Some(accounts.bob));
        //     assert_eq!(sh34.balance_of(accounts.bob), 1);

        //     assert_eq!(sh34.owners_token_by_index(accounts.bob, 0), Ok(Id::U64(1)));
        //     assert_eq!(sh34.payable_mint.last_token_id, 1);
        //     assert_eq!(1, ink::env::test::recorded_events().count());
        // }

        // fn default_accounts() -> test::DefaultAccounts<ink::env::DefaultEnvironment> {
        //     test::default_accounts::<Environment>()
        // }

        // fn set_sender(sender: AccountId) {
        //     ink::env::test::set_caller::<Environment>(sender);
        // }

        // fn set_balance(account_id: AccountId, balance: Balance) {
        //     ink::env::test::set_account_balance::<ink::env::DefaultEnvironment>(account_id, balance)
        // }
    }
}
