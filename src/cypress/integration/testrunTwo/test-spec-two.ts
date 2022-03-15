/// <reference types="cypress" />

describe("Spec 2", function () {
    beforeEach(function () {
  
    });
  
    it("user can navigate to Login page", function () {
      cy.visit("/");
      cy.location("pathname").should("equal", "/login");
    });
    
    it("user is able to login", function () {
      cy.visit("/");
      cy.get('[name="email"]').type(Cypress.env('USERNAME'));
      cy.get('[name="password"]').type(Cypress.env('USER_PASSWORD'));
      cy.get('[type="submit"]').click();
      cy.location("pathname").should("equal", "/dashboard/app");
    });
  });