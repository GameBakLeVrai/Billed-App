/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { screen, fireEvent } from "@testing-library/dom";
import { ROUTES } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";

import mockStore from "../__mocks__/store.js";
import NewBill from "../containers/NewBill.js";
import NewBillUI from '../views/NewBillUI.js';

jest.mock("../app/Store", () => mockStore);

const onNavigate = (pathname) => {
	document.body.innerHTML = ROUTES({ pathname });
};

describe("Given I am connected as an Employee", () => {
	beforeEach(() => {
		Object.defineProperty(window, "localStorage", { value: localStorageMock, });
		window.localStorage.setItem("user", JSON.stringify({ type: "Employee", }));
		document.body.innerHTML = NewBillUI();
	});

	describe("When i am on NewBill Page and i share file", () => {
		test("Then I share valid file", async () => {
			const dashboard = new NewBill({ document, onNavigate, store: mockStore, localeStorage: localStorageMock, });

			const handleChangeFile = jest.fn(dashboard.handleChangeFile);
			const shareFile = screen.getByTestId("file");
			shareFile.addEventListener("change", handleChangeFile);

			fireEvent.change(shareFile, {
				target: {
					files: [
						new File(["document.jpg"], "document.jpg", {
							type: "document/jpg",
						}),
					],
				},
			});

			expect(handleChangeFile).toHaveBeenCalled();
			expect(handleChangeFile).toBeCalled();

			expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
		});

		test("Then I share invalid file", async () => {
			const dashboard = new NewBill({ document, onNavigate, store: mockStore, localeStorage: localStorageMock, });

			const handleChangeFile = jest.fn(dashboard.handleChangeFile);
			const shareFile = screen.getByTestId("file");
			shareFile.addEventListener("change", handleChangeFile);

			fireEvent.change(shareFile, {
				target: {
					files: [
						new File(["document.pdf"], "document.pdf", {
							type: "document/pdf",
						}),
					],
				},
			});

			expect(handleChangeFile).toHaveBeenCalled();
			expect(handleChangeFile).toBeCalled();

			expect(screen.getByText("Nous acceptons seulement les images : JPEG / JPG / PNG / GIF")).toBeTruthy();
		});
	});

	describe("When I am on NewBill Page and submit form", () => {
		test("Then i submit valid form", async () => {
			const newBill = new NewBill({ document, onNavigate, store: mockStore, localeStorage: localStorageMock, });
			const handleSubmit = jest.fn(newBill.handleSubmit);
			
			const form = screen.getByTestId("form-new-bill");			
			form.addEventListener("submit", handleSubmit);
			fireEvent.submit(form);

			expect(handleSubmit).toHaveBeenCalled();
		});
	});
});