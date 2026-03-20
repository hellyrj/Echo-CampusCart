import { useCallback } from 'react';
import { useApiCall } from './useApiCall';
import { vendorApi } from '../api/vendor.api';

export const useVendorApi = () => {
  const { executeCall, loading, error, resetError } = useApiCall();

  const createVendor = useCallback(async (vendorData) => {
    const result = await executeCall(vendorApi.createVendor, vendorData);
    if (result.success) {
      return { success: true, vendor: result.data.data };
    }
    return { success: false, message: result.message };
  }, [executeCall]);

  const getVendor = useCallback(async (vendorId) => {
    const result = await executeCall(vendorApi.getVendor, vendorId);
    return result;
  }, [executeCall]);

  const updateVendor = useCallback(async (vendorId, vendorData) => {
    const result = await executeCall(vendorApi.updateVendor, vendorId, vendorData);
    if (result.success) {
      return { success: true, vendor: result.data.data };
    }
    return { success: false, message: result.message };
  }, [executeCall]);

  const deleteVendor = useCallback(async (vendorId) => {
    const result = await executeCall(vendorApi.deleteVendor, vendorId);
    if (result.success) {
      return { success: true, message: 'Vendor deleted successfully' };
    }
    return { success: false, message: result.message };
  }, [executeCall]);

  const getNearbyVendors = useCallback(async (params) => {
    const result = await executeCall(vendorApi.getNearbyVendors, params);
    return result;
  }, [executeCall]);

  const getMyVendor = useCallback(async () => {
    const result = await executeCall(vendorApi.getMyVendor);
    return result;
  }, [executeCall]);

  return {
    createVendor,
    getVendor,
    updateVendor,
    deleteVendor,
    getNearbyVendors,
    getMyVendor,
    loading,
    error,
    resetError
  };
};

export default useVendorApi;