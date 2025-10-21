import express from "express";
import { orderInputSchema } from "./types.js";

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

function fillOrder(orderId: string , price: number , quantity: number , side: "buy" | "sell" , kind: "limit" | "market") {
    const fills: Fill[] = [];
    
}

app.listen(3000 , () => {
    console.log("Server running on port 3000");
});