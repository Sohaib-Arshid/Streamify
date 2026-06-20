import connectdb from "./db/index.js";
import { app } from "./app.js";
import dotenv from "dotenv"
dotenv.config({ 
 path: "../.env"
})

connectdb()
    .then(() => {
        const server = app.listen(process.env.PORT || 3000, () => {
            console.log(`server is listing on ${process.env.PORT}`);
        })
        server.on("error", (error) => {
            console.log("Error in port", error);

        })
    }).catch((error) => {
        console.log("Mongodb connection failed !! ", error);

    })  