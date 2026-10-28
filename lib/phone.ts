/**
 * Standardized Phone Validation & Normalization for TouchGift
 * Specializes in Kenyan mobile numbers (Safaricom 07xx/01xx, Airtel 07xx/01xx, Telkom)
 * and supports international numbers.
 */

export interface PhoneValidationResult {
  isValid: boolean;
  normalized: string;
  display: string;
  error?: string;
}

/**
 * Normalizes phone numbers to standard format (+254... or international)
 */
export function normalizePhone(raw: string, defaultCountry = "+254"): string {
  if (!raw) return "";
  const cleaned = raw.trim().replace(/[\s\-\(\)]/g, "");
  
  if (cleaned.startsWith("+")) {
    return cleaned;
  }

  // Kenyan local formats
  if (cleaned.startsWith("07") || cleaned.startsWith("01")) {
    return `+254${cleaned.slice(1)}`;
  }
  if ((cleaned.startsWith("7") || cleaned.startsWith("1")) && cleaned.length === 9) {
    return `+254${cleaned}`;
  }
  if (cleaned.startsWith("254") && cleaned.length === 12) {
    return `+${cleaned}`;
  }

  // Fallback to prepending default country if provided
  if (defaultCountry && !cleaned.startsWith("+")) {
    const noLead = cleaned.replace(/^0+/, "");
    return `${defaultCountry}${noLead}`;
  }

  return cleaned;
}

/**
 * Cleans phone to numbers only for WhatsApp URL (e.g., 254711223344)
 */
export function getWhatsAppPhone(raw: string): string {
  const normalized = normalizePhone(raw);
  return normalized.replace(/\D/g, "");
}

/**
 * Validates whether a phone number is a valid Kenyan or international mobile number
 */
export function validatePhone(raw: string): PhoneValidationResult {
  const trimmed = (raw || "").trim();
  if (!trimmed) {
    return {
      isValid: false,
      normalized: "",
      display: "",
      error: "Phone number is required",
    };
  }

  const digits = trimmed.replace(/\D/g, "");

  // Kenyan specific validation
  if (trimmed.startsWith("+254") || trimmed.startsWith("254") || trimmed.startsWith("07") || trimmed.startsWith("01")) {
    // 07XXXXXXXX or 01XXXXXXXX (10 digits)
    if ((digits.startsWith("07") || digits.startsWith("01")) && digits.length === 10) {
      const normalized = `+254${digits.slice(1)}`;
      return {
        isValid: true,
        normalized,
        display: formatPhoneDisplay(normalized),
      };
    }

    // 2547XXXXXXXX or 2541XXXXXXXX (12 digits)
    if ((digits.startsWith("2547") || digits.startsWith("2541")) && digits.length === 12) {
      const normalized = `+${digits}`;
      return {
        isValid: true,
        normalized,
        display: formatPhoneDisplay(normalized),
      };
    }

    // 9 digits without leading zero: 7XXXXXXXX or 1XXXXXXXX
    if ((digits.startsWith("7") || digits.startsWith("1")) && digits.length === 9) {
      const normalized = `+254${digits}`;
      return {
        isValid: true,
        normalized,
        display: formatPhoneDisplay(normalized),
      };
    }

    return {
      isValid: false,
      normalized: "",
      display: trimmed,
      error: "Enter a valid 10-digit Kenyan number (e.g., 0712 345 678)",
    };
  }

  // Generic international number
  if (trimmed.startsWith("+")) {
    if (digits.length >= 8 && digits.length <= 15) {
      return {
        isValid: true,
        normalized: `+${digits}`,
        display: `+${digits}`,
      };
    }
    return {
      isValid: false,
      normalized: "",
      display: trimmed,
      error: "Enter a valid international phone number with country code",
    };
  }

  // Standard digits between 9 and 12
  if (digits.length >= 9 && digits.length <= 12) {
    const normalized = normalizePhone(trimmed);
    return {
      isValid: true,
      normalized,
      display: formatPhoneDisplay(normalized),
    };
  }

  return {
    isValid: false,
    normalized: "",
    display: trimmed,
    error: "Invalid phone number format",
  };
}

/**
 * Formats a phone number cleanly with spacing for readability
 */
export function formatPhoneDisplay(phone: string): string {
  if (!phone) return "";
  const cleaned = phone.replace(/[\s\-]/g, "");
  
  if (cleaned.startsWith("+254") && cleaned.length === 13) {
    // +254 7XX XXX XXX
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 10)} ${cleaned.slice(10)}`;
  }

  if ((cleaned.startsWith("07") || cleaned.startsWith("01")) && cleaned.length === 10) {
    // 07XX XXX XXX
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }

  return phone;
}

