import jwt from "jsonwebtoken"

const authorizeUser = (request, response, next) => {
    let jwtToken = request.headers["authorization"]
    if (jwtToken === undefined) {
        response.status(401)
        response.send({ msg: "User is not authorized" })
    } else {
        jwtToken = jwtToken.split(" ")[1]
        jwt.verify(jwtToken, process.env.secretCode, async (error, payload) => {
            if (error) {
                response.status(401)
                response.send({ msg: "Jwt token not matched" })
            } else {
                request.currentUser = payload.UserEmail
                console.log("User authorized")
                next();
            }
        })
    }

}

export default authorizeUser