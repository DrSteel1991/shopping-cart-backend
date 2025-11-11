import { Address } from "../types/types";

export const isValidAddress = (address: unknown): address is Address => {
  return (
    address !== null &&
    typeof address === "object" &&
    "street" in address &&
    "city" in address &&
    "country" in address &&
    "postalCode" in address &&
    typeof (address as { street: unknown }).street === "string" &&
    (address as { street: string }).street.trim() !== "" &&
    typeof (address as { city: unknown }).city === "string" &&
    (address as { city: string }).city.trim() !== "" &&
    typeof (address as { country: unknown }).country === "string" &&
    (address as { country: string }).country.trim() !== "" &&
    typeof (address as { postalCode: unknown }).postalCode === "string" &&
    (address as { postalCode: string }).postalCode.trim() !== ""
  );
};

export const validateAddressArray = (
  address: Address | Address[] | undefined
): {
  isValid: boolean;
  addressArray: Address[];
  error?: string;
} => {
  if (!address) {
    return {
      isValid: false,
      addressArray: [],
      error: "At least one address is required",
    };
  }

  const addressArray = Array.isArray(address) ? address : [address];

  if (addressArray.length === 0) {
    return {
      isValid: false,
      addressArray: [],
      error: "At least one address is required",
    };
  }

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
