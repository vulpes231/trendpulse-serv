const Ticket = require("../../models/Ticket");

const fetchTickets = async (req, res) => {
  const isAdmin = req.isAdmin;
  if (!isAdmin) return res.status(403).json({ message: "Forbidden access!" });
  try {
    const tickets = await Ticket.getAllTickets();
    res.status(200).json({ tickets });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const adminReply = async (req, res) => {
  const isAdmin = req.isAdmin;
  if (!isAdmin) return res.status(403).json({ message: "Forbidden access!" });

  const adminId = req.adminId;
  const { message, ticketId } = req.body;
  try {
    const ticketData = { adminId, ticketId, message };
    await Ticket.replyUser(ticketData);
    res.status(200).json({ message: "Message sent." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const singleTicket = async (req, res) => {
  const { ticketId } = req.params;
  try {
    const ticket = await Ticket.getTicketById(ticketId);
    res.status(200).json({ ticket });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const closeTicket = async (req, res) => {};

module.exports = { fetchTickets, adminReply, closeTicket, singleTicket };
