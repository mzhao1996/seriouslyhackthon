/// <reference types="cypress" />

describe('Home Page Tests', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });

  it('should load the home page successfully', () => {
    cy.get('h1').should('be.visible');
  });

  it('should display search functionality', () => {
    cy.get('input[placeholder*="Search by name, country, skills or bio..."]').should('be.visible');
    cy.get('button').contains('Search').should('be.visible');
  });

  it('should display professional cards', () => {
    cy.get('div[class=p-6]').should('have.length.at.least', 1);
  });

  it('should filter professionals by search input', () => {
    const searchTerm = 'developer';
    cy.get('input[placeholder*="Search by name, country, skills or bio..."]').type(searchTerm);
    cy.get('button').contains('Search').click();
    cy.get('div[class=p-6]').should('exist');
  });

  it('should handle pagination', () => {
    cy.get('button').contains('Next').click();
    cy.get('div[class=p-6]').should('exist');
    cy.get('button').contains('Previous').click();
    cy.get('div[class=p-6]').should('exist');
  });
}); 