const express = require("express");
const app = express();
const mongoose = require('mongoose');
require('dotenv/config');	// a Variável de ambiente em .env

// Middleware para fazer a requisição JSON
app.use(express.json());

// Importar modelo de alimentos o arquivo Food.js
const Food = require('./Model/Food');

//Rotas
app.get("/", (req,res)=>{
		res.send("Home Page");
});

// Rota para listar todos os alimentos (no objeto)
app.get("/api/foods", async (req, res) => {
	try {
	const foods = await Food.find();
	res.json(foods);
	} catch (err) {
	res.status(500).json({ message: err.message });
	}
});

// Rota para buscar um alimento específico por ID
app.get("/api/foods/:id", async (req, res) => {
	try {
	const food = await Food.findById(req.params.id);
	if (!food) {
		return res.status(404).json({ message: 'Alimento não encontrado' });
	}
	res.json(food);
	} catch (err) {
	res.status(500).json({ message: err.message });
	}
});

// Rota para criar um novo alimento
app.post("/api/foods", async (req, res) => {
	try {
	const { name, category, quantity, expirationDate, price } = req.body;

	// Criar um novo objeto de alimento
	const newFood = new Food({
		name,
		category,
		quantity,
		expirationDate,
		price
	});
	
	// Salvar o novo alimento no banco de dados do Atlas
	const createdFood = await newFood.save();

	// Retornar os detalhes do novo alimento criado
	res.status(201).json(createdFood);
	} catch (err) {
	res.status(400).json({ message: err.message });
	}
});


// Rota para atualizar um alimento existente
app.put("/api/foods/:id", async (req, res) => {
	try {
	const { name, category, quantity, expirationDate, price } = req.body;

	// Verificar se existem dados de atualização no corpo da requisição
	if (!name && !category && !quantity && !expirationDate && !price) {
		return res.status(400).json({ message: 'Nenhum dado de atualização fornecido' });
	}

	// Atualizar o alimento com base no ID fornecido
	const updatedFood = await Food.findByIdAndUpdate(req.params.id, req.body, { new: true });

	// Verificar se o alimento foi encontrado e atualizado
	if (!updatedFood) {
		return res.status(404).json({ message: 'Alimento não encontrado' });
	}

	// Retornar os detalhes do alimento atualizado
	res.json(updatedFood);
	} catch (err) {
	res.status(400).json({ message: err.message });
	}
});



// Rota para excluir um alimento
app.delete("/api/foods/:id", async (req, res) => {
	try {
	// Excluir o alimento com base no ID fornecido
	const deletedFood = await Food.findByIdAndDelete(req.params.id);

	// Verificar se o alimento foi encontrado e excluído
	if (!deletedFood) {
		return res.status(404).json({ message: 'Alimento não encontrado' });
	}

	// Retornar uma mensagem indicando que o alimento foi excluído com sucesso
	res.json({ message: 'Alimento excluído com sucesso' });
	} catch (err) {
	res.status(400).json({ message: err.message });
	}
});



// Conectar ao banco de dados usando async/await
async function conectarAoBancoDeDados() {
	try {
		await mongoose.connect(process.env.DB_CONNECTION);
		console.log('Conectado ao banco de dados');
	} catch (error) {
	console.error('Erro ao conectar ao banco de dados:', error);
	process.exit(1); // Sair do processo em caso de erro de conexão
	}
}

conectarAoBancoDeDados()
	.then(() => {
		// Iniciar o servidor apenas após a conexão bem-sucedida
		app.listen(3000, () => console.log("Servidor em execução: http://localhost:3000/"));
	})
	.catch(error => console.error('Erro ao iniciar o servidor:', error));


/*
MINHAS ANOTAÇÔES

	• Obter todos os foods
		http://localhost:3000/api/foods

	• Buscar por ID
		http://localhost:3000/api/foods/:id

	• Pots
		http://localhost:3000/api/foods

		adicionei isto:
			{
				"name": "Maçã",
				"category": "Frutas",
				"quantity": 10,
				"expirationDate": "2024-05-01",
				"price": 2.50
			}

		maçã -- ID = 660dee8fb9d129fd5da35308

			BUSCA obtive isto

			{
				"_id": "660dee8fb9d129fd5da35308",
				"name": "Maçã",
				"category": "Frutas",
				"quantity": 10,
				"expirationDate": "2024-05-01T00:00:00.000Z",
				"price": 2.5,
				"__v": 0
			}

			http://localhost:3000/api/foods/660dee8fb9d129fd5da35308



	• PUT - atualizar
		http://localhost:3000/api/foods/:id

		http://localhost:3000/api/foods/660dee8fb9d129fd5da35308

		no body

			{
				"name": "Maçã Verde",
				"category": "Nova Categoria",
				"quantity": 15,
				"expirationDate": "2025-05-01",
				"price": 17.00
			}

		recebi
			{
				"_id": "660dee8fb9d129fd5da35308",
				"name": "Maçã Verde",
				"category": "Nova Categoria",
				"quantity": 15,
				"expirationDate": "2025-05-01T00:00:00.000Z",
				"price": 17,
				"__v": 0
			}

	• DELETE
		http://localhost:3000/api/foods/:id

		deletar maçã verde
			http://localhost:3000/api/foods/660dee8fb9d129fd5da35308
		

*/
