import { adminOrderAPI } from './api.js';
import { formatOrderDate } from './utils.js';
import {
	showSuccessToast,
	showErrorToast,
	showWarningToast,
	showConfirmDialog,
} from './sweetalert.js';

const orderPageTableBody = document.querySelector('.orderPage-table-body');

let allOrders = [];

/* ------------ 訂單相關 ------------ */

// const adminOrderAPI = {
//   // 更新訂單狀態
//   updateOrder(data) {
//     return adminRequest.put(`/api/livejs/v1/admin/${apiPath}/orders`, data);
//     //     {
//     //   "data": {
//     //     "id": "訂單 ID (String)",
//     //     "paid": true
//     //   }
//     // }
//   },
//   // 刪除全部訂單
//   deleteAllOrders() {
//     return adminRequest.delete(`/api/livejs/v1/admin/${apiPath}/orders`);
//   },
//   // 刪除特定訂單
//   deleteOrder(id) {
//     return adminRequest.delete(`/api/livejs/v1/admin/${apiPath}/orders/${id}`);
//   },
// };

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
