import { RequestHandler } from "express";
import BizCardsError from "../errors/BizCardsError";
import Order from "../db/models/order-model";

const isOrder: RequestHandler = async (req, _, next) => {
    try {
        const orderId = req.params.orderId;
        const order = await Order.findById(orderId);

        if (!order) {
            return next(new BizCardsError(403, "Order not found"));
        }

        if (order.status !== "cancelled") {
            return next(order);
        } else {
            return next(new BizCardsError(400, "Order is cancelled"));
        }
    } catch (e) {
        return next(e);
    }
};

export default isOrder;
