import { ROUTES_PATH } from "../constants/routes.js";
import Logout from "./Logout.js";

export default class NewBill {
	constructor({ document, onNavigate, store, localStorage }) {
		this.document = document;
		this.onNavigate = onNavigate;
		this.store = store;

		const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`);
		formNewBill.addEventListener("submit", this.handleSubmit);

		const file = this.document.querySelector(`input[data-testid="file"]`);
		file.addEventListener("change", this.handleChangeFile);

		this.fileUrl = null;
		this.fileName = null;
		this.billId = null;

		new Logout({ document, localStorage, onNavigate });
	}

	isPicture = (mimeType) => ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(mimeType);
	errorHandler = (element, active) => {
		const errorContainer = document.querySelector(`input[data-testid="file"]`).parentNode.querySelector("[role='alert']");

		if(errorContainer !== null && active || !active && errorContainer === null) return;
		if(!active && errorContainer !== null) return errorContainer.remove();

		let error = document.createElement("div");

		error.textContent = "Nous acceptons seulement les images : JPEG / JPG / PNG / GIF";
		error.style = "margin-top: 10px;";

		error.setAttribute("class", "alert alert-danger");
		error.setAttribute("role", "alert");

		element.appendChild(error);
	}
	
	handleChangeFile = (e) => {
		e.preventDefault();

		const inputField = this.document.querySelector(`input[data-testid="file"]`);
		const file = inputField.files[0];
		const filePath = e.target.value.split(/\\/g);
		const fileName = filePath[filePath.length - 1];
		
		const formData = new FormData();
		const email = JSON.parse(localStorage.getItem("user")).email;

		// if file is invalid, reset input file field
		if(!this.isPicture(file.type)) {						
			this.errorHandler(inputField.parentNode, true);
			return inputField.value = "";
		}

		this.errorHandler(inputField.parentNode, false);

		formData.append("file", file);
		formData.append("email", email);

		this.store.bills().create({
			data: formData,
			headers: {
				noContentType: true,
			},
		}).then(({ fileUrl, key }) => {
			console.log(fileUrl);

			this.billId = key;
			this.fileUrl = fileUrl;
			this.fileName = fileName;
		}).catch((error) => console.error(error));
	};

	handleSubmit = (e) => {
		e.preventDefault();
		console.log('e.target.querySelector(`input[data-testid="datepicker"]`).value', e.target.querySelector(`input[data-testid="datepicker"]`).value);

		const email = JSON.parse(localStorage.getItem("user")).email;
		const bill = {
			email,
			type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
			name: e.target.querySelector(`input[data-testid="expense-name"]`).value,
			amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
			date: e.target.querySelector(`input[data-testid="datepicker"]`).value,
			vat: e.target.querySelector(`input[data-testid="vat"]`).value,
			pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
			commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
			fileUrl: this.fileUrl,
			fileName: this.fileName,
			status: "pending",
		};

		this.updateBill(bill);
		this.onNavigate(ROUTES_PATH["Bills"]);
	};

	// not need to cover this function by tests
	updateBill = (bill) => {
		if (this.store) {
			this.store.bills().update({ data: JSON.stringify(bill), selector: this.billId }).then(() => {
				this.onNavigate(ROUTES_PATH["Bills"]);
			}).catch((error) => console.error(error));
		}
	};
}