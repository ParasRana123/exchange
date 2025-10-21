import express from "express";

const app = express();
app.use(express.json());

app.post("/api/v1/order" , (req , res) => {
    
})

app.listen(3000 , () => {
    console.log("Running on port 3000");
});