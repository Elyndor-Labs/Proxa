use crate::constants::MAX_BUCKETS;
use crate::errors::ProxaError;
use anchor_lang::prelude::*;

pub fn validate_bucket_bounds(num_buckets: u8, bounds: &[i32; MAX_BUCKETS]) -> Result<()> {
    let n = num_buckets as usize;
    for i in 0..(n - 1) {
        require!(bounds[i] < bounds[i + 1], ProxaError::InvalidBucketBounds);
    }
    Ok(())
}

pub fn winning_bucket_for(value: i32, num_buckets: u8, bounds: &[i32; MAX_BUCKETS]) -> u8 {
    let n = num_buckets as usize;
    for i in 0..(n - 1) {
        if value < bounds[i + 1] {
            return i as u8;
        }
    }
    (n - 1) as u8
}
