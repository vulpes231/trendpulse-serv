const Transaction = require("../../models/Transaction");

const makeDeposit = async (req, res) => {
  const userId = req.userId;
  const { amount, memo, method } = req.body;
  if (!amount || !method)
    return res.status(400).json({ message: "Bad request!" });
  try {
    const transactionData = {
      amount,
      method,
      memo,
    };
    await Transaction.depositFund(transactionData, userId);
    res.status(200).json({ message: "Deposit initiated." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const makeWithdrawal = async (req, res) => {
  const userId = req.userId;
  const { amount, method, memo, receiver } = req.body;
  if (!amount || !method || !receiver)
    return res.status(400).json({ message: "Bad request!" });
  try {
    const transactionData = {
      amount,
      method,
      memo,
      receiver,
    };
    await Transaction.withdrawFund(transactionData, userId);
    res.status(200).json({ message: "Withdrawal initiated." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const makeTransfer = async (req, res) => {
  const userId = req.userId;
  const { amount, from, comment, to } = req.body;
  if (!amount || !from || !to)
    return res.status(400).json({ message: "Bad request!" });
  try {
    const transactionData = {
      amount,
      comment,
      from,
      to,
    };
    await Transaction.transferFund(transactionData, userId);
    res
      .status(200)
      .json({ message: `${amount} USD transferred to ${to}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserTrnxs = async (req, res) => {
  const userId = req.userId;
  try {
    const userTrnxs = await Transaction.getUserHistory(userId);
    res.status(200).json({ userTrnxs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { makeDeposit, makeWithdrawal, makeTransfer, getUserTrnxs };
