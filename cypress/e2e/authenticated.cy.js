import {faker} from '@faker-js/faker/locale/en' // usar o faker somente com uma linguagem para melhora de performance

describe('Scenarios where authentication is a pre-condition', () => {
  beforeEach(() => { // Antes de cada teste executar. Sao as pre condicoes para cada teste
    cy.intercept('GET', '**/notes').as('getNotes')
    cy.sessionLogin()
  })

  it('CRUDs a note', () => {
    const noteDescription = faker.lorem.words(4)

    cy.intercept('GET', '**/notes').as('getNotes') // Intercepta a rota de notes
    cy.intercept('GET', '**/notes/**').as('getNote') // Intercepta a rota de notes com um id
    cy.sessionLogin()

    cy.createNote(noteDescription)
    cy.wait('@getNotes')

    const updatedNoteDescription = faker.lorem.words(4) // Gera uma nova descricao com 4 palavras
    const attachFile = true // Define se vai ou nao anexar um arquivo. const porque nao vai mudar. Se for let vai mudar

    cy.editNote(noteDescription, updatedNoteDescription, attachFile)
    cy.wait('@getNotes')

    cy.deleteNote(updatedNoteDescription)
    cy.wait('@getNotes')
  })

  // it.only('successfully submits the settings form', () => { only define que apenas esse teste sera executado
  it('successfully submits the settings form', () => {
    cy.intercept('POST', '**/prod/billing').as('paymentRequest') // interceptar a rota de pagamento

    cy.fillSettingsFormAndSubmit() // chama a funcao para preencher e enviar o formulario

    cy.wait('@getNotes') // checa se a rota de notes foi interceptada
    cy.wait('@paymentRequest').its('state').should('be.equal', 'Complete') // checa se a rota de pagamento foi completada
  })

  // Comando para executar os testes com viewport menor e customizado
  // npx cypress open --config viewportWidth=767,viewportHeight=480
  it('logout', () => {
    cy.visit('/')
    cy.wait('@getNotes')

    if (Cypress.config('viewportWidth') < Cypress.env('viewportWidthBreakpoint')) { // Se a largura da tela for menor que o breakpoint(que é o limite de 768px)
      cy.get('.navbar-toggle.collapsed').should('be.visible').click() // possui a classe navbar-toggle e possui o atributo collapsed
    }

    cy.contains('.nav a', 'Logout').click() // procura o elemento 'a' dentro da classe nav com o texto Logout e clica nele

    cy.get('#email').should('be.visible')
  })

})