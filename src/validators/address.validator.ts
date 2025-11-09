import { Address } from "../types/types";

/**
 * Validates if an address object has all required fields
 * @param address - The address object to validate
 * @returns true if address is valid, false otherwise
 */
export const isValidAddress = (address: any): address is Address => {
  return (
    address &&
    typeof address === "object" &&
    typeof address.street === "string" &&
    address.street.trim() !== "" &&
    typeof address.city === "string" &&
    address.city.trim() !== "" &&
    typeof address.country === "string" &&
    address.country.trim() !== "" &&
    typeof address.postalCode === "string" &&
    address.postalCode.trim() !== ""
  );
};

/**
 * Validates an address array and returns normalized array with validation result
 * @param address - Single address object or array of addresses
 * @returns Object with isValid flag, normalized address array, and error message if invalid
 */
export const validateAddressArray = (
  address: Address | Address[] | undefined
): {
  isValid: boolean;
  addressArray: Address[];
  error?: string;
} => {
  // Check if address exists
  if (!address) {
    return {
      isValid: false,
      addressArray: [],
      error: "At least one address is required",
    };
  }

  // Normalize to array
  const addressArray = Array.isArray(address) ? address : [address];

  // Check if array is empty
  if (addressArray.length === 0) {
    return {
      isValid: false,
      addressArray: [],
      error: "At least one address is required",
    };
  }

  // Validate each address
  for (let i = 0; i < addressArray.length; i++) {
    if (!isValidAddress(addressArray[i])) {
      return {
        isValid: false,
        addressArray: [],
        error: `Address ${
          i + 1
        } is invalid. All fields (street, city, country, postalCode) are required and must be non-empty strings.`,
      };
    }
  }

  return {
    isValid: true,
    addressArray: addressArray as Address[],
  };
};

