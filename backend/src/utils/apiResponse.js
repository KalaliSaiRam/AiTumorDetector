/**
 * Standardised API response helper
 * Usage: res.status(200).json(apiResponse.success(data, 'Done'));
 */

const success = (data = null, message = 'Success') => ({
  success: true,
  message,
  data,
});

const error = (message = 'Something went wrong', errors = null) => ({
  success: false,
  message,
  errors,
});

module.exports = { success, error };
