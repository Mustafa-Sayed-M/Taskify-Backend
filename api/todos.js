import clientPromise from '../lib/mongodb.js';
import { isEmail } from '../utils/handlers.js';
import { CREATE_TODO, DELETE_TODO, GET_TODOS, UPDATE_TODO } from "../handlers/todosHandler.js";

const getTodosCollection = async () => {
    const client = await clientPromise;
    const db = client.db("taskify_db");
    return db.collection("todos");
};

export default async function handler(req, res) {
    // Allow Access:
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    const method = req.method;

    if (method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { userEmail } = req.query;

    if (!userEmail) {
        return res.status(400).json({
            message: "Failed to fetch todos",
            error: { message: "'userEmail' is a required parameter!" },
            status: 400
        });
    }

    if (!isEmail(userEmail)) {
        return res.status(400).json({
            message: "Invalid user format",
            error: { message: "The provided user is not a valid email address." },
            status: 400
        });
    }

    const todosCollection = await getTodosCollection();

    if (method === 'GET') {
        return await GET_TODOS(req, res, todosCollection);
    } else if (method === 'POST') {
        return await CREATE_TODO(req, res, todosCollection);
    } else if (method === 'PUT') {
        return await UPDATE_TODO(req, res, todosCollection);
    } else if (method === 'DELETE') {
        return await DELETE_TODO(req, res, todosCollection);
    } else {
        res.setHeader("Allow", "GET, POST, PUT, DELETE, OPTIONS");
        return res.status(405).json({
            message: `Method ${method} Not Allowed`,
            allowedMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
        });
    }
}