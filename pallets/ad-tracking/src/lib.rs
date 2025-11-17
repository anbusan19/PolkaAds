//! # Pallet Ad Tracking
//!
//! Ad performance tracking pallet for PolkaAds.
//! Tracks ad views, clicks, and emits verification events.

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
	}

	/// Ad metrics structure
	#[derive(Clone, Encode, Decode, Eq, PartialEq, RuntimeDebug, TypeInfo, MaxEncodedLen, Default)]
	pub struct AdMetrics {
		pub total_views: u64,
		pub total_clicks: u64,
		pub unique_viewers: u64,
	}

	/// View record structure
	#[derive(Clone, Encode, Decode, Eq, PartialEq, RuntimeDebug, TypeInfo, MaxEncodedLen)]
	#[scale_info(skip_type_params(T))]
	pub struct ViewRecord<T: Config> {
		pub ad_id: u32,
		pub viewer: T::AccountId,
		pub timestamp: u64,
		pub completed: bool,
	}

	/// Storage: Ad metrics by ad ID
	#[pallet::storage]
	#[pallet::getter(fn ad_metrics)]
	pub type AdMetricsStorage<T: Config> = StorageMap<_, Blake2_128Concat, u32, AdMetrics, ValueQuery>;

	/// Storage: View records by ID
	#[pallet::storage]
	#[pallet::getter(fn view_records)]
	pub type ViewRecords<T: Config> = StorageMap<_, Blake2_128Concat, u32, ViewRecord<T>>;

	/// Storage: Next view record ID
	#[pallet::storage]
	#[pallet::getter(fn next_view_id)]
	pub type NextViewId<T: Config> = StorageValue<_, u32, ValueQuery>;

	/// Storage: User view history (user -> ad_id -> has_viewed)
	#[pallet::storage]
	#[pallet::getter(fn user_views)]
	pub type UserViews<T: Config> = StorageDoubleMap<
		_,
		Blake2_128Concat,
		T::AccountId,
		Blake2_128Concat,
		u32,
		bool,
		ValueQuery,
	>;

	/// Storage: Click records (ad_id -> click_count)
	#[pallet::storage]
	#[pallet::getter(fn click_records)]
	pub type ClickRecords<T: Config> = StorageMap<_, Blake2_128Concat, u32, u64, ValueQuery>;

	#[pallet::event]
	#[pallet::generate_deposit(pub(super) fn deposit_event)]
	pub enum Event<T: Config> {
		/// Ad view recorded
		AdViewRecorded { view_id: u32, ad_id: u32, viewer: T::AccountId },
		/// Ad view completed
		AdViewCompleted { view_id: u32, ad_id: u32, viewer: T::AccountId },
		/// Ad click recorded
		AdClickRecorded { ad_id: u32, viewer: T::AccountId },
		/// Metrics updated
		MetricsUpdated { ad_id: u32, views: u64, clicks: u64 },
	}

	#[pallet::error]
	pub enum Error<T> {
		/// View record not found
		ViewRecordNotFound,
		/// View already completed
		ViewAlreadyCompleted,
		/// Ad not found
		AdNotFound,
	}

	#[pallet::call]
	impl<T: Config> Pallet<T> {
		/// Record an ad view
		#[pallet::call_index(0)]
		#[pallet::weight(10_000)]
		pub fn record_view(
			origin: OriginFor<T>,
			ad_id: u32,
			timestamp: u64,
		) -> DispatchResult {
			let who = ensure_signed(origin)?;
			
			let view_id = NextViewId::<T>::get();
			let view_record = ViewRecord {
				ad_id,
				viewer: who.clone(),
				timestamp,
				completed: false,
			};
			
			ViewRecords::<T>::insert(view_id, view_record);
			NextViewId::<T>::put(view_id.saturating_add(1));
			
			// Update metrics
			AdMetricsStorage::<T>::mutate(ad_id, |metrics| {
				metrics.total_views = metrics.total_views.saturating_add(1);
				
				// Check if this is a unique viewer
				if !UserViews::<T>::get(&who, ad_id) {
					metrics.unique_viewers = metrics.unique_viewers.saturating_add(1);
					UserViews::<T>::insert(&who, ad_id, true);
				}
			});
			
			Self::deposit_event(Event::AdViewRecorded { view_id, ad_id, viewer: who });
			
			Ok(())
		}

		/// Mark ad view as completed
		#[pallet::call_index(1)]
		#[pallet::weight(10_000)]
		pub fn complete_view(origin: OriginFor<T>, view_id: u32) -> DispatchResult {
			let who = ensure_signed(origin)?;
			
			ViewRecords::<T>::try_mutate(view_id, |maybe_record| -> DispatchResult {
				let record = maybe_record.as_mut().ok_or(Error::<T>::ViewRecordNotFound)?;
				
				ensure!(record.viewer == who, DispatchError::BadOrigin);
				ensure!(!record.completed, Error::<T>::ViewAlreadyCompleted);
				
				record.completed = true;
				
				Self::deposit_event(Event::AdViewCompleted {
					view_id,
					ad_id: record.ad_id,
					viewer: who,
				});
				
				Ok(())
			})
		}

		/// Record an ad click
		#[pallet::call_index(2)]
		#[pallet::weight(10_000)]
		pub fn record_click(origin: OriginFor<T>, ad_id: u32) -> DispatchResult {
			let who = ensure_signed(origin)?;
			
			// Update click count
			ClickRecords::<T>::mutate(ad_id, |count| {
				*count = count.saturating_add(1);
			});
			
			// Update metrics
			AdMetricsStorage::<T>::mutate(ad_id, |metrics| {
				metrics.total_clicks = metrics.total_clicks.saturating_add(1);
			});
			
			Self::deposit_event(Event::AdClickRecorded { ad_id, viewer: who });
			
			Ok(())
		}

		/// Get ad performance metrics (callable by anyone)
		#[pallet::call_index(3)]
		#[pallet::weight(10_000)]
		pub fn get_ad_metrics(origin: OriginFor<T>, ad_id: u32) -> DispatchResult {
			let _ = ensure_signed(origin)?;
			
			let metrics = AdMetricsStorage::<T>::get(ad_id);
			
			Self::deposit_event(Event::MetricsUpdated {
				ad_id,
				views: metrics.total_views,
				clicks: metrics.total_clicks,
			});
			
			Ok(())
		}
	}
}
