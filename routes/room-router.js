const route = require("express").Router();
const RoomsController = require("../controllers/room-controller");
const middleware = require('../middlewares/verifyUser');

// create room
route.post("/create" , middleware , RoomsController.createRoom);
// get open rooms
route.get("/rooms" , middleware , RoomsController.getOpenRooms);
// get one open targeted room
route.get("/rooms/:roomId" , middleware , RoomsController.getOpenRooms);
// get user rooms
route.get("/me" , middleware , RoomsController.getUserRooms);
// update room
route.patch("/update/:roomId" , middleware , RoomsController.updateRoom);

module.exports = route;