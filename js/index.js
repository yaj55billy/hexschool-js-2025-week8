import { productAPI, cartAPI } from './api.js';

function testFunc() {
	productAPI
		.getProducts()
		.then((response) => {
			console.log(response.data);
		})
		.catch((error) => {
			console.error(error);
		});
}
testFunc();
