import { productAPI, cartAPI } from './api.js';

const productWrap = document.querySelector('.productWrap');
const productSelect = document.querySelector('.productSelect');

let allProducts = [];

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
					<del class="originPrice">NT$${product.origin_price}</del>
					<p class="nowPrice">NT$${product.price}</p>
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
		console.error('載入產品失敗:', error);
	}
}

function handleCategoryChange() {
	const selectedCategory = productSelect.value;
	filterProducts(selectedCategory);
}

async function initializeApp() {
	await fetchProducts();

	productSelect.addEventListener('change', handleCategoryChange);
}

initializeApp();

// 載入購物車資料
// function FetchCartData() {
// 	return cartAPI
// 		.getCarts()
// 		.then((response) => {
// 			console.log('購物車資料:', response.data);
// 			// 這裡可以處理購物車資料，例如更新購物車 UI
// 			return response.data;
// 		})
// 		.catch((error) => {
// 			console.error('載入購物車失敗:', error);
// 			throw error;
// 		});
// }
