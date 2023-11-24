/**
 * @jest-environment jsdom
*/

import { screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import Bills from "../containers/Bills.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import userEvent from "@testing-library/user-event";

import router from "../app/Router.js";

jest.mock("../app/Store", () => mockStore);

describe("Given I am connected as an employee", () => {
	beforeEach(() => {
		Object.defineProperty(window, "localStorage", { value: localStorageMock, });
		window.localStorage.setItem("user", JSON.stringify({ type: "Employee", }));
	});

	describe("When I am on Bills Page", () => {
		test("Then bill icon in vertical layout should be highlighted", async () => {
			const root = document.createElement("div");
			root.setAttribute("id", "root");
			document.body.append(root);

			router();
			window.onNavigate(ROUTES_PATH.Bills);
			await waitFor(() => screen.getByTestId("icon-window"));

			const windowIcon = screen.getByTestId("icon-window");
			expect(windowIcon.classList.contains("active-icon")).toBe(true);
		});

		test("Then bills should be ordered from earliest to latest", () => {
			document.body.innerHTML = BillsUI({ data: bills });

			const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map((a) => a.innerHTML);
			const antiChrono = (a, b) => (a < b ? 1 : -1);
			const datesSorted = [...dates].sort(antiChrono);

			expect(dates).toEqual(datesSorted);
		});
	});

	describe("When I am on Bills page and I click on eye button", () => {
		window.$ = $; // Define $ variable for mock JQuery function
		$.fn.modal = jest.fn(); // Mock modal function get by JQuery

		test("Modal should be appear", () => {
			document.body.innerHTML = BillsUI({ data: bills });

			const container = new Bills({ document, onNavigate, store: mockStore, localStorage: window.localStorage, });
			const iconEye = screen.getAllByTestId("icon-eye")[0];
			const handleClickIconEye = jest.fn(container.handleClickIconEye(iconEye));

			iconEye.addEventListener("click", handleClickIconEye);
			userEvent.click(iconEye);

			expect(handleClickIconEye).toHaveBeenCalled();
			expect(document.querySelector(".modal-body")).toBeTruthy();
		});
	});
});

// GET Integration Tests
describe("Given I am connected as an employee", () => {
	beforeEach(() => {
		jest.spyOn(mockStore, "bills");
		Object.defineProperty(window, "localStorage", {  value: localStorageMock, });
		window.localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a", }));
	});

	describe("When I navigate to BillsUI", () => {
		test("fetches bills from mock API GET", async () => {
			const bills = await mockStore.bills().list();
    		expect(bills.length).toBe(4);
		});

		describe("When an error occurs on API", () => {
			test("fetches bills from an API and fails with 404 message error", async () => {
				mockStore.bills.mockImplementationOnce(() => {
					return {
						list: () => {
							return Promise.reject(new Error("Erreur 404"));
						},
					};
				});

				document.body.innerHTML = BillsUI({ error: 'Erreur 404' });

				const message = screen.getByText(/Erreur 404/);
				expect(message).toBeTruthy();
			});

			test("fetches messages from an API and fails with 500 message error", async () => {
				mockStore.bills.mockImplementationOnce(() => {
					return {
						list: () => {
							return Promise.reject(new Error("Erreur 500"));
						},
					};
				});

				document.body.innerHTML = BillsUI({ error: 'Erreur 500' });

				const message = screen.getByText(/Erreur 500/);
				expect(message).toBeTruthy();
			});
		});
	});
});
