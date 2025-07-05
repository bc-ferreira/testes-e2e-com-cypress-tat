// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
// cypress/support/commands.js

Cypress.Commands.add('fillSignupFormAndSubmit', (email, password) => {
  cy.intercept('GET', '**/notes').as('getNotes') // Define a rota que será interceptada(escutada) e da um nome para esse intercept
  cy.visit('/signup') // visita a baseUrl definida no cypress.config.json concatenada com a rota de signup
  cy.get('#email').type(email) // Digita o emai no campo de email
  cy.get('#password').type(password, { log: false }) // Digita a senha no campo de senha, sem exibir no console
  cy.get('#confirmPassword').type(password, { log: false }) // Digita a senha no campo de confirmar senha sem exibir no console
  cy.contains('button', 'Signup').click() // Clica no botão de signup
  cy.get('#confirmationCode').should('be.visible') // Espera que o campo de código de confirmação seja visível
  cy.mailosaurGetMessage(Cypress.env('MAILOSAUR_SERVER_ID'), {
    sentTo: email // Busca a mensagem que foi enviada para o email informado
  }).then(message => { // Quando a mensagem for encontrada
    const confirmationCode = message.html.body.match(/\d{6}/)[0] // Extrai o código de confirmação da mensagem
    cy.get('#confirmationCode').type(`${confirmationCode}{enter}`) // Digita o código de confirmação e pressiona enter
    cy.wait('@getNotes') // Espera a rota de notes ser interceptada
  })
})

Cypress.Commands.add('guiLogin', (
  username = Cypress.env('USER_EMAIL'), // atribui o valor da variavel USER_EMAIL ao username se nao for informado
  password = Cypress.env('USER_PASSWORD') // atribui o valor da variavel USER_PASSWORD ao password se nao for informado
) => {
  cy.intercept('GET', '**/notes').as('getNotes')
  cy.visit('/login')
  cy.get('#email').type(username)
  cy.get('#password').type(password, { log: false })
  cy.contains('button', 'Login').click()
  cy.wait('@getNotes') //verificar uma requisição esperada após o login é uma boa prática para garantir os asserts após o login
  cy.contains('h1', 'Your Notes').should('be.visible')
})

Cypress.Commands.add('sessionLogin', (
  username = Cypress.env('USER_EMAIL'),
  password = Cypress.env('USER_PASSWORD')
) => {
  const login = () => cy.guiLogin(username, password)
  cy.session(username, login) // primeiro argumento é o id da sessao, segundo é a funcao que sera executada
})

const attachFileHandler = () => { // Funcao para anexar um arquivo
  cy.get('#file').selectFile('cypress/fixtures/example.json')
}

Cypress.Commands.add('createNote', (noteDescription, attachFile = false) => {

  cy.visit('notes/new')
  cy.get('#content').type(noteDescription) // Digita a descricao da nota

  if (attachFile) {
    attachFileHandler()
  }

  cy.contains ('button', 'Create').click() // Clica em um botão que contenha o texto Create
  cy.contains('.list-group-item', noteDescription).should('be.visible') // Valida se a nota foi criada
})

Cypress.Commands.add('editNote', (noteDescription, updatedNoteDescription, attachFile = false) => {
  cy.intercept('GET', '**/notes/**').as('getNote')

  cy.contains('.list-group-item', noteDescription).should('be.visible').click() // Clica na nota para editar
  cy.wait('@getNote')
  cy.get('#content').as('contentField').clear() // get no campo, as para dar um alias e limpar o campo
  cy.get('@contentField').type(updatedNoteDescription)
  if (attachFile) {
    attachFileHandler()
  }
  cy.contains('button', 'Save').click()
  cy.contains('.list-group-item', updatedNoteDescription).should('be.visible')
  cy.contains('.list-group-item', noteDescription).should('not.exist')
})

Cypress.Commands.add('deleteNote', (updatedNoteDescription) => {
  cy.contains('.list-group-item', updatedNoteDescription).click()
  cy.contains('button', 'Delete').click()
  cy.get('.list-group-item').its('length').should('be.at.least', 1) // Verifica se ao menos uma nota foi criada. Boa pratica fazer uma verificacao positiva antes de confirmar a negativa.
  cy.contains('.list-group-item', updatedNoteDescription).should('not.exist') // Verifica se a nota foi deletada
})

Cypress.Commands.add('fillSettingsFormAndSubmit', () => {
  cy.visit('/settings') // Visita a rota de settings
  cy.get('#storage').type('1') // Digita 1 no campo de storage
  cy.get('#name').type('John Doe') // Digita o nome no campo de name
  cy.iframe('.card-field iframe').as('iframe').find('[name="cardnumber"]').type('4242424242424242') // O iframe esta dentro do card-field. Da um alias para ele e Busca o cardNumber e digita 4242424242424242
  cy.get('@iframe').find('[name="exp-date"]').type('1271') // Busca o iframe pelo alias, busca o exp-date e digita 1271
  cy.get('@iframe').find('[name="cvc"]').type('123') // Busca o iframe pelo alias, busca o cvc e digita 123
  cy.get('@iframe').find('[name="postal"]').type('12345') // Busca o iframe pelo alias, busca o postal e digita 12345
  cy.contains('button', 'Purchase').click() // Clica no botão de purchase
})