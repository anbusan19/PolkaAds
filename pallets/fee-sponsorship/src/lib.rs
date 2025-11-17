//! # Pallet Fee Sponsorship
//!
//! Transaction fee sponsorship pallet for PolkaAds.
//! Handles fee sponsorship logic similar to ERC-4337 Paymaster.

#![cfg_attr(not(feature = "std"), no_std)]

pub use pallet::*;

#[frame_support::pallet]
pub mod pallet {
	use frame_support::pallet_prelude::*;
	use frame_system::pallet_prelude::*;

	#[pallet::pallet]
	pub struct Pallet<T>(_);

	#[pallet::config]
	pub trait Config: frame_system::Config {
		type RuntimeEvent: From<Event<Self>> + IsType<<Self as frame_system::Config>::RuntimeEvent>;
		
		/// Minimum fee amount that can be sponsored
		#[pallet::constant]
		type MinSponsorshipAmount: Get<u128>;
	}

	/// Sponsorship request structure
	#[derive(Clone, Encode, Decode, Eq, PartialEq, RuntimeDebug, TypeInfo, MaxEncodedLen)]
	#[scale_info(skip_type_params(T))]
	pub struct SponsorshipRequest<T: Config> {
		pub user: T::AccountId,
		pub ad_id: u32,
		pub fee_amount: u128,
		pub verified: bool,
		pub sponsored: bool,
	}

	/// Storage: Sponsorship requests by ID
	#[pallet::storage]
	#[pallet::getter(fn sponsorship_requests)]
	pub type SponsorshipRequests<T: Config> = StorageMap<_, Blake2_128Concat, u32, SponsorshipRequest<T>>;

	/// Storage: Next sponsorship request ID
	#[pallet::storage]
	#[pallet::getter(fn next_request_id)]
	pub type NextRequestId<T: Config> = StorageValue<_, u32, ValueQuery>;

	/// Storage: User pending sponsorships
	#[pallet::storage]
	#[pallet::getter(fn pending_sponsorships)]
	pub type PendingSponsorships<T: Config> = StorageMap<_, Blake2_128Concat, T::AccountId, u32>;

	/// Storage: Total sponsored fees per ad
	#[pallet::storage]
	#[pallet::getter(fn total_sponsored)]
	pub type TotalSponsored<T: Config> = StorageMap<_, Blake2_128Concat, u32, u128, ValueQuery>;

	#[pallet::event]
	#[pallet::generate_deposit(pub(super) fn deposit_event)]
	pub enum Event<T: Config> {
		/// Sponsorship requested
		SponsorshipRequested { request_id: u32, user: T::AccountId, ad_id: u32, fee_amount: u128 },
		/// Ad view verified
		AdViewVerified { request_id: u32, user: T::AccountId },
		/// Fee sponsored
		FeeSponsored { request_id: u32, user: T::AccountId, amount: u128 },
		/// Sponsorship cancelled
		SponsorshipCancelled { request_id: u32 },
	}

	#[pallet::error]
	pub enum Error<T> {
		/// Sponsorship request not found
		RequestNotFound,
		/// Ad view not verified
		AdViewNotVerified,
		/// Already sponsored
		AlreadySponsored,
		/// Insufficient ad budget
		InsufficientAdBudget,
		/// Fee amount too low
		FeeAmountTooLow,
		/// Pending sponsorship exists
		PendingSponsorshipExists,
	}

	#[pallet::call]
	impl<T: Config> Pallet<T> {
		/// Request transaction fee sponsorship
		#[pallet::call_index(0)]
		#[pallet::weight(10_000)]
		pub fn sponsor_transaction(
			origin: OriginFor<T>,
			ad_id: u32,
			fee_amount: u128,
		) -> DispatchResult {
			let who = ensure_signed(origin)?;
			
			ensure!(
				fee_amount >= T::MinSponsorshipAmount::get(),
				Error::<T>::FeeAmountTooLow
			);
			
			ensure!(
				!PendingSponsorships::<T>::contains_key(&who),
				Error::<T>::PendingSponsorshipExists
			);
			
			let request_id = NextRequestId::<T>::get();
			let request = SponsorshipRequest {
				user: who.clone(),
				ad_id,
				fee_amount,
				verified: false,
				sponsored: false,
			};
			
			SponsorshipRequests::<T>::insert(request_id, request);
			PendingSponsorships::<T>::insert(&who, request_id);
			NextRequestId::<T>::put(request_id.saturating_add(1));
			
			Self::deposit_event(Event::SponsorshipRequested {
				request_id,
				user: who,
				ad_id,
				fee_amount,
			});
			
			Ok(())
		}

		/// Verify that user watched the ad
		#[pallet::call_index(1)]
		#[pallet::weight(10_000)]
		pub fn verify_ad_view(origin: OriginFor<T>, request_id: u32) -> DispatchResult {
			// In production, this would be called by an oracle or trusted source
			ensure_root(origin)?;
			
			SponsorshipRequests::<T>::try_mutate(request_id, |maybe_request| -> DispatchResult {
				let request = maybe_request.as_mut().ok_or(Error::<T>::RequestNotFound)?;
				request.verified = true;
				
				Self::deposit_event(Event::AdViewVerified {
					request_id,
					user: request.user.clone(),
				});
				
				Ok(())
			})
		}

		/// Execute fee reimbursement after verification
		#[pallet::call_index(2)]
		#[pallet::weight(10_000)]
		pub fn reimburse_fee(origin: OriginFor<T>, request_id: u32) -> DispatchResult {
			let who = ensure_signed(origin)?;
			
			SponsorshipRequests::<T>::try_mutate(request_id, |maybe_request| -> DispatchResult {
				let request = maybe_request.as_mut().ok_or(Error::<T>::RequestNotFound)?;
				
				ensure!(request.user == who, DispatchError::BadOrigin);
				ensure!(request.verified, Error::<T>::AdViewNotVerified);
				ensure!(!request.sponsored, Error::<T>::AlreadySponsored);
				
				// Mark as sponsored
				request.sponsored = true;
				
				// Update total sponsored amount
				TotalSponsored::<T>::mutate(request.ad_id, |total| {
					*total = total.saturating_add(request.fee_amount);
				});
				
				// Remove from pending
				PendingSponsorships::<T>::remove(&who);
				
				Self::deposit_event(Event::FeeSponsored {
					request_id,
					user: who,
					amount: request.fee_amount,
				});
				
				Ok(())
			})
		}

		/// Cancel a sponsorship request
		#[pallet::call_index(3)]
		#[pallet::weight(10_000)]
		pub fn cancel_sponsorship(origin: OriginFor<T>, request_id: u32) -> DispatchResult {
			let who = ensure_signed(origin)?;
			
			let request = SponsorshipRequests::<T>::get(request_id)
				.ok_or(Error::<T>::RequestNotFound)?;
			
			ensure!(request.user == who, DispatchError::BadOrigin);
			ensure!(!request.sponsored, Error::<T>::AlreadySponsored);
			
			SponsorshipRequests::<T>::remove(request_id);
			PendingSponsorships::<T>::remove(&who);
			
			Self::deposit_event(Event::SponsorshipCancelled { request_id });
			
			Ok(())
		}
	}
}
