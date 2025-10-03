import { productAPI, cartAPI } from './api.js';
import { formatPriceWithCurrency } from './utils.js';

const productWrap = document.querySelector('.productWrap'),
	productSelect = document.querySelector('.productSelect'),
	shoppingCartTbody = document.querySelector('.shoppingCart-tbody'),
	shoppingCartTotalPrice = document.querySelector('.shoppingCart-totalPrice');

let allProducts = [],
	allCarts = [];

function renderProducts(filteredProducts) {
	productWrap.innerHTML = filteredProducts
		.map(
			(product) => `<li class="productCard">
					<h4 class="productType">${product.category}</h4>
					<img
						src="${product.images}"
						alt="${product.title}"
					/>
					<a href="#" class="addCardBtn">加入購物車</a>
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
            <a href="#" class="material-icons"> clear </a>
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
		allCarts = response.data.carts;
	} catch (error) {
		console.error('資料取得失敗，請稍後再嘗試', error);
	} finally {
		renderCarts();
	}
}

async function initializeApp() {
	await fetchProducts();
	await fetchCarts();

	productSelect.addEventListener('change', handleCategoryChange);
}

initializeApp();
