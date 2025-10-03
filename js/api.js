const apiPath = 'billyji';
const apiKeyAuth = '';

// 客戶端
const userRequest = axios.create({
	baseURL: 'https://livejs-api.hexschool.io/',
});

// 產品相關 API
const productAPI = {
	// 取得產品列表
	getProducts() {
		return userRequest.get(`/api/livejs/v1/customer/${apiPath}/products`);
	},
};

// 購物車相關 API
const cartAPI = {
	// 取得購物車列表
	getCarts() {
		return userRequest.get(`/api/livejs/v1/customer/${apiPath}/carts`);
	},
	// 加入購物車
	addToCart(data) {
		return userRequest.post(`/api/livejs/v1/customer/${apiPath}/carts`, data);
		// {
		//   "data": {
		//     "productId": "產品 ID (String)",
		//     "quantity": 5
		//   }
		// }
	},
	// 更新購物車
	updateCart(data) {
		return userRequest.patch(`/api/livejs/v1/customer/${apiPath}/carts`, data);
		// {
		//   "data": {
		//     "id": "購物車 ID (String)",
		//     "quantity": 6
		//   }
		// }
	},
	// 清除購物車
	clearAllCarts() {
		return userRequest.delete(`/api/livejs/v1/customer/${apiPath}/carts`);
	},
	// 刪除特定購物車項目
	deleteCartItem(id) {
		return userRequest.delete(`/api/livejs/v1/customer/${apiPath}/carts/${id}`);
	},
};

// 訂單相關 API
const orderAPI = {
	// 送出訂單
	createOrder(data) {
		return userRequest.post(`/api/livejs/v1/customer/${apiPath}/orders`, data);
	},
	// {
	//   "data": {
	//     "user": {
	//       "name": "六角學院",
	//       "tel": "07-5313506",
	//       "email": "hexschool@hexschool.com",
	//       "address": "高雄市六角學院路",
	//       "payment": "Apple Pay"
	//     }
	//   }
	// }
};

// 管理者端
const adminRequest = axios.create({
	baseURL: 'https://livejs-api.hexschool.io/',
	headers: {
		Authorization: apiKeyAuth,
	},
});

// 管理者訂單相關 API
const adminOrderAPI = {
	// 取得訂單列表
	getOrders() {
		return adminRequest.get(`/api/livejs/v1/admin/${apiPath}/orders`);
	},
	// 更新訂單狀態
	updateOrder(data) {
		return adminRequest.put(`/api/livejs/v1/admin/${apiPath}/orders`, data);
		//     {
		//   "data": {
		//     "id": "訂單 ID (String)",
		//     "paid": true
		//   }
		// }
	},
	// 刪除全部訂單
	deleteAllOrders() {
		return adminRequest.delete(`/api/livejs/v1/admin/${apiPath}/orders`);
	},
	// 刪除特定訂單
	deleteOrder(id) {
		return adminRequest.delete(`/api/livejs/v1/admin/${apiPath}/orders/${id}`);
	},
};

// Export API modules
export { productAPI, cartAPI, orderAPI, adminOrderAPI };
