/// <reference types="cypress" />

describe('Professional Detail Tests', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
    cy.get('.grid > :nth-child(1) > .p-6').first().click();
  });

  it('should display professional details modal', () => {
    cy.get('.p-8').should('be.visible');
  });

  it('should show professional skills', () => {
    cy.get('.space-y-6 > :nth-child(1)').should('be.visible');
    cy.get(':nth-child(1) > .space-y-4 > :nth-child(1)').should('exist');
    cy.get(':nth-child(1) > .space-y-4 > :nth-child(2)').should('exist');
  });

  it('should display work experience', () => {
    cy.get('.space-y-6 > :nth-child(2)').should('be.visible');
  });

  it('should display education information', () => {
    cy.get('.space-y-6 > :nth-child(3)').should('be.visible');
  });

  it('should handle booking a call', () => {
    cy.get('button').contains('Call by AI').click();
    cy.get('#radix-«rt»').should('be.visible');
    
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[placeholder*="tell the talent about yourself"]').type('Test call summary');
    cy.get('input[placeholder*="Questions you want to ask"]').type('Test questions');
    
    cy.get('button').contains('Book a Call').click();
    cy.get('h2').contains('Call Booked Successfully').should('be.visible');
  });

  it('should close the detail modal', () => {
    cy.get('button').contains('Back to List').click();
    cy.get('[data-testid="professional-detail-modal"]').should('not.exist');
  });
}); 