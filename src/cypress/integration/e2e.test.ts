/// <reference types="cypress" />

describe("Smoke Test", function () {
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

  it.only("yodlee connection loads", function () {
    cy.visit("/");
    cy.get('[name="email"]').type(Cypress.env('USERNAME'));
    cy.get('[name="password"]').type(Cypress.env('USER_PASSWORD'));
    cy.get('[type="submit"]').click();
    cy.intercept('https://4uk4vcy7wzf7zfyqqo74aijdku.appsync-api.us-west-2.amazonaws.com/graphql').as('Cognito');
    cy.wait('@Cognito')
    cy.wait(2000);
    cy.get('[data-cy="addAsset"]').first().click();
    cy.get('[data-cy="yodlee"]').click();
    cy.intercept('https://fl4.prod.yodlee.com/**').as('Yodlee');
    cy.wait('@Yodlee');
    cy.intercept('https://bam-cell.nr-data.net/events/**').as('Yodlee2');
    cy.wait('@Yodlee2');
  });
});