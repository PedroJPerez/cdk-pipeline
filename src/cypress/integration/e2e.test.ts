describe("User Sign-up and Login", function () {
  beforeEach(function () {

  });

  it("should navigate to Login Page", function () {
    cy.visit("/");
    cy.location("pathname").should("equal", "/login");
  });
  
  it("should login user", function () {
    cy.visit("/");
    cy.get('[name="email"]').type(Cypress.env('USERNAME'));
    cy.get('[name="password"]').type(Cypress.env('USER_PASSWORD'));
    cy.get('[type="submit"]').click();
    cy.location("pathname").should("equal", "/dashboard/app");
  });
});