use crate::{mock::*, Error, Event};
use frame_support::{assert_noop, assert_ok};

#[test]
fn register_advertiser_works() {
    new_test_ext().execute_with(|| {
        let advertiser = 1;
        assert_ok!(Ads::register_advertiser(RuntimeOrigin::signed(advertiser)));
        assert!(Advertisers::<Test>::get(advertiser));
    });
}

#[test]
fn create_ad_spot_requires_root() {
    new_test_ext().execute_with(|| {
        assert_noop!(
            Ads::create_ad_spot(RuntimeOrigin::signed(1)),
            DispatchError::BadOrigin
        );
    });
}