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
const chartSelect = document.querySelector('#chartSelect');
const sectionTitle = document.querySelector('.section-title');
const productChartContainer = document.querySelector('#productChart');
const categoryChartContainer = document.querySelector('#categoryChart');

let allOrders = [];
let productChart = null;
let categoryChart = null;

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
		initProductChart();
		initCategoryChart();

		const selectedChartType = chartSelect.value;
		sectionTitle.textContent = selectedChartType;

		if (selectedChartType === '全產品類別營收比重') {
			productChartContainer.style.display = 'none';
			categoryChartContainer.style.display = 'block';
		} else {
			productChartContainer.style.display = 'block';
			categoryChartContainer.style.display = 'none';
		}
	} catch (error) {
		console.error('載入訂單失敗:', error);
		showErrorToast('載入訂單失敗，請稍後再試');
	}
}

/* ------------ 圖表相關 ------------ */
function processOrdersForChart() {
	if (allOrders.length === 0) {
		return [['無資料', 1]];
	}

	const productRevenue = {};

	allOrders.forEach((order) => {
		if (order.products && order.products.length > 0) {
			order.products.forEach((product) => {
				const quantity = product.quantity || 1;
				const revenue = product.price * quantity;

				if (productRevenue[product.title]) {
					productRevenue[product.title] += revenue;
				} else {
					productRevenue[product.title] = revenue;
				}
			});
		}
	});

	// 轉換為 C3 圖表格式
	const chartColumns = Object.entries(productRevenue).sort(
		(a, b) => b[1] - a[1]
	);

	return chartColumns;
}

function processOrdersForCategoryChart() {
	if (allOrders.length === 0) {
		console.log('沒有訂單資料，返回預設值');
		return [['無資料', 1]];
	}

	const categoryRevenue = {};

	allOrders.forEach((order, orderIndex) => {
		if (order.products && order.products.length > 0) {
			order.products.forEach((product, productIndex) => {
				console.log(`  商品 ${productIndex + 1}:`, {
					title: product.title,
					category: product.category,
					price: product.price,
					quantity: product.quantity,
				});

				const quantity = product.quantity || 1;
				const revenue = product.price * quantity;
				// 使用實際的 category，如果沒有則歸類為「未分類」
				const category = product.category || '未分類';

				if (categoryRevenue[category]) {
					categoryRevenue[category] += revenue;
				} else {
					categoryRevenue[category] = revenue;
				}
			});
		} else {
			console.log('此訂單沒有商品資料');
		}
	});

	// 轉換為 C3 圖表格式
	const chartColumns = Object.entries(categoryRevenue).sort(
		(a, b) => b[1] - a[1]
	);

	if (chartColumns.length === 0) {
		console.log('沒有有效的類別資料，返回預設值');
		return [['無資料', 1]];
	}

	return chartColumns;
}

// 顏色處理
function generateChartColors(columns, chartType = 'product') {
	let colorPalette;

	if (chartType === 'category') {
		colorPalette = [
			'#5434A7',
			'#9D7FEA',
			'#DACBFF',
			'#301E5F',
			'#8B5CF6',
			'#7C3AED',
			'#A855F7',
			'#C084FC',
		];
	} else {
		colorPalette = [
			'#DACBFF',
			'#9D7FEA',
			'#5434A7',
			'#301E5F',
			'#8B5CF6',
			'#7C3AED',
		];
	}

	const colors = {};
	columns.forEach(([title], index) => {
		colors[title] = colorPalette[index % colorPalette.length];
	});

	return colors;
}

function initProductChart() {
	if (productChart) {
		productChart.destroy();
	}

	const chartColumns = processOrdersForChart();
	const chartColors = generateChartColors(chartColumns, 'product');

	productChart = c3.generate({
		bindto: '#productChart',
		data: {
			type: 'pie',
			columns: chartColumns,
			colors: chartColors,
		},
	});
}

function initCategoryChart() {
	if (categoryChart) {
		categoryChart.destroy();
	}

	const chartColumns = processOrdersForCategoryChart();
	const chartColors = generateChartColors(chartColumns, 'category');

	categoryChart = c3.generate({
		bindto: '#categoryChart',
		data: {
			type: 'pie',
			columns: chartColumns,
			colors: chartColors,
		},
	});
}

/**
 * 圖表切換
 */
function handleChartChange() {
	const selectedValue = chartSelect.value;
	console.log('切換圖表類型:', selectedValue);

	sectionTitle.textContent = selectedValue;

	if (selectedValue === '全品項營收比重') {
		productChartContainer.style.display = 'block';
		categoryChartContainer.style.display = 'none';
	} else if (selectedValue === '全產品類別營收比重') {
		productChartContainer.style.display = 'none';
		categoryChartContainer.style.display = 'block';
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

	chartSelect.addEventListener('change', handleChartChange);
}

initializeApp();
