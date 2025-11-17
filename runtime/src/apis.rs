//! Runtime API definitions for PolkaAds runtime
//! This module provides the runtime API versions used by the node

use crate::Block;
use sp_api::impl_runtime_apis;
use sp_version::RuntimeVersion;

/// Runtime API versions
pub const RUNTIME_API_VERSIONS: sp_version::RuntimeVersion = RuntimeVersion {
	spec_name: sp_version::create_runtime_str!("polkaads"),
	impl_name: sp_version::create_runtime_str!("polkaads"),
	authoring_version: 1,
	spec_version: 100,
	impl_version: 1,
	apis: sp_version::create_apis_vec!(
		[sp_api::API_ID_CORE, sp_api::runtime_decl_for_Core::runtime_api_versions]
		[sp_api::API_ID_BLOCK_BUILDER, sp_api::runtime_decl_for_BlockBuilder::runtime_api_versions]
		[sp_api::API_ID_TAGGED_TRANSACTION_QUEUE, sp_api::runtime_decl_for_TaggedTransactionQueue::runtime_api_versions]
		[sp_api::API_ID_OFFCHAIN_WORKER, sp_api::runtime_decl_for_OffchainWorkerApi::runtime_api_versions]
		[sp_api::API_ID_SESSION_KEYS, sp_api::runtime_decl_for_SessionKeys::runtime_api_versions]
		[frame_system_rpc_runtime_api::API_ID_SYSTEM, frame_system_rpc_runtime_api::runtime_decl_for_AccountNonceApi::runtime_api_versions]
		[pallet_transaction_payment_rpc_runtime_api::API_ID_TRANSACTION_PAYMENT, pallet_transaction_payment_rpc_runtime_api::runtime_decl_for_TransactionPaymentApi::runtime_api_versions]
	),
	transaction_version: 1,
	state_version: 1,
};

/// Runtime API type alias for node usage
pub type RuntimeApi = sp_api::Impl<Block, crate::Runtime>;

