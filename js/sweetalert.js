const Toast = Swal.mixin({
	toast: true,
	position: 'bottom-start',
	showConfirmButton: false,
	timer: 3000,
	timerProgressBar: true,
	width: 'auto',
	didOpen: (toast) => {
		toast.addEventListener('mouseenter', Swal.stopTimer);
		toast.addEventListener('mouseleave', Swal.resumeTimer);
	},
});

export function showSuccessToast(message = '操作成功！') {
	Toast.fire({
		icon: 'success',
		title: message,
		timer: 2000,
	});
}

export function showErrorToast(message = '操作失敗，請稍後再試！') {
	Toast.fire({
		icon: 'error',
		title: message,
		timer: 3000,
	});
}

export function showWarningToast(message = '請注意！') {
	Toast.fire({
		icon: 'warning',
		title: message,
		timer: 3000,
	});
}

export async function showConfirmDialog(
	title = '確認操作',
	text = '您確定要執行此操作嗎？',
	confirmButtonText = '確認',
	cancelButtonText = '取消'
) {
	const result = await Swal.fire({
		title: title,
		text: text,
		icon: 'question',
		showCancelButton: true,
		confirmButtonColor: '#3085d6',
		cancelButtonColor: '#d33',
		confirmButtonText: confirmButtonText,
		cancelButtonText: cancelButtonText,
		customClass: {
			confirmButton: 'swal-btn-check',
			cancelButton: 'swal-btn-cancel',
		},
	});

	return result.isConfirmed;
}
