[x] Deve ser possível criar um usuário;
[x] Deve ser possível identificar o usuário entre as requisições;

[X] Deve ser possível registrar uma refeição feita, com as seguintes informações:

*As refeições devem ser relacionadas a um usuário.*

[x] Nome,
[x] Descrição,
[x] Data e Hora,
[x] Está dentro ou não da dieta,

[x] Deve ser possível editar uma refeição, podendo alterar todos os dados acima;
[x] Deve ser possível apagar uma refeição;
[x] Deve ser possível listar todas as refeições de um usuário;
[x] Deve ser possível visualizar uma única refeição;

[x] Deve ser possível recuperar as métricas de um usuário;
[x] Quantidade total de refeições registradas;
[x] Quantidade total de refeições dentro da dieta;
[x] Quantidade total de refeições fora da dieta;
[x] Melhor sequência de refeições dentro da dieta;

[x] O usuário só pode visualizar, editar e apagar as refeições o qual ele criou;


Métricas: 
Sequencia de pratos dentro da dieta,
refeições registradas,
refeicoes dentro da dieta,
refeicoes fora da dieta,

*Run* project:

npm run knex -- migrate:latest
npm run dev

Routes:

Create a New User
POST: http://localhost:3333/newUser

Create a New Data on Table
POST: http://localhost:3333/meals

Get The Data of All Users
GET: http://localhost:3333/meals/all

Get The One Meal of The Actual User
GET: http://localhost:3333/meals/:id

Get The Number of Meal Out of Diet - of The Actual User
GET: http://localhost:3333/meals/mealQuantityOutOfDiet

Get The Number of Meal On Diet - of The Actual User
GET: http://localhost:3333/meals/mealQuantityOnDiet

Get The Total Number of Meal of The Actual User
GET: http://localhost:3333/meals/mealQuantity

Get The Best Sequence of The Actual User
GET: http://localhost:3333/meals/bestSequence

Get The Data of The Actual User
GET: http://localhost:3333/meals

Delete All Meals of All Users
DEL: http://localhost:3333/meals/all

Delete a Specific Meal of Actual User
DEL: http://localhost:3333//meals

Edit a Specific Meal
PATCH: http://localhost:3333/meals/:id