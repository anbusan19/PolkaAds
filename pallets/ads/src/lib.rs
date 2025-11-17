//! # Pallet Ads
//!
//! Ad management pallet for PolkaAds platform.
//! Manages ad spots, advertiser registrations, and ad metadata.

#![cfg_attr(not(feature = "std"), no_std)]

pub use pallet::*;

#[frame_support::pallet]
pub mod pallet {
	use frame_support::pallet_prelude::*;
	use frame_system::pallet_prelude::*;
	use sp_std::vec::Vec;
	use frame_support::traits::{Currency, ReservableCurrency};
	use sp_runtime::traits::Saturating;

	#[pallet::pallet]
	pub struct Pallet<T>(_);

	#[pallet::config]
	pub trait Config: frame_system::Config {
		type RuntimeEvent: From<Event<Self>> + IsType<<Self as frame_system::Config>::RuntimeEvent>;
		
		/// The currency implementation for handling advertiser deposits
		type Currency: ReservableCurrency<Self::AccountId>;
		
		/// Maximum length for ad name
		#[pallet::constant]
		type MaxAdNameLength: Get<u32>;
		
		/// Maximum length for ad description
		#[pallet::constant]
		type MaxAdDescriptionLength: Get<u32>;
		
		/// Maximum length for IPFS CID
		#[pallet::constant]
		type MaxCidLength: Get<u32>;
		
		/// Maximum length for advertiser name
		#[pallet::constant]
		type MaxAdvertiserNameLength: Get<u32>;
		
		/// Minimum deposit required to register as an advertiser
		#[pallet::constant]
		type MinAdvertiserDeposit: Get<<<Self as Config>::Currency as Currency<Self::AccountId>>::Balance>;
	}

	/// Type alias for Balance
	pub type BalanceOf<T> =
		<<T as Config>::Currency as Currency<<T as frame_system::Config>::AccountId>>::Balance;

	/// Ad metadata structure
	#[derive(Clone, Encode, Decode, Eq, PartialEq, RuntimeDebug, TypeInfo, MaxEncodedLen)]
	#[scale_info(skip_type_params(T))]
	pub struct AdMetadata<T: Config> {
		pub advertiser: T::AccountId,
		pub name: BoundedVec<u8, T::MaxAdNameLength>,
		pub description: BoundedVec<u8, T::MaxAdDescriptionLength>,
		pub ipfs_cid: BoundedVec<u8, T::MaxCidLength>,
		pub funding: u128,
		pub remaining_budget: u128,
		pub views: u64,
		pub active: bool,
	}

	/// Advertiser profile information
	#[derive(Clone, Encode, Decode, Eq, PartialEq, RuntimeDebug, TypeInfo, MaxEncodedLen)]
	#[scale_info(skip_type_params(T))]
	pub struct AdvertiserProfile<T: Config> {
		/// Advertiser account ID
		pub account_id: T::AccountId,
		/// Advertiser name
		pub name: BoundedVec<u8, T::MaxAdvertiserNameLength>,
		/// Block number when the advertiser registered
		pub registration_block: BlockNumberFor<T>,
		/// Total deposit held for this advertiser
		pub deposit: BalanceOf<T>,
		/// Whether the advertiser account is active
		pub active: bool,
		/// Total amount advertiser has funded across all ads
		pub total_funded: u128,
		/// Total number of ads submitted
		pub total_ads: u32,
	}

	/// Ad spot structure
	#[derive(Clone, Encode, Decode, Eq, PartialEq, RuntimeDebug, TypeInfo, MaxEncodedLen)]
	pub struct AdSpot {
		pub spot_id: u32,
		pub available: bool,
	}

	/// Storage: Ad spots by ID
	#[pallet::storage]
	#[pallet::getter(fn ad_spots)]
	pub type AdSpots<T: Config> = StorageMap<_, Blake2_128Concat, u32, AdSpot>;

	/// Storage: Ads by ID
	#[pallet::storage]
	#[pallet::getter(fn ads)]
	pub type Ads<T: Config> = StorageMap<_, Blake2_128Concat, u32, AdMetadata<T>>;

	/// Storage: Advertiser profiles
	#[pallet::storage]
	#[pallet::getter(fn advertiser_profiles)]
	pub type AdvertiserProfiles<T: Config> = StorageMap<_, Blake2_128Concat, T::AccountId, AdvertiserProfile<T>>;

	/// Storage: Next ad ID
	#[pallet::storage]
	#[pallet::getter(fn next_ad_id)]
	pub type NextAdId<T: Config> = StorageValue<_, u32, ValueQuery>;

	/// Storage: Next spot ID
	#[pallet::storage]
	#[pallet::getter(fn next_spot_id)]
	pub type NextSpotId<T: Config> = StorageValue<_, u32, ValueQuery>;

	/// Storage: Advertiser accounts (legacy, kept for backward compatibility)
	#[pallet::storage]
	#[pallet::getter(fn advertisers)]
	pub type Advertisers<T: Config> = StorageMap<_, Blake2_128Concat, T::AccountId, bool, ValueQuery>;

	#[pallet::event]
	#[pallet::generate_deposit(pub(super) fn deposit_event)]
	pub enum Event<T: Config> {
		/// Ad spot created
		AdSpotCreated { spot_id: u32 },
		/// Advertiser registered
		AdvertiserRegistered { advertiser: T::AccountId, deposit: BalanceOf<T> },
		/// Advertiser deregistered
		AdvertiserDeregistered { advertiser: T::AccountId, refunded: BalanceOf<T> },
		/// Ad submitted
		AdSubmitted { ad_id: u32, advertiser: T::AccountId, spot_id: u32 },
		/// Ad activated
		AdActivated { ad_id: u32 },
		/// Ad deactivated
		AdDeactivated { ad_id: u32 },
		/// Deposit increased
		DepositIncreased { advertiser: T::AccountId, amount: BalanceOf<T> },
		/// Advertiser profile updated
		AdvertiserProfileUpdated { advertiser: T::AccountId },
	}

	#[pallet::error]
	pub enum Error<T> {
		/// Ad spot not found
		AdSpotNotFound,
		/// Ad not found
		AdNotFound,
		/// Advertiser not found
		AdvertiserNotFound,
		/// Advertiser not registered
		AdvertiserNotRegistered,
		/// Advertiser already registered
		AdvertiserAlreadyRegistered,
		/// Ad spot not available
		AdSpotNotAvailable,
		/// Insufficient funding
		InsufficientFunding,
		/// Ad name too long
		AdNameTooLong,
		/// Ad description too long
		AdDescriptionTooLong,
		/// IPFS CID too long
		CidTooLong,
		/// Advertiser name too long
		AdvertiserNameTooLong,
		/// Insufficient balance for deposit
		InsufficientBalance,
		/// Deposit required is too low
		DepositTooLow,
		/// Cannot withdraw deposit while ads are active
		CannotWithdrawWithActiveAds,
		/// Unauthorized - only advertiser can perform this action
		Unauthorized,
	}

	#[pallet::call]
	impl<T: Config> Pallet<T> {
		/// Create a new ad spot
		#[pallet::call_index(0)]
		#[pallet::weight(10_000)]
		pub fn create_ad_spot(origin: OriginFor<T>) -> DispatchResult {
			ensure_root(origin)?;
			
			let spot_id = NextSpotId::<T>::get();
			let spot = AdSpot {
				spot_id,
				available: true,
			};
			
			AdSpots::<T>::insert(spot_id, spot);
			NextSpotId::<T>::put(spot_id.saturating_add(1));
			
			Self::deposit_event(Event::AdSpotCreated { spot_id });
			Ok(())
		}

		/// Register as an advertiser with deposit and name
		///
		/// This extrinsic registers a new advertiser on the platform.
		/// The caller must provide:
		/// - `name`: A human-readable name for the advertiser (max length configured)
		/// - `deposit_amount`: The amount to deposit (must be >= MinAdvertiserDeposit)
		///
		/// The deposit is held in reserve and can be withdrawn later.
		/// An advertiser must be registered before they can submit ads.
		#[pallet::call_index(1)]
		#[pallet::weight(25_000)]
		pub fn register_advertiser(
			origin: OriginFor<T>,
			name: Vec<u8>,
			deposit_amount: BalanceOf<T>,
		) -> DispatchResult {
			let who = ensure_signed(origin)?;
			let now = frame_system::Pallet::<T>::block_number();
			
			// Validate that advertiser is not already registered
			ensure!(
				!AdvertiserProfiles::<T>::contains_key(&who),
				Error::<T>::AdvertiserAlreadyRegistered
			);

			// Validate deposit amount meets minimum requirement
			let min_deposit = T::MinAdvertiserDeposit::get();
			ensure!(
				deposit_amount >= min_deposit,
				Error::<T>::DepositTooLow
			);

			// Validate advertiser name length
			let bounded_name = BoundedVec::try_from(name)
				.map_err(|_| Error::<T>::AdvertiserNameTooLong)?;

			// Check if advertiser has sufficient balance
			let free_balance = T::Currency::free_balance(&who);
			ensure!(
				free_balance >= deposit_amount,
				Error::<T>::InsufficientBalance
			);

			// Reserve the deposit amount
			T::Currency::reserve(&who, deposit_amount)
				.map_err(|_| Error::<T>::InsufficientBalance)?;

			// Create advertiser profile
			let profile = AdvertiserProfile {
				account_id: who.clone(),
				name: bounded_name,
				registration_block: now,
				deposit: deposit_amount,
				active: true,
				total_funded: 0,
				total_ads: 0,
			};

			// Store the profile
			AdvertiserProfiles::<T>::insert(&who, profile);
			
			// Also set the legacy advertiser flag for backward compatibility
			Advertisers::<T>::insert(&who, true);

			Self::deposit_event(Event::AdvertiserRegistered {
				advertiser: who,
				deposit: deposit_amount,
			});

			Ok(())
		}

		/// Increase advertiser deposit
		///
		/// This allows an advertiser to add more funds to their deposit.
		/// Only called by the advertiser themselves.
		#[pallet::call_index(2)]
		#[pallet::weight(20_000)]
		pub fn increase_advertiser_deposit(
			origin: OriginFor<T>,
			additional_amount: BalanceOf<T>,
		) -> DispatchResult {
			let who = ensure_signed(origin)?;

			// Get the advertiser profile
			let mut profile = AdvertiserProfiles::<T>::get(&who)
				.ok_or(Error::<T>::AdvertiserNotFound)?;

			// Ensure the advertiser is active
			ensure!(profile.active, Error::<T>::AdvertiserNotRegistered);

			// Check if advertiser has sufficient balance
			let free_balance = T::Currency::free_balance(&who);
			ensure!(
				free_balance >= additional_amount,
				Error::<T>::InsufficientBalance
			);

			// Reserve the additional amount
			T::Currency::reserve(&who, additional_amount)
				.map_err(|_| Error::<T>::InsufficientBalance)?;

			// Update deposit
			profile.deposit = profile.deposit.saturating_add(additional_amount);
			AdvertiserProfiles::<T>::insert(&who, profile);

			Self::deposit_event(Event::DepositIncreased {
				advertiser: who,
				amount: additional_amount,
			});

			Ok(())
		}

		/// Deregister as an advertiser and withdraw deposit
		///
		/// This extrinsic allows an advertiser to unregister and withdraw their deposit.
		/// All ads must be deactivated before deregistering.
		#[pallet::call_index(3)]
		#[pallet::weight(25_000)]
		pub fn deregister_advertiser(origin: OriginFor<T>) -> DispatchResult {
			let who = ensure_signed(origin)?;

			// Get the advertiser profile
			let profile = AdvertiserProfiles::<T>::get(&who)
				.ok_or(Error::<T>::AdvertiserNotFound)?;

			// Check if advertiser has any active ads
			let has_active_ads = Ads::<T>::iter_values()
				.any(|ad| ad.advertiser == who && ad.active);

			ensure!(
				!has_active_ads,
				Error::<T>::CannotWithdrawWithActiveAds
			);

			let refund_amount = profile.deposit;

			// Unreserve the deposit
			T::Currency::unreserve(&who, refund_amount);

			// Remove advertiser profile
			AdvertiserProfiles::<T>::remove(&who);
			Advertisers::<T>::remove(&who);

			Self::deposit_event(Event::AdvertiserDeregistered {
				advertiser: who,
				refunded: refund_amount,
			});

			Ok(())
		}

		/// Submit an ad
		#[pallet::call_index(4)]
		#[pallet::weight(25_000)]
		pub fn submit_ad(
			origin: OriginFor<T>,
			spot_id: u32,
			name: Vec<u8>,
			description: Vec<u8>,
			ipfs_cid: Vec<u8>,
			funding: u128,
		) -> DispatchResult {
			let who = ensure_signed(origin)?;
			
			// Verify advertiser is registered
			let mut profile = AdvertiserProfiles::<T>::get(&who)
				.ok_or(Error::<T>::AdvertiserNotRegistered)?;

			// Verify advertiser is active
			ensure!(profile.active, Error::<T>::AdvertiserNotRegistered);

			// Verify ad spot exists and is available
			ensure!(AdSpots::<T>::contains_key(spot_id), Error::<T>::AdSpotNotFound);
			let spot = AdSpots::<T>::get(spot_id).ok_or(Error::<T>::AdSpotNotFound)?;
			ensure!(spot.available, Error::<T>::AdSpotNotAvailable);
			
			// Validate inputs
			let bounded_name = BoundedVec::try_from(name)
				.map_err(|_| Error::<T>::AdNameTooLong)?;
			let bounded_description = BoundedVec::try_from(description)
				.map_err(|_| Error::<T>::AdDescriptionTooLong)?;
			let bounded_cid = BoundedVec::try_from(ipfs_cid)
				.map_err(|_| Error::<T>::CidTooLong)?;
			
			// Create ad
			let ad_id = NextAdId::<T>::get();
			let ad = AdMetadata {
				advertiser: who.clone(),
				name: bounded_name,
				description: bounded_description,
				ipfs_cid: bounded_cid,
				funding,
				remaining_budget: funding,
				views: 0,
				active: true,
			};
			
			// Store ad
			Ads::<T>::insert(ad_id, ad);
			NextAdId::<T>::put(ad_id.saturating_add(1));

			// Update advertiser profile
			profile.total_funded = profile.total_funded.saturating_add(funding);
			profile.total_ads = profile.total_ads.saturating_add(1);
			AdvertiserProfiles::<T>::insert(&who, profile);
			
			// Mark spot as unavailable
			AdSpots::<T>::mutate(spot_id, |maybe_spot| {
				if let Some(spot) = maybe_spot {
					spot.available = false;
				}
			});
			
			Self::deposit_event(Event::AdSubmitted { ad_id, advertiser: who, spot_id });
			Ok(())
		}

		/// Deactivate an ad
		#[pallet::call_index(5)]
		#[pallet::weight(15_000)]
		pub fn deactivate_ad(origin: OriginFor<T>, ad_id: u32) -> DispatchResult {
			let who = ensure_signed(origin)?;
			
			Ads::<T>::try_mutate(ad_id, |maybe_ad| -> DispatchResult {
				let ad = maybe_ad.as_mut().ok_or(Error::<T>::AdNotFound)?;
				
				// Only advertiser or root can deactivate
				ensure!(
					ad.advertiser == who,
					Error::<T>::Unauthorized
				);

				ad.active = false;
				
				Self::deposit_event(Event::AdDeactivated { ad_id });
				Ok(())
			})
		}
	}
}
