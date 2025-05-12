/* =============== */
/* =============== */
import { ObjectId } from "bson";

// # GET:
export const GET_TODOS = async (req, res, todosCollection) => {
    try {
        const { userEmail } = req.query;

        const todos = await todosCollection.find({ userEmail }).toArray();

        return res.status(200).json({
            message: "Todos fetched successfully",
            todos,
            status: 200,
            ...(todos.length === 0 && {
                info: "No todos found. The user might not have created any yet."
            })
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch todos",
            error: error.message,
            status: 500
        });
    }
};
/* =============== */
/* =============== */

/* =============== */
/* =============== */
// # UPDATE:
export const UPDATE_TODO = async (req, res, todosCollection) => {
    try {
        const { userEmail } = req.query;
        const { todoId, updatedFields } = req.body;

        if (!todoId) {
            return res.status(400).json({
                message: "Missing 'todoId' parameter",
                status: "error",
                code: 400
            });
        }

        const updatedTodo = await todosCollection.findOneAndUpdate(
            { _id: new ObjectId(todoId), userEmail },
            {
                $set: {
                    ...updatedFields,
                    updatedAt: Date.now()
                }
            },
            { returnDocument: "after" }
        );

        if (!updatedTodo) {
            return res.status(404).json({
                message: "Todo not found or no changes made",
                todo: null,
                status: 'error',
                code: 404
            });
        }

        return res.status(200).json({
            message: "Todo updated successfully",
            todo: updatedTodo,
            status: 'ok',
            code: 200
        });

    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message,
            status: 'server error',
            code: 500
        });
    }
};
/* =============== */
/* =============== */

/* =============== */
/* =============== */
// # CREATE:
export const CREATE_TODO = async (req, res, todosCollection) => {
    try {

        const { userEmail } = req.query;

        const {
            title,
            isCompleted = false,
            isFeatured = false
        } = req.body;

        if (!title) {
            return res.status(400).json({
                message: "Title is required to create a todo",
                status: 400
            });
        }

        const newTodo = { title, userEmail, isCompleted, isFeatured, createdAt: Date.now(), updatedAt: Date.now() };

        const result = await todosCollection.insertOne(newTodo);

        if (!result.acknowledged) {
            return res.status(500).json({
                message: "Failed to create todo",
                status: 500
            });
        }

        return res.status(200).json({
            message: "Todo created successfully",
            todo: { _id: result.insertedId, ...newTodo },
            status: 200
        });

    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message,
            status: 500
        });
    }
};
/* =============== */
/* =============== */

/* =============== */
/* =============== */
// # DELETE:
export const DELETE_TODO = async (req, res, todosCollection) => {

    const { userEmail } = req.query;
    const { todoId } = req.body;

    if (!todoId || !ObjectId.isValid(todoId)) {
        return res.status(400).json({
            message: "Invalid or missing 'todoId' parameter",
            status: 400
        });
    }
    try {
        const result = await todosCollection.findOneAndDelete({ _id: new ObjectId(todoId), userEmail });

        if (!result) {
            return res.status(404).json({
                message: "Todo not found or not associated with this user",
                status: 404
            });
        }

        return res.status(200).json({
            message: "Todo deleted successfully",
            todo: result,
            status: 200
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to delete todo",
            error: error.message,
            status: 500
        });
    }
};
/* =============== */
/* =============== */