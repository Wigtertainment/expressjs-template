var passportJWT = require("passport-jwt");
var ExtractJwt = passportJWT.ExtractJwt;

module.exports = {
    jwtFromRequest: ExtractJwt.fromAuthHeader(),
    secretOrKey: 'ilovescotchscotchyscotchscotch'
}