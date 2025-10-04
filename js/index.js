import { productAPI, cartAPI } from './api.js';
import { formatPriceWithCurrency } from './utils.js';

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
				`<tr>
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
                <a href="#" class="material-icons" id="removeBtn"> remove </a>
              </div>
              ${cart.quantity}
              <div class="cardItem-updateBtn">
                <a href="#" class="material-icons" id="addBtn"> add </a>
              </div>
            </div>
          </td>
          <td>${formatPriceWithCurrency(
						cart.product.price * cart.quantity
					)}</td>
          <td class="discardBtn">
            <a href="#" class="material-icons cardItem-deleteBtn" data-id="${
							cart.id
						}"> clear </a>
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
		} else {
			await cartAPI.addToCart({
				data: {
					productId: productId,
					quantity: 1,
				},
			});
		}

		await fetchCarts();
	} catch (error) {
		console.error('操作失敗，請稍後再試', error);
	}
}

async function handleDeleteCartItem(cartItemId) {
	try {
		await cartAPI.deleteCartItem(cartItemId);
		await fetchCarts();
	} catch (error) {
		console.error('操作失敗，請稍後再試', error);
	}
}

async function handleDeleteAllCartItems() {
	if (allCarts.length === 0) {
		alert('購物車目前沒有商品');
		return;
	}

	try {
		await cartAPI.clearAllCarts();
		await fetchCarts();
	} catch (error) {
		console.error('操作失敗，請稍後再試', error);
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
			const productId = event.target.dataset.id;
			handleAddToCart(productId);
		}
	});

	shoppingCartTbody.addEventListener('click', (event) => {
		if (event.target.classList.contains('cardItem-deleteBtn')) {
			event.preventDefault();
			const cartItemId = event.target.dataset.id;
			handleDeleteCartItem(cartItemId);
		}
	});

	deleteCartsBtn.addEventListener('click', (event) => {
		event.preventDefault();
		handleDeleteAllCartItems();
	});
}

initializeApp();
