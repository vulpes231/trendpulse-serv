const Verification = require("../../models/Verification");

const requestVerification = async (req, res) => {
  const userId = req.userId;
  const { idNumber, idType, fullname } = req.body;

  console.log("trying...");
  console.log(req.body);

  // Ensure required fields are provided
  if (!idNumber || !idType || !fullname) {
    return res
      .status(400)
      .json({ message: "Bad request! Missing required fields." });
  }

  // // Ensure both images are uploaded (front and back)
  // if (!req.files || req.files.length !== 2) {
  //   return res
  //     .status(400)
  //     .json({ message: "Both front and back images must be uploaded!" });
  // }

  // // Assuming the first image is the front image and the second is the back image
  // const frontImagePath = req.files[0].path;
  // const backImagePath = req.files[1].path;

  // // Log image paths for debugging purposes
  // console.log("Front Image Path:", frontImagePath);
  // console.log("Back Image Path:", backImagePath);

  try {
    // Create the verification data to pass to the verifyAccount method
    const verifyData = {
      idNumber,
      idType,
      // frontImagePath, // Pass the front image path
      // backImagePath, // Pass the back image path
      userId,
      fullname,
    };

    // Call the static verifyAccount method
    await Verification.verifyAccount(verifyData);

    // Respond with a success message
    return res
      .status(200)
      .json({ message: "Verification request submitted successfully!" });
  } catch (error) {
    // Handle errors and send a failure response
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const getVerifyData = async (req, res) => {
  const userId = req.userId;
  try {
    await Verification.getUserVerifyData(userId);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { requestVerification, getVerifyData };
