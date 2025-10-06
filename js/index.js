import { productAPI, cartAPI } from './api.js';
import { formatPriceWithCurrency } from './utils.js';
import {
	showSuccessToast,
	showErrorToast,
	showWarningToast,
	showConfirmDialog,
} from './sweetalert.js';

const productWrap = document.querySelector('.productWrap'),
	productSelect = document.querySelector('.productSelect'),
	shoppingCartTbody = document.querySelector('.shoppingCart-tbody'),
	shoppingCartTotalPrice = document.querySelector('.shoppingCart-totalPrice'),
	deleteCartsBtn = document.querySelector('.deleteCartsBtn');

let allProducts = [],
	allCarts = [];

/* ------------ 產品相關 ------------ */
function renderProducts(filteredProducts) {
	productWrap.innerHTML = filteredProducts
		.map(
			(product) => `<li class="productCard">
					<h4 class="productType">${product.category}</h4>
					<img
						src="${product.images}"
						alt="${product.title}"
					/>
					<a href="#" class="addCardBtn" data-id="${product.id}">加入購物車</a>
					<h3>${product.title}</h3>
					<del class="originPrice">${formatPriceWithCurrency(product.origin_price)}</del>
					<p class="nowPrice">${formatPriceWithCurrency(product.price)}</p>
				</li>`
		)
		.join('');
}

function filterProducts(category = '全部') {
	const filteredProducts =
		category === '全部'
			? allProducts
			: allProducts.filter((product) => product.category === category);

	renderProducts(filteredProducts);
}

async function fetchProducts() {
	try {
		const response = await productAPI.getProducts();
		allProducts = response.data.products;
		filterProducts();
	} catch (error) {
		console.error('資料取得失敗，請稍後再嘗試', error);
	}
}

function handleCategoryChange() {
	const selectedCategory = productSelect.value;
	filterProducts(selectedCategory);
}

/* ------------ 購物車相關 ------------ */
function renderCarts() {
	if (allCarts.length === 0) {
		shoppingCartTbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 40px 0;">購物車目前沒有商品</td></tr>`;
		shoppingCartTotalPrice.textContent = formatPriceWithCurrency(0);
		return;
	}

	shoppingCartTbody.innerHTML = allCarts
		.map(
			(cart) =>
				`<tr data-id="${cart.id}">
          <td>
            <div class="cardItem-title">
              <img src="${cart.product.images}" alt="${cart.product.title}" />
              <p>${cart.product.title}</p>
            </div>
          </td>
          <td>${formatPriceWithCurrency(cart.product.price)}</td>
          <td>
            <div class="cardItem-quantity">
              <div class="cardItem-updateBtn">
                <a href="#" class="material-icons quantity-decrease-btn"> remove </a>
              </div>
              ${cart.quantity}
              <div class="cardItem-updateBtn">
                <a href="#" class="material-icons quantity-increase-btn"> add </a>
              </div>
            </div>
          </td>
          <td>${formatPriceWithCurrency(
						cart.product.price * cart.quantity
					)}</td>
          <td class="discardBtn">
            <a href="#" class="material-icons cardItem-deleteBtn"> clear </a>
          </td>
        </tr>`
		)
		.join('');

	shoppingCartTotalPrice.textContent = formatPriceWithCurrency(
		allCarts.reduce(
			(total, cart) => total + cart.product.price * cart.quantity,
			0
		)
	);
}

async function fetchCarts() {
	try {
		const response = await cartAPI.getCarts();
		// console.log(response.data.carts);

		allCarts = response.data.carts;
	} catch (error) {
		console.error('資料取得失敗，請稍後再嘗試', error);
	} finally {
		renderCarts();
	}
}

async function handleAddToCart(productId) {
	try {
		// 檢查購物車中是否已有相同商品
		const existingCartItem = allCarts.find(
			(cart) => cart.product.id === productId
		);

		if (existingCartItem) {
			// 更新現有商品數量
			await cartAPI.updateCart({
				data: {
					id: existingCartItem.id,
					quantity: existingCartItem.quantity + 1,
				},
			});
			showSuccessToast('商品數量已更新！');
		} else {
			await cartAPI.addToCart({
				data: {
					productId: productId,
					quantity: 1,
				},
			});
			showSuccessToast('商品已加入購物車！');
		}

		await fetchCarts();
	} catch (error) {
		console.error(error);
		showErrorToast('加入購物車失敗，請稍後再試！');
	}
}

async function handleDeleteCartItem(cartItemId) {
	try {
		await cartAPI.deleteCartItem(cartItemId);
		await fetchCarts();
		showSuccessToast('商品已移除！');
	} catch (error) {
		console.error(error);
		showErrorToast('移除商品失敗，請稍後再試！');
	}
}

async function handleDeleteAllCartItems() {
	if (allCarts.length === 0) {
		showWarningToast('購物車目前沒有商品');
		return;
	}

	const confirmed = await showConfirmDialog(
		'清空購物車',
		'確定要清空購物車中的所有商品嗎？',
		'確定清空',
		'取消'
	);

	if (!confirmed) return;

	try {
		await cartAPI.clearAllCarts();
		await fetchCarts();
		showSuccessToast('購物車已清空！');
	} catch (error) {
		console.error(error);
		showErrorToast('清空購物車失敗，請稍後再試！');
	}
}

async function handleUpdateCartQuantity(cartItemId, quantityChange) {
	try {
		const cartItem = allCarts.find((cart) => cart.id === cartItemId);

		if (!cartItem) {
			showErrorToast('找不到購物車項目');
			return;
		}

		const newQuantity = cartItem.quantity + quantityChange;

		// 如果新數量小於等於 0，詢問是否刪除商品
		if (newQuantity <= 0) {
			const confirmed = await showConfirmDialog(
				'移除商品',
				'數量不能小於 1，是否要移除此商品？',
				'移除',
				'取消'
			);

			if (confirmed) {
				await handleDeleteCartItem(cartItemId);
			}
			return;
		}

		await cartAPI.updateCart({
			data: {
				id: cartItemId,
				quantity: newQuantity,
			},
		});

		await fetchCarts();
		showSuccessToast('數量已更新！');
	} catch (error) {
		console.error(error);
		showErrorToast('更新數量失敗，請稍後再試！');
	}
}

/* ------------ INIT ------------ */
async function initializeApp() {
	await fetchProducts();
	await fetchCarts();

	productSelect.addEventListener('change', handleCategoryChange);

	// 事件委派
	productWrap.addEventListener('click', (event) => {
		if (event.target.classList.contains('addCardBtn')) {
			event.preventDefault();
			console.log(event);
			const productId = event.target.dataset.id;
			handleAddToCart(productId);
		}
	});

	shoppingCartTbody.addEventListener('click', (event) => {
		event.preventDefault();
		const cartItemRow = event.target.closest('tr'); // 找到 tr 父元素
		const cartItemId = cartItemRow.dataset.id;

		if (event.target.classList.contains('cardItem-deleteBtn')) {
			handleDeleteCartItem(cartItemId);
		}
		if (event.target.classList.contains('quantity-decrease-btn')) {
			handleUpdateCartQuantity(cartItemId, -1);
		}

		if (event.target.classList.contains('quantity-increase-btn')) {
			handleUpdateCartQuantity(cartItemId, 1);
		}
	});

	deleteCartsBtn.addEventListener('click', (event) => {
		event.preventDefault();
		handleDeleteAllCartItems();
	});
}

initializeApp();
