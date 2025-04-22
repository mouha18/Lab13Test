const express = require('express');
const bodyParser = require('body-parser');
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// Database connection setup
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
    }
);

// Define the Book model
const Book = sequelize.define('Book', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    author: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    isbn: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    publication_year: {
        type: DataTypes.INTEGER,
    },
    genre: {
        type: DataTypes.STRING,
    },
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

// Sync the model with the database
sequelize.sync()
    .then(() => {
        console.log('Database synced');
    })
    .catch(err => {
        console.error('Error syncing database:', err);
    });

// Initialize Express app
const app = express();
const PORT = 3000;

app.use(bodyParser.json());

// Get all books
app.get('/api/books', async (req, res) => {
    try {
        const books = await Book.findAll();
        res.json(books);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create a new book
app.post('/api/books', async (req, res) => {
    const { title, author, isbn, publication_year, genre } = req.body;
    if (!title || !author || !isbn) {
        return res.status(400).json({ error: 'Title, author, and isbn are required' });
    }
    try {
        const book = await Book.create({
            title,
            author,
            isbn,
            publication_year,
            genre,
        });
        res.status(201).json(book);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            res.status(400).json({ error: 'ISBN must be unique' });
        } else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

// Get a book by ID
app.get('/api/books/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const book = await Book.findByPk(id);
        if (book) {
            res.json(book);
        } else {
            res.status(404).json({ error: 'Book not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update a book by ID
app.put('/api/books/:id', async (req, res) => {
    const { id } = req.params;
    const { title, author, isbn, publication_year, genre } = req.body;
    try {
        const book = await Book.findByPk(id);
        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }
        await book.update({
            title,
            author,
            isbn,
            publication_year,
            genre,
        });
        res.json(book);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            res.status(400).json({ error: 'ISBN must be unique' });
        } else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

// Delete a book by ID
app.delete('/api/books/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const book = await Book.findByPk(id);
        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }
        await book.destroy();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});