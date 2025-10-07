export function formatPriceWithCurrency(price) {
	return `NT$${price.toLocaleString()}`;
}

export function validatePhone(phone) {
	const phoneRegex = /^09\d{8}$/;
	return phoneRegex.test(phone);
}

export function validateEmail(email) {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

export function validateRequired(value) {
	return value.trim() !== '';
}

export function validateOrderForm(formData) {
	const errors = [];

	if (!validateRequired(formData.name)) {
		errors.push({ field: 'customerName', message: '姓名為必填欄位' });
	}

	if (!validateRequired(formData.tel)) {
		errors.push({ field: 'customerPhone', message: '電話為必填欄位' });
	} else if (!validatePhone(formData.tel)) {
		errors.push({
			field: 'customerPhone',
			message: '電話格式錯誤，請輸入正確的手機號碼 (09xxxxxxxx)',
		});
	}

	if (!validateRequired(formData.email)) {
		errors.push({ field: 'customerEmail', message: 'Email 為必填欄位' });
	} else if (!validateEmail(formData.email)) {
		errors.push({
			field: 'customerEmail',
			message: 'Email 格式錯誤，請輸入正確的 Email 格式',
		});
	}

	if (!validateRequired(formData.address)) {
		errors.push({ field: 'customerAddress', message: '地址為必填欄位' });
	}

	return {
		isValid: errors.length === 0,
		errors: errors,
	};
}
