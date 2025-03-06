const Admin = require("../../models/Admin");
const User = require("../../models/User");

const signoutAdmin = async (req, res) => {
  const adminId = req.adminId;
  const isAdmin = req.isAdmin;
  if (!isAdmin) return res.status(403).json({ message: "Access forbidden!" });

  try {
    await Admin.logoutAdmin(adminId);
    res.clearCookie("jwt");
    res.status(204).json({ message: "Logged out successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAdminInfo = async (req, res) => {
  const adminId = req.adminId;
  const isAdmin = req.isAdmin;
  if (!isAdmin) return res.status(403).json({ message: "Access forbidden!" });

  console.log(adminId);
  try {
    const admin = await Admin.getAdmin(adminId);
    res.status(200).json({ admin });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  // const adminId = req.adminId;
  const isAdmin = req.isAdmin;
  if (!isAdmin) return res.status(403).json({ message: "Access forbidden!" });

  try {
    const users = await User.find();
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const adminGetUser = async (req, res) => {
  const isAdmin = req.isAdmin;
  if (!isAdmin) return res.status(403).json({ message: "Access forbidden!" });

  const { userId } = req.params;
  if (!userId) return res.status(400).json({ message: "Bad request!" });

  try {
    const userInfo = await User.findById(userId);
    res.status(200).json({ userInfo });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const setUserDepositAddress = async (req, res) => {
  const { walletAddress, userId, coin, network } = req.body;
  if (!walletAddress || !userId || !coin || !network)
    return res.status(400).json({ message: "All fields required!" });

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found!" });

    // Find the deposit address by coin type
    const walletToUpdate = user.depositAddress.find(
      (address) => address.coin === coin
    );

    // Check if wallet address already exists
    if (walletToUpdate) {
      // Address exists, update it
      walletToUpdate.address = walletAddress;
      walletToUpdate.network = network; // If you need to update the network as well
    } else {
      // Address doesn't exist, create a new one
      const newAddress = {
        walletId: user._id,
        coin: coin,
        address: walletAddress,
        network: network,
      };
      user.depositAddress.push(newAddress);
    }

    // Mark the depositAddress array as modified (if needed)
    user.markModified("depositAddress");

    // Save the user object with updated deposit address
    await user.save();

    return res.status(200).json({ message: "Wallet updated." });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
};

const disableWithdrawal = async (req, res) => {
  const { userId, message } = req.body;
  if (!userId || !message)
    return res.status(400).json({ message: "All fields required!" });
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "user not found!" });

    if (!user.canWithdraw)
      return res.status(400).json({ message: "Already disabled!" });

    user.customWithdrawalMsg = message;

    user.canWithdraw = false;
    await user.save();

    return res.status(200).json({ message: "Withdrawal disabled." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const enableWithdrawal = async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ message: "All fields required!" });
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "user not found!" });

    user.customWithdrawalMsg = "";

    user.canWithdraw = true;
    await user.save();

    return res.status(200).json({ message: "Withdrawal disabled." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAdminInfo,
  signoutAdmin,
  getAllUsers,
  adminGetUser,
  setUserDepositAddress,
  disableWithdrawal,
  enableWithdrawal,
};
