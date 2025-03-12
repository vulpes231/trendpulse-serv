const { Router } = require("express");

const {
  fetchTickets,
  closeTicket,
  adminReply,
  singleTicket,
} = require("./adminTicketHanlder");
const router = Router();

router.route("/").get(fetchTickets).post(closeTicket);
router.route("/:ticketId").get(singleTicket);
router.route("/reply").post(adminReply);

module.exports = router;
