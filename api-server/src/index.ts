import express from "express";
import { orderInputSchema } from "./types.js";
import { orderbook , bookWithQuantity } from "./orderbook.js";

const app = express();
app.use(express.json());

const BASE_ASSET = "BTC";
const QUOTE_ASSET = "USD";

let GLOBAL_TRADE_ID = 0;

app.post("/api/v1/order" , (req , res) => {
    const order = orderInputSchema.safeParse(req.body);
    if(!order.success) {
        res.status(400).send(order.error.message);
    }
    if(!order?.data) {
        throw new Error("Order data is missing");
    }
    const { baseAsset , quoteAsset , price ,  quantity , side , kind } = order.data;
    const orderId = getOrderId();
    if(baseAsset != BASE_ASSET || quoteAsset != QUOTE_ASSET) {
        res.status(400).send("Invalid base or quote asset");
        return;
    }
    const { executedQty , fills } = fillOrder(orderId , price , quantity , side , kind);

    res.send({
        orderId,
        executedQty,
        fills
    })
})

interface Fill {
    "price" : number,
    "qty" : number,
    "tradeId" : number
}

function fillOrder(orderId: string , price: number , quantity: number , side: "buy" | "sell" , kind: "limit" | "market") {
    const fills: Fill[] = [];
    const maxFillQuantity = getFillAmount(price , quantity , side);
    let executedQty = 0;

    if(type === "ioc" && maxFillQuantity < quantity) {
        return { status: "rejected" , executedQty: maxFillQuantity , fills: [] };
    }

    if(side === "buy") {
        // orderbook should be sorted before you try to fill them
        orderbook.asks.forEach(order => {
            if(order.price <= price && quantity > 0) {
                const filledQuantity = Math.min(order.quantity , quantity);
                console.log(filledQuantity);
                order.quantity -= filledQuantity;
                bookWithQuantity.asks[order.price] = (bookWithQuantity.asks[order.price] || 0) - filledQuantity;
                fills.push({
                    price: order.price,
                    qty: order.quantity,
                    tradeId: GLOBAL_TRADE_ID++
                });
                executedQty += filledQuantity;
                quantity -= filledQuantity;
                if(order.quantity === 0) {
                    orderbook.asks.splice(orderbook.asks.indexOf(order) , 1);
                }
                if(bookWithQuantity.asks[price] === 0) {
                    delete bookWithQuantity.asks[price];
                }
            }
        });

        if(quantity != 0) {
            orderbook.bids.push({
                price,
                quantity: quantity - executedQty,
                side: "bid",
                orderId
            })
            bookWithQuantity.asks[price] = (bookWithQuantity.asks[price] || 0) + (quantity);
        }
    }

    else {

    }
}

app.listen(3000 , () => {
    console.log("Server running on port 3000");
});