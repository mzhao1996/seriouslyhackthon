/// <reference types="cypress" />

describe('Filter and Sort Tests', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });

  it('should filter professionals by country', () => {
    cy.get('[data-testid="country-filter"]').click();
    cy.get('[data-testid="country-option"]').first().click();
    cy.get('.grid > :nth-child(1) > .p-6').should('exist');
  });

  it('should filter professionals by skills', () => {
    cy.get('[data-testid="skills-filter"]').click();
    cy.get('[data-testid="skill-option"]').first().click();
    cy.get('.grid > :nth-child(1) > .p-6').should('exist');
  });


  it('should combine filters and search', () => {
    // Apply country filter
    cy.get('[data-testid="country-filter"]').click();
    cy.get('[data-testid="country-option"]').first().click();
    
    // Apply skills filter
    cy.get('[data-testid="skills-filter"]').click();
    cy.get('[data-testid="skill-option"]').first().click();
    
    // Perform search
    const searchTerm = 'developer';
    cy.get('input[placeholder*="Search by name, country, skills or bio..."]').type(searchTerm);
    cy.get('button').contains('Search').click();
    
    cy.get('.grid > :nth-child(1) > .p-6').should('exist');
  });
}); 