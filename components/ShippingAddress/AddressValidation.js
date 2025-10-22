// Address validation utilities
class AddressValidation {
  // Country-specific validation rules
  static getValidationRules(countryCode) {
    const rules = {
      TH: {
        phone: /^0[0-9]{8,9}$/,
        postal: /^[0-9]{5}$/,
        required: ['recipient_name', 'phone', 'address_line_1', 'city', 'province', 'postal_code']
      },
      US: {
        phone: /^\+?1?[0-9]{10}$/,
        postal: /^[0-9]{5}(-[0-9]{4})?$/,
        required: ['recipient_name', 'phone', 'address_line_1', 'city', 'province', 'postal_code']
      },
      GB: {
        phone: /^(\+44|0)[0-9]{10}$/,
        postal: /^[A-Z]{1,2}[0-9][A-Z0-9]? [0-9][A-Z]{2}$/i,
        required: ['recipient_name', 'phone', 'address_line_1', 'city', 'province', 'postal_code']
      },
      AU: {
        phone: /^(\+61|0)[0-9]{9}$/,
        postal: /^[0-9]{4}$/,
        required: ['recipient_name', 'phone', 'address_line_1', 'city', 'province', 'postal_code']
      },
      SG: {
        phone: /^(\+65|0)[0-9]{8}$/,
        postal: /^[0-9]{6}$/,
        required: ['recipient_name', 'phone', 'address_line_1', 'city', 'province', 'postal_code']
      },
      JP: {
        phone: /^(\+81|0)[0-9]{10,11}$/,
        postal: /^[0-9]{3}-[0-9]{4}$/,
        required: ['recipient_name', 'phone', 'address_line_1', 'city', 'province', 'postal_code']
      },
      KR: {
        phone: /^(\+82|0)[0-9]{9,10}$/,
        postal: /^[0-9]{5}$/,
        required: ['recipient_name', 'phone', 'address_line_1', 'city', 'province', 'postal_code']
      }
    };
    
    return rules[countryCode] || rules.TH; // Default to Thailand
  }

  // Validate individual field
  static validateField(field, value, countryCode = 'TH') {
    const rules = this.getValidationRules(countryCode);
    
    // Check if field is required
    if (rules.required.includes(field) && (!value || value.trim() === '')) {
      return `${this.getFieldLabel(field)} จำเป็นต้องกรอก`;
    }

    // Skip validation if value is empty and field is not required
    if (!value || value.trim() === '') {
      return null;
    }

    switch (field) {
      case 'recipient_name':
        if (value.trim().length < 2) {
          return 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร';
        }
        if (value.trim().length > 100) {
          return 'ชื่อต้องไม่เกิน 100 ตัวอักษร';
        }
        break;

      case 'phone':
        if (!rules.phone.test(value.replace(/[\s\-\(\)]/g, ''))) {
          return 'รูปแบบเบอร์โทรไม่ถูกต้อง';
        }
        break;

      case 'address_line_1':
        if (value.trim().length < 5) {
          return 'ที่อยู่ต้องมีอย่างน้อย 5 ตัวอักษร';
        }
        if (value.trim().length > 200) {
          return 'ที่อยู่ต้องไม่เกิน 200 ตัวอักษร';
        }
        break;

      case 'address_line_2':
        if (value.trim().length > 100) {
          return 'รายละเอียดเพิ่มเติมต้องไม่เกิน 100 ตัวอักษร';
        }
        break;

      case 'city':
        if (value.trim().length < 2) {
          return 'เขต/อำเภอต้องมีอย่างน้อย 2 ตัวอักษร';
        }
        if (value.trim().length > 50) {
          return 'เขต/อำเภอต้องไม่เกิน 50 ตัวอักษร';
        }
        break;

      case 'province':
        if (value.trim().length < 2) {
          return 'จังหวัดต้องมีอย่างน้อย 2 ตัวอักษร';
        }
        if (value.trim().length > 50) {
          return 'จังหวัดต้องไม่เกิน 50 ตัวอักษร';
        }
        break;

      case 'postal_code':
        if (!rules.postal.test(value.trim())) {
          return 'รหัสไปรษณีย์ไม่ถูกต้อง';
        }
        break;

      default:
        return null;
    }

    return null;
  }

  // Validate entire address object
  static async validate(address) {
    const errors = {};
    let isValid = true;

    // Validate each required field
    const rules = this.getValidationRules(address.country);
    
    for (const field of rules.required) {
      const error = this.validateField(field, address[field], address.country);
      if (error) {
        errors[field] = error;
        isValid = false;
      }
    }

    // Additional validation for optional fields
    if (address.address_line_2) {
      const error = this.validateField('address_line_2', address.address_line_2, address.country);
      if (error) {
        errors.address_line_2 = error;
        isValid = false;
      }
    }

    return {
      isValid,
      errors
    };
  }

  // Get field label for error messages
  static getFieldLabel(field) {
    const labels = {
      recipient_name: 'ชื่อผู้รับ',
      phone: 'เบอร์โทร',
      address_line_1: 'ที่อยู่',
      address_line_2: 'รายละเอียดเพิ่มเติม',
      city: 'เขต/อำเภอ',
      province: 'จังหวัด',
      postal_code: 'รหัสไปรษณีย์',
      country: 'ประเทศ'
    };
    
    return labels[field] || field;
  }

  // Format address for display
  static formatAddress(address) {
    const parts = [];
    
    if (address.recipient_name) parts.push(address.recipient_name);
    if (address.address_line_1) parts.push(address.address_line_1);
    if (address.address_line_2) parts.push(address.address_line_2);
    if (address.city && address.province) {
      parts.push(`${address.city} ${address.province}`);
    }
    if (address.postal_code) parts.push(address.postal_code);
    if (address.country) parts.push(address.country);
    
    return parts.join(', ');
  }

  // Check if address is complete
  static isComplete(address) {
    const rules = this.getValidationRules(address.country);
    
    for (const field of rules.required) {
      if (!address[field] || address[field].trim() === '') {
        return false;
      }
    }
    
    return true;
  }

  // Get country name from code
  static getCountryName(countryCode) {
    const countries = {
      TH: 'ประเทศไทย',
      US: 'สหรัฐอเมริกา',
      GB: 'สหราชอาณาจักร',
      AU: 'ออสเตรเลีย',
      SG: 'สิงคโปร์',
      JP: 'ญี่ปุ่น',
      KR: 'เกาหลีใต้'
    };
    
    return countries[countryCode] || countryCode;
  }
}

export default AddressValidation;
