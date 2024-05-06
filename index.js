import { getProducts, getProduct } from './services/api.js';
import { createOrder, retrieveOrder } from './services/klarna.js';
import express from 'express';
const app = express();
import { config } from 'dotenv';
config();

app.get('/', async (req, res) => {
    const products = await getProducts();
    const markup = `
        <style>
            body {
                background-color: #f2f2f2;
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
            }
            .product {
                border: 1px solid #ddd;
                border-radius: 8px;
                margin-bottom: 20px;
                padding: 10px;
                background-color: #fff;
            }
            .product img {
                max-width: 200px;
                max-height: 200px;
                display: block;
                margin: 0 auto 10px;
            }
            .product a {
                color: #333;
                text-decoration: none;
            }
            .product h3 {
                margin: 0;
            }
            .product p {
                margin: 5px 0;
            }
        </style>
        <div class="container">
            <h1 style="text-align: center; margin-bottom: 20px;">Världens Mest Genialiska Produkter (eller inte)</h1>
            ${products.map((p) => `
            <a href="/products/${p.id}" class="product-link">
                <div class="product">
                    <img src="${p.image}" alt="${p.title}">
                    <div style="text-align: center;">
                            <h3>${p.title}</h3>
                            <p>Price: ${p.price} kr</p>
                        </a>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    res.send(markup);
});



app.get('/products/:id', async (req, res) => {
    try {
        const { id } =req.params;
        const product = await getProduct(id);
        const klarnaResponse = await createOrder(product);
        const markup = klarnaResponse.html_snippet;
        res.send(markup);
    } catch(error) {
        res.send(error.message);
    }
});

app.get('/confirmation', async (req, res) => {
    const { order_id } = req.query;
    const klarnaResponse = await retrieveOrder(order_id);
    const { html_snippet } = klarnaResponse;
    res.send(html_snippet);
})

app.listen(process.env.PORT)
