import { adminOrderAPI } from './api.js';
import { formatOrderDate } from './utils.js';
import {
	showSuccessToast,
	showErrorToast,
	showWarningToast,
	showConfirmDialog,
} from './sweetalert.js';

const orderPageTableBody = document.querySelector('.orderPage-table-body');
const discardAllBtn = document.querySelector('.discardAllBtn');

let allOrders = [];

/* ------------ 訂單相關 ------------ */

function renderOrders() {
	if (allOrders.length === 0) {
		orderPageTableBody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 40px 0;">
          目前沒有訂單資料
        </td>
      </tr>
    `;
		return;
	}

	orderPageTableBody.innerHTML = allOrders
		.map((order) => {
			const orderDate = formatOrderDate(order.createdAt);
			const orderedItems = order.products
				.map((product) => product.title)
				.join('<br/>');
			const statusText = order.paid ? '已處理' : '未處理';
			const statusClass = order.paid
				? 'orderStatus-done'
				: 'orderStatus-unDone';

			return `
          <tr data-id="${order.id}">
          <td>${order.createdAt}</td>
          <td>
            <p>${order.user.name}</p>
            <p>${order.user.tel}</p>
          </td>
          <td>${order.user.address}</td>
          <td>${order.user.email}</td>
          <td>
            <p>${orderedItems}</p>
          </td>
          <td>${orderDate}</td>
          <td class="orderStatus ${statusClass}">
            <a href="#" class="status-toggle-btn">${statusText}</a>
          </td>
          <td>
            <input type="button" class="delSingleOrder-Btn" value="刪除" />
          </td>
        </tr>
        `;
		})
		.join('');
}

async function handleToggleOrderStatus(orderId) {
	try {
		const order = allOrders.find((order) => order.id === orderId);

		if (!order) {
			showErrorToast('找不到訂單資料');
			return;
		}

		const newStatus = !order.paid;
		const statusText = newStatus ? '已處理' : '未處理';

		const confirmed = await showConfirmDialog(
			'更新訂單狀態',
			`確定要將訂單狀態更改為「${statusText}」嗎？`,
			'確定更新',
			'取消'
		);

		if (!confirmed) return;

		await adminOrderAPI.updateOrder({
			data: {
				id: orderId,
				paid: newStatus,
			},
		});

		showSuccessToast(`訂單狀態已更新為「${statusText}」`);
		await fetchOrders();
	} catch (error) {
		console.error(error);
		showErrorToast('更新訂單狀態失敗，請稍後再試');
	}
}

async function handleDeleteOrder(orderId) {
	try {
		const confirmed = await showConfirmDialog(
			'刪除訂單',
			'確定要刪除此訂單嗎？此操作無法復原。',
			'確定刪除',
			'取消'
		);

		if (!confirmed) return;

		await adminOrderAPI.deleteOrder(orderId);
		showSuccessToast('此筆訂單已刪除');
		await fetchOrders();
	} catch (error) {
		console.error(error);
		showErrorToast('刪除訂單失敗，請稍後再試');
	}
}

async function handleDeleteAllOrders() {
	if (allOrders.length === 0) {
		showWarningToast('目前沒有訂單可刪除');
		return;
	}

	const confirmed = await showConfirmDialog(
		'刪除全部訂單',
		'確定要刪除所有訂單嗎？此操作無法復原。',
		'確定刪除',
		'取消'
	);

	if (!confirmed) return;

	try {
		await adminOrderAPI.deleteAllOrders();
		showSuccessToast('所有訂單已刪除');
		await fetchOrders();
	} catch (error) {
		console.error(error);
		showErrorToast('刪除全部訂單失敗，請稍後再試');
	}
}

async function fetchOrders() {
	try {
		const response = await adminOrderAPI.getOrders();
		allOrders = response.data.orders;
		renderOrders();
	} catch (error) {
		console.error(error);
	}
}

/* ------------ INIT ------------ */
async function initializeApp() {
	await fetchOrders();

	orderPageTableBody.addEventListener('click', async (event) => {
		const orderRow = event.target.closest('tr');
		const orderId = orderRow?.dataset.id;

		if (!orderId) return;

		if (event.target.classList.contains('status-toggle-btn')) {
			event.preventDefault();
			await handleToggleOrderStatus(orderId);
		}

		if (event.target.classList.contains('delSingleOrder-Btn')) {
			event.preventDefault();
			await handleDeleteOrder(orderId);
		}
	});

	discardAllBtn.addEventListener('click', async (event) => {
		event.preventDefault();
		await handleDeleteAllOrders();
	});
}

initializeApp();

/* ------------ 圖表相關 ------------ */
let chart = c3.generate({
	bindto: '#chart', // HTML 元素綁定
	data: {
		type: 'pie',
		columns: [
			['Louvre 雙人床架', 1],
			['Antony 雙人床架', 2],
			['Anty 雙人床架', 3],
			['其他', 4],
		],
		colors: {
			'Louvre 雙人床架': '#DACBFF',
			'Antony 雙人床架': '#9D7FEA',
			'Anty 雙人床架': '#5434A7',
			其他: '#301E5F',
		},
	},
});
